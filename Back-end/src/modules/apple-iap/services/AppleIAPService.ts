import { Service } from 'typedi';
import axios from 'axios';
import {
  APPLE_PRODUCT_IDS,
  CREDIT_PACKAGES,
  AppleTransactionStatus,
  AppleIAPTransaction,
} from '../types/AppleIAPTypes';
import { User } from '../../user/entities/User';
import { AppDataSource } from '../../../config/database';
import { AppleIAPTransactionEntity, AppleTransactionStatusDB } from '../entities/AppleIAPTransaction';

// Apple Verification URLs
const APPLE_VERIFY_URL_PRODUCTION = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_VERIFY_URL_SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';

interface AppleReceiptVerification {
  status: number;
  receipt: any;
  latest_receipt_info?: any[];
}

@Service()
export class AppleIAPService {
  private userRepository = AppDataSource.getRepository(User);
  private txRepository = AppDataSource.getRepository(AppleIAPTransactionEntity);
  
  // Apple Shared Secret (App Store Connect'ten alınacak)
  private readonly sharedSecret = process.env.APPLE_SHARED_SECRET || '';

  constructor() {
    if (!this.sharedSecret) {
      console.error('[AppleIAP] ⚠️ WARNING: APPLE_SHARED_SECRET environment variable is not set! IAP verification will fail.');
    } else {
      console.log('[AppleIAP] ✅ Apple Shared Secret loaded successfully');
    }
  }

  /**
   * Apple'dan makbuz doğrulama
   */
  async verifyReceipt(receiptData: string, isProduction = true): Promise<AppleReceiptVerification> {
    if (!this.sharedSecret) {
      throw new Error('Apple Shared Secret is not configured. Please set APPLE_SHARED_SECRET environment variable.');
    }

    const url = isProduction ? APPLE_VERIFY_URL_PRODUCTION : APPLE_VERIFY_URL_SANDBOX;

    try {
      console.log(`[AppleIAP] Verifying receipt with ${isProduction ? 'PRODUCTION' : 'SANDBOX'} URL`);
      
      const response = await axios.post(url, {
        'receipt-data': receiptData,
        password: this.sharedSecret,
        'exclude-old-transactions': true,
      });

      console.log(`[AppleIAP] Apple response status: ${response.data.status}`);

      // Status 21007 = sandbox receipt sent to production, retry with sandbox
      if (response.data.status === 21007 && isProduction) {
        console.warn('[AppleIAP] 21007: Sandbox receipt detected in production. Automatically retrying with SANDBOX URL');
        return this.verifyReceipt(receiptData, false);
      }

      // Status 21008 = production receipt sent to sandbox (edge case)
      if (response.data.status === 21008 && !isProduction) {
        console.warn('[AppleIAP] 21008: Production receipt detected in sandbox. Automatically retrying with PRODUCTION URL');
        return this.verifyReceipt(receiptData, true);
      }

      return response.data;
    } catch (error) {
      console.error('[AppleIAP] Apple receipt verification error:', error);
      throw new Error('Failed to verify receipt with Apple');
    }
  }

  /**
   * Makbuzu doğrula ve kredileri ekle
   */
  async verifyAndAddCredits(
    userId: string,
    receiptData: string,
    productId: string,
    transactionId: string
  ): Promise<{
    success: boolean;
    message: string;
    credits?: number;
    newBalance?: number;
  }> {
    try {
      console.log(`[AppleIAP] Starting verification for user ${userId}, product ${productId}, transaction ${transactionId}`);

      // 1. Ürün bilgisini al
      const packageInfo = CREDIT_PACKAGES[productId];
      if (!packageInfo) {
        console.error(`[AppleIAP] Invalid product ID: ${productId}`);
        return {
          success: false,
          message: 'Geçersiz ürün ID',
        };
      }

      // 2. Transaction daha önce kullanılmış mı kontrol et
      const existingTransaction = await this.findTransactionByTransactionId(transactionId);
  if (existingTransaction && existingTransaction.status === AppleTransactionStatus.VERIFIED) {
        console.warn(`[AppleIAP] Transaction ${transactionId} already verified`);
        return {
          success: false,
          message: 'Bu satın alma daha önce kullanıldı',
        };
      }

      // 3. Apple'dan makbuzu doğrula (otomatik olarak production'dan başlar, 21007 gelirse sandbox'a düşer)
      console.log('[AppleIAP] Verifying receipt with Apple...');
      const verificationResult = await this.verifyReceipt(receiptData);

      // 4. Doğrulama başarısız
      if (verificationResult.status !== 0) {
        console.error(`[AppleIAP] Verification failed with status ${verificationResult.status}: ${this.getAppleStatusMessage(verificationResult.status)}`);
        
        await this.saveTransaction(
          userId,
          productId,
          transactionId,
          transactionId,
          receiptData,
          AppleTransactionStatus.FAILED
        );

        return {
          success: false,
          message: `Apple doğrulama hatası: ${this.getAppleStatusMessage(verificationResult.status)}`,
        };
      }

      // 5. Transaction bilgilerini kontrol et
      const receipt = verificationResult.receipt;
      const inAppPurchases = receipt.in_app || [];
      
      const matchingPurchase = inAppPurchases.find(
        (purchase: any) => purchase.transaction_id === transactionId && purchase.product_id === productId
      );

      if (!matchingPurchase) {
        console.error(`[AppleIAP] Purchase not found in receipt. Looking for transaction ${transactionId} with product ${productId}`);
        return {
          success: false,
          message: 'Satın alma bilgisi makbuzda bulunamadı',
        };
      }

      console.log(`[AppleIAP] Purchase found in receipt: ${JSON.stringify(matchingPurchase)}`);

      // 6. Kullanıcıyı bul
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.error(`[AppleIAP] User not found: ${userId}`);
        return {
          success: false,
          message: 'Kullanıcı bulunamadı',
        };
      }

      // 7. Kredileri ekle
      const creditsToAdd = packageInfo.credits;
      const oldBalance = user.currentCredit || 0;
      user.currentCredit = oldBalance + creditsToAdd;
      await this.userRepository.save(user);

      console.log(`[AppleIAP] Credits added: ${creditsToAdd}. New balance: ${user.currentCredit} (was ${oldBalance})`);

      // 8. Transaction kaydını oluştur
      await this.saveTransaction(
        userId,
        productId,
        transactionId,
        matchingPurchase.original_transaction_id || transactionId,
        receiptData,
  AppleTransactionStatus.VERIFIED
      );

      console.log(`[AppleIAP] ✅ Verification successful for transaction ${transactionId}`);

      return {
        success: true,
        message: `${creditsToAdd} kredi hesabınıza eklendi!`,
        credits: creditsToAdd,
        newBalance: user.currentCredit,
      };
    } catch (error: any) {
      console.error('[AppleIAP] Error verifying and adding credits:', error);
      return {
        success: false,
        message: error.message || 'Satın alma işlemi sırasında bir hata oluştu',
      };
    }
  }

  /**
   * Satın almaları geri yükle
   */
  async restorePurchases(
    userId: string,
    receiptData: string
  ): Promise<{
    success: boolean;
    message: string;
    restoredCount: number;
  }> {
    try {
      const verificationResult = await this.verifyReceipt(receiptData);

      if (verificationResult.status !== 0) {
        return {
          success: false,
          message: 'Makbuz doğrulanamadı',
          restoredCount: 0,
        };
      }

      const inAppPurchases = verificationResult.receipt?.in_app || [];
      let restoredCount = 0;

      for (const purchase of inAppPurchases) {
        const transactionId = purchase.transaction_id;
        const productId = purchase.product_id;

        // Daha önce eklenmemiş mi kontrol et
        const existing = await this.findTransactionByTransactionId(transactionId);
  if (!existing || existing.status !== AppleTransactionStatus.VERIFIED) {
          const result = await this.verifyAndAddCredits(userId, receiptData, productId, transactionId);
          if (result.success) {
            restoredCount++;
          }
        }
      }

      return {
        success: true,
        message: restoredCount > 0 ? `${restoredCount} satın alma geri yüklendi` : 'Geri yüklenecek satın alma bulunamadı',
        restoredCount,
      };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return {
        success: false,
        message: 'Satın almalar geri yüklenirken hata oluştu',
        restoredCount: 0,
      };
    }
  }

  /**
   * Ürün listesini getir
   */
  getProducts() {
    return Object.values(CREDIT_PACKAGES);
  }

  // Helper methods
  private async findTransactionByTransactionId(transactionId: string): Promise<any | null> {
  return this.txRepository.findOne({ where: { transactionId } });
  }

  private async saveTransaction(
    userId: string,
    productId: string,
    transactionId: string,
    originalTransactionId: string,
    receiptData: string,
    status: AppleTransactionStatus
  ): Promise<void> {
    const credits = CREDIT_PACKAGES[productId]?.credits || 0;
    const entity = this.txRepository.create({
      userId,
      productId,
      transactionId,
      originalTransactionId,
      receiptData,
      credits,
      status: status as unknown as AppleTransactionStatusDB,
      verifiedAt: status === AppleTransactionStatus.VERIFIED ? new Date() : null,
    });
    await this.txRepository.save(entity);
  }

  private getAppleStatusMessage(status: number): string {
    const messages: { [key: number]: string } = {
      0: 'Başarılı',
      21000: 'App Store makbuzu okunamadı',
      21002: 'Makbuz verileri hatalı',
      21003: 'Makbuz doğrulanamadı',
      21004: 'Paylaşılan şifre hatalı',
      21005: 'Makbuz sunucusu şu anda kullanılamıyor',
      21006: 'Makbuz geçerli ama abonelik süresi dolmuş',
      21007: 'Sandbox makbuzu production ortamına gönderildi',
      21008: 'Production makbuzu sandbox ortamına gönderildi',
      21010: 'Makbuz bulunamadı veya silindi',
    };

    return messages[status] || `Bilinmeyen hata (${status})`;
  }
}

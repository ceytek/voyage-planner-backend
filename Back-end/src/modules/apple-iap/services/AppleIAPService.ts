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

  /**
   * Apple'dan makbuz doğrulama
   */
  async verifyReceipt(receiptData: string, isProduction = true): Promise<AppleReceiptVerification> {
    const url = isProduction ? APPLE_VERIFY_URL_PRODUCTION : APPLE_VERIFY_URL_SANDBOX;

    try {
      const response = await axios.post(url, {
        'receipt-data': receiptData,
        password: this.sharedSecret,
        'exclude-old-transactions': true,
      });

      // Status 21007 = sandbox receipt sent to production, retry with sandbox
      if (response.data.status === 21007 && isProduction) {
        console.warn('[AppleIAP] 21007: Sandbox receipt sent to production. Retrying with SANDBOX');
        return this.verifyReceipt(receiptData, false);
      }

      return response.data;
    } catch (error) {
      console.error('Apple receipt verification error:', error);
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
      // 1. Ürün bilgisini al
      const packageInfo = CREDIT_PACKAGES[productId];
      if (!packageInfo) {
        return {
          success: false,
          message: 'Geçersiz ürün ID',
        };
      }

      // 2. Transaction daha önce kullanılmış mı kontrol et
      const existingTransaction = await this.findTransactionByTransactionId(transactionId);
  if (existingTransaction && existingTransaction.status === AppleTransactionStatus.VERIFIED) {
        return {
          success: false,
          message: 'Bu satın alma daha önce kullanıldı',
        };
      }

      // 3. Apple'dan makbuzu doğrula
      const verificationResult = await this.verifyReceipt(receiptData);

      // 4. Doğrulama başarısız
      if (verificationResult.status !== 0) {
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
        return {
          success: false,
          message: 'Satın alma bilgisi makbuzda bulunamadı',
        };
      }

      // 6. Kullanıcıyı bul
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı',
        };
      }

      // 7. Kredileri ekle
      const creditsToAdd = packageInfo.credits;
      user.currentCredit = (user.currentCredit || 0) + creditsToAdd;
      await this.userRepository.save(user);

      // 8. Transaction kaydını oluştur
      await this.saveTransaction(
        userId,
        productId,
        transactionId,
        matchingPurchase.original_transaction_id || transactionId,
        receiptData,
  AppleTransactionStatus.VERIFIED
      );

      return {
        success: true,
        message: `${creditsToAdd} kredi hesabınıza eklendi!`,
        credits: creditsToAdd,
        newBalance: user.currentCredit,
      };
    } catch (error: any) {
      console.error('Error verifying and adding credits:', error);
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

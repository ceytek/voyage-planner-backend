import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Payment, PaymentStatus } from '../entities/Payment';
import { CreditService } from '../../credit/services/CreditService';
import axios from 'axios';

// Apple IAP receipt validation URLs
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';

// Apple IAP product configurations
const APPLE_PRODUCTS = {
  'com.voyageapp.credits150': {
    credits: 150,
    priceInCents: 999, // $9.99
    name: '150 Credits'
  },
  'com.voyageapp.credits350': {
    credits: 350,
    priceInCents: 1999, // $19.99
    name: '350 Credits'
  },
  'com.voyageapp.credits800': {
    credits: 800,
    priceInCents: 3999, // $39.99
    name: '800 Credits'
  }
};

interface AppleReceiptResponse {
  status: number;
  receipt?: any;
  latest_receipt_info?: any[];
  pending_renewal_info?: any[];
  environment?: string;
}

@Service()
export class AppleIAPService {
  private paymentRepository: Repository<Payment>;
  private creditService: CreditService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.creditService = new CreditService();
  }

  /**
   * Verify Apple IAP receipt and process payment
   */
  async verifyReceipt(
    userId: string,
    receiptData: string,
    productId: string
  ): Promise<{
    success: boolean;
    message: string;
    creditsAdded?: number;
    newBalance?: number;
    transactionId?: string;
  }> {
    console.log('🍎 Verifying Apple IAP receipt:', { userId, productId });

    try {
      // 1. Get product configuration
      const productConfig = APPLE_PRODUCTS[productId as keyof typeof APPLE_PRODUCTS];
      if (!productConfig) {
        throw new Error(`Invalid product ID: ${productId}`);
      }

      // 2. Verify receipt with Apple
      const receiptResponse = await this.validateReceiptWithApple(receiptData);

      if (receiptResponse.status !== 0) {
        console.error('❌ Apple receipt validation failed:', receiptResponse.status);
        return {
          success: false,
          message: `Receipt validation failed: ${this.getAppleStatusMessage(receiptResponse.status)}`
        };
      }

      // 3. Extract transaction info
      const latestReceipt = receiptResponse.latest_receipt_info?.[0] || receiptResponse.receipt?.in_app?.[0];
      if (!latestReceipt) {
        throw new Error('No transaction found in receipt');
      }

      const transactionId = latestReceipt.transaction_id;
      const originalTransactionId = latestReceipt.original_transaction_id;

      // 4. Check for duplicate transaction
      const existingPayment = await this.paymentRepository.findOne({
        where: { appleTransactionId: transactionId }
      });

      if (existingPayment) {
        console.log('⚠️ Transaction already processed:', transactionId);
        return {
          success: false,
          message: 'This purchase has already been processed'
        };
      }

      // 5. Create payment record
      const payment = this.paymentRepository.create({
        userId,
        appleTransactionId: transactionId,
        appleOriginalTransactionId: originalTransactionId,
        appleReceiptData: receiptData,
        appleProductId: productId,
        amount: productConfig.priceInCents / 100, // Convert to dollars
        currency: 'USD',
        credits: productConfig.credits,
        packageName: productConfig.name,
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: 'apple_iap'
      });

      await this.paymentRepository.save(payment);
      console.log('💾 Payment record saved:', payment.id);

      // 6. Add credits to user
      const newBalance = await this.addCreditsToUser(userId, productConfig.credits);
      console.log('💰 Credits added successfully:', newBalance);

      // 7. Create credit transaction record
      await this.createCreditTransaction(payment, transactionId);

      return {
        success: true,
        message: 'Purchase successful! Credits added to your account.',
        creditsAdded: productConfig.credits,
        newBalance: Number(newBalance),
        transactionId
      };

    } catch (error: any) {
      console.error('❌ Error verifying Apple receipt:', error.message);
      return {
        success: false,
        message: `Failed to process purchase: ${error.message}`
      };
    }
  }

  /**
   * Validate receipt with Apple's verification API
   */
  private async validateReceiptWithApple(receiptData: string): Promise<AppleReceiptResponse> {
    const sharedSecret = process.env.APPLE_SHARED_SECRET; // Optional for auto-renewable subscriptions

    try {
      // Try production first
      console.log('🔍 Validating receipt with Apple (production)...');
      const productionResponse = await axios.post<AppleReceiptResponse>(
        APPLE_PRODUCTION_URL,
        {
          'receipt-data': receiptData,
          'password': sharedSecret,
          'exclude-old-transactions': true
        }
      );

      // If status is 21007, receipt is from sandbox, try sandbox URL
      if (productionResponse.data.status === 21007) {
        console.log('🔍 Receipt is from sandbox, validating with sandbox URL...');
        const sandboxResponse = await axios.post<AppleReceiptResponse>(
          APPLE_SANDBOX_URL,
          {
            'receipt-data': receiptData,
            'password': sharedSecret,
            'exclude-old-transactions': true
          }
        );
        return sandboxResponse.data;
      }

      return productionResponse.data;

    } catch (error: any) {
      console.error('❌ Error calling Apple verification API:', error.message);
      throw new Error('Failed to connect to Apple verification service');
    }
  }

  /**
   * Get human-readable message for Apple status codes
   */
  private getAppleStatusMessage(status: number): string {
    const statusMessages: Record<number, string> = {
      0: 'Valid receipt',
      21000: 'The App Store could not read the JSON object you provided',
      21002: 'The data in the receipt-data property was malformed',
      21003: 'The receipt could not be authenticated',
      21004: 'The shared secret you provided does not match',
      21005: 'The receipt server is not currently available',
      21006: 'This receipt is valid but the subscription has expired',
      21007: 'This receipt is from the test environment',
      21008: 'This receipt is from the production environment',
      21009: 'Internal data access error',
      21010: 'The user account cannot be found'
    };

    return statusMessages[status] || `Unknown status code: ${status}`;
  }

  /**
   * Add credits to user balance
   */
  private async addCreditsToUser(userId: string, credits: number): Promise<number> {
    return await this.creditService.addCreditsToUser(userId, credits);
  }

  /**
   * Create credit transaction record for purchase history
   */
  private async createCreditTransaction(payment: Payment, transactionId: string): Promise<void> {
    const CreditTransaction = require('../../credit/entities/CreditTransaction').CreditTransaction;
    const transactionRepository = AppDataSource.getRepository(CreditTransaction);

    if (!payment.userId) {
      console.warn('⚠️ Skipping credit transaction creation: missing userId');
      return;
    }

    const transaction = transactionRepository.create({
      userId: payment.userId,
      packageId: payment.appleProductId || 'unknown',
      creditsEarned: payment.credits,
      priceInCents: Math.round(payment.amount * 100),
      currency: payment.currency,
      status: 'completed',
      transactionType: 'purchase',
      paymentProvider: 'apple_iap',
      paymentIntentId: transactionId,
    });

    await transactionRepository.save(transaction);
    console.log('📝 Credit transaction recorded:', transaction.id);
  }

  /**
   * Get available Apple IAP products
   */
  async getAvailableProducts(): Promise<Array<{
    productId: string;
    credits: number;
    price: number;
    name: string;
  }>> {
    return Object.entries(APPLE_PRODUCTS).map(([productId, config]) => ({
      productId,
      credits: config.credits,
      price: config.priceInCents / 100,
      name: config.name
    }));
  }
}

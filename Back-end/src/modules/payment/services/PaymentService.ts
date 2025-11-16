import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Payment, PaymentStatus } from '../entities/Payment';
import { stripe, stripeConfig } from '../../../config/stripe';
import { CreditService } from '../../credit/services/CreditService';

@Service()
export class PaymentService {
  private paymentRepository: Repository<Payment>;
  private creditService: CreditService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.creditService = new CreditService();
  }

  /**
   * Create a payment intent for purchasing credits
   */
  async createPaymentIntent(userId: string, packageId: string, email?: string) {
    // Get package details from config
    const packageConfig = stripeConfig.creditPackages[packageId as keyof typeof stripeConfig.creditPackages];
    
    if (!packageConfig) {
      throw new Error(`Invalid package ID: ${packageId}`);
    }

    console.log('💳 Creating payment intent:', {
      userId,
      packageId,
      credits: packageConfig.credits,
      amount: packageConfig.amount
    });

    try {
      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(packageConfig.amount * 100), // Convert to cents
        currency: stripeConfig.currency,
        metadata: {
          userId,
          packageId,
          credits: packageConfig.credits.toString(),
          packageName: packageConfig.name
        },
        description: `${packageConfig.name} for user ${userId}`,
        receipt_email: email,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('✅ Stripe Payment Intent created:', paymentIntent.id);

      // Save payment record to database
      const payment = this.paymentRepository.create({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: packageConfig.amount,
        currency: stripeConfig.currency,
        credits: packageConfig.credits,
        packageName: packageConfig.name,
        packageId: packageId,
        status: PaymentStatus.PENDING,
        stripeCustomerId: paymentIntent.customer as string || undefined,
      });

      await this.paymentRepository.save(payment);
      console.log('💾 Payment record saved to database:', payment.id);

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        amount: packageConfig.amount,
        currency: stripeConfig.currency,
        credits: packageConfig.credits,
        packageName: packageConfig.name
      };
    } catch (error: any) {
      console.error('❌ Error creating payment intent:', error.message);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm payment and add credits to user
   */
  async confirmPayment(paymentIntentId: string) {
    console.log('🔍 Confirming payment:', paymentIntentId);

    try {
      // Get payment from database
      const payment = await this.paymentRepository.findOne({
        where: { stripePaymentIntentId: paymentIntentId }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update payment status
        payment.status = PaymentStatus.SUCCEEDED;
        // Get receipt URL from charges if available
        const expandedIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['latest_charge']
        });
        payment.receiptUrl = (expandedIntent.latest_charge as any)?.receipt_url || undefined;
        await this.paymentRepository.save(payment);

        console.log('✅ Payment succeeded, adding credits...');

        // Add credits to user
        if (!payment.userId) {
          throw new Error('Payment has no associated user');
        }
        const newBalance = await this.addCreditsToUser(payment.userId, payment.credits);
        
        console.log('💰 Credits added successfully:', newBalance);

        // Create credit transaction record
        await this.createCreditTransaction(payment, paymentIntentId);

        return {
          success: true,
          message: 'Payment successful! Credits added to your account.',
          creditsAdded: payment.credits,
          newBalance: Number(newBalance)
        };
      } else if (paymentIntent.status === 'processing') {
        payment.status = PaymentStatus.PROCESSING;
        await this.paymentRepository.save(payment);

        return {
          success: false,
          message: 'Payment is being processed. Please wait...'
        };
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = paymentIntent.last_payment_error?.message;
        await this.paymentRepository.save(payment);

        throw new Error('Payment failed: ' + paymentIntent.last_payment_error?.message);
      }
    } catch (error: any) {
      console.error('❌ Error confirming payment:', error.message);
      throw error;
    }
  }

  /**
   * Add credits to user balance
   */
  private async addCreditsToUser(userId: string, credits: number): Promise<number> {
    const User = require('../../user/entities/User').User;
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

  // Ensure numeric addition (decimal fields may come as strings)
  const current = Number(user.currentCredit) || 0;
  const toAdd = Number(credits) || 0;
  user.currentCredit = current + toAdd;
    await userRepository.save(user);

  return Number(user.currentCredit);
  }

  /**
   * Create credit transaction record for purchase history
   */
  private async createCreditTransaction(payment: Payment, paymentIntentId: string): Promise<void> {
    const CreditTransaction = require('../../credit/entities/CreditTransaction').CreditTransaction;
    const transactionRepository = AppDataSource.getRepository(CreditTransaction);

    if (!payment.userId) {
      console.warn('⚠️ Skipping credit transaction creation: missing userId');
      return;
    }

    const transaction = transactionRepository.create({
      userId: payment.userId,
      packageId: payment.packageId,
      creditsEarned: payment.credits,
      priceInCents: Math.round(payment.amount * 100), // Convert dollars to cents
      currency: payment.currency,
      status: 'completed',
      transactionType: 'purchase',
      paymentProvider: 'stripe',
      paymentIntentId: paymentIntentId,
    });

    await transactionRepository.save(transaction);
    console.log('📝 Credit transaction recorded:', transaction.id);
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhookEvent(event: any) {
    console.log('🔔 Webhook received:', event.type);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        
        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object);
          break;

        default:
          console.log('ℹ️ Unhandled event type:', event.type);
      }
    } catch (error: any) {
      console.error('❌ Error handling webhook:', error.message);
      throw error;
    }
  }

  /**
   * Handle successful payment from webhook
   */
  private async handlePaymentSuccess(paymentIntent: any) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) {
      console.error('❌ Payment not found for intent:', paymentIntent.id);
      return;
    }

    // Prevent duplicate credit additions
    if (payment.status === PaymentStatus.SUCCEEDED) {
      console.log('⚠️ Payment already processed:', payment.id);
      return;
    }

    payment.status = PaymentStatus.SUCCEEDED;
    payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
    await this.paymentRepository.save(payment);

    console.log('✅ Payment marked as succeeded:', payment.id);

    // Add credits to user
    if (!payment.userId) {
      console.warn('⚠️ Payment missing userId in webhook, skipping credit addition');
      return;
    }
    await this.addCreditsToUser(payment.userId, payment.credits);

    console.log('💰 Credits added via webhook:', payment.credits);
  }

  /**
   * Handle failed payment from webhook
   */
  private async handlePaymentFailure(paymentIntent: any) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = paymentIntent.last_payment_error?.message;
      await this.paymentRepository.save(payment);
      console.log('❌ Payment marked as failed:', payment.id);
    }
  }

  /**
   * Handle canceled payment from webhook
   */
  private async handlePaymentCanceled(paymentIntent: any) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (payment) {
      payment.status = PaymentStatus.CANCELED;
      await this.paymentRepository.save(payment);
      console.log('🚫 Payment marked as canceled:', payment.id);
    }
  }

  /**
   * Get user's purchase history
   */
  async getPurchaseHistory(userId: string) {
    const payments = await this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    return payments.map(payment => ({
      id: payment.id,
      packageName: payment.packageName,
      credits: payment.credits,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      purchaseDate: payment.createdAt,
      receiptUrl: payment.receiptUrl
    }));
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string) {
    return await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user']
    });
  }
}

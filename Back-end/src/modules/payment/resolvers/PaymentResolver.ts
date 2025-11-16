import { Resolver, Mutation, Query, Arg, Ctx, Authorized } from 'type-graphql';
import { Service } from 'typedi';
import { PaymentService } from '../services/PaymentService';
import { AppleIAPService } from '../services/AppleIAPService';
import {
  CreatePaymentIntentInput,
  PaymentIntentResponse,
  ConfirmPaymentInput,
  ConfirmPaymentResponse,
  PurchaseHistoryItem
} from '../types/PaymentTypes';
import {
  VerifyAppleReceiptInput,
  VerifyAppleReceiptResponse,
  AppleIAPProduct
} from '../types/AppleIAPTypes';

@Service()
@Resolver()
export class PaymentResolver {
  private appleIAPService: AppleIAPService;

  constructor(private paymentService: PaymentService) {
    this.appleIAPService = new AppleIAPService();
  }

  @Authorized()
  @Mutation(() => PaymentIntentResponse)
  async createPaymentIntent(
    @Arg('input') input: CreatePaymentIntentInput,
    @Ctx() context: any
  ): Promise<PaymentIntentResponse> {
    const userId = context.userId;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('🎯 [PaymentResolver] Creating payment intent for user:', userId);

    return await this.paymentService.createPaymentIntent(
      userId,
      input.packageId,
      input.email
    );
  }

  @Authorized()
  @Mutation(() => ConfirmPaymentResponse)
  async confirmPayment(
    @Arg('input') input: ConfirmPaymentInput,
    @Ctx() context: any
  ): Promise<ConfirmPaymentResponse> {
    const userId = context.userId;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('🎯 [PaymentResolver] Confirming payment:', input.paymentIntentId);

    return await this.paymentService.confirmPayment(input.paymentIntentId);
  }

  @Authorized()
  @Query(() => [PurchaseHistoryItem])
  async getPurchaseHistory(@Ctx() context: any): Promise<PurchaseHistoryItem[]> {
    const userId = context.userId;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('🎯 [PaymentResolver] Getting purchase history for user:', userId);

    return await this.paymentService.getPurchaseHistory(userId);
  }

  @Authorized()
  @Mutation(() => VerifyAppleReceiptResponse)
  async verifyAppleReceipt(
    @Arg('input') input: VerifyAppleReceiptInput,
    @Ctx() context: any
  ): Promise<VerifyAppleReceiptResponse> {
    const userId = context.userId;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('🍎 [PaymentResolver] Verifying Apple receipt for user:', userId);

    return await this.appleIAPService.verifyReceipt(
      userId,
      input.receiptData,
      input.productId
    );
  }

  @Query(() => [AppleIAPProduct])
  async getAppleIAPProducts(): Promise<AppleIAPProduct[]> {
    return await this.appleIAPService.getAvailableProducts();
  }

  @Query(() => String)
  healthCheckPayment(): string {
    return 'Payment service is running!';
  }
}

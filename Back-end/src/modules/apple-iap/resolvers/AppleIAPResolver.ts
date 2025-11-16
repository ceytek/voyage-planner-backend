import { Resolver, Mutation, Query, Arg, Ctx, Authorized } from 'type-graphql';
import { Service } from 'typedi';
import { AppleIAPService } from '../services/AppleIAPService';
import {
  VerifyReceiptInput,
  VerifyReceiptResponse,
  RestorePurchasesInput,
  AppleProductInfo,
} from '../types/AppleIAPTypes';
import { Context } from '../../user/resolvers/UserResolver';

@Service()
@Resolver()
export class AppleIAPResolver {
  constructor(private appleIAPService: AppleIAPService) {}

  /**
   * Apple IAP makbuzunu doğrula ve kredileri ekle
   */
  @Authorized()
  @Mutation(() => VerifyReceiptResponse)
  async verifyAppleReceipt(
    @Arg('input') input: VerifyReceiptInput,
    @Ctx() context: Context
  ): Promise<VerifyReceiptResponse> {
    const userId = context.user!.id;

    const result = await this.appleIAPService.verifyAndAddCredits(
      userId,
      input.receiptData,
      input.productId,
      input.transactionId
    );

    return {
      success: result.success,
      message: result.message,
      credits: result.credits,
      newBalance: result.newBalance,
    };
  }

  /**
   * Satın almaları geri yükle
   */
  @Authorized()
  @Mutation(() => VerifyReceiptResponse)
  async restoreApplePurchases(
    @Arg('input') input: RestorePurchasesInput,
    @Ctx() context: Context
  ): Promise<VerifyReceiptResponse> {
    const userId = context.user!.id;

    const result = await this.appleIAPService.restorePurchases(userId, input.receiptData);

    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Satın alınabilir ürünleri listele
   */
  @Query(() => [AppleProductInfo])
  async getAppleProducts(): Promise<AppleProductInfo[]> {
    return this.appleIAPService.getProducts();
  }
}

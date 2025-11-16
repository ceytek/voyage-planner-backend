import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { CreditPackage } from '../entities/CreditPackage';
import { CreditTransaction } from '../entities/CreditTransaction';
import { CreditUsage } from '../entities/CreditUsage';
import { User } from '../../user/entities/User';
import { CreateCreditPackageInput } from '../dto/credit.dto';

@Service()
export class CreditService {
  private creditPackageRepository: Repository<CreditPackage>;
  private creditTransactionRepository: Repository<CreditTransaction>;
  private creditUsageRepository: Repository<CreditUsage>;
  private userRepository: Repository<User>;

  constructor() {
    this.creditPackageRepository = AppDataSource.getRepository(CreditPackage);
    this.creditTransactionRepository = AppDataSource.getRepository(CreditTransaction);
    this.creditUsageRepository = AppDataSource.getRepository(CreditUsage);
    this.userRepository = AppDataSource.getRepository(User);
  }

  // Credit Package Management
  async createCreditPackage(input: CreateCreditPackageInput): Promise<CreditPackage> {
    const creditPackage = this.creditPackageRepository.create(input);
    return await this.creditPackageRepository.save(creditPackage);
  }

  async getAllCreditPackages(): Promise<CreditPackage[]> {
    return await this.creditPackageRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' }
    });
  }

  async getCreditPackageById(id: string): Promise<CreditPackage | null> {
    return await this.creditPackageRepository.findOne({ where: { id } });
  }

  // Purchase credit package
  async purchaseCreditPackage(userId: string, packageId: string): Promise<{ 
    success: boolean; 
    transaction?: CreditTransaction;
    newBalance?: number;
    message: string;
  }> {
    try {
      // Get the package
      const creditPackage = await this.getCreditPackageById(packageId);
      if (!creditPackage) {
        return { success: false, message: 'Credit package not found' };
      }

      // Create transaction record
      const transaction = this.creditTransactionRepository.create({
        userId,
        packageId,
        creditsEarned: creditPackage.credits + (creditPackage.bonusCredits || 0),
        priceInCents: creditPackage.priceInCents,
        currency: creditPackage.currency,
        status: 'completed',
        transactionType: 'purchase',
        paymentProvider: 'mock',
        paymentIntentId: `mock_${Date.now()}`
      });
      
      const savedTransaction = await this.creditTransactionRepository.save(transaction);

      // Create usage record for purchase
      const usage = this.creditUsageRepository.create({
        userId,
        creditsUsed: creditPackage.credits + (creditPackage.bonusCredits || 0),
        action: 'purchase_credits',
        description: `Purchased ${creditPackage.credits} credits`
      });
      
      await this.creditUsageRepository.save(usage);

      // Update user's current credit
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        const current = Number(user.currentCredit) || 0;
        const inc = Number(creditPackage.credits + (creditPackage.bonusCredits || 0)) || 0;
        user.currentCredit = current + inc;
        await this.userRepository.save(user);
      }

      // Get new balance
      const newBalance = await this.getUserCreditBalance(userId);

      return { 
        success: true, 
        transaction: savedTransaction,
        newBalance,
        message: `Successfully added ${creditPackage.credits} credits to your account`
      };
    } catch (error) {
      console.error('Error purchasing credit package:', error);
      return { success: false, message: 'Failed to purchase credits' };
    }
  }

  // Get user's current credit balance
  async getUserCreditBalance(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.currentCredit || 0;
  }

  // Use credits and log usage
  async useCredits(params: {
    userId: string;
    creditsUsed: number;
    action: string;
    entityId?: string;
    entityType?: string;
    description?: string;
  }): Promise<{ success: boolean; newBalance?: number; message: string }> {
    const { userId, creditsUsed, action, entityId, entityType, description } = params;
    try {
      if (!userId) {
        return { success: false, message: 'Missing userId' };
      }
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Decrement credits (not below zero)
  const current = Number(user.currentCredit) || 0;
  const toUse = Math.max(0, Number(creditsUsed) || 0);
  user.currentCredit = Math.max(0, current - toUse);
      await this.userRepository.save(user);

      // Log usage
      const usage = this.creditUsageRepository.create({
        userId,
        creditsUsed: toUse,
        action,
        entityId,
        entityType,
        description,
      });
      await this.creditUsageRepository.save(usage);

  return { success: true, newBalance: Number(user.currentCredit), message: 'Credits used' };
    } catch (err) {
      console.error('[CreditService] useCredits error', err);
      return { success: false, message: 'Failed to use credits' };
    }
  }

  // Add credits to user (public method for Apple IAP)
  async addCreditsToUser(userId: string, credits: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const current = Number(user.currentCredit) || 0;
    const toAdd = Math.max(0, Number(credits) || 0);
    user.currentCredit = current + toAdd;
    
    await this.userRepository.save(user);
    console.log(`💰 Added ${toAdd} credits to user ${userId}. New balance: ${user.currentCredit}`);
    
    return Number(user.currentCredit);
  }

  // Get user's credit transaction history
  async getUserCreditHistory(userId: string): Promise<CreditTransaction[]> {
    return await this.creditTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  // Seed initial credit packages
  async seedCreditPackages(): Promise<void> {
    const packages = [
      {
        name: '100 Credits',
        credits: 100,
        priceInCents: 500, // $5.00
        currency: 'USD',
        description: 'Perfect for casual trip planning',
        isActive: true,
        sortOrder: 1
      },
      {
        name: '300 Credits',
        credits: 300,
        priceInCents: 1200, // $12.00
        currency: 'USD',
        description: 'Great value for regular travelers',
        isActive: true,
        sortOrder: 2
      },
      {
        name: '600 Credits',
        credits: 600,
        priceInCents: 2000, // $20.00
        currency: 'USD',
        description: 'Best deal for power users',
        isActive: true,
        sortOrder: 3,
        bonusCredits: 100
      }
    ];

    for (const packageData of packages) {
      const existingPackage = await this.creditPackageRepository.findOne({
        where: { name: packageData.name }
      });
      
      if (!existingPackage) {
        await this.createCreditPackage(packageData);
      }
    }
  }
}

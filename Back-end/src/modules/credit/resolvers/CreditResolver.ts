import { Resolver, Query, Mutation, Arg, Ctx, Int } from 'type-graphql';
import { Service } from 'typedi';
import { AppDataSource } from '../../../config/database';
import { CreditPackage } from '../entities/CreditPackage';
import { CreditPackageTranslation } from '../entities/CreditPackageTranslation';
import { CreditPackageType, PurchaseCreditResponse, CreditTransactionType, TransactionStatus, TransactionType, CreditTransactionConnection } from '../types/CreditTypes';
import { Context } from '../../user/resolvers/UserResolver';
import { User } from '../../user/entities/User';
import { CreditTransaction } from '../entities/CreditTransaction';
import { CreditUsage } from '../entities/CreditUsage';
import { CreditService } from '../services/CreditService';
import { CreditUsageType, CreditUsageConnection } from '../types/CreditTypes';

@Service()
@Resolver()
export class CreditResolver {
  private creditService = new CreditService();
  // Return active credit packages from DB (public.credit_packages) with translations
  @Query(() => [CreditPackageType], {
    description: 'Get all available credit packages from database with translations',
  })
  async getCreditPackages(
    @Arg('language', { defaultValue: 'en' }) language: string
  ): Promise<CreditPackageType[]> {
    const repo = AppDataSource.getRepository(CreditPackage);
    const rows = await repo.find({ 
      where: { isActive: true }, 
      order: { sortOrder: 'ASC' },
      relations: ['translations']
    });

    return rows.map((p) => {
      // Find translation for requested language, fallback to English, then to original name
      const translation = p.translations?.find(t => t.language === language) ||
                         p.translations?.find(t => t.language === 'en');
      
      return {
        id: p.id,
        name: translation?.name || p.name,
        credits: p.credits,
        priceInCents: p.priceInCents,
        currency: p.currency,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
        description: translation?.description || p.description,
        bonusCredits: p.bonusCredits,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });
  }

  // Use credits explicitly (optional endpoint)
  @Mutation(() => Number)
  async useCredits(
    @Arg('creditsUsed', () => Int) creditsUsed: number,
    @Arg('action') action: string,
    @Arg('entityId', { nullable: true }) entityId: string,
    @Arg('entityType', { nullable: true }) entityType: string,
    @Arg('description', { nullable: true }) description: string,
    @Ctx() ctx: Context,
  ): Promise<number> {
    const userId = ctx.user?.id;
    if (!userId) return 0;
    const res = await this.creditService.useCredits({ userId, creditsUsed, action, entityId, entityType, description });
    return res.newBalance || 0;
  }

  // List usage history for current user
  @Query(() => [CreditUsageType])
  async getUserCreditUsage(@Ctx() ctx: Context): Promise<CreditUsage[]> {
  const userId = ctx.user?.id;
  if (!userId) return [];
    const repo = AppDataSource.getRepository(CreditUsage);
    return await repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  @Query(() => CreditUsageConnection)
  async getUserCreditUsageV2(
    @Arg('first', () => Int, { nullable: true, defaultValue: 10 }) first: number,
    @Arg('after', () => String, { nullable: true }) after: string | undefined,
    @Ctx() ctx: Context
  ): Promise<CreditUsageConnection> {
    const userId = ctx.user?.id;
    if (!userId) return { items: [], nextCursor: undefined, hasMore: false };
    const repo = AppDataSource.getRepository(CreditUsage);

    let cursorCreatedAt: Date | null = null;
    let cursorId: string | null = null;
    if (after) {
      const [createdAtStr, id] = after.split('|');
      if (createdAtStr && id) {
        cursorCreatedAt = new Date(createdAtStr);
        cursorId = id;
      }
    }

    const qb = repo
      .createQueryBuilder('u')
      .where('u.userId = :userId', { userId })
      .orderBy('u.createdAt', 'DESC')
      .addOrderBy('u.id', 'DESC')
      .limit(first + 1);

    if (cursorCreatedAt && cursorId) {
      qb.andWhere('(u.createdAt < :cAt OR (u.createdAt = :cAt AND u.id < :cId))', {
        cAt: cursorCreatedAt,
        cId: cursorId,
      });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > first;
    const items = hasMore ? rows.slice(0, first) : rows;
    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? `${last.createdAt.toISOString()}|${last.id}` : undefined;
    return { items, nextCursor, hasMore };
  }

  // Current user credit balance (DB if auth, mock otherwise)
  @Query(() => Number, { description: 'Get current user credit balance' })
  async getUserCreditBalance(@Ctx() ctx: Context): Promise<number> {
    if (ctx.user?.id) {
      const user = await AppDataSource.getRepository(User).findOne({ where: { id: ctx.user.id } });
      const balance = Number(user?.currentCredit ?? 0);
      console.log(`💰 [getUserCreditBalance] User ${ctx.user.id} balance: ${balance}`);
      return balance;
    }
    // Unauthenticated: consistent zero instead of mock
    return 0;
  }

  // Recent transactions for current user
  @Query(() => [CreditTransactionType], { description: 'Get current user credit transaction history' })
  async getUserCreditHistory(@Ctx() ctx: Context): Promise<CreditTransactionType[]> {
    if (!ctx.user?.id) return [];
    const txRepo = AppDataSource.getRepository(CreditTransaction);
    const list = await txRepo.find({ where: { userId: ctx.user.id }, order: { createdAt: 'DESC' } });
    return list.map((t) => ({
      id: t.id,
      userId: t.userId,
      packageId: t.packageId,
      creditsEarned: t.creditsEarned,
      priceInCents: t.priceInCents,
      currency: t.currency,
      status: t.status as TransactionStatus,
      transactionType: t.transactionType as TransactionType,
      paymentProvider: t.paymentProvider,
      paymentIntentId: t.paymentIntentId,
      notes: t.notes,
      createdAt: t.createdAt,
    }));
  }

  // V2: Cursor-based recent transactions for current user
  @Query(() => CreditTransactionConnection, { description: 'Cursor-based user credit transaction history' })
  async getUserCreditHistoryV2(
    @Arg('first', () => Int, { nullable: true, defaultValue: 10 }) first: number,
    @Arg('after', () => String, { nullable: true }) after: string | undefined,
    @Ctx() ctx: Context
  ): Promise<CreditTransactionConnection> {
    const userId = ctx.user?.id;
    if (!userId) return { items: [], nextCursor: undefined, hasMore: false };
    const repo = AppDataSource.getRepository(CreditTransaction);

    let cursorCreatedAt: Date | null = null;
    let cursorId: string | null = null;
    if (after) {
      const [createdAtStr, id] = after.split('|');
      if (createdAtStr && id) {
        cursorCreatedAt = new Date(createdAtStr);
        cursorId = id;
      }
    }

    const qb = repo
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .orderBy('t.createdAt', 'DESC')
      .addOrderBy('t.id', 'DESC')
      .limit(first + 1);

    if (cursorCreatedAt && cursorId) {
      qb.andWhere('(t.createdAt < :cAt OR (t.createdAt = :cAt AND t.id < :cId))', {
        cAt: cursorCreatedAt,
        cId: cursorId,
      });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > first;
    const items = hasMore ? rows.slice(0, first) : rows;
    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? `${last.createdAt.toISOString()}|${last.id}` : undefined;

    // Map to GraphQL type shape if necessary
    const mapped = items.map((t) => ({
      id: t.id,
      userId: t.userId,
      packageId: t.packageId,
      creditsEarned: t.creditsEarned,
      priceInCents: t.priceInCents,
      currency: t.currency,
      status: t.status as TransactionStatus,
      transactionType: t.transactionType as TransactionType,
      paymentProvider: t.paymentProvider,
      paymentIntentId: t.paymentIntentId,
      notes: t.notes,
      createdAt: t.createdAt,
    }));

    return { items: mapped, nextCursor, hasMore };
  }

  // Process credit package purchase (temporary auth-optional implementation)
  @Mutation(() => PurchaseCreditResponse, {
    description: 'Purchase a credit package and return new balance',
  })
  async purchaseCreditPackage(
    @Arg('packageId') packageId: string,
    @Ctx() ctx: Context,
  ): Promise<PurchaseCreditResponse> {
    try {
      const userId = ctx.user?.id;

      // Fetch package to know credit amount
      const pkgRepo = AppDataSource.getRepository(CreditPackage);
      const pkg = await pkgRepo.findOne({ where: { id: packageId, isActive: true } });
      if (!pkg) {
        return { success: false, message: 'Kredi paketi bulunamadı' };
      }

      const totalCredits = pkg.credits + (pkg.bonusCredits || 0);

      if (userId) {
        // Real DB-backed flow: update user balance and log transaction
        const userRepo = AppDataSource.getRepository(User);
        const txRepo = AppDataSource.getRepository(CreditTransaction);

        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
          return { success: false, message: 'Kullanıcı bulunamadı' };
        }

        const current = Number(user.currentCredit) || 0;
        user.currentCredit = current + totalCredits;
        await userRepo.save(user);

        const tx = txRepo.create({
          userId,
          packageId: pkg.id,
          creditsEarned: totalCredits,
          priceInCents: pkg.priceInCents,
          currency: pkg.currency,
          status: 'completed',
          transactionType: 'purchase',
          paymentProvider: 'mock',
          paymentIntentId: `mock_${Date.now()}`,
          notes: `Purchased ${pkg.name}`,
        });
        await txRepo.save(tx);

        return {
          success: true,
          message: `${pkg.name} satın alındı` ,
          newBalance: Number(user.currentCredit),
        };
      }

      // No authenticated user: fall back to non-persistent response so UI can proceed
      const mockCurrent = 30; // keep in sync with getUserCreditBalance mock
      return {
        success: true,
        message: `${pkg.name} satın alımı (demo) işlendi`,
        newBalance: mockCurrent + totalCredits,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Satın alma işlemi sırasında bir hata oluştu',
      };
    }
  }
}

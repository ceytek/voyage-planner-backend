import { Resolver, Query, Mutation, Arg, ObjectType, Field, Int } from 'type-graphql';
import { Service } from 'typedi';

@ObjectType()
export class SimpleCreditPackage {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  credits!: number;

  @Field(() => Int)
  priceInCents!: number;

  @Field()
  currency!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  bonusCredits?: number;

  @Field(() => Int)
  sortOrder!: number;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class PurchaseResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => Int, { nullable: true })
  newBalance?: number;
}

@Service()
@Resolver()
export class SimpleCreditResolver {
  
  @Query(() => [SimpleCreditPackage], { description: 'Get all available credit packages' })
  async getCreditPackages(): Promise<SimpleCreditPackage[]> {
    // Return mock data for now
    return [
      {
        id: '1',
        name: '100 Credits',
        credits: 100,
        priceInCents: 500,
        currency: 'USD',
        description: 'Perfect for casual trip planning',
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: '300 Credits',
        credits: 300,
        priceInCents: 1200,
        currency: 'USD',
        description: 'Great value for regular travelers',
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: '600 Credits',
        credits: 600,
        priceInCents: 2000,
        currency: 'USD',
        description: 'Best deal for power users',
        bonusCredits: 100,
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  @Query(() => Int, { description: 'Get user current credit balance' })
  async getUserCreditBalance(): Promise<number> {
    // Return mock balance for now
    return 30;
  }

  @Query(() => [SimpleCreditPackage], { description: 'Get user credit transaction history' })
  async getUserCreditHistory(): Promise<SimpleCreditPackage[]> {
    // Return empty array for now
    return [];
  }

  @Mutation(() => PurchaseResponse, { description: 'Purchase a credit package' })
  async purchaseCreditPackage(
    @Arg('packageId') packageId: string
  ): Promise<PurchaseResponse> {
    // Mock purchase response
    return {
      success: true,
      message: 'Kredi paketi başarıyla satın alındı!',
      newBalance: 130
    };
  }
}

import { ObjectType, Field, ID, Int, registerEnumType } from 'type-graphql';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum TransactionType {
  PURCHASE = 'purchase',
  BONUS = 'bonus',
  REFUND = 'refund',
  ADMIN_GRANT = 'admin_grant'
}

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus'
});

registerEnumType(TransactionType, {
  name: 'TransactionType'
});

@ObjectType()
export class CreditPackageType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  credits!: number;

  @Field(() => Int)
  priceInCents!: number;

  @Field()
  currency!: string;

  @Field()
  isActive!: boolean;

  @Field(() => Int)
  sortOrder!: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  bonusCredits?: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class CreditTransactionType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  packageId!: string;

  @Field(() => Int)
  creditsEarned!: number;

  @Field(() => Int)
  priceInCents!: number;

  @Field()
  currency!: string;

  @Field(() => TransactionStatus)
  status!: TransactionStatus;

  @Field(() => TransactionType)
  transactionType!: TransactionType;

  @Field({ nullable: true })
  paymentProvider?: string;

  @Field({ nullable: true })
  paymentIntentId?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class CreditUsageType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field(() => Int)
  creditsUsed!: number;

  @Field()
  action!: string;

  @Field({ nullable: true })
  entityId?: string;

  @Field({ nullable: true })
  entityType?: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class UserCreditSummary {
  @Field(() => Int)
  totalCredits!: number;

  @Field(() => Int)
  usedCredits!: number;

  @Field(() => Int)
  availableCredits!: number;

  @Field(() => Int)
  totalPurchased!: number;

  @Field(() => Int)
  totalSpentInCents!: number;
}

@ObjectType()
export class PurchaseCreditResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => Int, { nullable: true })
  newBalance?: number;
}

@ObjectType()
export class CreditUsageConnection {
  @Field(() => [CreditUsageType])
  items!: CreditUsageType[];

  @Field({ nullable: true })
  nextCursor?: string;

  @Field()
  hasMore!: boolean;
}

@ObjectType()
export class CreditTransactionConnection {
  @Field(() => [CreditTransactionType])
  items!: CreditTransactionType[];

  @Field({ nullable: true })
  nextCursor?: string;

  @Field()
  hasMore!: boolean;
}

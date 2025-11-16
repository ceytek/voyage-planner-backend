import { ObjectType, Field, InputType, registerEnumType } from 'type-graphql';

// Transaction durumları
export enum AppleTransactionStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

registerEnumType(AppleTransactionStatus, {
  name: 'AppleTransactionStatus',
  description: 'Apple IAP transaction status',
});

// Kredi paketleri (Apple Product IDs ile eşleşecek)
export const APPLE_PRODUCT_IDS = {
  CREDITS_150: 'com.voyageapp.credits150',
  CREDITS_350: 'com.voyageapp.credits350',
  CREDITS_800: 'com.voyageapp.credits800',
};

export const CREDIT_PACKAGES = {
  [APPLE_PRODUCT_IDS.CREDITS_150]: {
    credits: 150,
    productId: APPLE_PRODUCT_IDS.CREDITS_150,
    name: 'Başlangıç Paketi',
    description: '150 kredi',
  },
  [APPLE_PRODUCT_IDS.CREDITS_350]: {
    credits: 350,
    productId: APPLE_PRODUCT_IDS.CREDITS_350,
    name: 'Popüler Paket',
    description: '350 kredi',
  },
  [APPLE_PRODUCT_IDS.CREDITS_800]: {
    credits: 800,
    productId: APPLE_PRODUCT_IDS.CREDITS_800,
    name: 'Premium Paket',
    description: '800 kredi',
  },
};

// GraphQL Types (sadece type tanımları, Entity değil)
@ObjectType()
export class AppleIAPTransaction {
  @Field()
  id!: string;

  @Field()
  userId!: string;

  @Field()
  productId!: string;

  @Field()
  transactionId!: string;

  @Field()
  originalTransactionId!: string;

  @Field()
  credits!: number;

  @Field(() => AppleTransactionStatus)
  status!: AppleTransactionStatus;

  @Field()
  receiptData!: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  verifiedAt?: Date;
}

@ObjectType()
export class VerifyReceiptResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field({ nullable: true })
  credits?: number;

  @Field({ nullable: true })
  newBalance?: number;

  @Field({ nullable: true })
  transaction?: AppleIAPTransaction;
}

@ObjectType()
export class AppleProductInfo {
  @Field()
  productId!: string;

  @Field()
  credits!: number;

  @Field()
  name!: string;

  @Field()
  description!: string;
}

// Input Types
@InputType()
export class VerifyReceiptInput {
  @Field()
  receiptData!: string;

  @Field()
  productId!: string;

  @Field()
  transactionId!: string;
}

@InputType()
export class RestorePurchasesInput {
  @Field()
  receiptData!: string;
}

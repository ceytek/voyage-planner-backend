import { ObjectType, Field, InputType, Int, Float } from 'type-graphql';

@InputType()
export class CreatePaymentIntentInput {
  @Field()
  packageId!: string; // 'credits_150', 'credits_350', 'credits_800'

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class PaymentIntentResponse {
  @Field()
  clientSecret!: string;

  @Field()
  paymentIntentId!: string;

  @Field(() => Float)
  amount!: number;

  @Field()
  currency!: string;

  @Field(() => Int)
  credits!: number;

  @Field()
  packageName!: string;
}

@InputType()
export class ConfirmPaymentInput {
  @Field()
  paymentIntentId!: string;
}

@ObjectType()
export class ConfirmPaymentResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => Int, { nullable: true })
  creditsAdded?: number;

  @Field(() => Float, { nullable: true })
  newBalance?: number;
}

@ObjectType()
export class PurchaseHistoryItem {
  @Field()
  id!: string;

  @Field()
  packageName!: string;

  @Field(() => Int)
  credits!: number;

  @Field(() => Float)
  amount!: number;

  @Field()
  currency!: string;

  @Field()
  status!: string;

  @Field(() => Date)
  purchaseDate!: Date;

  @Field({ nullable: true })
  receiptUrl?: string;
}

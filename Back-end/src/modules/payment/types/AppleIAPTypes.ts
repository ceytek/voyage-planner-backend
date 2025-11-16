import { ObjectType, Field, InputType, Int } from 'type-graphql';

@InputType()
export class VerifyAppleReceiptInput {
  @Field()
  receiptData!: string;

  @Field()
  productId!: string;
}

@ObjectType()
export class VerifyAppleReceiptResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => Int, { nullable: true })
  creditsAdded?: number;

  @Field(() => Int, { nullable: true })
  newBalance?: number;

  @Field({ nullable: true })
  transactionId?: string;
}

@ObjectType()
export class AppleIAPProduct {
  @Field()
  productId!: string;

  @Field(() => Int)
  credits!: number;

  @Field()
  price!: number;

  @Field()
  name!: string;
}

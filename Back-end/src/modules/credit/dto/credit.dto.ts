import { InputType, Field, Int } from 'type-graphql';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min } from 'class-validator';

@InputType()
export class CreateCreditPackageInput {
  @Field()
  @IsString()
  name!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  credits!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  priceInCents!: number;

  @Field()
  @IsString()
  currency!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  bonusCredits?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@InputType()
export class PurchaseCreditInput {
  @Field()
  @IsString()
  packageId!: string;

  @Field()
  @IsString()
  paymentProvider!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}

@InputType()
export class UseCreditInput {
  @Field()
  @IsString()
  userId!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  creditsUsed!: number;

  @Field()
  @IsString()
  action!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entityId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entityType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class AdminGrantCreditInput {
  @Field()
  @IsString()
  userId!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  credits!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

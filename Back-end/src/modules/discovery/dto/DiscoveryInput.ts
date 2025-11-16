// Discovery Input DTOs
// GraphQL input types for mutations

import { InputType, Field, Int, Float } from 'type-graphql';
import { IsNotEmpty, IsString, IsOptional, Min, Max, IsNumber, IsArray } from 'class-validator';

// Define nested types first
@InputType()
export class DetailedInfoInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  history?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  architecture?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  culturalSignificance?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bestTimeToVisit?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entryFee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  openingHours?: string;
}

@InputType()
export class UserReviewInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  author!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating!: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  comment!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  date?: string;
}

// Main input type
@InputType()
export class CreateDiscoveryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  placeName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  localName?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  country!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Field(() => DetailedInfoInput)
  detailedInfo!: DetailedInfoInput;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  ratingAverage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  ratingCount?: number;

  @Field(() => [UserReviewInput], { nullable: true })
  @IsOptional()
  @IsArray()
  userReviews?: UserReviewInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field({ defaultValue: 'tr' })
  @IsString()
  language: string = 'tr';
}

@InputType()
export class GetDiscoveriesInput {
  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset: number = 0;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;
}

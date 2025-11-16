import { InputType, Field } from 'type-graphql';
import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class CreateInterestCategoryInput {
  @Field()
  @IsString()
  key!: string;

  @Field()
  @IsString()
  icon!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@InputType()
export class UpdateInterestCategoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  key?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@InputType()
export class CreateInterestTranslationInput {
  @Field()
  @IsString()
  categoryId!: string;

  @Field()
  @IsString()
  language!: string;

  @Field()
  @IsString()
  name!: string;
}

@InputType()
export class UpdateInterestTranslationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}

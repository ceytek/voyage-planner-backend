import { InputType, Field, ObjectType, Float } from 'type-graphql';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsPhoneNumber } from 'class-validator';
import { AuthProvider, User } from '../entities/User';

@InputType()
export class GoogleAuthInput {
  @Field()
  @IsString()
  idToken!: string;
  
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  languagePreference?: string;
}

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Field(() => AuthProvider)
  @IsEnum(AuthProvider)
  provider!: AuthProvider;

  @Field()
  @IsString()
  providerId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ defaultValue: 'en' })
  @IsString()
  languagePreference!: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  languagePreference?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateCreditInput {
  @Field(() => Float)
  @IsNumber()
  amount!: number;
}

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user!: User;

  @Field()
  token!: string;

  @Field()
  message!: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  success!: boolean;

  @Field()
  message!: string;
}

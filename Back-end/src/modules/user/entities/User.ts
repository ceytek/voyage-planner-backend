import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType, Float } from 'type-graphql';

export enum AuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  EMAIL = 'email'
}

registerEnumType(AuthProvider, {
  name: 'AuthProvider',
  description: 'Available authentication providers'
});

@ObjectType()
@Entity('users')
@Index(['email'], { unique: true })
@Index(['providerId', 'provider'], { unique: true })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'display_name' })
  displayName?: string;

  @Field(() => AuthProvider)
  @Column({
    type: 'enum',
    enum: AuthProvider,
    enumName: 'auth_provider'
  })
  provider!: AuthProvider;

  @Field()
  @Column({ type: 'varchar', length: 255, name: 'provider_id' })
  providerId!: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'profile_picture' })
  profilePicture?: string;

  @Field()
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 30, name: 'current_credit' })
  currentCredit!: number;

  @Field({ nullable: true })
  @Column({ type: 'uuid', nullable: true, name: 'plan_id' })
  planId?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Field()
  @Column({ type: 'varchar', length: 10, default: 'en', name: 'language_preference' })
  languagePreference!: string;

  @Field()
  @Column({ type: 'boolean', default: false, name: 'has_completed_onboarding' })
  hasCompletedOnboarding!: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Float, Int, registerEnumType } from 'type-graphql';
import { User } from '../../user/entities/User';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment transaction status'
});

@ObjectType()
@Entity('payments')
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  appleTransactionId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  appleOriginalTransactionId?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  appleReceiptData?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  appleProductId?: string;

  @Field({ nullable: true })
  @Column({ default: 'stripe' })
  paymentMethod?: string; // 'stripe', 'apple_iap', 'google_iap'

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Field()
  @Column({ length: 3, default: 'usd' })
  currency!: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  credits!: number;

  @Field()
  @Column()
  packageName!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  packageId?: string;

  @Field(() => PaymentStatus)
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status!: PaymentStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  stripeCustomerId?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  receiptUrl?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;
}

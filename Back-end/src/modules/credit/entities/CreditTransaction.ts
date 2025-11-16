import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/User';
import type { CreditPackage } from './CreditPackage';

@Entity('credit_transactions')
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  packageId!: string;

  @Column()
  creditsEarned!: number; // purchased credits

  @Column()
  priceInCents!: number; // actual paid amount

  @Column()
  currency!: string; // 'USD'

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  })
  status!: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({
    type: 'enum',
    enum: ['purchase', 'bonus', 'refund', 'admin_grant'],
    default: 'purchase'
  })
  transactionType!: 'purchase' | 'bonus' | 'refund' | 'admin_grant';

  @Column({ nullable: true })
  paymentProvider?: string; // 'stripe', 'paypal', 'apple_pay'

  @Column({ nullable: true })
  paymentIntentId?: string; // stripe payment intent id

  @Column({ nullable: true })
  notes?: string; // admin notes

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: any;

  // Note: packageId stores the Stripe package key (e.g., 'credits_150'), not the database UUID
  // Removed @ManyToOne relationship to avoid UUID parsing errors

  @CreateDateColumn()
  createdAt!: Date;
}

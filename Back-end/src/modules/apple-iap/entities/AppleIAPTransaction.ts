import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AppleTransactionStatusDB {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity({ name: 'apple_iap_transactions' })
export class AppleIAPTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  productId!: string;

  @Index({ unique: true })
  @Column()
  transactionId!: string;

  @Column()
  originalTransactionId!: string;

  @Column({ type: 'int' })
  credits!: number;

  @Column({ type: 'enum', enum: AppleTransactionStatusDB, default: AppleTransactionStatusDB.PENDING })
  status!: AppleTransactionStatusDB;

  @Column({ type: 'text' })
  receiptData!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date | null;
}

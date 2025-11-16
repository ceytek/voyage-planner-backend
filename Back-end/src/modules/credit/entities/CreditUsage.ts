import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/User';

@Entity('credit_usage')
export class CreditUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  creditsUsed!: number; // how many credits spent

  @Column()
  action!: string; // 'create_plan', 'hotel_suggestions', 'export_pdf'

  @Column({ nullable: true })
  entityId?: string; // tripId, hotelId, etc.

  @Column({ nullable: true })
  entityType?: string; // 'trip', 'hotel', 'restaurant'

  @Column({ nullable: true })
  description?: string; // 'Created trip plan for Thailand'

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: any;

  @CreateDateColumn()
  createdAt!: Date;
}

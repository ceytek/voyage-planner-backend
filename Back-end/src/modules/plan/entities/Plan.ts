import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';

@ObjectType()
@Entity('plans')
@Index(['name'], { unique: true })
export class Plan {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Field()
  @Column({ type: 'varchar', length: 100, name: 'display_name' })
  displayName!: string;

  @Field(() => Int)
  @Column({ type: 'integer', name: 'monthly_credits' })
  monthlyCredits!: number;

  @Field(() => Int)
  @Column({ type: 'integer', name: 'price_cents' })
  priceCents!: number;

  @Field(() => Int)
  @Column({ type: 'integer', name: 'credit_cost_per_action' })
  creditCostPerAction!: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  features?: string;

  @Field()
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Virtual field for formatted price
  @Field()
  get formattedPrice(): string {
    return `$${(this.priceCents / 100).toFixed(2)}`;
  }
}

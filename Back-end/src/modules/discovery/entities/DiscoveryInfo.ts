// Discovery Info Entity
// Trip'ten tamamen ayrı, sadece fotoğraf analizi kayıtları için

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn
} from 'typeorm';
import { Field, ObjectType, ID, Int, Float } from 'type-graphql';
import { User } from '../../user/entities/User';

@ObjectType()
@Entity('discovery_info')
@Index(['userId', 'createdAt'])
export class DiscoveryInfo {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column()
  @Index()
  userId!: string;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Place Information
  @Field()
  @Column({ type: 'varchar', length: 255 })
  placeName!: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  localName?: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Field()
  @Column({ type: 'text' })
  description!: string;

  // Detailed Information (JSON)
  @Field(() => String)
  @Column({ type: 'jsonb' })
  detailedInfo!: {
    history?: string;
    architecture?: string;
    culturalSignificance?: string;
    bestTimeToVisit?: string;
    entryFee?: string;
    openingHours?: string;
  };

  // Rating
  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  ratingAverage?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  ratingCount?: number;

  // User Reviews (JSON array)
  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  userReviews?: {
    author: string;
    rating: number;
    comment: string;
    date?: string;
  }[];

  // Categories
  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  categories?: string[];

  // Image
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  imageUrl?: string; // User's uploaded image URL (from storage)

  // Language
  @Field()
  @Column({ type: 'varchar', length: 10, default: 'tr' })
  @Index()
  language!: string;

  // Credit Cost (always 15 for successful recognition)
  @Field(() => Int)
  @Column({ type: 'int', default: 15 })
  creditCost!: number;

  // Timestamps
  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;
}

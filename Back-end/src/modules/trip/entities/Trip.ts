import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/User';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text', nullable: true, default: null })
  name?: string | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  country!: string;

  @Column({ type: 'jsonb' })
  cities!: string[];

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'varchar', length: 10 })
  language!: string;

  @Column({ name: 'hero_image', type: 'text' })
  heroImage!: string;

  @Column({ name: 'cover_image_url', type: 'text', nullable: true })
  coverImageUrl?: string | null;

  @Column({ type: 'jsonb' })
  interests!: string[];

  @Column({ type: 'jsonb' })
  itinerary!: any; // Full trip plan structure

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse?: any; // Original GPT response

  @Column({ type: 'varchar', length: 50, nullable: true })
  model?: string;

  @Column({ name: 'prompt_version', type: 'int', default: 1 })
  promptVersion!: number;

  @Column({ name: 'schema_version', type: 'int', default: 1 })
  schemaVersion!: number;

  @Column({ name: 'credits_spent', type: 'int', default: 0 })
  creditsSpent!: number;

  @Column({ type: 'varchar', length: 20, default: 'gpt' })
  source!: string;

  @Column({ name: 'is_fav', type: 'boolean', default: false })
  isFav!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

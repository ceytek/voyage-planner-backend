import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { InterestTranslation } from './InterestTranslation';

@Entity('interest_categories')
export class InterestCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  key!: string; // unique identifier like 'nature', 'history', etc.

  @Column()
  icon!: string; // Ionicons name

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number; // for ordering in UI

  @OneToMany('InterestTranslation', 'category')
  translations!: InterestTranslation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

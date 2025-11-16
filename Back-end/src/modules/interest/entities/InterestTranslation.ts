import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { InterestCategory } from './InterestCategory';

@Entity('interest_translations')
export class InterestTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  categoryId!: string;

  @Column()
  language!: string; // 'en', 'tr', 'fr', 'es', 'it'

  @Column()
  name!: string; // translated name

  @ManyToOne('InterestCategory', 'translations')
  @JoinColumn({ name: 'categoryId' })
  category!: InterestCategory;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

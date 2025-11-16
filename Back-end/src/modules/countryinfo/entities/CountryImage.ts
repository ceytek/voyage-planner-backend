import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('country_images')
export class CountryImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  country!: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl!: string;

  @Column({ type: 'text', nullable: true })
  photographer?: string;

  @Column({ name: 'photo_source', type: 'text', nullable: true })
  photoSource?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

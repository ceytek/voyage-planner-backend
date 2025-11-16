import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 2, unique: true })
  code!: string; // ISO 3166-1 alpha-2 (TR, TH, FR, IT, ES...)

  @Column({ type: 'varchar', length: 10, nullable: true })
  flagEmoji?: string; // 🇹🇷, 🇹🇭, 🇫🇷...

    @Column({ default: false })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string; // Representative country image from Wikimedia // For custom ordering (popular countries first)

  @OneToMany('CountryTranslation', 'country', { cascade: true })
  translations!: any[];

  @OneToMany('City', 'country', { cascade: true })
  cities!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

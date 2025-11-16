import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CreditPackage } from './CreditPackage';

@Entity('credit_package_translations')
export class CreditPackageTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  packageId!: string;

  @Column({ length: 10 })
  language!: string; // 'en', 'tr', 'es', etc.

  @Column()
  name!: string; // Translated package name

  @Column({ nullable: true })
  description?: string; // Translated description

  @ManyToOne(() => CreditPackage, creditPackage => creditPackage.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'packageId' })
  creditPackage!: CreditPackage;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

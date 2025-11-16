import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CreditPackageTranslation } from './CreditPackageTranslation';

@Entity('credit_packages')
export class CreditPackage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; // 'Starter Pack', 'Popular Pack', 'Value Pack'

  @Column()
  credits!: number; // 100, 300, 600

  @Column()
  priceInCents!: number; // 500 ($5.00), 1200 ($12.00), 2000 ($20.00)

  @Column()
  currency!: string; // 'USD'

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number; // display order

  @Column({ nullable: true })
  description?: string; // 'Best for casual travelers'

  @Column({ nullable: true })
  bonusCredits?: number; // extra credits for promotions

  @OneToMany(() => CreditPackageTranslation, translation => translation.creditPackage)
  translations!: CreditPackageTranslation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

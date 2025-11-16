import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('country_translations')
export class CountryTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne('Country', 'translations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'countryId' })
  country!: any;

  @Column({ type: 'varchar', length: 10 })
  language!: string; // en, tr, fr, it, es...

  @Column({ type: 'varchar', length: 100 })
  name!: string; // Turkey, Türkiye, Turquie, Turchia...

  @CreateDateColumn()
  createdAt!: Date;
}

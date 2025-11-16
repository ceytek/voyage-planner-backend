import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('country_info')
@Index(['country', 'language'], { unique: true })
export class CountryInfo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', length: 10 })
  language!: string;

  @Column({ type: 'jsonb' })
  countryInfo!: {
    overview: string;
    topHighlights: string[];
    currency: string;
    power: string;
    emergency: string;
    sim: string;
    bestSeasons: string;
    tipping?: string;
    safety: string;
    localEtiquette?: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

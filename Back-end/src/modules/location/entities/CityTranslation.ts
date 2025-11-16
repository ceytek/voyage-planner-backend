import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('city_translations')
export class CityTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  cityId!: string;

  @ManyToOne('City', 'translations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city!: any;

  @Column({ type: 'varchar', length: 10 })
  language!: string; // en, tr, fr, it, es...

  @Column({ type: 'varchar', length: 100 })
  name!: string; // Bangkok, บางกอก, Istanbul, İstanbul...

  @CreateDateColumn()
  createdAt!: Date;
}

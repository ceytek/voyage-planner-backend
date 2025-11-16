import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne('Country', 'cities', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'countryId' })
  country!: any;

  @Column({ type: 'int', nullable: true })
  population?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'boolean', default: false })
  isPopular!: boolean; // Tourist cities flag

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany('CityTranslation', 'city', { cascade: true })
  translations!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

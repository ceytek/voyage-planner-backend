import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../modules/user/entities/User';
import { Plan } from '../modules/plan/entities/Plan';
import { InterestCategory } from '../modules/interest/entities/InterestCategory';
import { InterestTranslation } from '../modules/interest/entities/InterestTranslation';
import { CreditPackage } from '../modules/credit/entities/CreditPackage';
import { CreditPackageTranslation } from '../modules/credit/entities/CreditPackageTranslation';
import { CreditTransaction } from '../modules/credit/entities/CreditTransaction';
import { CreditUsage } from '../modules/credit/entities/CreditUsage';
import { Trip } from '../modules/trip/entities/Trip';
import { Country } from '../modules/location/entities/Country';
import { CountryTranslation } from '../modules/location/entities/CountryTranslation';
import { City } from '../modules/location/entities/City';
import { CityTranslation } from '../modules/location/entities/CityTranslation';
import { CountryInfo } from '../modules/countryinfo/entities/CountryInfo';
import { CountryImage } from '../modules/countryinfo/entities/CountryImage';
import { DiscoveryInfo } from '../modules/discovery/entities/DiscoveryInfo';
import { Payment } from '../modules/payment/entities/Payment';
import { AppleIAPTransactionEntity } from '../modules/apple-iap/entities/AppleIAPTransaction';

dotenv.config();

// SSL configuration - only enable for AWS RDS
const useSSL = process.env.DB_HOST?.includes('rds.amazonaws.com') || 
               process.env.DB_HOST?.includes('amazonaws.com');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'ceytek85',
  database: process.env.DB_DATABASE || 'gumpdb',
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  synchronize: true, // Auto-create tables from entities
  logging: false, // Disable SQL query logging
  entities: [User, Plan, InterestCategory, InterestTranslation, CreditPackage, CreditPackageTranslation, CreditTransaction, CreditUsage, Trip, Country, CountryTranslation, City, CityTranslation, CountryInfo, CountryImage, DiscoveryInfo, Payment, AppleIAPTransactionEntity],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

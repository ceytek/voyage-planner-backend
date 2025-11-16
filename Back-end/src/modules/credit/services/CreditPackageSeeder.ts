import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { CreditPackage } from '../entities/CreditPackage';
import { CreditPackageTranslation } from '../entities/CreditPackageTranslation';

@Service()
export class CreditPackageSeeder {
  private creditPackageRepository: Repository<CreditPackage>;
  private translationRepository: Repository<CreditPackageTranslation>;

  constructor() {
    this.creditPackageRepository = AppDataSource.getRepository(CreditPackage);
    this.translationRepository = AppDataSource.getRepository(CreditPackageTranslation);
  }

  async seedCreditPackagesWithTranslations(): Promise<void> {
    // Check if packages already exist
    const existingCount = await this.creditPackageRepository.count();
    if (existingCount > 0) {
      console.log('📊 Credit packages already exist, skipping seed');
      return;
    }

    // Package data with translations
    const packagesData = [
      {
        credits: 100,
        priceInCents: 500,
        currency: 'USD',
        isActive: true,
        sortOrder: 1,
        translations: {
          en: { name: 'Starter Pack', description: 'Perfect for casual travelers' },
          tr: { name: 'Başlangıç Paketi', description: 'Gündelik gezginler için mükemmel' }
        }
      },
      {
        credits: 300,
        priceInCents: 1200,
        currency: 'USD',
        isActive: true,
        sortOrder: 2,
        bonusCredits: 50,
        translations: {
          en: { name: 'Popular Pack', description: 'Best value for regular planners' },
          tr: { name: 'Popüler Paket', description: 'Düzenli planlayıcılar için en iyi değer' }
        }
      },
      {
        credits: 750,
        priceInCents: 2000,
        currency: 'USD',
        isActive: true,
        sortOrder: 3,
        bonusCredits: 150,
        translations: {
          en: { name: 'Value Pack', description: 'Ultimate package for power users' },
          tr: { name: 'Değer Paketi', description: 'Güçlü kullanıcılar için en üst paket' }
        }
      }
    ];

    for (const packageData of packagesData) {
      // Create package
      const creditPackage = this.creditPackageRepository.create({
        name: packageData.translations.en.name, // Default name
        credits: packageData.credits,
        priceInCents: packageData.priceInCents,
        currency: packageData.currency,
        isActive: packageData.isActive,
        sortOrder: packageData.sortOrder,
        description: packageData.translations.en.description, // Default description
        bonusCredits: packageData.bonusCredits,
      });

      const savedPackage = await this.creditPackageRepository.save(creditPackage);

      // Create translations
      for (const [language, translation] of Object.entries(packageData.translations)) {
        const packageTranslation = this.translationRepository.create({
          packageId: savedPackage.id,
          language,
          name: translation.name,
          description: translation.description,
        });
        await this.translationRepository.save(packageTranslation);
      }
    }

    console.log('✅ Credit packages and translations seeded successfully');
  }
}

import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { InterestCategory } from '../entities/InterestCategory';
import { InterestTranslation } from '../entities/InterestTranslation';
import { CreateInterestCategoryInput, UpdateInterestCategoryInput, CreateInterestTranslationInput, UpdateInterestTranslationInput } from '../dto/interest.dto';

@Service()
export class InterestService {
  private interestCategoryRepository: Repository<InterestCategory>;
  private interestTranslationRepository: Repository<InterestTranslation>;

  constructor() {
    this.interestCategoryRepository = AppDataSource.getRepository(InterestCategory);
    this.interestTranslationRepository = AppDataSource.getRepository(InterestTranslation);
  }

  // Interest Category CRUD operations
  async createCategory(input: CreateInterestCategoryInput): Promise<InterestCategory> {
    const category = this.interestCategoryRepository.create(input);
    return await this.interestCategoryRepository.save(category);
  }

  async getAllCategories(): Promise<InterestCategory[]> {
    return await this.interestCategoryRepository.find({
      where: { isActive: true },
      relations: ['translations'],
      order: { sortOrder: 'ASC' }
    });
  }

  async getCategoryById(id: string): Promise<InterestCategory | null> {
    return await this.interestCategoryRepository.findOne({
      where: { id },
      relations: ['translations']
    });
  }

  async getCategoryByKey(key: string): Promise<InterestCategory | null> {
    return await this.interestCategoryRepository.findOne({
      where: { key },
      relations: ['translations']
    });
  }

  async updateCategory(id: string, input: UpdateInterestCategoryInput): Promise<InterestCategory> {
    await this.interestCategoryRepository.update(id, input);
    const category = await this.getCategoryById(id);
    if (!category) {
      throw new Error('Interest category not found');
    }
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.interestCategoryRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // Interest Translation CRUD operations
  async createTranslation(input: CreateInterestTranslationInput): Promise<InterestTranslation> {
    const translation = this.interestTranslationRepository.create(input);
    return await this.interestTranslationRepository.save(translation);
  }

  async getTranslationsByCategory(categoryId: string): Promise<InterestTranslation[]> {
    return await this.interestTranslationRepository.find({
      where: { categoryId }
    });
  }

  async getTranslationByCategoryAndLanguage(categoryId: string, language: string): Promise<InterestTranslation | null> {
    return await this.interestTranslationRepository.findOne({
      where: { categoryId, language }
    });
  }

  async updateTranslation(id: string, input: UpdateInterestTranslationInput): Promise<InterestTranslation> {
    await this.interestTranslationRepository.update(id, input);
    const translation = await this.interestTranslationRepository.findOne({ where: { id } });
    if (!translation) {
      throw new Error('Interest translation not found');
    }
    return translation;
  }

  async deleteTranslation(id: string): Promise<boolean> {
    const result = await this.interestTranslationRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // Helper method to get categories with translations for a specific language
  async getCategoriesWithTranslations(language: string = 'en'): Promise<InterestCategory[]> {
    return await this.interestCategoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translation', 'translation.language = :language', { language })
      .where('category.isActive = :isActive', { isActive: true })
      .orderBy('category.sortOrder', 'ASC')
      .getMany();
  }

  // Bulk create categories with translations (useful for seeding)
  async seedInterests(): Promise<void> {
    const interestsData = [
      {
        key: 'nature',
        icon: 'leaf-outline',
        sortOrder: 1,
        translations: [
          { language: 'en', name: 'Nature' },
          { language: 'tr', name: 'Doğa' },
          { language: 'fr', name: 'Nature' },
          { language: 'es', name: 'Naturaleza' },
          { language: 'it', name: 'Natura' }
        ]
      },
      {
        key: 'history',
        icon: 'library-outline',
        sortOrder: 2,
        translations: [
          { language: 'en', name: 'History' },
          { language: 'tr', name: 'Tarih' },
          { language: 'fr', name: 'Histoire' },
          { language: 'es', name: 'Historia' },
          { language: 'it', name: 'Storia' }
        ]
      },
      {
        key: 'museum',
        icon: 'library-outline',
        sortOrder: 3,
        translations: [
          { language: 'en', name: 'Museum' },
          { language: 'tr', name: 'Müze' },
          { language: 'fr', name: 'Musée' },
          { language: 'es', name: 'Museo' },
          { language: 'it', name: 'Museo' }
        ]
      },
      {
        key: 'beach',
        icon: 'water-outline',
        sortOrder: 4,
        translations: [
          { language: 'en', name: 'Beach' },
          { language: 'tr', name: 'Deniz' },
          { language: 'fr', name: 'Plage' },
          { language: 'es', name: 'Playa' },
          { language: 'it', name: 'Spiaggia' }
        ]
      },
      {
        key: 'adventure',
        icon: 'bicycle-outline',
        sortOrder: 5,
        translations: [
          { language: 'en', name: 'Adventure' },
          { language: 'tr', name: 'Macera' },
          { language: 'fr', name: 'Aventure' },
          { language: 'es', name: 'Aventura' },
          { language: 'it', name: 'Avventura' }
        ]
      },
      {
        key: 'food',
        icon: 'restaurant-outline',
        sortOrder: 6,
        translations: [
          { language: 'en', name: 'Food' },
          { language: 'tr', name: 'Gastronomi' },
          { language: 'fr', name: 'Gastronomie' },
          { language: 'es', name: 'Gastronomía' },
          { language: 'it', name: 'Gastronomia' }
        ]
      }
    ];

    for (const interestData of interestsData) {
      // Check if category already exists
      const existingCategory = await this.getCategoryByKey(interestData.key);
      if (!existingCategory) {
        // Create category
        const category = await this.createCategory({
          key: interestData.key,
          icon: interestData.icon,
          sortOrder: interestData.sortOrder,
          isActive: true
        });

        // Create translations
        for (const translationData of interestData.translations) {
          await this.createTranslation({
            categoryId: category.id,
            language: translationData.language,
            name: translationData.name
          });
        }
      }
    }
  }
}

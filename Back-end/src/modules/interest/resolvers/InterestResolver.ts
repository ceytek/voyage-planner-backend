import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { Service } from 'typedi';
import { InterestCategory } from '../entities/InterestCategory';
import { InterestTranslation } from '../entities/InterestTranslation';
import { InterestCategoryType, InterestTranslationType } from '../types/InterestTypes';
import { InterestService } from '../services/InterestService';
import { CreateInterestCategoryInput, UpdateInterestCategoryInput, CreateInterestTranslationInput, UpdateInterestTranslationInput } from '../dto/interest.dto';

@Resolver(() => InterestCategoryType)
@Service()
export class InterestResolver {
  constructor(private interestService: InterestService) {}

  // Category Queries
  @Query(() => [InterestCategoryType])
  async getInterestCategories(): Promise<InterestCategory[]> {
    return await this.interestService.getAllCategories();
  }

  @Query(() => InterestCategoryType, { nullable: true })
  async getInterestCategoryById(@Arg('id', () => ID) id: string): Promise<InterestCategory | null> {
    return await this.interestService.getCategoryById(id);
  }

  @Query(() => InterestCategoryType, { nullable: true })
  async getInterestCategoryByKey(@Arg('key') key: string): Promise<InterestCategory | null> {
    return await this.interestService.getCategoryByKey(key);
  }

  @Query(() => [InterestCategoryType])
  async getInterestCategoriesWithTranslations(
    @Arg('language', { defaultValue: 'en' }) language: string
  ): Promise<InterestCategory[]> {
    return await this.interestService.getCategoriesWithTranslations(language);
  }

  // Category Mutations
  @Mutation(() => InterestCategoryType)
  async createInterestCategory(@Arg('input') input: CreateInterestCategoryInput): Promise<InterestCategory> {
    return await this.interestService.createCategory(input);
  }

  @Mutation(() => InterestCategoryType)
  async updateInterestCategory(
    @Arg('id', () => ID) id: string,
    @Arg('input') input: UpdateInterestCategoryInput
  ): Promise<InterestCategory> {
    return await this.interestService.updateCategory(id, input);
  }

  @Mutation(() => Boolean)
  async deleteInterestCategory(@Arg('id', () => ID) id: string): Promise<boolean> {
    return await this.interestService.deleteCategory(id);
  }

  // Translation Mutations
  @Mutation(() => InterestTranslationType)
  async createInterestTranslation(@Arg('input') input: CreateInterestTranslationInput): Promise<InterestTranslation> {
    return await this.interestService.createTranslation(input);
  }

  @Mutation(() => InterestTranslationType)
  async updateInterestTranslation(
    @Arg('id', () => ID) id: string,
    @Arg('input') input: UpdateInterestTranslationInput
  ): Promise<InterestTranslation> {
    return await this.interestService.updateTranslation(id, input);
  }

  @Mutation(() => Boolean)
  async deleteInterestTranslation(@Arg('id', () => ID) id: string): Promise<boolean> {
    return await this.interestService.deleteTranslation(id);
  }

  // Utility mutation for seeding data
  @Mutation(() => Boolean)
  async seedInterestData(): Promise<boolean> {
    try {
      await this.interestService.seedInterests();
      return true;
    } catch (error) {
      console.error('Error seeding interest data:', error);
      return false;
    }
  }
}

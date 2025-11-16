// Discovery Service
// Business logic for photo discovery feature

import { Repository } from 'typeorm';
import { Service } from 'typedi';
import { AppDataSource } from '../../../config/database';
import { DiscoveryInfo } from '../entities/DiscoveryInfo';
import { User } from '../../user/entities/User';
import { CreateDiscoveryInput } from '../dto/DiscoveryInput';
import { CreditUsage } from '../../credit/entities/CreditUsage';
import { CREDIT_COSTS } from '../../credit/constants';
import { GraphQLError } from 'graphql';

@Service()
export class DiscoveryService {
  private discoveryRepository: Repository<DiscoveryInfo>;
  private userRepository: Repository<User>;

  constructor() {
    this.discoveryRepository = AppDataSource.getRepository(DiscoveryInfo);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new discovery and deduct credits from user
   * @param userId - User ID
   * @param input - Discovery data from photo analysis
   * @returns Created discovery record
   */
  async createDiscovery(
    userId: string,
    input: CreateDiscoveryInput
  ): Promise<DiscoveryInfo> {
  const creditCost = CREDIT_COSTS.discovery; // Fixed cost for photo analysis

    // Start a transaction to ensure atomic credit deduction + save
    return await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      // Get user with lock to prevent race conditions
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'USER_NOT_FOUND' },
        });
      }

      // Check if user has enough credits
      if (user.currentCredit < creditCost) {
        throw new GraphQLError('Insufficient credits', {
          extensions: {
            code: 'INSUFFICIENT_CREDITS',
            required: creditCost,
            available: user.currentCredit,
          },
        });
      }

      // Deduct credits
      user.currentCredit -= creditCost;
      await transactionalEntityManager.save(User, user);

      // Create discovery record
      const discovery = this.discoveryRepository.create({
        user,
        placeName: input.placeName,
        localName: input.localName,
        country: input.country,
        city: input.city,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description,
        detailedInfo: input.detailedInfo as any, // JSONB column
        ratingAverage: input.ratingAverage,
        ratingCount: input.ratingCount,
        userReviews: input.userReviews as any, // JSONB column
        categories: input.categories as any, // JSONB column
        imageUrl: input.imageUrl,
        language: input.language,
        creditCost,
      });

      await transactionalEntityManager.save(DiscoveryInfo, discovery);

      // Log credit usage for this discovery action
      const usage = transactionalEntityManager.create(CreditUsage, {
        userId: user.id,
        creditsUsed: creditCost,
        action: 'discovery',
        entityId: discovery.id,
        entityType: 'discovery',
        description: `Photo discovery: ${input.placeName}`,
      });
      await transactionalEntityManager.save(CreditUsage, usage);

      return discovery;
    });
  }

  /**
   * Get user's discovery history with pagination
   * @param userId - User ID
   * @param limit - Number of items per page
   * @param offset - Number of items to skip
   * @param language - Optional language filter
   * @returns List of discoveries and total count
   */
  async getUserDiscoveries(
    userId: string,
    limit: number = 10,
    offset: number = 0,
    language?: string
  ): Promise<{ items: DiscoveryInfo[]; total: number }> {
    const queryBuilder = this.discoveryRepository
      .createQueryBuilder('discovery')
      .where('discovery.userId = :userId', { userId })
      .orderBy('discovery.createdAt', 'DESC');

    // Optional language filter
    if (language) {
      queryBuilder.andWhere('discovery.language = :language', { language });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated items
    const items = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    return { items, total };
  }

  /**
   * Get a single discovery by ID
   * @param discoveryId - Discovery ID
   * @param userId - User ID (for authorization)
   * @returns Discovery record
   */
  async getDiscoveryById(
    discoveryId: string,
    userId: string
  ): Promise<DiscoveryInfo> {
    const discovery = await this.discoveryRepository.findOne({
      where: { id: discoveryId, user: { id: userId } },
    });

    if (!discovery) {
      throw new GraphQLError('Discovery not found', {
        extensions: { code: 'DISCOVERY_NOT_FOUND' },
      });
    }

    return discovery;
  }

  /**
   * Delete a discovery
   * @param discoveryId - Discovery ID
   * @param userId - User ID (for authorization)
   */
  async deleteDiscovery(discoveryId: string, userId: string): Promise<boolean> {
    const discovery = await this.getDiscoveryById(discoveryId, userId);
    await this.discoveryRepository.remove(discovery);
    return true;
  }

  /**
   * Get discovery statistics for a user
   * @param userId - User ID
   * @returns Statistics object
   */
  async getUserStats(userId: string): Promise<{
    totalDiscoveries: number;
    totalCreditsSpent: number;
    countriesVisited: string[];
    favoriteCategories: string[];
  }> {
    const discoveries = await this.discoveryRepository.find({
      where: { user: { id: userId } },
    });

    const totalDiscoveries = discoveries.length;
    const totalCreditsSpent = discoveries.reduce(
      (sum, d) => sum + d.creditCost,
      0
    );

    // Get unique countries
    const countriesSet = new Set(discoveries.map((d) => d.country));
    const countriesVisited = Array.from(countriesSet);

    // Count categories
    const categoryCount: { [key: string]: number } = {};
    discoveries.forEach((d) => {
      if (d.categories) {
        d.categories.forEach((cat) => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      }
    });

    // Get top 5 categories
    const favoriteCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat]) => cat);

    return {
      totalDiscoveries,
      totalCreditsSpent,
      countriesVisited,
      favoriteCategories,
    };
  }
}

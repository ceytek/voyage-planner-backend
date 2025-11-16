// Discovery Resolver
// GraphQL API endpoints for photo discovery feature

import { Resolver, Mutation, Query, Arg, Ctx, Int, Authorized } from 'type-graphql';
import { Service } from 'typedi';
import { DiscoveryService } from '../services/DiscoveryService';
import { CreateDiscoveryInput, GetDiscoveriesInput } from '../dto/DiscoveryInput';
import {
  SaveDiscoveryResponse,
  DiscoveriesListResponse,
  DiscoveryResponse,
} from '../dto/DiscoveryResponse';
import { Context } from '../../user/resolvers/UserResolver';
import { GraphQLError } from 'graphql';

@Service()
@Resolver()
export class DiscoveryResolver {
  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * Save a new discovery from photo analysis
   * Deducts 15 credits from user account
   */
  @Authorized()
  @Mutation(() => SaveDiscoveryResponse)
  async saveDiscovery(
    @Arg('input') input: CreateDiscoveryInput,
    @Ctx() context: Context
  ): Promise<SaveDiscoveryResponse> {
    try {
      const userId = context.user?.id;
      if (!userId) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Create discovery and deduct credits atomically
      const discovery = await this.discoveryService.createDiscovery(userId, input);

      // Get updated user credit balance
      const userRepository = require('../../../config/database').AppDataSource.getRepository(
        require('../../user/entities/User').User
      );
      const user = await userRepository.findOne({ where: { id: userId } });

      return {
        success: true,
        message: 'Discovery saved successfully',
        discovery: DiscoveryResponse.fromEntity(discovery),
        remainingCredits: user?.currentCredit || 0,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to save discovery',
        discovery: undefined,
        remainingCredits: undefined,
      };
    }
  }

  /**
   * Get user's discovery history with pagination
   */
  @Authorized()
  @Query(() => DiscoveriesListResponse)
  async getMyDiscoveries(
    @Arg('input', { nullable: true }) input: GetDiscoveriesInput = new GetDiscoveriesInput(),
    @Ctx() context: Context
  ): Promise<DiscoveriesListResponse> {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError('User not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const { limit = 10, offset = 0, language } = input;

    const { items, total } = await this.discoveryService.getUserDiscoveries(
      userId,
      limit,
      offset,
      language
    );

    return {
      items: items.map(DiscoveryResponse.fromEntity),
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Get a single discovery by ID
   */
  @Authorized()
  @Query(() => DiscoveryResponse, { nullable: true })
  async getDiscoveryById(
    @Arg('id') id: string,
    @Ctx() context: Context
  ): Promise<DiscoveryResponse | null> {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError('User not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    try {
      const discovery = await this.discoveryService.getDiscoveryById(id, userId);
      return DiscoveryResponse.fromEntity(discovery);
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a discovery
   */
  @Authorized()
  @Mutation(() => Boolean)
  async deleteDiscovery(
    @Arg('id') id: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError('User not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    return await this.discoveryService.deleteDiscovery(id, userId);
  }

  /**
   * Get user's discovery statistics
   */
  @Authorized()
  @Query(() => DiscoveryStatsResponse)
  async getMyDiscoveryStats(@Ctx() context: Context): Promise<DiscoveryStatsResponse> {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError('User not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const stats = await this.discoveryService.getUserStats(userId);
    return stats;
  }
}

// Stats response type
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
class DiscoveryStatsResponse {
  @Field(() => Int)
  totalDiscoveries!: number;

  @Field(() => Int)
  totalCreditsSpent!: number;

  @Field(() => [String])
  countriesVisited!: string[];

  @Field(() => [String])
  favoriteCategories!: string[];
}

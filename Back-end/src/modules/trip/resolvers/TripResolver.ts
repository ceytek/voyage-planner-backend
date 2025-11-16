import { Arg, Mutation, Resolver, Query, Ctx, Int, Authorized, ObjectType, Field } from 'type-graphql';
import { Service } from 'typedi';
import { TripPlanResponseDTO, TripGenerationInput, TripPlanDTO, SaveTripInput, SavedTrip, TripSummary, TripConnection } from '../dto/trip.dto';
import { TripService } from '../services/TripService';
import { Context } from '../../user/resolvers/UserResolver';

@Service()
@Resolver()
export class TripResolver {
  constructor(private tripService: TripService) {}

  @Mutation(() => TripPlanResponseDTO)
  async generateTripPlan(
    @Arg('input') input: TripGenerationInput
  ): Promise<TripPlanResponseDTO> {
    try {
      const response = await this.tripService.generateTrip(input);
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'AI service failed',
          timestamp: new Date().toISOString(),
        };
      }

      const plan: TripPlanDTO = {
        ...response.data,
      } as TripPlanDTO;

      return {
        success: true,
        data: plan,
        timestamp: response.timestamp,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Mutation(() => SavedTrip)
  async saveTrip(
    @Arg('input') input: SaveTripInput,
    @Ctx() ctx: Context
  ): Promise<SavedTrip> {
    const userId = ctx.user?.id || 'test-user-id';
    console.log('[saveTrip] userId:', userId);

    const trip = await this.tripService.saveTrip(userId, input);
    
    return {
      id: trip.id,
      name: trip.name || undefined,
      title: trip.title,
      country: trip.country,
      cities: trip.cities,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      language: trip.language,
      heroImage: trip.heroImage,
      coverImageUrl: trip.coverImageUrl || undefined,
      interests: trip.interests,
      itinerary: trip.itinerary,
      rawResponse: trip.rawResponse || undefined,
      model: trip.model,
      promptVersion: trip.promptVersion,
      schemaVersion: trip.schemaVersion,
      creditsSpent: trip.creditsSpent,
      source: trip.source,
      isFav: trip.isFav,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }

  @Query(() => [TripSummary])
  async getUserTrips(
    @Arg('limit', () => Int, { nullable: true, defaultValue: 50 }) limit: number,
    @Arg('offset', () => Int, { nullable: true, defaultValue: 0 }) offset: number,
    @Ctx() ctx: Context
  ): Promise<TripSummary[]> {
    const userId = ctx.user?.id || 'test-user-id';
    console.log('[getUserTrips] userId:', userId);

    const trips = await this.tripService.listTrips(userId, limit, offset);
    
    return trips.map(trip => ({
      id: trip.id,
      name: trip.name || undefined,
      title: trip.title,
      cities: trip.cities,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      heroImage: trip.heroImage,
      coverImageUrl: trip.coverImageUrl || undefined,
      isFav: trip.isFav,
      createdAt: trip.createdAt,
    }));
  }

  @Query(() => TripConnection)
  async getUserTripsV2(
    @Arg('first', () => Int, { nullable: true, defaultValue: 10 }) first: number,
  @Arg('after', () => String, { nullable: true }) after: string | undefined,
    @Ctx() ctx: Context
  ): Promise<TripConnection> {
    const userId = ctx.user?.id || 'test-user-id';
    console.log('[getUserTripsV2] userId:', userId, 'first:', first, 'after:', after);

    const { items, nextCursor, hasMore } = await this.tripService.listTripsByCursor(userId, first, after);
    const summaries: TripSummary[] = items.map(trip => ({
      id: trip.id,
      name: trip.name || undefined,
      title: trip.title,
      cities: trip.cities,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      heroImage: trip.heroImage,
      coverImageUrl: trip.coverImageUrl || undefined,
      isFav: trip.isFav,
      createdAt: trip.createdAt,
    }));
    return { items: summaries, nextCursor, hasMore };
  }

  @Query(() => SavedTrip, { nullable: true })
  async getTrip(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<SavedTrip | null> {
    const userId = ctx.user?.id || 'test-user-id';
    console.log('[getTrip] userId:', userId);

    const trip = await this.tripService.getTrip(userId, id);
    if (!trip) {
      return null;
    }

    return {
      id: trip.id,
      name: trip.name || undefined,
      title: trip.title,
      country: trip.country,
      cities: trip.cities,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      language: trip.language,
      heroImage: trip.heroImage,
      coverImageUrl: trip.coverImageUrl || undefined,
      interests: trip.interests,
      itinerary: trip.itinerary,
      rawResponse: trip.rawResponse || undefined,
      model: trip.model,
      promptVersion: trip.promptVersion,
      schemaVersion: trip.schemaVersion,
      creditsSpent: trip.creditsSpent,
      source: trip.source,
      isFav: trip.isFav,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }

  @Mutation(() => SavedTrip)
  async toggleFavorite(
    @Arg('tripId') tripId: string,
    @Ctx() ctx: Context
  ): Promise<SavedTrip> {
    const userId = ctx.user?.id || 'test-user-id';
    console.log('[toggleFavorite] userId:', userId, 'tripId:', tripId);

    const trip = await this.tripService.toggleFavorite(userId, tripId);

    return {
      id: trip.id,
      name: trip.name || undefined,
      title: trip.title,
      country: trip.country,
      cities: trip.cities,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      language: trip.language,
      heroImage: trip.heroImage,
      coverImageUrl: trip.coverImageUrl || undefined,
      interests: trip.interests,
      itinerary: trip.itinerary,
      rawResponse: trip.rawResponse || undefined,
      model: trip.model,
      promptVersion: trip.promptVersion,
      schemaVersion: trip.schemaVersion,
      creditsSpent: trip.creditsSpent,
      source: trip.source,
      isFav: trip.isFav,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }

  @Query(() => [TripSummary])
  async getFavoriteTrips(
    @Arg('limit', () => Int, { nullable: true, defaultValue: 50 }) limit: number,
    @Arg('offset', () => Int, { nullable: true, defaultValue: 0 }) offset: number,
    @Ctx() ctx: Context
  ): Promise<TripSummary[]> {
    const userId = ctx.user?.id || 'test-user-id';
    console.log('[getFavoriteTrips] userId:', userId);

    const trips = await this.tripService.listFavorites(userId, limit, offset);

    return trips.map(trip => ({
      id: trip.id,
      name: trip.name || undefined,
      title: trip.title,
      cities: trip.cities,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      heroImage: trip.heroImage,
      coverImageUrl: trip.coverImageUrl || undefined,
      isFav: trip.isFav,
      createdAt: trip.createdAt,
    }));
  }

  @Query(() => TripConnection)
  async getFavoriteTripsV2(
    @Arg('first', () => Int, { nullable: true, defaultValue: 10 }) first: number,
    @Arg('after', () => String, { nullable: true }) after: string | undefined,
    @Ctx() ctx: Context
  ): Promise<TripConnection> {
    const userId = ctx.user?.id || 'test-user-id';
    console.log('[getFavoriteTripsV2] userId:', userId, 'first:', first, 'after:', after);

    const { items, nextCursor, hasMore } = await this.tripService.listFavoritesByCursor(userId, first, after);
    const summaries: TripSummary[] = items.map(trip => ({
      id: trip.id,
      name: trip.name || undefined,
      title: trip.title,
      cities: trip.cities,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: trip.duration,
      heroImage: trip.heroImage,
      coverImageUrl: trip.coverImageUrl || undefined,
      isFav: trip.isFav,
      createdAt: trip.createdAt,
    }));
    return { items: summaries, nextCursor, hasMore };
  }

  // ===== Travel Info =====
}

@ObjectType()
class CountryInfoType {
  @Field() overview!: string;
  @Field(() => [String]) topHighlights!: string[];
  @Field() currency!: string;
  @Field() power!: string;
  @Field() emergency!: string;
  @Field() sim!: string;
  @Field() bestSeasons!: string;
  @Field({ nullable: true }) tipping?: string;
  @Field() safety!: string;
  @Field({ nullable: true }) localEtiquette?: string;
}

@ObjectType()
class TravelInfoType {
  @Field() country!: string;
  @Field() language!: string;
  @Field(() => CountryInfoType) countryInfo!: CountryInfoType;
}

@Service()
@Resolver()
export class TravelInfoResolver {
  constructor(private tripService: TripService) {}

  @Query(() => TravelInfoType)
  async getTravelInfo(
    @Arg('country') country: string,
    @Arg('language') language: string,
  ): Promise<any> {
    const res = await this.tripService.getTravelInfo(country, language);
    if (!res?.success || !res?.data) {
      throw new Error(res?.error || 'AI service travel-info failed');
    }
    return res.data;
  }
}

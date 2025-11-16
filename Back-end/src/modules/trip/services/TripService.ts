import axios from 'axios';
import { Service } from 'typedi';
import { aiConfig, aiEndpoints, AIServiceResponse, AITripGenerationRequest, AITripPlan } from '../../../config/ai';
import { Trip } from '../entities/Trip';
import { SaveTripInput } from '../dto/trip.dto';
import { CreditService } from '../../credit/services/CreditService';
import { CREDIT_COSTS } from '../../credit/constants';
import { AppDataSource } from '../../../config/database';
import { CountryInfoService } from '../../countryinfo/services/CountryInfoService';

@Service()
export class TripService {
  private client = axios.create({
    baseURL: aiConfig.baseURL + aiConfig.apiPrefix,
    timeout: aiConfig.timeoutMs,
  });

  constructor(
    private creditService: CreditService,
    private countryInfoService: CountryInfoService
  ) {}

  async generateTrip(input: AITripGenerationRequest): Promise<AIServiceResponse<AITripPlan>> {
    const { data } = await this.client.post<AIServiceResponse<AITripPlan>>(aiEndpoints.generateItinerary, input);
    return data;
  }

  async getTravelInfo(country: string, language: string): Promise<any> {
    // 1. Check cache first (DB lookup by country + language)
    const cached = await this.countryInfoService.get(country, language);
    if (cached) {
      console.log(`[TripService] Returning cached info for ${country} (${language})`);
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Cache miss - call AI service
    console.log(`[TripService] Cache miss, calling AI service for ${country} (${language})`);
    const { data } = await this.client.post(aiEndpoints.travelInfo, { country, language });

    // 3. If AI call successful, save to cache
    if (data?.success && data?.data) {
      await this.countryInfoService.save(country, language, data.data.countryInfo);
    }

    return data;
  }

  async saveTrip(userId: string, input: SaveTripInput): Promise<Trip> {
  const tripRepo = AppDataSource.getRepository(Trip);
  // Debug log
  console.log('[TripService] saveTrip called for user', userId, 'title:', input.title);
  const spent = CREDIT_COSTS.create_plan; // standardized cost for creating a plan
  
  // Get coverImageUrl from first city (passed from frontend)
  const coverImageUrl = input.coverImageUrl || null;

  const trip = tripRepo.create({
      userId,
      name: input.name || null,
      title: input.title,
      country: input.country,
      cities: input.cities,
      startDate: input.startDate,
      endDate: input.endDate,
      duration: input.duration,
      language: input.language,
      heroImage: input.heroImage,
      coverImageUrl,
      interests: input.interests,
      itinerary: input.itinerary,
      rawResponse: input.rawResponse || null,
      model: input.model || 'gpt-4o-mini',
      promptVersion: input.promptVersion || 1,
      schemaVersion: input.schemaVersion || 1,
      creditsSpent: spent,
      source: input.source || 'gpt',
      isFav: false, // Default to false; future toggle endpoint can update
    });

    try {
      const saved = await tripRepo.save(trip);
      console.log('[TripService] trip saved with id', saved.id);

      // Log credit usage if any credits were spent
  if (spent > 0) {
        await this.creditService.useCredits({
          userId,
          creditsUsed: spent,
          action: 'create_plan',
          entityId: saved.id,
          entityType: 'trip',
          description: `Created trip plan: ${saved.title}`,
        });
      }
      return saved;
    } catch (err) {
      console.error('[TripService] saveTrip failed:', err);
      throw err;
    }
  }

  async listTrips(userId: string, limit: number = 50, offset: number = 0): Promise<Trip[]> {
  const tripRepo = AppDataSource.getRepository(Trip);
  return await tripRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Cursor-based pagination for user trips. Cursor format: `${createdAt.toISOString()}|${id}`
   */
  async listTripsByCursor(userId: string, first: number = 10, after?: string): Promise<{ items: Trip[]; nextCursor?: string; hasMore: boolean; }> {
    const tripRepo = AppDataSource.getRepository(Trip);

    let cursorCreatedAt: Date | null = null;
    let cursorId: string | null = null;
    if (after) {
      const [createdAtStr, id] = after.split('|');
      if (createdAtStr && id) {
        cursorCreatedAt = new Date(createdAtStr);
        cursorId = id;
      }
    }

    const qb = tripRepo
      .createQueryBuilder('trip')
      .where('trip.user_id = :userId', { userId })
      .orderBy('trip.created_at', 'DESC')
      .addOrderBy('trip.id', 'DESC')
      .limit(first + 1);

    if (cursorCreatedAt && cursorId) {
      qb.andWhere('(trip.created_at < :cAt OR (trip.created_at = :cAt AND trip.id < :cId))', {
        cAt: cursorCreatedAt,
        cId: cursorId,
      });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > first;
    const items = hasMore ? rows.slice(0, first) : rows;
    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? `${last.createdAt.toISOString()}|${last.id}` : undefined;
    return { items, nextCursor, hasMore };
  }

  async getTrip(userId: string, id: string): Promise<Trip | null> {
  const tripRepo = AppDataSource.getRepository(Trip);
  const trip = await tripRepo.findOne({
      where: { id, userId },
    });
    return trip || null;
  }

  async toggleFavorite(userId: string, tripId: string): Promise<Trip> {
    const tripRepo = AppDataSource.getRepository(Trip);
    const trip = await tripRepo.findOne({
      where: { id: tripId, userId },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    trip.isFav = !trip.isFav;
    const updated = await tripRepo.save(trip);
    console.log('[TripService] toggled favorite for trip', tripId, 'isFav:', updated.isFav);
    return updated;
  }

  async listFavorites(userId: string, limit: number = 50, offset: number = 0): Promise<Trip[]> {
    const tripRepo = AppDataSource.getRepository(Trip);
    return await tripRepo.find({
      where: { userId, isFav: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Cursor-based pagination for favorite trips
   */
  async listFavoritesByCursor(userId: string, first: number = 10, after?: string): Promise<{ items: Trip[]; nextCursor?: string; hasMore: boolean; }> {
    const tripRepo = AppDataSource.getRepository(Trip);

    let cursorCreatedAt: Date | null = null;
    let cursorId: string | null = null;
    if (after) {
      const [createdAtStr, id] = after.split('|');
      if (createdAtStr && id) {
        cursorCreatedAt = new Date(createdAtStr);
        cursorId = id;
      }
    }

    const qb = tripRepo
      .createQueryBuilder('trip')
      .where('trip.user_id = :userId', { userId })
      .andWhere('trip.is_fav = true')
      .orderBy('trip.created_at', 'DESC')
      .addOrderBy('trip.id', 'DESC')
      .limit(first + 1);

    if (cursorCreatedAt && cursorId) {
      qb.andWhere('(trip.created_at < :cAt OR (trip.created_at = :cAt AND trip.id < :cId))', {
        cAt: cursorCreatedAt,
        cId: cursorId,
      });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > first;
    const items = hasMore ? rows.slice(0, first) : rows;
    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? `${last.createdAt.toISOString()}|${last.id}` : undefined;
    return { items, nextCursor, hasMore };
  }
}

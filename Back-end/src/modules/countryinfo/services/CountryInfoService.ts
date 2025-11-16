import { Service } from 'typedi';
import { AppDataSource } from '../../../config/database';
import { CountryInfo } from '../entities/CountryInfo';

@Service()
export class CountryInfoService {
  private repo = AppDataSource.getRepository(CountryInfo);

  /**
   * Get cached country info by country + language
   */
  async get(country: string, language: string): Promise<any | null> {
    const cached = await this.repo.findOne({
      where: { country, language },
    });

    if (!cached) {
      console.log(`[CountryInfoCache] MISS: ${country} (${language})`);
      return null;
    }

    console.log(`[CountryInfoCache] HIT: ${country} (${language})`);
    return {
      country: cached.country,
      language: cached.language,
      countryInfo: cached.countryInfo,
    };
  }

  /**
   * Save country info to cache
   */
  async save(country: string, language: string, countryInfo: any): Promise<void> {
    try {
      // Upsert: if exists, update; else insert
      await this.repo.save({
        country,
        language,
        countryInfo,
      });
      console.log(`[CountryInfoCache] SAVED: ${country} (${language})`);
    } catch (error) {
      console.error('[CountryInfoCache] Save failed:', error);
      // Don't throw - cache failure shouldn't break the request
    }
  }
}

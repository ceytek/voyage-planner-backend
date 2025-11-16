import { Service } from 'typedi';
import { AppDataSource } from '../../../config/database';
import { Country } from '../entities/Country';
import { CountryTranslation } from '../entities/CountryTranslation';
import { City } from '../entities/City';
import { CityTranslation } from '../entities/CityTranslation';

@Service()
export class LocationService {
  private countryRepo = AppDataSource.getRepository(Country);
  private countryTransRepo = AppDataSource.getRepository(CountryTranslation);
  private cityRepo = AppDataSource.getRepository(City);
  private cityTransRepo = AppDataSource.getRepository(CityTranslation);

  /**
   * Get all countries with translations for a specific language
   * Fallback to English if requested language not found
   */
  async getCountries(language: string = 'en'): Promise<Array<{ id: string; code: string; name: string; flagEmoji?: string; sortOrder: number; imageUrl?: string }>> {
    const countries = await this.countryRepo.find({
      where: { isActive: true },
      relations: ['translations'],
      order: { sortOrder: 'ASC' },
    });

    return countries.map((country) => {
      const translation = country.translations.find((t) => t.language === language) ||
                         country.translations.find((t) => t.language === 'en');
      
      return {
        id: country.id,
        code: country.code,
        name: translation?.name || country.code,
        flagEmoji: country.flagEmoji,
        sortOrder: country.sortOrder,
        imageUrl: country.imageUrl,
      };
    });
  }

  /**
   * Get cities by country with translations
   * @param popularOnly - If true, only return tourist/popular cities
   */
  async getCitiesByCountry(
    countryId: string,
    language: string = 'en',
    popularOnly: boolean = false
  ): Promise<Array<{ id: string; name: string; population?: number; latitude?: number; longitude?: number; isPopular: boolean; imageUrl?: string }>> {
    const whereClause: any = { countryId };
    if (popularOnly) {
      whereClause.isPopular = true;
    }

    const cities = await this.cityRepo.find({
      where: whereClause,
      relations: ['translations'],
      order: { sortOrder: 'ASC', population: 'DESC' },
    });

    return cities.map((city) => {
      const translation = city.translations.find((t) => t.language === language) ||
                         city.translations.find((t) => t.language === 'en');
      
      return {
        id: city.id,
        name: translation?.name || `City ${city.id}`,
        population: city.population,
        latitude: city.latitude,
        longitude: city.longitude,
        isPopular: city.isPopular,
      };
    });
  }

  /**
   * Seed a country with translations
   */
  async seedCountry(data: {
    code: string;
    flagEmoji?: string;
    sortOrder?: number;
    imageUrl?: string;
    translations: Array<{ language: string; name: string }>;
  }): Promise<Country> {
    // Check if country already exists
    const existing = await this.countryRepo.findOne({ where: { code: data.code } });
    if (existing) {
      return existing;
    }

    const country = this.countryRepo.create({
      code: data.code,
      flagEmoji: data.flagEmoji,
      sortOrder: data.sortOrder || 0,
      imageUrl: data.imageUrl,
      isActive: true,
    });

    await this.countryRepo.save(country);

    // Add translations
    for (const trans of data.translations) {
      const translation = this.countryTransRepo.create({
        countryId: country.id,
        language: trans.language,
        name: trans.name,
      });
      await this.countryTransRepo.save(translation);
    }

    return country;
  }

  /**
   * Seed a city with translations
   */
  async seedCity(data: {
    countryId: string;
    population?: number;
    latitude?: number;
    longitude?: number;
    isPopular?: boolean;
    sortOrder?: number;
    translations: Array<{ language: string; name: string }>;
  }): Promise<City> {
    const city = this.cityRepo.create({
      countryId: data.countryId,
      population: data.population,
      latitude: data.latitude,
      longitude: data.longitude,
      isPopular: data.isPopular || false,
      sortOrder: data.sortOrder || 0,
    });

    await this.cityRepo.save(city);

    // Add translations
    for (const trans of data.translations) {
      const translation = this.cityTransRepo.create({
        cityId: city.id,
        language: trans.language,
        name: trans.name,
      });
      await this.cityTransRepo.save(translation);
    }

    return city;
  }

  /**
   * Get country by code
   */
  async getCountryByCode(code: string): Promise<Country | null> {
    return await this.countryRepo.findOne({ where: { code } });
  }
}

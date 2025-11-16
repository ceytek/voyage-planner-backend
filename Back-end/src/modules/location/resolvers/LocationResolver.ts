import { Resolver, Query, Arg } from 'type-graphql';
import { Service } from 'typedi';
import { LocationService } from '../services/LocationService';
import { CountryType, CityType } from '../types/LocationTypes';

@Service()
@Service()
@Resolver()
export class LocationResolver {
  constructor(private locationService: LocationService) {}

  @Query(() => [CountryType], {
    description: 'Get all active countries with translations for specified language',
  })
  async getCountries(
    @Arg('language', { defaultValue: 'en' }) language: string
  ): Promise<CountryType[]> {
    return await this.locationService.getCountries(language);
  }

  @Query(() => [CityType], {
    description: 'Get cities for a country with translations',
  })
  async getCitiesByCountry(
    @Arg('countryId') countryId: string,
    @Arg('language', { defaultValue: 'en' }) language: string,
    @Arg('popularOnly', { defaultValue: false }) popularOnly: boolean
  ): Promise<CityType[]> {
    return await this.locationService.getCitiesByCountry(countryId, language, popularOnly);
  }
}

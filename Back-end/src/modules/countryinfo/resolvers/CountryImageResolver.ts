import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Service } from 'typedi';
import { AppDataSource } from '../../../config/database';
import { CountryImageService } from '../services/CountryImageService';

@Service()
@Resolver()
export class CountryImageResolver {
  private countryImageService: CountryImageService;

  constructor() {
    this.countryImageService = new CountryImageService(AppDataSource);
  }

  @Query(() => String, { nullable: true })
  async getCountryImage(@Arg('country') country: string): Promise<string | null> {
    return await this.countryImageService.getCountryImage(country);
  }

  @Mutation(() => Boolean)
  async saveCountryImage(
    @Arg('country') country: string,
    @Arg('imageUrl') imageUrl: string,
    @Arg('photographer', { nullable: true }) photographer?: string,
    @Arg('photoSource', { nullable: true }) photoSource?: string
  ): Promise<boolean> {
    try {
      await this.countryImageService.saveCountryImage(country, imageUrl, photographer, photoSource);
      return true;
    } catch (error) {
      console.error('Error in saveCountryImage mutation:', error);
      return false;
    }
  }
}

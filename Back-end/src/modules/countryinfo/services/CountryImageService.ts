import { Service } from 'typedi';
import { DataSource, Repository } from 'typeorm';
import { CountryImage } from '../entities/CountryImage';

@Service()
export class CountryImageService {
  private repository: Repository<CountryImage>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CountryImage);
  }

  async getCountryImage(country: string): Promise<string | null> {
    try {
      const countryImage = await this.repository.findOne({
        where: { country: country.toLowerCase() }
      });
      return countryImage?.imageUrl || null;
    } catch (error) {
      console.error('Error fetching country image:', error);
      return null;
    }
  }

  async saveCountryImage(country: string, imageUrl: string, photographer?: string, photoSource?: string): Promise<CountryImage> {
    try {
      // Check if already exists
      let countryImage = await this.repository.findOne({
        where: { country: country.toLowerCase() }
      });

      if (countryImage) {
        // Update existing
        countryImage.imageUrl = imageUrl;
        countryImage.photographer = photographer;
        countryImage.photoSource = photoSource;
      } else {
        // Create new
        countryImage = this.repository.create({
          country: country.toLowerCase(),
          imageUrl,
          photographer,
          photoSource
        });
      }

      return await this.repository.save(countryImage);
    } catch (error) {
      console.error('Error saving country image:', error);
      throw error;
    }
  }

  async getAllCountryImages(): Promise<CountryImage[]> {
    return await this.repository.find();
  }
}

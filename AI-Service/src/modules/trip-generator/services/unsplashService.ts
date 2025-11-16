import axios from 'axios';

export interface CountryImageData {
  url: string;
  photographer: string;
  source: string;
}

export class UnsplashService {
  private accessKey: string;
  private baseUrl = 'https://api.unsplash.com';

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
  }

  async getCountryImage(country: string): Promise<CountryImageData | null> {
    console.log('🎯 === UNSPLASH SERVICE CALLED ===');
    console.log('📸 Unsplash: Fetching image for', country);
    console.log('🔑 Unsplash Access Key:', this.accessKey ? `${this.accessKey.substring(0, 10)}...` : 'NOT SET');
    
    if (!this.accessKey) {
      console.error('❌ Unsplash Access Key not configured');
      return this.getFallbackImageForCountry(country);
    }

    try {
      // Search for country-specific landmark images
      const searchQuery = this.getCountrySearchQuery(country);
      console.log('🔍 Unsplash search query:', searchQuery);
      
      const response = await axios.get(`${this.baseUrl}/search/photos`, {
        params: {
          query: searchQuery,
          per_page: 1,
          orientation: 'landscape',
          order_by: 'relevant'
        },
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`
        }
      });

      if (response.data?.results && response.data.results.length > 0) {
        const photo = response.data.results[0];
        console.log('✅ Unsplash: Found image from', photo.user.name);
        return {
          url: photo.urls.regular,
          photographer: photo.user.name,
          source: 'Unsplash'
        };
      }

      console.warn('⚠️ Unsplash: No results found, using fallback');
      return this.getFallbackImageForCountry(country);
    } catch (error: any) {
      console.error('❌ Unsplash API Error:', error?.response?.status, error?.response?.data?.errors || error?.message);
      return this.getFallbackImageForCountry(country);
    }
  }

  private getCountrySearchQuery(country: string): string {
    // Map countries to their iconic landmarks
    const countryLandmarks: Record<string, string> = {
      'turkey': 'cappadocia hot air balloons turkey',
      'türkiye': 'cappadocia hot air balloons turkey',
      'france': 'eiffel tower paris',
      'italy': 'colosseum rome',
      'spain': 'sagrada familia barcelona',
      'japan': 'mount fuji japan',
      'china': 'great wall china',
      'usa': 'statue of liberty new york',
      'united states': 'statue of liberty new york',
      'uk': 'big ben london',
      'united kingdom': 'big ben london',
      'england': 'big ben london',
      'germany': 'brandenburg gate berlin',
      'greece': 'santorini greece',
      'thailand': 'grand palace bangkok',
      'egypt': 'pyramids giza',
      'india': 'taj mahal india',
      'brazil': 'christ redeemer rio',
      'australia': 'sydney opera house',
      'canada': 'niagara falls',
      'mexico': 'chichen itza mexico',
      'netherlands': 'windmills amsterdam',
      'switzerland': 'matterhorn switzerland',
      'austria': 'vienna austria',
      'portugal': 'lisbon portugal',
      'norway': 'fjords norway',
      'sweden': 'stockholm sweden',
      'denmark': 'copenhagen denmark',
      'finland': 'helsinki finland',
      'russia': 'red square moscow',
      'poland': 'warsaw poland',
      'czech republic': 'prague castle',
      'hungary': 'budapest parliament',
      'romania': 'bran castle romania',
      'croatia': 'dubrovnik croatia',
      'iceland': 'iceland landscape',
      'ireland': 'cliffs of moher',
      'scotland': 'edinburgh castle',
      'morocco': 'marrakech morocco',
      'south africa': 'table mountain cape town',
      'kenya': 'masai mara kenya',
      'uae': 'burj khalifa dubai',
      'saudi arabia': 'mecca saudi arabia',
      'israel': 'jerusalem israel',
      'jordan': 'petra jordan',
      'vietnam': 'halong bay vietnam',
      'cambodia': 'angkor wat cambodia',
      'singapore': 'marina bay singapore',
      'malaysia': 'petronas towers kuala lumpur',
      'indonesia': 'borobudur indonesia',
      'philippines': 'el nido philippines',
      'new zealand': 'milford sound new zealand',
      'argentina': 'buenos aires argentina',
      'peru': 'machu picchu peru',
      'chile': 'torres del paine chile',
      'colombia': 'cartagena colombia',
    };

    const normalizedCountry = country.toLowerCase().trim();
    return countryLandmarks[normalizedCountry] || `${country} landmark travel`;
  }

  private getFallbackImageForCountry(country: string): { url: string; photographer: string; source: string } {
    // Country-specific fallback images from Unsplash (free to use)
    const countryImages: Record<string, string> = {
      'turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200',
      'türkiye': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200',
      'italy': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200',
      'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200',
      'spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200',
      'japan': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200',
      'china': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200',
      'usa': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200',
      'united states': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200',
      'uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
      'united kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
      'england': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
      'germany': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200',
      'greece': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200',
      'thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200',
      'egypt': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200',
      'india': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200',
      'brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200',
      'australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200',
      'canada': 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200',
      'mexico': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200',
      'netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200',
      'switzerland': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200',
      'austria': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200',
      'portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200',
      'norway': 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1200',
      'sweden': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200',
      'iceland': 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200',
      'ireland': 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1200',
      'morocco': 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200',
      'uae': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200',
      'vietnam': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
      'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200',
      'new zealand': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
      'argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200',
      'peru': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200',
    };

    const normalizedCountry = country.toLowerCase().trim();
    const imageUrl = countryImages[normalizedCountry] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200';

    return {
      url: imageUrl,
      photographer: 'Unsplash',
      source: 'Fallback'
    };
  }
}

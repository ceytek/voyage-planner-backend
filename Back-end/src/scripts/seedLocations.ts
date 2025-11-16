import axios from 'axios';
import { AppDataSource } from '../config/database';
import { LocationService } from '../modules/location/services/LocationService';
import { TOURISM_COUNTRIES, POPULAR_CITIES } from '../modules/location/data/tourism-data';

/**
 * Seed script for countries and cities
 * Fetches data from REST Countries API and combines with our curated tourism data
 * 
 * Usage: npm run seed:locations
 */

interface RestCountryData {
  cca2: string; // Country code (TR, TH, FR...)
  translations: {
    [key: string]: {
      official: string;
      common: string;
    };
  };
  name: {
    common: string;
    official: string;
  };
}

const SUPPORTED_LANGUAGES = ['en', 'tr', 'fra', 'ita', 'spa'];

async function fetchCountryTranslations(countryCode: string): Promise<Array<{ language: string; name: string }>> {
  try {
    const response = await axios.get<RestCountryData[]>(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const countryData = response.data[0];

    const translations: Array<{ language: string; name: string }> = [];

    // English (default)
    translations.push({
      language: 'en',
      name: countryData.name.common,
    });

    // Other languages from REST Countries API
    const langMapping: Record<string, string> = {
      tur: 'tr',
      fra: 'fr',
      ita: 'it',
      spa: 'es',
    };

    for (const [apiLang, translation] of Object.entries(countryData.translations)) {
      const ourLang = langMapping[apiLang];
      if (ourLang && translation && typeof translation === 'object' && 'common' in translation) {
        translations.push({
          language: ourLang,
          name: (translation as { common: string }).common,
        });
      }
    }

    return translations;
  } catch (error) {
    console.error(`Failed to fetch translations for ${countryCode}:`, error);
    return [{ language: 'en', name: countryCode }];
  }
}

/**
 * Manual city translations for major tourist cities
 * This is a fallback/supplement to automated translation
 */
const CITY_TRANSLATIONS: Record<string, Record<string, string>> = {
  Istanbul: { en: 'Istanbul', tr: 'İstanbul', fr: 'Istanbul', it: 'Istanbul', es: 'Estambul' },
  Ankara: { en: 'Ankara', tr: 'Ankara', fr: 'Ankara', it: 'Ankara', es: 'Ankara' },
  Izmir: { en: 'Izmir', tr: 'İzmir', fr: 'Izmir', it: 'Smirne', es: 'Esmirna' },
  Antalya: { en: 'Antalya', tr: 'Antalya', fr: 'Antalya', it: 'Adalia', es: 'Antalya' },
  Bangkok: { en: 'Bangkok', tr: 'Bangkok', fr: 'Bangkok', it: 'Bangkok', es: 'Bangkok' },
  Phuket: { en: 'Phuket', tr: 'Phuket', fr: 'Phuket', it: 'Phuket', es: 'Phuket' },
  Paris: { en: 'Paris', tr: 'Paris', fr: 'Paris', it: 'Parigi', es: 'París' },
  Rome: { en: 'Rome', tr: 'Roma', fr: 'Rome', it: 'Roma', es: 'Roma' },
  Venice: { en: 'Venice', tr: 'Venedik', fr: 'Venise', it: 'Venezia', es: 'Venecia' },
  Florence: { en: 'Florence', tr: 'Floransa', fr: 'Florence', it: 'Firenze', es: 'Florencia' },
  Madrid: { en: 'Madrid', tr: 'Madrid', fr: 'Madrid', it: 'Madrid', es: 'Madrid' },
  Barcelona: { en: 'Barcelona', tr: 'Barselona', fr: 'Barcelone', it: 'Barcellona', es: 'Barcelona' },
  Tokyo: { en: 'Tokyo', tr: 'Tokyo', fr: 'Tokyo', it: 'Tokyo', es: 'Tokio' },
  London: { en: 'London', tr: 'Londra', fr: 'Londres', it: 'Londra', es: 'Londres' },
  'New York': { en: 'New York', tr: 'New York', fr: 'New York', it: 'New York', es: 'Nueva York' },
  Baku: { en: 'Baku', tr: 'Bakü', fr: 'Bakou', it: 'Baku', es: 'Bakú' },
  Gabala: { en: 'Gabala', tr: 'Gabala', fr: 'Gabala', it: 'Gabala', es: 'Gabala' },
  Sheki: { en: 'Sheki', tr: 'Şeki', fr: 'Cheki', it: 'Sheki', es: 'Sheki' },
  // Add more as needed...
};

function getCityTranslations(cityName: string): Array<{ language: string; name: string }> {
  const translations = CITY_TRANSLATIONS[cityName];
  if (translations) {
    return Object.entries(translations).map(([lang, name]) => ({ language: lang, name }));
  }
  // Fallback: same name for all languages
  return [
    { language: 'en', name: cityName },
    { language: 'tr', name: cityName },
    { language: 'fr', name: cityName },
    { language: 'it', name: cityName },
    { language: 'es', name: cityName },
  ];
}

async function seedLocations() {
  console.log('🌍 Starting location seed...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const locationService = new LocationService();

    // Seed countries
    console.log(`\n📍 Seeding ${TOURISM_COUNTRIES.length} tourism countries...`);
    
    for (const countryConfig of TOURISM_COUNTRIES) {
      console.log(`  Fetching ${countryConfig.code}...`);
      
      const translations = await fetchCountryTranslations(countryConfig.code);
      
      const country = await locationService.seedCountry({
        code: countryConfig.code,
        flagEmoji: countryConfig.flagEmoji,
        sortOrder: countryConfig.sortOrder,
        imageUrl: countryConfig.imageUrl,
        translations,
      });

      console.log(`  ✅ ${country.code} seeded with ${translations.length} translations`);

      // Seed cities for this country
      const cities = POPULAR_CITIES[countryConfig.code];
      if (cities && cities.length > 0) {
        console.log(`    Seeding ${cities.length} cities for ${countryConfig.code}...`);
        
        for (const cityData of cities) {
          const cityTranslations = getCityTranslations(cityData.name);
          
          await locationService.seedCity({
            countryId: country.id,
            population: cityData.population,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            isPopular: cityData.isPopular,
            sortOrder: 0,
            translations: cityTranslations,
          });
        }
        
        console.log(`    ✅ ${cities.length} cities seeded`);
      }

      // Rate limiting for REST Countries API
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log('\n🎉 Location seed completed successfully!');
    console.log(`   Countries: ${TOURISM_COUNTRIES.length}`);
    console.log(`   Cities: ${Object.values(POPULAR_CITIES).reduce((sum, cities) => sum + cities.length, 0)}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run seed
seedLocations();

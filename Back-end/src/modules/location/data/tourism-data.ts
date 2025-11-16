/**
 * Tourism-focused countries and popular cities
 * This is a curated list of ~50 tourist destinations with their major cities
 * Used for seeding the database
 */

export const TOURISM_COUNTRIES = [
  // Europe
  { code: 'TR', flagEmoji: '🇹🇷', sortOrder: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Hagia_Sophia_Mars_2013.jpg/1280px-Hagia_Sophia_Mars_2013.jpg' },
  { code: 'TH', flagEmoji: '🇹🇭', sortOrder: 2, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wat_Arun_Bangkok_Thailand.jpg/1280px-Wat_Arun_Bangkok_Thailand.jpg' },
  { code: 'FR', flagEmoji: '🇫🇷', sortOrder: 3, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/1280px-Tour_Eiffel_Wikimedia_Commons.jpg' },
  { code: 'IT', flagEmoji: '🇮🇹', sortOrder: 4, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg' },
  { code: 'ES', flagEmoji: '🇪🇸', sortOrder: 5, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Sagrada_Familia_8-12-21_%281%29.jpg/1280px-Sagrada_Familia_8-12-21_%281%29.jpg' },
  { code: 'GB', flagEmoji: '🇬🇧', sortOrder: 6, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/1280px-London_Skyline_%28125508655%29.jpeg' },
  { code: 'DE', flagEmoji: '🇩🇪', sortOrder: 7, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Brandenburger_Tor_abends.jpg/1280px-Brandenburger_Tor_abends.jpg' },
  { code: 'GR', flagEmoji: '🇬🇷', sortOrder: 8, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/1280px-The_Parthenon_in_Athens.jpg' },
  { code: 'PT', flagEmoji: '🇵🇹', sortOrder: 9, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Belem_Tower.jpg/1280px-Belem_Tower.jpg' },
  { code: 'NL', flagEmoji: '🇳🇱', sortOrder: 10, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Amsterdam_Canals.jpg/1280px-Amsterdam_Canals.jpg' },
  { code: 'AT', flagEmoji: '🇦🇹', sortOrder: 11, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Sch%C3%B6nbrunn_Palace.jpg/1280px-Sch%C3%B6nbrunn_Palace.jpg' },
  { code: 'CH', flagEmoji: '🇨🇭', sortOrder: 12, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Matterhorn_from_Domh%C3%BCtte.jpg/1280px-Matterhorn_from_Domh%C3%BCtte.jpg' },
  { code: 'CZ', flagEmoji: '🇨🇿', sortOrder: 13, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Prague_Castle_and_Charles_Bridge.jpg/1280px-Prague_Castle_and_Charles_Bridge.jpg' },
  { code: 'HR', flagEmoji: '🇭🇷', sortOrder: 14, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Dubrovnik_Old_Town.jpg/1280px-Dubrovnik_Old_Town.jpg' },
  { code: 'IE', flagEmoji: '🇮🇪', sortOrder: 15, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Cliffs_of_Moher.jpg/1280px-Cliffs_of_Moher.jpg' },
  { code: 'PL', flagEmoji: '🇵🇱', sortOrder: 16, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Krakow_Main_Square.jpg/1280px-Krakow_Main_Square.jpg' },
  { code: 'HU', flagEmoji: '🇭🇺', sortOrder: 17, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Hungarian_Parliament_Building.jpg/1280px-Hungarian_Parliament_Building.jpg' },
  { code: 'NO', flagEmoji: '🇳🇴', sortOrder: 18, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Geirangerfjord.jpg/1280px-Geirangerfjord.jpg' },
  { code: 'SE', flagEmoji: '🇸🇪', sortOrder: 19, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Stockholm_Old_Town.jpg/1280px-Stockholm_Old_Town.jpg' },
  { code: 'DK', flagEmoji: '🇩🇰', sortOrder: 20, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Nyhavn_Copenhagen.jpg/1280px-Nyhavn_Copenhagen.jpg' },
  { code: 'IS', flagEmoji: '🇮🇸', sortOrder: 21, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Blue_Lagoon_Iceland.jpg/1280px-Blue_Lagoon_Iceland.jpg' },

  // Asia
  { code: 'JP', flagEmoji: '🇯🇵', sortOrder: 22, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Mount_Fuji_and_Pagoda.jpg/1280px-Mount_Fuji_and_Pagoda.jpg' },
  { code: 'CN', flagEmoji: '🇨🇳', sortOrder: 23, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/20090529_Great_Wall_8185.jpg/1280px-20090529_Great_Wall_8185.jpg' },
  { code: 'KR', flagEmoji: '🇰🇷', sortOrder: 24, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Gyeongbokgung_Palace_Seoul.jpg/1280px-Gyeongbokgung_Palace_Seoul.jpg' },
  { code: 'SG', flagEmoji: '🇸🇬', sortOrder: 25, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Marina_Bay_Sands_in_the_evening.jpg/1280px-Marina_Bay_Sands_in_the_evening.jpg' },
  { code: 'MY', flagEmoji: '🇲🇾', sortOrder: 26, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Petronas_Towers.jpg/1280px-Petronas_Towers.jpg' },
  { code: 'ID', flagEmoji: '🇮🇩', sortOrder: 27, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Borobudur_Temple.jpg/1280px-Borobudur_Temple.jpg' },
  { code: 'VN', flagEmoji: '🇻🇳', sortOrder: 28, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Ha_Long_Bay.jpg/1280px-Ha_Long_Bay.jpg' },
  { code: 'IN', flagEmoji: '🇮🇳', sortOrder: 29, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India.jpg/1280px-Taj_Mahal%2C_Agra%2C_India.jpg' },
  { code: 'AE', flagEmoji: '🇦🇪', sortOrder: 30, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Burj_Khalifa.jpg/1280px-Burj_Khalifa.jpg' },
  { code: 'AZ', flagEmoji: '🇦🇿', sortOrder: 31, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Flame_Towers_Baku.jpg/1280px-Flame_Towers_Baku.jpg' },
  { code: 'JO', flagEmoji: '🇯🇴', sortOrder: 32, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/The_Treasury_Petra_Jordan.jpg/1280px-The_Treasury_Petra_Jordan.jpg' },

  // Americas
  { code: 'US', flagEmoji: '🇺🇸', sortOrder: 33, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Statue_of_Liberty.jpg/1280px-Statue_of_Liberty.jpg' },
  { code: 'CA', flagEmoji: '🇨🇦', sortOrder: 34, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Niagara_Falls.jpg/1280px-Niagara_Falls.jpg' },
  { code: 'MX', flagEmoji: '🇲🇽', sortOrder: 35, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Chichen_Itza.jpg/1280px-Chichen_Itza.jpg' },
  { code: 'BR', flagEmoji: '🇧🇷', sortOrder: 36, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Christ_the_Redeemer_Rio.jpg/1280px-Christ_the_Redeemer_Rio.jpg' },
  { code: 'AR', flagEmoji: '🇦🇷', sortOrder: 37, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Obelisco_de_Buenos_Aires.jpg/1280px-Obelisco_de_Buenos_Aires.jpg' },
  { code: 'PE', flagEmoji: '🇵🇪', sortOrder: 38, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Machu_Picchu.jpg/1280px-Machu_Picchu.jpg' },
  { code: 'CL', flagEmoji: '🇨🇱', sortOrder: 39, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Torres_del_Paine.jpg/1280px-Torres_del_Paine.jpg' },
  { code: 'CR', flagEmoji: '🇨🇷', sortOrder: 40, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Arenal_Volcano.jpg/1280px-Arenal_Volcano.jpg' },

  // Africa
  { code: 'EG', flagEmoji: '🇪🇬', sortOrder: 41, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/1280px-All_Gizah_Pyramids.jpg' },
  { code: 'MA', flagEmoji: '🇲🇦', sortOrder: 42, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Hassan_II_Mosque.jpg/1280px-Hassan_II_Mosque.jpg' },
  { code: 'ZA', flagEmoji: '🇿🇦', sortOrder: 43, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Table_Mountain_Cape_Town.jpg/1280px-Table_Mountain_Cape_Town.jpg' },
  { code: 'KE', flagEmoji: '🇰🇪', sortOrder: 44, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Masai_Mara.jpg/1280px-Masai_Mara.jpg' },
  { code: 'TZ', flagEmoji: '🇹🇿', sortOrder: 45, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Mount_Kilimanjaro.jpg/1280px-Mount_Kilimanjaro.jpg' },

  // Oceania
  { code: 'AU', flagEmoji: '🇦🇺', sortOrder: 46, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Sydney_Opera_House.jpg/1280px-Sydney_Opera_House.jpg' },
  { code: 'NZ', flagEmoji: '🇳🇿', sortOrder: 47, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Milford_Sound.jpg/1280px-Milford_Sound.jpg' },
  { code: 'FJ', flagEmoji: '🇫🇯', sortOrder: 48, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Fiji_Beach.jpg/1280px-Fiji_Beach.jpg' },
];

/**
 * Popular tourist cities by country code
 * Each city includes population (for sorting) and isPopular flag
 * Now WITHOUT imageUrl - images are on countries
 */
export const POPULAR_CITIES: Record<string, Array<{
  name: string;
  population: number;
  isPopular: boolean;
  latitude?: number;
  longitude?: number;
}>> = {
  TR: [
    { name: 'Istanbul', population: 15460000, isPopular: true, latitude: 41.0082, longitude: 28.9784 },
    { name: 'Ankara', population: 5663000, isPopular: false, latitude: 39.9334, longitude: 32.8597 },
    { name: 'Izmir', population: 4395000, isPopular: true, latitude: 38.4192, longitude: 27.1287 },
    { name: 'Antalya', population: 2511700, isPopular: true, latitude: 36.8969, longitude: 30.7133 },
    { name: 'Bursa', population: 3101800, isPopular: false, latitude: 40.1828, longitude: 29.0668 },
    { name: 'Bodrum', population: 176000, isPopular: true, latitude: 37.0344, longitude: 27.4305 },
    { name: 'Fethiye', population: 159000, isPopular: true, latitude: 36.6446, longitude: 29.1161 },
    { name: 'Cappadocia', population: 85000, isPopular: true, latitude: 38.6436, longitude: 34.8290 },
  ],
  TH: [
    { name: 'Bangkok', population: 10539000, isPopular: true, latitude: 13.7563, longitude: 100.5018 },
    { name: 'Phuket', population: 416000, isPopular: true, latitude: 7.8804, longitude: 98.3923 },
    { name: 'Chiang Mai', population: 1730000, isPopular: true, latitude: 18.7883, longitude: 98.9853 },
    { name: 'Pattaya', population: 328000, isPopular: true, latitude: 12.9236, longitude: 100.8825 },
    { name: 'Krabi', population: 461000, isPopular: true, latitude: 8.0863, longitude: 98.9063 },
    { name: 'Ayutthaya', population: 51000, isPopular: true, latitude: 14.3532, longitude: 100.5648 },
  ],
  FR: [
    { name: 'Paris', population: 2161000, isPopular: true, latitude: 48.8566, longitude: 2.3522 },
    { name: 'Marseille', population: 870000, isPopular: true, latitude: 43.2965, longitude: 5.3698 },
    { name: 'Lyon', population: 516000, isPopular: true, latitude: 45.7640, longitude: 4.8357 },
    { name: 'Nice', population: 342000, isPopular: true, latitude: 43.7102, longitude: 7.2620 },
    { name: 'Bordeaux', population: 252000, isPopular: true, latitude: 44.8378, longitude: -0.5792 },
  ],
  IT: [
    { name: 'Rome', population: 2873000, isPopular: true, latitude: 41.9028, longitude: 12.4964 },
    { name: 'Milan', population: 1396000, isPopular: true, latitude: 45.4642, longitude: 9.1900 },
    { name: 'Venice', population: 261000, isPopular: true, latitude: 45.4408, longitude: 12.3155 },
    { name: 'Florence', population: 383000, isPopular: true, latitude: 43.7696, longitude: 11.2558 },
    { name: 'Naples', population: 967000, isPopular: true, latitude: 40.8518, longitude: 14.2681 },
  ],
  ES: [
    { name: 'Madrid', population: 3223000, isPopular: true, latitude: 40.4168, longitude: -3.7038 },
    { name: 'Barcelona', population: 1621000, isPopular: true, latitude: 41.3851, longitude: 2.1734 },
    { name: 'Seville', population: 689000, isPopular: true, latitude: 37.3891, longitude: -5.9845 },
    { name: 'Valencia', population: 792000, isPopular: true, latitude: 39.4699, longitude: -0.3763 },
    { name: 'Malaga', population: 574000, isPopular: true, latitude: 36.7213, longitude: -4.4214 },
  ],
  GB: [
    { name: 'London', population: 8982000, isPopular: true, latitude: 51.5074, longitude: -0.1278 },
    { name: 'Edinburgh', population: 524000, isPopular: true, latitude: 55.9533, longitude: -3.1883 },
    { name: 'Manchester', population: 547000, isPopular: true, latitude: 53.4808, longitude: -2.2426 },
    { name: 'Liverpool', population: 498000, isPopular: true, latitude: 53.4084, longitude: -2.9916 },
  ],
  DE: [
    { name: 'Berlin', population: 3645000, isPopular: true, latitude: 52.5200, longitude: 13.4050 },
    { name: 'Munich', population: 1472000, isPopular: true, latitude: 48.1351, longitude: 11.5820 },
    { name: 'Hamburg', population: 1841000, isPopular: true, latitude: 53.5511, longitude: 9.9937 },
    { name: 'Frankfurt', population: 753000, isPopular: true, latitude: 50.1109, longitude: 8.6821 },
  ],
  GR: [
    { name: 'Athens', population: 664000, isPopular: true, latitude: 37.9838, longitude: 23.7275 },
    { name: 'Santorini', population: 15000, isPopular: true, latitude: 36.3932, longitude: 25.4615 },
    { name: 'Mykonos', population: 10000, isPopular: true, latitude: 37.4467, longitude: 25.3289 },
    { name: 'Thessaloniki', population: 325000, isPopular: true, latitude: 40.6401, longitude: 22.9444 },
  ],
  PT: [
    { name: 'Lisbon', population: 505000, isPopular: true, latitude: 38.7223, longitude: -9.1393 },
    { name: 'Porto', population: 214000, isPopular: true, latitude: 41.1579, longitude: -8.6291 },
    { name: 'Faro', population: 118000, isPopular: true, latitude: 37.0194, longitude: -7.9322 },
  ],
  NL: [
    { name: 'Amsterdam', population: 821000, isPopular: true, latitude: 52.3676, longitude: 4.9041 },
    { name: 'Rotterdam', population: 623000, isPopular: true, latitude: 51.9244, longitude: 4.4777 },
    { name: 'The Hague', population: 514000, isPopular: true, latitude: 52.0705, longitude: 4.3007 },
  ],
  AT: [
    { name: 'Vienna', population: 1900000, isPopular: true, latitude: 48.2082, longitude: 16.3738 },
    { name: 'Salzburg', population: 154000, isPopular: true, latitude: 47.8095, longitude: 13.0550 },
    { name: 'Innsbruck', population: 132000, isPopular: true, latitude: 47.2692, longitude: 11.4041 },
  ],
  CH: [
    { name: 'Zurich', population: 402000, isPopular: true, latitude: 47.3769, longitude: 8.5417 },
    { name: 'Geneva', population: 201000, isPopular: true, latitude: 46.2044, longitude: 6.1432 },
    { name: 'Lucerne', population: 82000, isPopular: true, latitude: 47.0502, longitude: 8.3093 },
    { name: 'Interlaken', population: 5600, isPopular: true, latitude: 46.6863, longitude: 7.8632 },
  ],
  CZ: [
    { name: 'Prague', population: 1309000, isPopular: true, latitude: 50.0755, longitude: 14.4378 },
    { name: 'Brno', population: 380000, isPopular: true, latitude: 49.1951, longitude: 16.6068 },
    { name: 'Cesky Krumlov', population: 13000, isPopular: true, latitude: 48.8127, longitude: 14.3175 },
  ],
  HR: [
    { name: 'Dubrovnik', population: 42000, isPopular: true, latitude: 42.6507, longitude: 18.0944 },
    { name: 'Split', population: 178000, isPopular: true, latitude: 43.5081, longitude: 16.4402 },
    { name: 'Zagreb', population: 790000, isPopular: true, latitude: 45.8150, longitude: 15.9819 },
  ],
  IE: [
    { name: 'Dublin', population: 553000, isPopular: true, latitude: 53.3498, longitude: -6.2603 },
    { name: 'Galway', population: 79000, isPopular: true, latitude: 53.2707, longitude: -9.0568 },
    { name: 'Cork', population: 125000, isPopular: true, latitude: 51.8985, longitude: -8.4756 },
  ],
  PL: [
    { name: 'Krakow', population: 767000, isPopular: true, latitude: 50.0647, longitude: 19.9450 },
    { name: 'Warsaw', population: 1765000, isPopular: true, latitude: 52.2297, longitude: 21.0122 },
    { name: 'Gdansk', population: 462000, isPopular: true, latitude: 54.3520, longitude: 18.6466 },
  ],
  HU: [
    { name: 'Budapest', population: 1752000, isPopular: true, latitude: 47.4979, longitude: 19.0402 },
    { name: 'Lake Balaton', population: 8000, isPopular: true, latitude: 46.9073, longitude: 17.8930 },
  ],
  NO: [
    { name: 'Oslo', population: 681000, isPopular: true, latitude: 59.9139, longitude: 10.7522 },
    { name: 'Bergen', population: 279000, isPopular: true, latitude: 60.3913, longitude: 5.3221 },
    { name: 'Tromso', population: 76000, isPopular: true, latitude: 69.6492, longitude: 18.9553 },
  ],
  SE: [
    { name: 'Stockholm', population: 975000, isPopular: true, latitude: 59.3293, longitude: 18.0686 },
    { name: 'Gothenburg', population: 572000, isPopular: true, latitude: 57.7089, longitude: 11.9746 },
    { name: 'Malmo', population: 341000, isPopular: true, latitude: 55.6050, longitude: 13.0038 },
  ],
  DK: [
    { name: 'Copenhagen', population: 602000, isPopular: true, latitude: 55.6761, longitude: 12.5683 },
    { name: 'Aarhus', population: 277000, isPopular: true, latitude: 56.1629, longitude: 10.2039 },
  ],
  IS: [
    { name: 'Reykjavik', population: 131000, isPopular: true, latitude: 64.1466, longitude: -21.9426 },
    { name: 'Akureyri', population: 18000, isPopular: true, latitude: 65.6835, longitude: -18.0878 },
  ],
  JP: [
    { name: 'Tokyo', population: 13960000, isPopular: true, latitude: 35.6762, longitude: 139.6503 },
    { name: 'Osaka', population: 2726000, isPopular: true, latitude: 34.6937, longitude: 135.5023 },
    { name: 'Kyoto', population: 1475000, isPopular: true, latitude: 35.0116, longitude: 135.7681 },
    { name: 'Hiroshima', population: 1196000, isPopular: true, latitude: 34.3853, longitude: 132.4553 },
    { name: 'Nara', population: 360000, isPopular: true, latitude: 34.6851, longitude: 135.8048 },
  ],
  CN: [
    { name: 'Beijing', population: 21540000, isPopular: true, latitude: 39.9042, longitude: 116.4074 },
    { name: 'Shanghai', population: 27060000, isPopular: true, latitude: 31.2304, longitude: 121.4737 },
    { name: 'Xi\'an', population: 12005000, isPopular: true, latitude: 34.3416, longitude: 108.9398 },
    { name: 'Guilin', population: 5000000, isPopular: true, latitude: 25.2736, longitude: 110.2900 },
    { name: 'Chengdu', population: 16045000, isPopular: true, latitude: 30.5728, longitude: 104.0668 },
  ],
  KR: [
    { name: 'Seoul', population: 9776000, isPopular: true, latitude: 37.5665, longitude: 126.9780 },
    { name: 'Busan', population: 3449000, isPopular: true, latitude: 35.1796, longitude: 129.0756 },
    { name: 'Jeju', population: 670000, isPopular: true, latitude: 33.4996, longitude: 126.5312 },
    { name: 'Gyeongju', population: 264000, isPopular: true, latitude: 35.8562, longitude: 129.2247 },
  ],
  SG: [
    { name: 'Singapore', population: 5686000, isPopular: true, latitude: 1.3521, longitude: 103.8198 },
  ],
  MY: [
    { name: 'Kuala Lumpur', population: 1768000, isPopular: true, latitude: 3.1390, longitude: 101.6869 },
    { name: 'Penang', population: 708000, isPopular: true, latitude: 5.4164, longitude: 100.3327 },
    { name: 'Malacca', population: 484000, isPopular: true, latitude: 2.1896, longitude: 102.2501 },
  ],
  ID: [
    { name: 'Bali', population: 4225000, isPopular: true, latitude: -8.4095, longitude: 115.1889 },
    { name: 'Jakarta', population: 10562000, isPopular: true, latitude: -6.2088, longitude: 106.8456 },
    { name: 'Yogyakarta', population: 373000, isPopular: true, latitude: -7.7956, longitude: 110.3695 },
  ],
  VN: [
    { name: 'Hanoi', population: 7994000, isPopular: true, latitude: 21.0285, longitude: 105.8542 },
    { name: 'Ho Chi Minh City', population: 8993000, isPopular: true, latitude: 10.8231, longitude: 106.6297 },
    { name: 'Hoi An', population: 152000, isPopular: true, latitude: 15.8801, longitude: 108.3380 },
    { name: 'Da Nang', population: 1007000, isPopular: true, latitude: 16.0544, longitude: 108.2022 },
  ],
  IN: [
    { name: 'Delhi', population: 16787000, isPopular: true, latitude: 28.7041, longitude: 77.1025 },
    { name: 'Mumbai', population: 12442000, isPopular: true, latitude: 19.0760, longitude: 72.8777 },
    { name: 'Jaipur', population: 3073000, isPopular: true, latitude: 26.9124, longitude: 75.7873 },
    { name: 'Agra', population: 1585000, isPopular: true, latitude: 27.1767, longitude: 78.0081 },
    { name: 'Goa', population: 1458000, isPopular: true, latitude: 15.2993, longitude: 74.1240 },
  ],
  AE: [
    { name: 'Dubai', population: 3331000, isPopular: true, latitude: 25.2048, longitude: 55.2708 },
    { name: 'Abu Dhabi', population: 1482000, isPopular: true, latitude: 24.4539, longitude: 54.3773 },
  ],
  AZ: [
    { name: 'Baku', population: 2293000, isPopular: true, latitude: 40.4093, longitude: 49.8671 },
    { name: 'Gabala', population: 13000, isPopular: true, latitude: 40.9817, longitude: 47.8486 },
    { name: 'Sheki', population: 63000, isPopular: true, latitude: 41.1919, longitude: 47.1706 },
  ],
  JO: [
    { name: 'Amman', population: 1000000, isPopular: true, latitude: 31.9454, longitude: 35.9284 },
    { name: 'Petra', population: 1000, isPopular: true, latitude: 30.3285, longitude: 35.4444 },
    { name: 'Aqaba', population: 108000, isPopular: true, latitude: 29.5321, longitude: 35.0063 },
  ],
  US: [
    { name: 'New York', population: 8336000, isPopular: true, latitude: 40.7128, longitude: -74.0060 },
    { name: 'Los Angeles', population: 3979000, isPopular: true, latitude: 34.0522, longitude: -118.2437 },
    { name: 'San Francisco', population: 874000, isPopular: true, latitude: 37.7749, longitude: -122.4194 },
    { name: 'Las Vegas', population: 641000, isPopular: true, latitude: 36.1699, longitude: -115.1398 },
    { name: 'Miami', population: 470000, isPopular: true, latitude: 25.7617, longitude: -80.1918 },
    { name: 'Chicago', population: 2716000, isPopular: true, latitude: 41.8781, longitude: -87.6298 },
  ],
  CA: [
    { name: 'Toronto', population: 2731000, isPopular: true, latitude: 43.6532, longitude: -79.3832 },
    { name: 'Vancouver', population: 675000, isPopular: true, latitude: 49.2827, longitude: -123.1207 },
    { name: 'Montreal', population: 1705000, isPopular: true, latitude: 45.5017, longitude: -73.5673 },
  ],
  MX: [
    { name: 'Mexico City', population: 8855000, isPopular: true, latitude: 19.4326, longitude: -99.1332 },
    { name: 'Cancun', population: 628000, isPopular: true, latitude: 21.1619, longitude: -86.8515 },
    { name: 'Playa del Carmen', population: 150000, isPopular: true, latitude: 20.6296, longitude: -87.0739 },
  ],
  BR: [
    { name: 'Rio de Janeiro', population: 6748000, isPopular: true, latitude: -22.9068, longitude: -43.1729 },
    { name: 'Sao Paulo', population: 12325000, isPopular: true, latitude: -23.5505, longitude: -46.6333 },
    { name: 'Salvador', population: 2887000, isPopular: true, latitude: -12.9714, longitude: -38.5014 },
  ],
  AR: [
    { name: 'Buenos Aires', population: 2891000, isPopular: true, latitude: -34.6037, longitude: -58.3816 },
    { name: 'Mendoza', population: 115000, isPopular: true, latitude: -32.8895, longitude: -68.8458 },
  ],
  PE: [
    { name: 'Lima', population: 9751000, isPopular: true, latitude: -12.0464, longitude: -77.0428 },
    { name: 'Cusco', population: 428000, isPopular: true, latitude: -13.5319, longitude: -71.9675 },
  ],
  CL: [
    { name: 'Santiago', population: 5614000, isPopular: true, latitude: -33.4489, longitude: -70.6693 },
    { name: 'Valparaiso', population: 284000, isPopular: true, latitude: -33.0472, longitude: -71.6127 },
  ],
  CR: [
    { name: 'San Jose', population: 342000, isPopular: true, latitude: 9.9281, longitude: -84.0907 },
    { name: 'Manuel Antonio', population: 1500, isPopular: true, latitude: 9.3886, longitude: -84.1428 },
  ],
  EG: [
    { name: 'Cairo', population: 9120000, isPopular: true, latitude: 30.0444, longitude: 31.2357 },
    { name: 'Luxor', population: 506000, isPopular: true, latitude: 25.6872, longitude: 32.6396 },
    { name: 'Aswan', population: 275000, isPopular: true, latitude: 24.0889, longitude: 32.8998 },
  ],
  MA: [
    { name: 'Marrakech', population: 928000, isPopular: true, latitude: 31.6295, longitude: -7.9811 },
    { name: 'Casablanca', population: 3360000, isPopular: true, latitude: 33.5731, longitude: -7.5898 },
    { name: 'Fes', population: 1112000, isPopular: true, latitude: 34.0181, longitude: -5.0078 },
  ],
  ZA: [
    { name: 'Cape Town', population: 4004000, isPopular: true, latitude: -33.9249, longitude: 18.4241 },
    { name: 'Johannesburg', population: 5635000, isPopular: true, latitude: -26.2041, longitude: 28.0473 },
    { name: 'Durban', population: 595000, isPopular: true, latitude: -29.8587, longitude: 31.0218 },
  ],
  KE: [
    { name: 'Nairobi', population: 4397000, isPopular: true, latitude: -1.2864, longitude: 36.8172 },
    { name: 'Mombasa', population: 1208000, isPopular: true, latitude: -4.0435, longitude: 39.6682 },
  ],
  TZ: [
    { name: 'Dar es Salaam', population: 4364000, isPopular: true, latitude: -6.7924, longitude: 39.2083 },
    { name: 'Zanzibar', population: 224000, isPopular: true, latitude: -6.1659, longitude: 39.2026 },
  ],
  AU: [
    { name: 'Sydney', population: 5231000, isPopular: true, latitude: -33.8688, longitude: 151.2093 },
    { name: 'Melbourne', population: 4936000, isPopular: true, latitude: -37.8136, longitude: 144.9631 },
    { name: 'Brisbane', population: 2514000, isPopular: true, latitude: -27.4698, longitude: 153.0251 },
    { name: 'Perth', population: 2042000, isPopular: true, latitude: -31.9505, longitude: 115.8605 },
  ],
  NZ: [
    { name: 'Auckland', population: 1470000, isPopular: true, latitude: -36.8485, longitude: 174.7633 },
    { name: 'Wellington', population: 215000, isPopular: true, latitude: -41.2865, longitude: 174.7762 },
    { name: 'Queenstown', population: 16000, isPopular: true, latitude: -45.0312, longitude: 168.6626 },
  ],
  FJ: [
    { name: 'Suva', population: 93000, isPopular: true, latitude: -18.1416, longitude: 178.4415 },
    { name: 'Nadi', population: 43000, isPopular: true, latitude: -17.8045, longitude: 177.4182 },
  ],
};

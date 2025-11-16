// Photo Analyzer Module Types
// Bu modül trip-generator'dan tamamen izole, sadece fotoğraf analizi için

export interface PhotoAnalysisRequest {
  imageBase64: string; // Base64 encoded image
  language: string;    // tr, en, etc.
}

export interface PlaceInfo {
  name: string;                    // e.g., "Kızıl Meydan"
  localName?: string;              // e.g., "Красная площадь" (opsiyonel)
  location: {
    city?: string;                 // e.g., "Moskova"
    country: string;               // e.g., "Rusya"
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  description: string;             // Kısa açıklama (2-3 cümle)
  detailedInfo: {
    history?: string;              // Tarihi bilgi
    architecture?: string;         // Mimari özellikler
    culturalSignificance?: string; // Kültürel önemi
    bestTimeToVisit?: string;      // En iyi ziyaret zamanı
    entryFee?: string;             // Giriş ücreti (varsa)
    openingHours?: string;         // Açılış saatleri
  };
  rating?: {
    average: number;               // 0-5 arası
    count: number;                 // Toplam yorum sayısı
  };
  userReviews?: {
    author: string;
    rating: number;
    comment: string;
    date?: string;
  }[];
  categories?: string[];           // e.g., ["Tarih", "Mimari", "Müze"]
  imageUrl?: string;                // Orijinal veya referans görsel URL (opsiyonel)
}

export interface PhotoAnalysisResponse {
  success: boolean;
  recognized: boolean;             // Yer tanındı mı?
  message?: string;                // Hata veya bilgi mesajı
  data?: PlaceInfo;                // Tanındıysa bilgiler
  language: string;
  creditCost: number;              // 15 (tanındıysa), 0 (tanınmadıysa)
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

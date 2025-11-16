// Request Types
export interface TripGenerationRequest {
  country: string;
  cities: string[];
  interests: string[];
  startDate: string;
  endDate: string;
  language: string;
  userId?: string;
}

// Response Types
export interface TripPlan {
  id: string;
  title: string;
  cities: string[];
  startDate: string;
  endDate: string;
  duration: number;
  heroImage: string;
  itinerary: DayPlan[];
  generatedAt: string;
}

export interface DayPlan {
  dayNumber: number;
  city: string;
  dateRange: string;
  activities: Activity[];
  isRoute?: boolean;
  routeInfo?: RouteInfo;
}

export interface Activity {
  id: string;
  title: string;
  duration: string;
  icon: string;
  type: 'activity' | 'accommodation' | 'transport' | 'food';
  description?: string;
}

export interface RouteInfo {
  from: string;
  to: string;
  transportType: 'flight' | 'bus' | 'train' | 'car' | 'ferry';
  duration?: string;
  cost?: string;
  fromTerminal?: string; // e.g., Suvarnabhumi Airport (BKK) / Pattaya Bus Terminal
  toTerminal?: string;   // e.g., Phuket International Airport (HKT)
  alternatives?: Array<{
    transportType: 'flight' | 'bus' | 'train' | 'car' | 'ferry';
    duration?: string;
    cost?: string;
    fromTerminal?: string;
    toTerminal?: string;
  }>;
}

// OpenAI Types
export interface OpenAIRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens: number;
  temperature: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Language Support
export type SupportedLanguage = 'tr' | 'en' | 'es' | 'fr' | 'it';

export interface LanguagePrompts {
  system: string;
  user: string;
}

// Service Response
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Travel Info Types
export interface TravelInfoRequest {
  country: string;
  language: string;
}

export interface TravelInfo {
  country: string;
  language: string;
  countryInfo: {
    overview: string;
    topHighlights: string[];
    currency: string;
    power: string;
    emergency: string;
    sim: string;
    bestSeasons: string;
    tipping?: string;
    safety: string;
    localEtiquette?: string;
  };
}

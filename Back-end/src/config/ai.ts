import dotenv from 'dotenv';

dotenv.config();

export const aiConfig = {
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:3001',
  // Allow a longer timeout to accommodate GPT responses + retry
  timeoutMs: Number(process.env.AI_SERVICE_TIMEOUT_MS || 60000),
  apiPrefix: '/api/trip',
};

export const aiEndpoints = {
  generateItinerary: '/generate-itinerary',
  travelInfo: '/travel-info',
  health: '/health',
};

export type AITripGenerationRequest = {
  country: string;
  cities: string[];
  interests: string[];
  startDate: string; // ISO string
  endDate: string; // ISO string
  language: string; // 'tr' | 'en' | ...
  userId?: string;
};

export type AIActivity = {
  id: string;
  title: string;
  duration: string;
  icon: string;
  type: 'activity' | 'accommodation' | 'transport' | 'food';
  description?: string;
};

export type AIRouteInfo = {
  from: string;
  to: string;
  transportType: 'flight' | 'bus' | 'train' | 'car';
  duration?: string;
  cost?: string;
  fromTerminal?: string;
  toTerminal?: string;
  alternatives?: Array<{
    transportType: 'flight' | 'bus' | 'train' | 'car';
    duration?: string;
    cost?: string;
    fromTerminal?: string;
    toTerminal?: string;
  }>;
};

export type AIDayPlan = {
  dayNumber: number;
  city: string;
  dateRange: string;
  activities: AIActivity[];
  isRoute?: boolean;
  routeInfo?: AIRouteInfo;
};

export type AITripPlan = {
  id: string;
  title: string;
  cities: string[];
  startDate: string;
  endDate: string;
  duration: number;
  heroImage: string;
  itinerary: AIDayPlan[];
  generatedAt: string;
};

export type AIServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

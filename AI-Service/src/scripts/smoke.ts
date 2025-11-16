// Force mock mode BEFORE importing config
process.env.OPENAI_USE_GPT = 'false';

import { OpenAIService } from "../modules/trip-generator/services/openaiService";
import { TripGenerationRequest } from "../modules/trip-generator/types";

async function main() {
  const svc = new OpenAIService();
  const req: TripGenerationRequest = {
    country: 'Thailand',
    cities: ['Bangkok', 'Pattaya', 'Phuket'],
    interests: ['culture','history','beach','nightlife','food'],
    startDate: '2025-10-01',
    endDate: '2025-10-12',
    language: 'tr',
  };
  console.log('🧪 Smoke test: mock mode (OPENAI_USE_GPT=false)');
  const res = await svc.generateTripPlan(req);
  if (!res.success) {
    console.error('Smoke failed:', res.error);
    process.exit(1);
  }
  console.log(JSON.stringify(res.data, null, 2));
}

main().catch(e => {
  console.error('Smoke exception:', e);
  process.exit(1);
});

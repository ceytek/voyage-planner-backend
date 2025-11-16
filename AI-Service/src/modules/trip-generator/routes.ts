import express from 'express';
import { TripGeneratorController } from './controllers/tripGeneratorController';

const router = express.Router();
const tripController = new TripGeneratorController();

// Trip generation routes
router.post('/generate-itinerary', tripController.generateItinerary);
router.post('/travel-info', tripController.getTravelInfo);

// Utility routes
router.get('/health', tripController.healthCheck);
router.get('/languages', tripController.getSupportedLanguages);

export { router as tripGeneratorRoutes };

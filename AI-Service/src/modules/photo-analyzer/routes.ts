// Photo Analyzer Routes
// Tamamen izole, trip-generator ile karışmaz

import { Router } from 'express';
import { PhotoAnalyzerController } from './controllers/photoAnalyzerController';

const router = Router();
const controller = new PhotoAnalyzerController();

/**
 * POST /api/photo/analyze
 * Analyze photo and identify place
 * 
 * Request body:
 * {
 *   "imageBase64": "base64_encoded_image",
 *   "language": "tr" | "en" | "es" | "fr" | "it"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "recognized": true,
 *     "message": "...",
 *     "data": PlaceInfo,
 *     "language": "tr",
 *     "creditCost": 15
 *   }
 * }
 */
router.post('/analyze', controller.analyzePhoto);

/**
 * GET /api/photo/health
 * Health check endpoint
 */
router.get('/health', controller.healthCheck);

export const photoAnalyzerRoutes = router;

import { Request, Response } from 'express';
import { OpenAIService } from '../services/openaiService';
import { TripGenerationRequest, ServiceResponse, TripPlan, TravelInfoRequest, TravelInfo } from '../types';
import { isLanguageSupported } from '../services/promptService';

export class TripGeneratorController {
  private openaiService: OpenAIService;
  
  constructor() {
    this.openaiService = new OpenAIService();
  }
  
  generateItinerary = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📥 Trip generation request received:', req.body);
      
      // Validate request
      const validationError = this.validateRequest(req.body);
      if (validationError) {
        res.status(400).json({
          success: false,
          error: validationError,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      const request: TripGenerationRequest = req.body;
      
      // Generate trip plan
      const result = await this.openaiService.generateTripPlan(request);
      
      if (result.success) {
        console.log('✅ Trip plan generated successfully');
        res.status(200).json(result);
      } else {
        console.error('❌ Trip generation failed:', result.error);
        res.status(500).json(result);
      }
      
    } catch (error) {
      console.error('💥 Controller Error:', error);
      
      const errorResponse: ServiceResponse<TripPlan> = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      };
      
      res.status(500).json(errorResponse);
    }
  };

  // Travel info endpoint
  getTravelInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Partial<TravelInfoRequest>;
      // We only require country + language now (city removed from spec)
      if (!body?.country || !body?.language) {
        res.status(400).json({ success: false, error: 'country and language required', timestamp: new Date().toISOString() });
        return;
      }
      const result = await this.openaiService.generateTravelInfo(body as TravelInfoRequest);
      if (result.success) res.status(200).json(result); else res.status(500).json(result);
    } catch (error) {
      const err: ServiceResponse<TravelInfo> = { success: false, error: error instanceof Error ? error.message : 'Internal error', timestamp: new Date().toISOString() };
      res.status(500).json(err);
    }
  };
  
  // Health check endpoint
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'AI Service is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  };
  
  // Get supported languages
  getSupportedLanguages = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      data: {
        languages: ['tr', 'en', 'es', 'fr', 'it'],
        default: 'en'
      },
      timestamp: new Date().toISOString()
    });
  };
  
  private validateRequest(body: any): string | null {
    const required = ['country', 'cities', 'interests', 'startDate', 'endDate', 'language'];
    
    for (const field of required) {
      if (!body[field]) {
        return `Missing required field: ${field}`;
      }
    }
    
    // Validate arrays
    if (!Array.isArray(body.cities) || body.cities.length === 0) {
      return 'Cities must be a non-empty array';
    }
    
    if (!Array.isArray(body.interests) || body.interests.length === 0) {
      return 'Interests must be a non-empty array';
    }
    
    // Validate language
    if (!isLanguageSupported(body.language)) {
      return `Unsupported language: ${body.language}. Supported languages: tr, en, es, fr, it`;
    }
    
    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid date format. Use YYYY-MM-DD format';
    }
    
    if (endDate <= startDate) {
      return 'End date must be after start date';
    }
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      return 'Trip duration cannot exceed 30 days';
    }
    
    return null;
  }
}

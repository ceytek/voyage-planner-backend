// Photo Analyzer Controller
// Trip generator'dan tamamen ayrı endpoint

import { Request, Response } from 'express';
import { PhotoAnalyzerOpenAIService } from '../services/openaiService';
import type { PhotoAnalysisRequest } from '../types';

export class PhotoAnalyzerController {
  private openaiService: PhotoAnalyzerOpenAIService;

  constructor() {
    this.openaiService = new PhotoAnalyzerOpenAIService();
  }

  /**
   * POST /api/photo/analyze
   * Analyze uploaded photo and identify place
   */
  analyzePhoto = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📸 [PhotoAnalyzerController] Received analyze request');

      const { imageBase64, language = 'tr' }: PhotoAnalysisRequest = req.body;

      // Debug payload size
      if (imageBase64) {
        const approxKb = Math.round((imageBase64.length * 3) / 4 / 1024);
        console.log(`📦 Incoming image base64 size ~${approxKb} KB, lang=${language}`);
        console.log(`🔤 Base64 prefix: ${imageBase64.substring(0, 16)}...`);
      }

      // Validation
      if (!imageBase64) {
        res.status(400).json({
          success: false,
          error: 'Image is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!PhotoAnalyzerOpenAIService.validateImageBase64(imageBase64)) {
        res.status(400).json({
          success: false,
          error: 'Invalid image format. Must be base64 encoded.',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Analyze photo
      const result = await this.openaiService.analyzePhoto({
        imageBase64,
        language
      });

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to analyze photo',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Success response
      res.status(200).json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });

      console.log('✅ [PhotoAnalyzerController] Analysis complete');

    } catch (error: any) {
      console.error('❌ [PhotoAnalyzerController] Error:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /api/photo/health
   * Health check for photo analyzer service
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Photo Analyzer Service is running',
      service: 'photo-analyzer',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  };
}

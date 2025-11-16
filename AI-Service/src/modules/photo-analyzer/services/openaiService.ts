// Photo Analyzer OpenAI Vision Service
// Trip generator'dan tamamen ayrı, sadece görüntü analizi için

import OpenAI from 'openai';
import { config } from '../../../config';
import { generatePhotoAnalysisPrompt, photoAnalysisSchema } from './promptService';
import type { PhotoAnalysisRequest, PhotoAnalysisResponse, PlaceInfo, ServiceResponse } from '../types';

export class PhotoAnalyzerOpenAIService {
  private client: OpenAI;
  private readonly model = 'gpt-4o-mini'; // Vision destekli model
  private readonly maxTokens = 2000;
  private readonly temperature = 0.3; // Daha deterministik sonuçlar için düşük

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Analyze photo with OpenAI Vision API
   */
  async analyzePhoto(request: PhotoAnalysisRequest): Promise<ServiceResponse<PhotoAnalysisResponse>> {
    try {
      console.log('🔍 [PhotoAnalyzer] Starting photo analysis...');
      console.log(`📸 Language: ${request.language}`);
      console.log(`🤖 Model: ${this.model}`);

      // Generate prompt
      const systemPrompt = generatePhotoAnalysisPrompt(request);

      // Call OpenAI Vision API
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${request.imageBase64}`,
                  detail: 'high' // Yüksek detay analizi
                }
              }
            ]
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: 'json_object' } // Structured JSON output
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      console.log('✅ [PhotoAnalyzer] Raw AI response received');

      // Parse JSON response
      const parsedResponse = JSON.parse(content);
      console.log('📊 [PhotoAnalyzer] Parsed response:', {
        recognized: parsedResponse.recognized,
        placeName: parsedResponse.place?.name || 'N/A'
      });

      // Build response
      const result: PhotoAnalysisResponse = {
        success: true,
        recognized: parsedResponse.recognized === true,
        message: parsedResponse.message,
        language: request.language,
        creditCost: parsedResponse.recognized ? 15 : 0, // Kredi sadece tanındıysa düşer
      };

      // Add place info if recognized
      if (parsedResponse.recognized && parsedResponse.place) {
        result.data = this.mapPlaceInfo(parsedResponse.place);
      }

      console.log(`💰 [PhotoAnalyzer] Credit cost: ${result.creditCost}`);
      console.log('✨ [PhotoAnalyzer] Analysis complete');

      return {
        success: true,
        data: result
      };

    } catch (error: any) {
      console.error('❌ [PhotoAnalyzer] Error:', error?.message || error);
      if (error?.response) {
        try {
          console.error('❌ [PhotoAnalyzer] OpenAI response status:', error.response.status);
          console.error('❌ [PhotoAnalyzer] OpenAI response data:', JSON.stringify(error.response.data));
        } catch {}
      }
      if (error?.code) {
        console.error('❌ [PhotoAnalyzer] Error code:', error.code);
      }
      
      return {
        success: false,
  error: error.message || 'Failed to analyze photo',
      };
    }
  }

  /**
   * Map raw AI response to PlaceInfo type
   */
  private mapPlaceInfo(rawPlace: any): PlaceInfo {
    return {
      name: rawPlace.name || '',
      localName: rawPlace.localName,
      location: {
        city: rawPlace.location?.city,
        country: rawPlace.location?.country || '',
        coordinates: rawPlace.location?.coordinates ? {
          latitude: rawPlace.location.coordinates.latitude,
          longitude: rawPlace.location.coordinates.longitude
        } : undefined
      },
      description: rawPlace.description || '',
      detailedInfo: {
        history: rawPlace.detailedInfo?.history,
        architecture: rawPlace.detailedInfo?.architecture,
        culturalSignificance: rawPlace.detailedInfo?.culturalSignificance,
        bestTimeToVisit: rawPlace.detailedInfo?.bestTimeToVisit,
        entryFee: rawPlace.detailedInfo?.entryFee,
        openingHours: rawPlace.detailedInfo?.openingHours
      },
      rating: rawPlace.rating ? {
        average: rawPlace.rating.average,
        count: rawPlace.rating.count
      } : undefined,
      userReviews: rawPlace.userReviews?.slice(0, 3) || [], // Max 3 review
      categories: rawPlace.categories || [],
      imageUrl: rawPlace.imageUrl
    };
  }

  /**
   * Validate image base64 format
   */
  static validateImageBase64(base64: string): boolean {
    if (!base64 || typeof base64 !== 'string') {
      return false;
    }

    // Check if it's a valid base64 string
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Pattern.test(base64);
  }
}

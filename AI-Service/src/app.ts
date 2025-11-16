import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config';
import { tripGeneratorRoutes } from './modules/trip-generator/routes';
import { photoAnalyzerRoutes } from './modules/photo-analyzer/routes';

class AIServiceApp {
  public app: express.Application;
  
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }
  
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true
    }));
    
    // Compression
    this.app.use(compression());
    
    // Logging
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined'));
    }
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.api.rateLimit,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString()
      }
    });
    this.app.use('/api/', limiter);
    
  // Body parsing (increase limits for base64 images)
  this.app.use(express.json({ limit: '20mb' }));
  this.app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  }
  
  private initializeRoutes(): void {
    // Health check route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Voyage AI Service is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
    
    // API routes
    this.app.use('/api/trip', tripGeneratorRoutes);
    this.app.use('/api/photo', photoAnalyzerRoutes); // YENİ: Photo analyzer route
    
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }
  
  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('💥 Global Error Handler:', error);
      
      res.status(500).json({
        success: false,
        error: config.nodeEnv === 'production' ? 'Internal server error' : error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
  
  public listen(): void {
    try {
      // Validate configuration
      validateConfig();
      
      this.app.listen(config.port, () => {
        console.log('🚀 AI Service started successfully');
        console.log(`📍 Server running on port ${config.port}`);
        console.log(`🌍 Environment: ${config.nodeEnv}`);
        console.log(`🤖 OpenAI Model: ${config.openai.model}`);
        console.log(`🔗 CORS Origin: ${config.cors.origin}`);
        console.log('=====================================');
      });
      
    } catch (error) {
      console.error('❌ Failed to start AI Service:', error);
      process.exit(1);
    }
  }
}

export default AIServiceApp;

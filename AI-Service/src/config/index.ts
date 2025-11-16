import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    // Prefer a fast, JSON-capable model by default; override via OPENAI_MODEL
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_COMPLETION_TOKENS || '2000', 10),
  temperature: 0.4,
  useGPT: (process.env.OPENAI_USE_GPT || 'true').toLowerCase() === 'true',
  // Increase timeout to reduce premature fallbacks
  gptTimeoutMs: parseInt(process.env.OPENAI_GPT_TIMEOUT_MS || '25000', 10),
  },
  
  // API
  api: {
    rateLimit: parseInt(process.env.API_RATE_LIMIT || '10', 10),
    timeout: parseInt(process.env.API_TIMEOUT || '60000', 10),
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
} as const;

// Validation
export const validateConfig = (): void => {
  const required = [
    'OPENAI_API_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Simple startup log for the model used
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.log(`[AI-Service] OpenAI model: ${config.openai.model}`);
}

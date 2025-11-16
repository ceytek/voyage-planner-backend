import AIServiceApp from './app';

// Start the AI Service
const aiService = new AIServiceApp();
aiService.listen();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📝 SIGTERM received');
  console.log('🛑 Shutting down AI Service gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📝 SIGINT received');
  console.log('🛑 Shutting down AI Service gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

import 'reflect-metadata';
// Enable TS path aliases (e.g., @/...) when running compiled JS
import 'tsconfig-paths/register';
import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import { useContainer } from 'typeorm';
import dotenv from 'dotenv';
import { HealthResolver } from './resolvers/HealthResolver';
import { AppDataSource } from './config/database';
import { UserResolver } from './modules/user/resolvers/UserResolver';
import { PlanResolver } from './modules/plan/resolvers/PlanResolver';
import { InterestResolver } from './modules/interest/resolvers/InterestResolver';
import { CreditResolver } from './modules/credit/resolvers/CreditResolver';
import { PlanService } from './modules/plan/services/PlanService';
import { InterestService } from './modules/interest/services/InterestService';
import { CreditPackageSeeder } from './modules/credit/services/CreditPackageSeeder';
import { AuthMiddleware } from './utils/authMiddleware';
import { TripResolver, TravelInfoResolver } from './modules/trip/resolvers/TripResolver';
import { LocationResolver } from './modules/location/resolvers/LocationResolver';
import { DiscoveryResolver } from './modules/discovery/resolvers/DiscoveryResolver';
import { WelcomeResolver } from './modules/welcome/resolvers/WelcomeResolver';
import { CountryImageResolver } from './modules/countryinfo/resolvers/CountryImageResolver';
import { PaymentResolver } from './modules/payment/resolvers/PaymentResolver';
import { stripeWebhookHandler } from './modules/payment/webhooks/stripeWebhook';
import { AppleIAPResolver } from './modules/apple-iap/resolvers/AppleIAPResolver';
// import { Context } from './modules/user/resolvers/UserResolver';
import { extractTokenFromHeader, verifyToken } from './utils/jwt';
import { UserService } from './modules/user/services/UserService';
import { AuthProvider } from './modules/user/entities/User';

dotenv.config();

// Configure TypeORM to use TypeDI container
useContainer(Container);

async function startServer() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Seed initial plans if needed
    const planService = Container.get(PlanService);
    await planService.seedInitialPlans();

    // Seed interest categories if needed
    const interestService = Container.get(InterestService);
    await interestService.seedInterests();

    // Seed credit packages with translations if needed
    const creditSeeder = Container.get(CreditPackageSeeder);
    await creditSeeder.seedCreditPackagesWithTranslations();

    // Build GraphQL schema with all resolvers
    const schema = await buildSchema({
      resolvers: [HealthResolver, UserResolver, PlanResolver, InterestResolver, CreditResolver, TripResolver, TravelInfoResolver, LocationResolver, DiscoveryResolver, WelcomeResolver, CountryImageResolver, PaymentResolver, AppleIAPResolver],
      container: Container,
      globalMiddlewares: [AuthMiddleware],
      authChecker: ({ context }: any) => {
        // Return true if user exists in context (set by AuthMiddleware)
        return !!context.user;
      },
    });

    // Create Apollo Server
    const server = new ApolloServer({
      schema,
    });

    const PORT = parseInt(process.env.PORT || '4001');
    
    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
      context: async ({ req, res }: any) => {
        const ctx: any = {
          req: req as Request,
          res: res as Response,
        };

        // Populate context.user early so @Authorized can see it
        try {
          const authHeader = (req as Request)?.headers?.authorization;
          if (authHeader) {
            const token = extractTokenFromHeader(authHeader);
            const userService = Container.get(UserService);

            if (process.env.NODE_ENV !== 'production' && token?.startsWith('test-token-')) {
              let user = await userService.findByProviderAndId(AuthProvider.GOOGLE as any, 'google-test-uid');
              if (!user) {
                user = await userService.createUser({
                  email: 'test.user@example.com',
                  name: 'Test User',
                  displayName: 'Test User',
                  provider: AuthProvider.GOOGLE as any,
                  providerId: 'google-test-uid',
                  profilePicture: 'https://i.pravatar.cc/150?img=3',
                  languagePreference: 'tr',
                } as any);
              }
              ctx.user = user;
              ctx.userId = user.id;
            } else {
              const payload = verifyToken(token);
              const user = await userService.findById(payload.userId);
              if (user) {
                ctx.user = user;
                ctx.userId = user.id;
              }
            }
          }
        } catch (e) {
          // ignore, unauthenticated
        }

        return ctx;
      },
    });

    // Start separate Express server for webhooks on different port
    const webhookApp = express();
    const WEBHOOK_PORT = parseInt(process.env.WEBHOOK_PORT || '4002');
    
    webhookApp.post('/webhooks/stripe',
      express.raw({ type: 'application/json' }),
      async (req, res) => {
        await stripeWebhookHandler.handleWebhook(req, res);
      }
    );

    webhookApp.listen(WEBHOOK_PORT, () => {
      console.log(`🚀 Server running at ${url}`);
      console.log(`📊 GraphQL endpoint: ${url}graphql`);
      console.log(`🔔 Webhook endpoint: http://localhost:${WEBHOOK_PORT}/webhooks/stripe`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

import { MiddlewareFn } from 'type-graphql';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { UserService } from '../modules/user/services/UserService';
import { Container } from 'typedi';
import { Context } from '../modules/user/resolvers/UserResolver';

export const AuthMiddleware: MiddlewareFn<Context> = async ({ context }, next) => {
  try {
    const authHeader = context.req?.headers?.authorization;
    
    if (!authHeader) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthMiddleware] No Authorization header');
      }
      return next();
    }

    const token = extractTokenFromHeader(authHeader);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AuthMiddleware] Authorization header present:', {
        bearer: authHeader.startsWith('Bearer '),
        tokenPreview: token?.slice(0, 12) + '...'
      });
    }
    const userService = Container.get(UserService);

    // DEV ONLY: allow test tokens to bypass JWT verification
    if (process.env.NODE_ENV !== 'production' && token?.startsWith('test-token-')) {
      // Try to find existing test user by providerId
      const existing = await userService.findByProviderAndId('google' as any, 'google-test-uid');
      if (existing) {
        context.user = existing as any;
        return next();
      }
      // Create a minimal test user
      const newUser = await userService.createUser({
        email: 'test.user@example.com',
        name: 'Test User',
        displayName: 'Test User',
        provider: 'google' as any,
        providerId: 'google-test-uid',
        profilePicture: 'https://i.pravatar.cc/150?img=3',
        languagePreference: 'tr',
      } as any);
      context.user = newUser as any;
      return next();
    }

    const payload = verifyToken(token);
    const user = await userService.findById(payload.userId);
    
    if (user) {
      context.user = user;
    }
    
    return next();
  } catch (error) {
    // Don't throw error, just continue without user context
    return next();
  }
};

export const RequireAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  
  return next();
};

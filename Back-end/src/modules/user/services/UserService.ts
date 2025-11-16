import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { User, AuthProvider } from '../entities/User';
import { CreateUserInput, UpdateUserInput, UpdateCreditInput } from '../dto/user.dto';
import { firebaseAuth } from '../../../config/firebase';
import { generateToken } from '../../../utils/jwt';

@Service()
export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByProviderAndId(provider: AuthProvider, providerId: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { provider, providerId } 
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const user = this.userRepository.create({
      ...input,
      currentCredit: 30, // Default credit
      isActive: true,
      hasCompletedOnboarding: false, // Always false for new users
      languagePreference: input.languagePreference || 'en'
    });
    return await this.userRepository.save(user);
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
    await this.userRepository.update(userId, input);
    return await this.findById(userId);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { 
      lastLoginAt: new Date() 
    });
  }

  async updateCredit(userId: string, input: UpdateCreditInput): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const newCredit = Number(user.currentCredit) + input.amount;
    await this.userRepository.update(userId, { 
      currentCredit: Math.max(0, newCredit) // Credit cannot go below 0
    });
    
    return await this.findById(userId);
  }

  async deactivateUser(userId: string): Promise<User | null> {
    await this.userRepository.update(userId, { isActive: false });
    return await this.findById(userId);
  }

  async authenticateWithGoogle(idToken: string, languagePreference?: string): Promise<{ user: User; token: string; isNewUser: boolean }> {
    try {
      // Verify the Google ID token with Firebase
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      
      const { uid, email, name, picture } = decodedToken as any;

      // Detect actual identity provider from Firebase token (apple.com, google.com, password, etc.)
      const signInProvider: string | undefined = (decodedToken as any)?.firebase?.sign_in_provider;
      const provider: AuthProvider = signInProvider === 'apple.com'
        ? AuthProvider.APPLE
        : signInProvider === 'google.com'
          ? AuthProvider.GOOGLE
          : AuthProvider.EMAIL; // fallback

      if (!email) {
        throw new Error('Email is required for authentication');
      }

      // Check if user already exists
      let user = await this.findByProviderAndId(provider, uid);

      let isNewUser = false;

      if (!user) {
        // Try to locate by email (in case of previously created account with wrong provider)
        const existingByEmail = await this.findByEmail(email);
        if (existingByEmail) {
          // Update provider info to match latest sign-in method and refresh profile fields
          await this.userRepository.update(existingByEmail.id, {
            provider,
            providerId: uid,
            name: existingByEmail.name || name || email.split('@')[0],
            displayName: existingByEmail.displayName || name,
            profilePicture: picture || existingByEmail.profilePicture,
            languagePreference: languagePreference || existingByEmail.languagePreference || 'en',
            lastLoginAt: new Date(),
          });
          user = (await this.findById(existingByEmail.id)) as User;
        } else {
          // Create new user
          user = await this.createUser({
            email,
            name: name || email.split('@')[0],
            displayName: name,
            provider,
            providerId: uid,
            profilePicture: picture,
            languagePreference: languagePreference || 'en'
          });
          console.log('🆕 New user created:', { email, hasCompletedOnboarding: user.hasCompletedOnboarding, provider });
          isNewUser = true;
        }
      } else {
        // Update last login and language preference if provided
        const updateData: any = { lastLoginAt: new Date() };
        if (languagePreference) {
          updateData.languagePreference = languagePreference;
        }
        await this.userRepository.update(user.id, updateData);
        user = await this.findById(user.id) as User;
      }

      // Generate JWT token
      const jwtToken = generateToken({
        userId: user.id,
        email: user.email,
        provider: user.provider
      });

      return { user, token: jwtToken, isNewUser };

    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });
  }

  async getUserStats(): Promise<{ total: number; active: number; inactive: number }> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { isActive: true } });
    const inactive = total - active;

    return { total, active, inactive };
  }

  async completeOnboarding(userId: string): Promise<User> {
    await this.userRepository.update(userId, { hasCompletedOnboarding: true });
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    await AppDataSource.transaction(async (manager) => {
      // Delete dependent records explicitly to satisfy existing FK constraints
      await manager.createQueryBuilder()
        .delete()
        .from('credit_usage')
        .where('"userId" = :userId', { userId })
        .execute();

      await manager.createQueryBuilder()
        .delete()
        .from('credit_transactions')
        .where('"userId" = :userId', { userId })
        .execute();

      await manager.createQueryBuilder()
        .delete()
        .from('discovery_info')
        .where('"userId" = :userId', { userId })
        .execute();

      await manager.createQueryBuilder()
        .delete()
        .from('trips')
        .where('"user_id" = :userId', { userId })
        .execute();

      // Payments: keep records but detach user to preserve receipts
      await manager.createQueryBuilder()
        .update('payments')
        .set({ userId: null })
        .where('"userId" = :userId', { userId })
        .execute();

      // Finally delete user
      await manager.delete(User, userId);
    });
  }
}

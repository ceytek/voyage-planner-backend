import { Resolver, Query, Mutation, Arg, Ctx, Int, ObjectType, Field } from 'type-graphql';
import { Service } from 'typedi';
import { User } from '../entities/User';
import { GoogleAuthInput, AuthResponse, UpdateUserInput, UpdateCreditInput, UserResponse } from '../dto/user.dto';
import { UserService } from '../services/UserService';
import { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
  user?: User;
}

@ObjectType()
class UserStats {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  active!: number;

  @Field(() => Int)
  inactive!: number;
}

@Service()
@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  async getUsers(
    @Arg('limit', () => Int, { defaultValue: 50 }) limit: number,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number
  ): Promise<User[]> {
    return await this.userService.getAllUsers(limit, offset);
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: Context): Promise<User | null> {
    return ctx.user || null;
  }

  @Query(() => User, { nullable: true })
  async getUserById(@Arg('id') id: string): Promise<User | null> {
    return await this.userService.findById(id);
  }

  @Query(() => User, { nullable: true })
  async getUserByEmail(@Arg('email') email: string): Promise<User | null> {
    return await this.userService.findByEmail(email);
  }

  @Query(() => UserStats)
  async getUserStats(): Promise<UserStats> {
    return await this.userService.getUserStats();
  }

  @Mutation(() => AuthResponse)
  async loginWithGoogle(@Arg('input') input: GoogleAuthInput): Promise<AuthResponse> {
    try {
      const { user, token, isNewUser } = await this.userService.authenticateWithGoogle(
        input.idToken, 
        input.languagePreference
      );
      
      return {
        user,
        token,
        message: isNewUser ? 'Account created successfully' : 'Login successful'
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @Mutation(() => UserResponse)
  async updateUser(
    @Arg('userId') userId: string,
    @Arg('input') input: UpdateUserInput
  ): Promise<UserResponse> {
    try {
      const user = await this.userService.updateUser(userId, input);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        user,
        success: true,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Mutation(() => UserResponse)
  async updateUserCredit(
    @Arg('userId') userId: string,
    @Arg('input') input: UpdateCreditInput
  ): Promise<UserResponse> {
    try {
      const user = await this.userService.updateCredit(userId, input);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        user,
        success: true,
        message: `Credit ${input.amount > 0 ? 'added' : 'deducted'} successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Credit update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Mutation(() => UserResponse)
  async deactivateUser(@Arg('userId') userId: string): Promise<UserResponse> {
    try {
      const user = await this.userService.deactivateUser(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        user,
        success: true,
        message: 'User deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Deactivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Mutation(() => UserResponse)
  async completeOnboarding(@Ctx() ctx: Context): Promise<UserResponse> {
    try {
      if (!ctx.user) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const user = await this.userService.completeOnboarding(ctx.user.id);
      
      return {
        user,
        success: true,
        message: 'Onboarding completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Mutation(() => UserResponse)
  async deleteAccount(@Ctx() ctx: Context): Promise<UserResponse> {
    try {
      if (!ctx.user) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      await this.userService.deleteAccount(ctx.user.id);
      
      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Account deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

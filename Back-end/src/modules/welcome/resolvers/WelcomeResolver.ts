import { Arg, Ctx, Query, Resolver, Mutation } from 'type-graphql';
import { Service } from 'typedi';
import { WelcomeSlide } from '../types/WelcomeSlide';
import { WelcomeService } from '../services/WelcomeService';

@Service()
@Resolver()
export class WelcomeResolver {
  constructor(private welcomeService: WelcomeService) {}

  @Query(() => [WelcomeSlide])
  welcomeSlides(
    @Arg('language', { nullable: true }) language?: string,
  ): WelcomeSlide[] {
    return this.welcomeService.getSlides(language || 'tr');
  }

  // Placeholder mutation to allow client to mark as completed (can be hooked to DB/user profile later)
  @Mutation(() => Boolean)
  markOnboardingCompleted(): boolean {
    return true;
  }
}

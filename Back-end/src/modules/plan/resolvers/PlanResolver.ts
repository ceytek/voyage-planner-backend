import { Resolver, Query, Arg, Int } from 'type-graphql';
import { Service } from 'typedi';
import { Plan } from '../entities/Plan';
import { PlanResponse, SinglePlanResponse, PlanStats } from '../dto/plan.dto';
import { PlanService } from '../services/PlanService';

@Service()
@Resolver(() => Plan)
export class PlanResolver {
  constructor(private planService: PlanService) {}

  @Query(() => PlanResponse)
  async getPlans(): Promise<PlanResponse> {
    try {
      const plans = await this.planService.getAllPlans();
      
      return {
        plans,
        success: true,
        message: `Found ${plans.length} plans`
      };
    } catch (error) {
      return {
        plans: [],
        success: false,
        message: `Failed to fetch plans: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Query(() => PlanResponse)
  async getActivePlans(): Promise<PlanResponse> {
    try {
      const plans = await this.planService.getActivePlans();
      
      return {
        plans,
        success: true,
        message: `Found ${plans.length} active plans`
      };
    } catch (error) {
      return {
        plans: [],
        success: false,
        message: `Failed to fetch active plans: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Query(() => SinglePlanResponse)
  async getPlanById(@Arg('id') id: string): Promise<SinglePlanResponse> {
    try {
      const plan = await this.planService.findById(id);
      
      if (!plan) {
        return {
          success: false,
          message: 'Plan not found'
        };
      }

      return {
        plan,
        success: true,
        message: 'Plan found successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Query(() => SinglePlanResponse)
  async getPlanByName(@Arg('name') name: string): Promise<SinglePlanResponse> {
    try {
      const plan = await this.planService.findByName(name);
      
      if (!plan) {
        return {
          success: false,
          message: `Plan with name '${name}' not found`
        };
      }

      return {
        plan,
        success: true,
        message: 'Plan found successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Query(() => PlanStats)
  async getPlanStats(): Promise<PlanStats> {
    try {
      const stats = await this.planService.getPlanStats();
      
      return {
        totalPlans: stats.total,
        activePlans: stats.active,
        inactivePlans: stats.inactive
      };
    } catch (error) {
      console.error('Error fetching plan stats:', error);
      return {
        totalPlans: 0,
        activePlans: 0,
        inactivePlans: 0
      };
    }
  }

  @Query(() => PlanResponse)
  async getPlansByPriceRange(
    @Arg('minPrice', () => Int) minPrice: number,
    @Arg('maxPrice', () => Int) maxPrice: number
  ): Promise<PlanResponse> {
    try {
      // Convert dollars to cents
      const minCents = minPrice * 100;
      const maxCents = maxPrice * 100;
      
      const plans = await this.planService.getPlanByCostRange(minCents, maxCents);
      
      return {
        plans,
        success: true,
        message: `Found ${plans.length} plans in price range $${minPrice}-$${maxPrice}`
      };
    } catch (error) {
      return {
        plans: [],
        success: false,
        message: `Failed to fetch plans by price range: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  @Query(() => SinglePlanResponse)
  async getBasicPlan(): Promise<SinglePlanResponse> {
    try {
      const plan = await this.planService.getBasicPlan();
      
      if (!plan) {
        return {
          success: false,
          message: 'Basic plan not found'
        };
      }

      return {
        plan,
        success: true,
        message: 'Basic plan found successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch basic plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

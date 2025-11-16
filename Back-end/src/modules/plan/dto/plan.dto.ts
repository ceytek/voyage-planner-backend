import { ObjectType, Field, Int } from 'type-graphql';
import { Plan } from '../entities/Plan';

@ObjectType()
export class PlanResponse {
  @Field(() => [Plan])
  plans!: Plan[];

  @Field()
  success!: boolean;

  @Field()
  message!: string;
}

@ObjectType()
export class SinglePlanResponse {
  @Field(() => Plan, { nullable: true })
  plan?: Plan;

  @Field()
  success!: boolean;

  @Field()
  message!: string;
}

@ObjectType()
export class PlanStats {
  @Field(() => Int)
  totalPlans!: number;

  @Field(() => Int)
  activePlans!: number;

  @Field(() => Int)
  inactivePlans!: number;
}

// Enums for plan types
export enum PlanType {
  BASIC = 'basic',
  ENTERPRISE = 'enterprise', 
  PRO = 'pro',
  SUPREME = 'supreme'
}

// Helper interface for plan creation
export interface CreatePlanData {
  name: string;
  displayName: string;
  monthlyCredits: number;
  priceCents: number;
  creditCostPerAction: number;
  features?: string;
  isActive?: boolean;
}

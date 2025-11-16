import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Plan } from '../entities/Plan';
import { CreatePlanData, PlanType } from '../dto/plan.dto';

@Service()
export class PlanService {
  private planRepository: Repository<Plan>;

  constructor() {
    this.planRepository = AppDataSource.getRepository(Plan);
  }

  async getAllPlans(): Promise<Plan[]> {
    return await this.planRepository.find({
      order: { priceCents: 'ASC' }
    });
  }

  async getActivePlans(): Promise<Plan[]> {
    return await this.planRepository.find({
      where: { isActive: true },
      order: { priceCents: 'ASC' }
    });
  }

  async findById(id: string): Promise<Plan | null> {
    return await this.planRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Plan | null> {
    return await this.planRepository.findOne({ where: { name } });
  }

  async createPlan(data: CreatePlanData): Promise<Plan> {
    const plan = this.planRepository.create({
      ...data,
      isActive: data.isActive ?? true
    });
    return await this.planRepository.save(plan);
  }

  async updatePlanStatus(id: string, isActive: boolean): Promise<Plan | null> {
    await this.planRepository.update(id, { isActive });
    return await this.findById(id);
  }

  async getPlanStats(): Promise<{ total: number; active: number; inactive: number }> {
    const total = await this.planRepository.count();
    const active = await this.planRepository.count({ where: { isActive: true } });
    const inactive = total - active;

    return { total, active, inactive };
  }

  async seedInitialPlans(): Promise<void> {
    const existingPlans = await this.planRepository.count();
    
    if (existingPlans > 0) {
      console.log('📊 Plans already exist, skipping seed');
      return;
    }

    const initialPlans: CreatePlanData[] = [
      {
        name: PlanType.BASIC,
        displayName: 'Basic Plan',
        monthlyCredits: 0,
        priceCents: 0,
        creditCostPerAction: 15,
        isActive: true
      },
      {
        name: PlanType.ENTERPRISE,
        displayName: 'Enterprise Plan',
        monthlyCredits: 500,
        priceCents: 2500, // $25.00
        creditCostPerAction: 15,
        isActive: true
      },
      {
        name: PlanType.PRO,
        displayName: 'Pro Plan',
        monthlyCredits: 250,
        priceCents: 4000, // $40.00
        creditCostPerAction: 15,
        isActive: true
      },
      {
        name: PlanType.SUPREME,
        displayName: 'Supreme Plan',
        monthlyCredits: 1000,
        priceCents: 5000, // $50.00
        creditCostPerAction: 15,
        isActive: true
      }
    ];

    console.log('🌱 Seeding initial plans...');
    
    for (const planData of initialPlans) {
      await this.createPlan(planData);
      console.log(`✅ Created plan: ${planData.displayName}`);
    }

    console.log('🎉 All plans seeded successfully!');
  }

  async getBasicPlan(): Promise<Plan | null> {
    return await this.findByName(PlanType.BASIC);
  }

  async getPlanByCostRange(minCents: number, maxCents: number): Promise<Plan[]> {
    return await this.planRepository
      .createQueryBuilder('plan')
      .where('plan.price_cents >= :minCents', { minCents })
      .andWhere('plan.price_cents <= :maxCents', { maxCents })
      .andWhere('plan.is_active = :isActive', { isActive: true })
      .orderBy('plan.price_cents', 'ASC')
      .getMany();
  }
}

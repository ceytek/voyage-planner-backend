import { Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver()
export class HealthResolver {
  @Query(() => String)
  health(): string {
    return 'Server is running!';
  }
}

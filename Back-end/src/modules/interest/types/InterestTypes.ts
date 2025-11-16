import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class InterestTranslationType {
  @Field(() => ID)
  id!: string;

  @Field()
  language!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class InterestCategoryType {
  @Field(() => ID)
  id!: string;

  @Field()
  key!: string;

  @Field()
  icon!: string;

  @Field()
  isActive!: boolean;

  @Field()
  sortOrder!: number;

  @Field(() => [InterestTranslationType])
  translations!: InterestTranslationType[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

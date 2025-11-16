import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class WelcomeSlide {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  primaryActionLabel?: string;

  @Field({ nullable: true })
  secondaryActionLabel?: string;

  @Field(() => Number)
  order!: number;
}

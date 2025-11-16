import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class CountryType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string; // Translated name based on language

  @Field({ nullable: true })
  flagEmoji?: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field({ nullable: true })
  imageUrl?: string; // Representative country image
}

@ObjectType()
export class CityType {
  @Field()
  id!: string;

  @Field()
  name!: string; // Translated name based on language

  @Field(() => Int, { nullable: true })
  population?: number;

  @Field({ nullable: true })
  latitude?: number;

  @Field({ nullable: true })
  longitude?: number;

  @Field()
  isPopular!: boolean;
}

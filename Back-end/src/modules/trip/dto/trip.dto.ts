import { Field, Int, ObjectType, InputType } from 'type-graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class SaveTripInput {
  @Field({ nullable: true })
  name?: string;

  @Field()
  title!: string;

  @Field()
  country!: string;

  @Field(() => [String])
  cities!: string[];

  @Field()
  startDate!: string;

  @Field()
  endDate!: string;

  @Field(() => Int)
  duration!: number;

  @Field()
  language!: string;

  @Field()
  heroImage!: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field(() => [String])
  interests!: string[];

  @Field(() => GraphQLJSON)
  itinerary!: any;

  @Field(() => GraphQLJSON, { nullable: true })
  rawResponse?: any;

  @Field({ nullable: true })
  model?: string;

  @Field(() => Int, { nullable: true })
  promptVersion?: number;

  @Field(() => Int, { nullable: true })
  schemaVersion?: number;

  @Field(() => Int, { nullable: true })
  creditsSpent?: number;

  @Field({ nullable: true })
  source?: string;
}

@ObjectType()
export class TripSummary {
  @Field()
  id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  title!: string;

  @Field(() => [String])
  cities!: string[];

  @Field()
  startDate!: string;

  @Field()
  endDate!: string;

  @Field(() => Int)
  duration!: number;

  @Field()
  heroImage!: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field()
  isFav!: boolean;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class SavedTrip {
  @Field()
  id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  title!: string;

  @Field()
  country!: string;

  @Field(() => [String])
  cities!: string[];

  @Field()
  startDate!: string;

  @Field()
  endDate!: string;

  @Field(() => Int)
  duration!: number;

  @Field()
  language!: string;

  @Field()
  heroImage!: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field(() => [String])
  interests!: string[];

  @Field(() => GraphQLJSON)
  itinerary!: any;

  @Field(() => GraphQLJSON, { nullable: true })
  rawResponse?: any;

  @Field({ nullable: true })
  model?: string;

  @Field(() => Int)
  promptVersion!: number;

  @Field(() => Int)
  schemaVersion!: number;

  @Field(() => Int)
  creditsSpent!: number;

  @Field()
  source!: string;

  @Field()
  isFav!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class TripGenerationInput {
  @Field()
  country!: string;

  @Field(() => [String])
  cities!: string[];

  @Field(() => [String])
  interests!: string[];

  @Field()
  startDate!: string; // ISO

  @Field()
  endDate!: string; // ISO

  @Field()
  language!: string; // 'tr' | 'en' | 'es' | 'fr' | 'it'
}

@ObjectType()
export class ActivityDTO {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  duration!: string;

  @Field()
  icon!: string;

  @Field()
  type!: string; // keep as string for simplicity

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class RouteInfoDTO {
  @Field()
  from!: string;

  @Field()
  to!: string;

  @Field()
  transportType!: string;

  @Field({ nullable: true })
  duration?: string;

  @Field({ nullable: true })
  cost?: string;

  @Field({ nullable: true })
  fromTerminal?: string;

  @Field({ nullable: true })
  toTerminal?: string;

  @Field(() => [RouteAlternativeDTO], { nullable: true })
  alternatives?: RouteAlternativeDTO[];
}

@ObjectType()
export class RouteAlternativeDTO {
  @Field()
  transportType!: string;

  @Field({ nullable: true })
  duration?: string;

  @Field({ nullable: true })
  cost?: string;

  @Field({ nullable: true })
  fromTerminal?: string;

  @Field({ nullable: true })
  toTerminal?: string;
}

@ObjectType()
export class DayPlanDTO {
  @Field(() => Int)
  dayNumber!: number;

  @Field()
  city!: string;

  @Field()
  dateRange!: string;

  @Field(() => [ActivityDTO])
  activities!: ActivityDTO[];

  @Field({ nullable: true })
  isRoute?: boolean;

  @Field(() => RouteInfoDTO, { nullable: true })
  routeInfo?: RouteInfoDTO;
}

@ObjectType()
export class TripPlanDTO {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field(() => [String])
  cities!: string[];

  @Field()
  startDate!: string;

  @Field()
  endDate!: string;

  @Field(() => Int)
  duration!: number;

  @Field()
  heroImage!: string;

  @Field(() => [DayPlanDTO])
  itinerary!: DayPlanDTO[];

  @Field()
  generatedAt!: string;
}

@ObjectType()
export class TripPlanResponseDTO {
  @Field()
  success!: boolean;

  @Field(() => TripPlanDTO, { nullable: true })
  data?: TripPlanDTO;

  @Field({ nullable: true })
  error?: string;

  @Field()
  timestamp!: string;
}

@ObjectType()
export class TripConnection {
  @Field(() => [TripSummary])
  items!: TripSummary[];

  @Field({ nullable: true })
  nextCursor?: string;

  @Field()
  hasMore!: boolean;
}

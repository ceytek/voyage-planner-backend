// Discovery Response DTOs
// GraphQL output types for queries

import { ObjectType, Field, Int, Float } from 'type-graphql';
import { DiscoveryInfo } from '../entities/DiscoveryInfo';

@ObjectType()
export class DetailedInfoResponse {
  @Field({ nullable: true })
  history?: string;

  @Field({ nullable: true })
  architecture?: string;

  @Field({ nullable: true })
  culturalSignificance?: string;

  @Field({ nullable: true })
  bestTimeToVisit?: string;

  @Field({ nullable: true })
  entryFee?: string;

  @Field({ nullable: true })
  openingHours?: string;
}

@ObjectType()
export class UserReviewResponse {
  @Field()
  author!: string;

  @Field(() => Float)
  rating!: number;

  @Field()
  comment!: string;

  @Field({ nullable: true })
  date?: string;
}

@ObjectType()
export class DiscoveryResponse {
  @Field()
  id!: string;

  @Field()
  placeName!: string;

  @Field({ nullable: true })
  localName?: string;

  @Field()
  country!: string;

  @Field({ nullable: true })
  city?: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field()
  description!: string;

  @Field(() => DetailedInfoResponse)
  detailedInfo!: DetailedInfoResponse;

  @Field(() => Float, { nullable: true })
  ratingAverage?: number;

  @Field(() => Int, { nullable: true })
  ratingCount?: number;

  @Field(() => [UserReviewResponse], { nullable: true })
  userReviews?: UserReviewResponse[];

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  language!: string;

  @Field(() => Int)
  creditCost!: number;

  @Field()
  createdAt!: Date;

  static fromEntity(entity: DiscoveryInfo): DiscoveryResponse {
    const response = new DiscoveryResponse();
    response.id = entity.id;
    response.placeName = entity.placeName;
    response.localName = entity.localName;
    response.country = entity.country;
    response.city = entity.city;
    response.latitude = entity.latitude;
    response.longitude = entity.longitude;
    response.description = entity.description;
    response.detailedInfo = entity.detailedInfo as DetailedInfoResponse;
    response.ratingAverage = entity.ratingAverage;
    response.ratingCount = entity.ratingCount;
    response.userReviews = entity.userReviews as UserReviewResponse[];
    response.categories = entity.categories;
    response.imageUrl = entity.imageUrl;
    response.language = entity.language;
    response.creditCost = entity.creditCost;
    response.createdAt = entity.createdAt;
    return response;
  }
}

@ObjectType()
export class DiscoveriesListResponse {
  @Field(() => [DiscoveryResponse])
  items!: DiscoveryResponse[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  offset!: number;

  @Field()
  hasMore!: boolean;
}

@ObjectType()
export class SaveDiscoveryResponse {
  @Field()
  success!: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => DiscoveryResponse, { nullable: true })
  discovery?: DiscoveryResponse;

  @Field(() => Int, { nullable: true })
  remainingCredits?: number;
}

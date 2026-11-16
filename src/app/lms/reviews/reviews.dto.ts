import { Review, User } from "@prisma/client";

export interface CreateReviewBodyRequest {
  classId: string;
  rating: number;
  text?: string | null;
}

export interface ReviewUserDTO {
  id: string;
  name: string;
  photo: string | null;
}

export interface ReviewDTO {
  id: string;
  rating: number;
  text: string | null;
  createdAt: Date;
  user: ReviewUserDTO;
}

export interface ReviewAggregateDTO {
  average: number | null;
  count: number;
}

// Payload carried in the envelope `data` field: the shared ApiResponse
// shape only has `data` + `meta`, so the review list, its aggregate,
// and the caller's own review state travel together here while `meta`
// stays at the envelope level like every other list endpoint.
export interface ClassReviewsDTO {
  reviews: ReviewDTO[];
  aggregate: ReviewAggregateDTO;
  canReview: boolean;
  myReview: ReviewDTO | null;
}

export interface ReviewData extends Review {
  user: Pick<User, "id" | "name" | "photo">;
}

export interface ClassRatingAggregate {
  average: number | null;
  count: number;
}

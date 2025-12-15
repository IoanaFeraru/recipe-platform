export type Rating = 1 | 2 | 3 | 4 | 5;

export type RatingDistribution = Record<Rating, number>;

export interface CommentStats {
  totalComments: number;
  totalReplies: number;
  avgRating: number;
  ratingDistribution: RatingDistribution;
}
export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userEmail: string;
  userPhotoURL?: string;
  text: string;
  rating?: Rating | null;
  createdAt: any;
  isOwnerReply?: boolean;
  parentCommentId?: string | null;
}

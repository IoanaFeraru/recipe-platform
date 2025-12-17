/**
 * Domain types related to comments and ratings.
 *
 * These types model user feedback on recipes, including star ratings,
 * threaded discussions, and aggregated statistics derived from comments.
 */

/**
 * Allowed star ratings.
 *
 * Restricted at the type level to prevent invalid values
 * and simplify validation across the application.
 */
export type Rating = 1 | 2 | 3 | 4 | 5;

/**
 * Rating histogram keyed by star value.
 *
 * Used for analytics and UI visualizations (e.g. rating breakdown charts).
 */
export type RatingDistribution = Record<Rating, number>;

/**
 * Aggregated statistics for a recipe's comments.
 *
 * This data is derived from the comments collection and typically
 * computed server-side or via batched queries.
 */
export interface CommentStats {
  totalComments: number;
  totalReplies: number;
  avgRating: number;
  ratingDistribution: RatingDistribution;
}

/**
 * Represents a user comment on a recipe.
 *
 * Supports:
 * - optional star ratings
 * - owner replies
 * - threaded discussions via parentCommentId
 */
export interface Comment {
  id: string;
  recipeId: string;

  userId: string;
  userEmail: string;
  userPhotoURL?: string;

  text: string;

  /**
   * Rating is optional and nullable to support:
   * - comments without ratings
   * - owner replies
   */
  rating?: Rating | null;

  /**
   * Creation timestamp as stored by the persistence layer.
   */
  createdAt: any;

  /**
   * Indicates whether the comment was posted by the recipe owner.
   */
  isOwnerReply?: boolean;

  /**
   * References the parent comment when this entry is a reply.
   * Null or undefined indicates a top-level comment.
   */
  parentCommentId?: string | null;
}
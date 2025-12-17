import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Comment,
  CommentStats,
  Rating,
  RatingDistribution
} from "@/types/comment";

/**
 * Comment and review persistence service.
 *
 * Owns Firestore access for:
 * - creating/updating/deleting comments and replies
 * - realtime subscriptions per recipe
 * - computing lightweight stats from an in-memory comments array
 * - recomputing denormalized recipe rating fields (avgRating, reviewCount)
 *
 * Notes on model assumptions:
 * - Replies are identified via parentCommentId and do not meaningfully contribute to rating.
 * - Ratings are user-provided on top-level comments; recipe owner ratings are excluded.
 * - "One rating per user per recipe" is enforced by application logic.
 */
export class CommentService {
  private readonly collectionName = "comments";
  private readonly collectionRef = collection(db, this.collectionName);

  /**
   * Creates a comment or reply and sets createdAt.
   */
  async create(commentData: Omit<Comment, "id">): Promise<string> {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...commentData,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create comment: ${String(error)}`);
    }
  }

  /**
   * Returns all comments (top-level and replies) for a recipe, newest first.
   */
  async getByRecipe(recipeId: string): Promise<Comment[]> {
    try {
      const q = query(
        this.collectionRef,
        where("recipeId", "==", recipeId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Comment[];
    } catch (error) {
      throw new Error(`Failed to fetch comments: ${String(error)}`);
    }
  }

  /**
   * Subscribes to all comments for a recipe (top-level + replies).
   * Caller must invoke the returned unsubscribe function.
   */
  listenToRecipeComments(
    recipeId: string,
    callback: (comments: Comment[]) => void
  ): Unsubscribe {
    const q = query(
      this.collectionRef,
      where("recipeId", "==", recipeId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      snapshot => {
        const comments = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Comment[];
        callback(comments);
      },
      error => {
        // Listener errors should not crash UI; log and keep last known state.
        console.error("Error listening to comments:", error);
      }
    );
  }

  /**
   * Applies a partial update to a comment. If a rating is changed, caller should
   * recompute recipe rating stats via updateRecipeRating().
   */
  async update(id: string, data: Partial<Comment>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      throw new Error(`Failed to update comment: ${String(error)}`);
    }
  }

  /**
   * Cascading delete: removes a comment and all replies beneath it.
   *
   * Note: This is implemented recursively with multiple reads/writes. For large
   * threads consider moving deletion to a backend job / Cloud Function.
   */
  async delete(id: string): Promise<void> {
    try {
      const replies = await this.getReplies(id);
      await Promise.all(replies.map(reply => this.delete(reply.id)));

      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete comment: ${String(error)}`);
    }
  }

  /**
   * Returns direct replies for a parent comment, oldest first.
   */
  async getReplies(parentCommentId: string): Promise<Comment[]> {
    try {
      const q = query(
        this.collectionRef,
        where("parentCommentId", "==", parentCommentId),
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Comment[];
    } catch (error) {
      throw new Error(`Failed to fetch replies: ${String(error)}`);
    }
  }

  /**
   * Recomputes and persists denormalized rating fields on the recipe document.
   *
   * Business rules:
   * - only top-level comments count (no parentCommentId)
   * - rating must be set and non-null
   * - recipe owner ratings are excluded
   */
  async updateRecipeRating(
    recipeId: string,
    recipeOwnerId: string
  ): Promise<{ avgRating: number; reviewCount: number }> {
    try {
      const allComments = await this.getByRecipe(recipeId);

      const ratingComments = allComments.filter(
        c =>
          typeof c.rating === "number" &&
          !c.parentCommentId &&
          c.userId !== recipeOwnerId
      );

      const reviewCount = ratingComments.length;

      const avgRating =
        reviewCount > 0
          ? ratingComments.reduce((sum, c) => sum + (c.rating as number), 0) / reviewCount
          : 0;

      const recipeRef = doc(db, "recipes", recipeId);
      await updateDoc(recipeRef, { avgRating, reviewCount });

      return { avgRating, reviewCount };
    } catch (error) {
      throw new Error(`Failed to update recipe rating: ${String(error)}`);
    }
  }

  /**
   * Returns whether the user has at least one (top-level) rating comment for the recipe.
   *
   * Note: Firestore has restrictions around `!=` queries; ensure indexes exist and
   * test this query shape. If it becomes brittle, consider storing `rating: number`
   * only when present, and query with `where("rating", ">", 0)` instead.
   */
  async hasUserRated(userId: string, recipeId: string): Promise<boolean> {
    try {
      const q = query(
        this.collectionRef,
        where("recipeId", "==", recipeId),
        where("userId", "==", userId),
        where("rating", "!=", null)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Failed to check user rating:", error);
      return false;
    }
  }

  /**
   * Retrieves the user's rating comment for a recipe, if any.
   */
  async getUserRating(userId: string, recipeId: string): Promise<Comment | null> {
    try {
      const q = query(
        this.collectionRef,
        where("recipeId", "==", recipeId),
        where("userId", "==", userId),
        where("rating", "!=", null)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const d = snapshot.docs[0];
      return { id: d.id, ...d.data() } as Comment;
    } catch (error) {
      throw new Error(`Failed to get user rating: ${String(error)}`);
    }
  }

  /**
   * Filters a comment list down to top-level comments.
   */
  getTopLevelComments(comments: Comment[]): Comment[] {
    return comments.filter(c => !c.parentCommentId);
  }

  /**
   * Returns direct replies for a given parent id from an in-memory comments list.
   */
  getCommentReplies(comments: Comment[], parentId: string): Comment[] {
    return comments.filter(c => c.parentCommentId === parentId);
  }

  /**
   * Groups a flat comment list into `{ comment, replies }` tuples for rendering.
   */
  groupCommentsWithReplies(comments: Comment[]): Array<{
    comment: Comment;
    replies: Comment[];
  }> {
    const topLevel = this.getTopLevelComments(comments);

    return topLevel.map(comment => ({
      comment,
      replies: this.getCommentReplies(comments, comment.id)
    }));
  }

  /**
   * Computes summary statistics from an in-memory comments list.
   */
  getCommentStats(comments: Comment[]): CommentStats {
    const topLevel = this.getTopLevelComments(comments);
    const replies = comments.filter(c => c.parentCommentId);

    const ratingsComments = topLevel.filter(c => typeof c.rating === "number");

    const ratingDistribution: RatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    let ratingSum = 0;

    for (const c of ratingsComments) {
      const rating = c.rating as number | null | undefined;
      if (typeof rating === "number") {
        ratingDistribution[rating as Rating]++;
        ratingSum += rating;
      }
    }

    const avgRating = ratingsComments.length > 0 ? ratingSum / ratingsComments.length : 0;

    return {
      totalComments: topLevel.length,
      totalReplies: replies.length,
      avgRating,
      ratingDistribution
    };
  }

  /**
   * Lightweight client-side validation for comment text and optional rating.
   * Prefer shared validators where possible; this exists for service-level convenience.
   */
  validateComment(
    text: string,
    rating?: Rating | null
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!text || text.trim().length === 0) {
      errors.push("Comment text is required");
    }

    if (text.trim().length > 1000) {
      errors.push("Comment must be less than 1000 characters");
    }

    if (rating !== undefined && rating !== null) {
      if (rating < 1 || rating > 5) {
        errors.push("Rating must be between 1 and 5");
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

/**
 * Shared instance used across the application.
 */
export const commentService = new CommentService();
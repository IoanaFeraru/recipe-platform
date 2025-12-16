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
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Comment, CommentStats, Rating, RatingDistribution } from "@/types/comment";


/**
 * CommentService - Encapsulates all comment-related operations
 * Handles comments, replies, and rating calculations
 */
export class CommentService {
  private readonly collectionName = "comments";
  private readonly collectionRef = collection(db, this.collectionName);

  /**
   * Create a new comment or reply
   */
  async create(commentData: Omit<Comment, "id">): Promise<string> {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...commentData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create comment: ${error}`);
    }
  }

  /**
   * Get all comments for a specific recipe
   */
  async getByRecipe(recipeId: string): Promise<Comment[]> {
    try {
      const q = query(
        this.collectionRef,
        where("recipeId", "==", recipeId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
    } catch (error) {
      throw new Error(`Failed to fetch comments: ${error}`);
    }
  }

  /**
   * Listen to real-time comment updates for a recipe
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
      (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
        callback(comments);
      },
      (error) => {
        console.error("Error listening to comments:", error);
      }
    );
  }

  /**
   * Update an existing comment
   */
  async update(id: string, data: Partial<Comment>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      throw new Error(`Failed to update comment: ${error}`);
    }
  }

  /**
   * Delete a comment and all its replies
   */
  async delete(id: string): Promise<void> {
    try {
      const replies = await this.getReplies(id);
      await Promise.all(replies.map((reply) => this.delete(reply.id)));

      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error}`);
    }
  }

  /**
   * Get all replies for a specific comment
   */
  async getReplies(parentCommentId: string): Promise<Comment[]> {
    try {
      const q = query(
        this.collectionRef,
        where("parentCommentId", "==", parentCommentId),
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
    } catch (error) {
      throw new Error(`Failed to fetch replies: ${error}`);
    }
  }

  /**
   * Calculate and update recipe rating statistics
   * Excludes owner's ratings and only counts top-level comments
   */
  async updateRecipeRating(
    recipeId: string,
    recipeOwnerId: string
  ): Promise<{ avgRating: number; reviewCount: number }> {
    try {
      const allComments = await this.getByRecipe(recipeId);

      const ratingsComments = allComments.filter(
        (c) => c.rating && !c.parentCommentId && c.userId !== recipeOwnerId
      );

      const reviewCount = ratingsComments.length;
      let avgRating = 0;

      if (reviewCount > 0) {
        const totalRating = ratingsComments.reduce(
          (sum, c) => sum + (c.rating || 0),
          0
        );
        avgRating = totalRating / reviewCount;
      }

      const recipeRef = doc(db, "recipes", recipeId);
      await updateDoc(recipeRef, {
        avgRating,
        reviewCount,
      });

      return { avgRating, reviewCount };
    } catch (error) {
      throw new Error(`Failed to update recipe rating: ${error}`);
    }
  }

  /**
   * Check if user has already rated a recipe
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
   * Get user's existing rating for a recipe
   */
  async getUserRating(
    userId: string,
    recipeId: string
  ): Promise<Comment | null> {
    try {
      const q = query(
        this.collectionRef,
        where("recipeId", "==", recipeId),
        where("userId", "==", userId),
        where("rating", "!=", null)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Comment;
    } catch (error) {
      throw new Error(`Failed to get user rating: ${error}`);
    }
  }

  /**
   * Get top-level comments (no replies)
   */
  getTopLevelComments(comments: Comment[]): Comment[] {
    return comments.filter((c) => !c.parentCommentId);
  }

  /**
   * Get replies for a specific parent comment
   */
  getCommentReplies(comments: Comment[], parentId: string): Comment[] {
    return comments.filter((c) => c.parentCommentId === parentId);
  }

  /**
   * Group comments with their replies
   */
  groupCommentsWithReplies(comments: Comment[]): Array<{
    comment: Comment;
    replies: Comment[];
  }> {
    const topLevel = this.getTopLevelComments(comments);

    return topLevel.map((comment) => ({
      comment,
      replies: this.getCommentReplies(comments, comment.id),
    }));
  }

  /**
   * Get comment statistics for a recipe
   */
  getCommentStats(comments: Comment[]): CommentStats {
  const topLevel = this.getTopLevelComments(comments);
  const replies = comments.filter((c) => c.parentCommentId);
  const ratingsComments = topLevel.filter(
    (c) => typeof c.rating === "number"
  );

  const ratingDistribution: RatingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let ratingSum = 0;

  ratingsComments.forEach((c) => {
    if (c.rating) {
      ratingDistribution[c.rating]++;
      ratingSum += c.rating;
    }
  });

  const avgRating =
    ratingsComments.length > 0
      ? ratingSum / ratingsComments.length
      : 0;

  return {
    totalComments: topLevel.length,
    totalReplies: replies.length,
    avgRating,
    ratingDistribution,
  };
}


  /**
   * Validate comment data before submission
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

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const commentService = new CommentService();
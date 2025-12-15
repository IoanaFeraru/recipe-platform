import { useState, useEffect, useCallback } from "react";
import { Comment, CommentStats, Rating } from "@/types/comment";
import { commentService } from "@/lib/services/CommentSevice";
import { useAuth } from "@/context/AuthContext";

interface UseCommentsOptions {
  recipeId: string;
  recipeOwnerId: string;
  realtime?: boolean;
}

interface UseCommentsReturn {
  comments: Comment[];
  topLevelComments: Comment[];
  loading: boolean;
  error: Error | null;
  isSubmitting: boolean;
  userHasRated: boolean;
  userExistingRating: Comment | null;
  averageRating: number;
  totalRatings: number;
  addComment: (text: string, rating?: Rating | null) => Promise<void>;
  updateComment: (id: string, text: string, Rating?: Rating) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  addReply: (parentId: string, text: string) => Promise<void>;
  getReplies: (parentId: string) => Comment[];
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing comments and ratings
 * Handles real-time updates, comment operations, and rating calculations
 */
export const useComments = ({
  recipeId,
  recipeOwnerId,
  realtime = true,
}: UseCommentsOptions): UseCommentsReturn => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userExistingRating, setUserExistingRating] = useState<Comment | null>(
    null
  );

  const isOwner = user?.uid === recipeOwnerId;

  // Calculate derived values
  const topLevelComments = commentService.getTopLevelComments(comments);

  const ratings = topLevelComments.filter(
    (c) => c.rating && c.userId !== recipeOwnerId
  );

  const totalRatings = ratings.length;
  const averageRating =
    totalRatings > 0
      ? ratings.reduce((sum, c) => sum + (c.rating || 0), 0) / totalRatings
      : 0;

  const userHasRated = !!userExistingRating;

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await commentService.getByRecipe(recipeId);
      setComments(data);

      // Check if user has rated
      if (user && !isOwner) {
        const userRating = data.find(
          (c) => c.userId === user.uid && c.rating && !c.parentCommentId
        );
        setUserExistingRating(userRating || null);
      }
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [recipeId, user, isOwner]);

  // Set up real-time listener or fetch once
  useEffect(() => {
    if (realtime) {
      const unsubscribe = commentService.listenToRecipeComments(
        recipeId,
        (data) => {
          setComments(data);
          setLoading(false);

          // Update user rating
          if (user && !isOwner) {
            const userRating = data.find(
              (c) => c.userId === user.uid && c.rating && !c.parentCommentId
            );
            setUserExistingRating(userRating || null);
          }
        }
      );

      return () => unsubscribe();
    } else {
      fetchComments();
    }
  }, [realtime, recipeId, user, isOwner, fetchComments]);

  /**
   * Add a new comment or rating
   */
  const addComment = useCallback(
    async (text: string, rating?: Rating | null) => {
      if (!user) {
        throw new Error("User must be logged in to comment");
      }

      // Validate
      const validation = commentService.validateComment(text, rating);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Check if owner is trying to rate
      if (!isOwner && rating && userHasRated) {
        throw new Error("You have already rated this recipe");
      }

      setIsSubmitting(true);

      try {
        await commentService.create({
          recipeId,
          userId: user.uid,
          userEmail: user.email || "",
          userPhotoURL: user.photoURL || "/default-profile.svg",
          text: text.trim(),
          rating: isOwner ? null : rating,
          createdAt: new Date(),
          parentCommentId: null,
          isOwnerReply: isOwner,
        });

        // Update recipe rating if rating was provided
        if (!isOwner && rating) {
          await commentService.updateRecipeRating(recipeId, recipeOwnerId);
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, recipeId, recipeOwnerId, isOwner, userHasRated]
  );

  /**
   * Update an existing comment
   */
  const updateComment = useCallback(
    async (id: string, text: string, rating?: Rating) => {
      if (!user) {
        throw new Error("User must be logged in");
      }

      const validation = commentService.validateComment(text, rating);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      setIsSubmitting(true);

      try {
        await commentService.update(id, {
          text: text.trim(),
          rating,
        });

        // Update recipe rating if rating was changed
        if (rating !== undefined) {
          await commentService.updateRecipeRating(recipeId, recipeOwnerId);
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, recipeId, recipeOwnerId]
  );

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("User must be logged in");
      }

      const comment = comments.find((c) => c.id === id);
      if (!comment) {
        throw new Error("Comment not found");
      }

      if (comment.userId !== user.uid) {
        throw new Error("You can only delete your own comments");
      }

      try {
        await commentService.delete(id);

        // Update recipe rating if it was a rating comment
        if (comment.rating && !comment.parentCommentId) {
          await commentService.updateRecipeRating(recipeId, recipeOwnerId);
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user, comments, recipeId, recipeOwnerId]
  );

  /**
   * Add a reply to a comment
   */
  const addReply = useCallback(
    async (parentId: string, text: string) => {
      if (!user) {
        throw new Error("User must be logged in to reply");
      }

      const validation = commentService.validateComment(text);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      try {
        await commentService.create({
          recipeId,
          userId: user.uid,
          userEmail: user.email || "",
          userPhotoURL: user.photoURL || "/default-profile.svg",
          text: text.trim(),
          rating: null,
          createdAt: new Date(),
          parentCommentId: parentId,
          isOwnerReply: user.uid === recipeOwnerId,
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user, recipeId, recipeOwnerId]
  );

  /**
   * Get replies for a specific comment
   */
  const getReplies = useCallback(
    (parentId: string): Comment[] => {
      return commentService.getCommentReplies(comments, parentId);
    },
    [comments]
  );

  return {
    comments,
    topLevelComments,
    loading,
    error,
    isSubmitting,
    userHasRated,
    userExistingRating,
    averageRating,
    totalRatings,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    getReplies,
    refetch: fetchComments,
  };
};

/**
 * Simplified hook for comment statistics
 */
export const useCommentStats = (recipeId: string) => {
  const [stats, setStats] = useState<CommentStats>({
    totalComments: 0,
    totalReplies: 0,
    avgRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const comments = await commentService.getByRecipe(recipeId);
        const commentStats = commentService.getCommentStats(comments);
        setStats(commentStats);
      } catch (error) {
        console.error("Error fetching comment stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [recipeId]);

  return { stats, loading };
};
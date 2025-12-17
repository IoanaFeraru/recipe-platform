import { useState, useEffect, useCallback, useMemo } from "react";
import { Comment, CommentStats, Rating } from "@/types/comment";
import { commentService } from "@/lib/services/CommentSevice";
import { useAuth } from "@/context/AuthContext";

/**
 * Hooks for orchestrating recipe comments and star ratings in the UI layer.
 *
 * Responsibilities:
 * - Fetch and keep comment threads in sync (real-time listener or on-demand fetch).
 * - Expose mutation operations (add/update/delete comments; add replies).
 * - Enforce non-obvious business rules at the UI boundary:
 *   - Authentication required to write.
 *   - Recipe owners cannot contribute to rating aggregates.
 *   - A user can submit at most one top-level rating per recipe.
 * - Compute derived view-model data (top-level threads, avg rating, rating count).
 *
 * Design notes:
 * - Persistence, validation, and aggregation primitives live in `commentService`.
 * - These hooks focus on React lifecycle/state orchestration and resilient UX.
 * - Rating aggregates are explicitly synchronized to the recipe document when
 *   ratings are created/updated/deleted (denormalized write-through).
 */
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
  updateComment: (id: string, text: string, rating?: Rating) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  addReply: (parentId: string, text: string) => Promise<void>;
  getReplies: (parentId: string) => Comment[];
  refetch: () => Promise<void>;
}

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

  const topLevelComments = useMemo(
    () => commentService.getTopLevelComments(comments),
    [comments]
  );

  // Derived rating metrics exclude recipe owner's ratings by business rule.
  const { totalRatings, averageRating } = useMemo(() => {
    const ratings = topLevelComments.filter(
      (c) => typeof c.rating === "number" && c.userId !== recipeOwnerId
    );

    const total = ratings.length;
    const avg =
      total > 0
        ? ratings.reduce((sum, c) => sum + (c.rating || 0), 0) / total
        : 0;

    return { totalRatings: total, averageRating: avg };
  }, [topLevelComments, recipeOwnerId]);

  const userHasRated = !!userExistingRating;

  const syncUserExistingRating = useCallback(
    (data: Comment[]) => {
      if (!user || isOwner) {
        setUserExistingRating(null);
        return;
      }

      const ratingComment = data.find(
        (c) => c.userId === user.uid && typeof c.rating === "number" && !c.parentCommentId
      );

      setUserExistingRating(ratingComment || null);
    },
    [user, isOwner]
  );

  /**
   * Fetch comments once (non-realtime mode) and compute user rating state.
   */
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await commentService.getByRecipe(recipeId);
      setComments(data);
      syncUserExistingRating(data);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [recipeId, syncUserExistingRating]);

  useEffect(() => {
    if (!recipeId) {
      setComments([]);
      setUserExistingRating(null);
      setLoading(false);
      return;
    }

    if (!realtime) {
      fetchComments();
      return;
    }

    const unsubscribe = commentService.listenToRecipeComments(recipeId, (data) => {
      setComments(data);
      setLoading(false);
      syncUserExistingRating(data);
    });

    return () => unsubscribe();
  }, [recipeId, realtime, fetchComments, syncUserExistingRating]);

  /**
   * Add a new top-level comment; optionally includes a rating.
   *
   * Business rules:
   * - Requires auth.
   * - Owner ratings are ignored (stored as null).
   * - Non-owner may submit only one rating comment.
   */
  const addComment = useCallback(
    async (text: string, rating?: Rating | null) => {
      if (!user) throw new Error("User must be logged in to comment");

      const validation = commentService.validateComment(text, rating);
      if (!validation.isValid) throw new Error(validation.errors.join(", "));

      if (!isOwner && typeof rating === "number" && userHasRated) {
        throw new Error("You have already rated this recipe");
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await commentService.create({
          recipeId,
          userId: user.uid,
          userEmail: user.email || "",
          userPhotoURL: user.photoURL || "/default-profile.svg",
          text: text.trim(),
          rating: isOwner ? null : (rating ?? null),
          createdAt: new Date(),
          parentCommentId: null,
          isOwnerReply: isOwner,
        });

        if (!isOwner && typeof rating === "number") {
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
   * Update an existing comment text and/or rating.
   *
   * Non-obvious rule:
   * - If a rating is updated (including being set), we recompute recipe aggregates.
   */
  const updateComment = useCallback(
    async (id: string, text: string, rating?: Rating) => {
      if (!user) throw new Error("User must be logged in");

      const validation = commentService.validateComment(text, rating);
      if (!validation.isValid) throw new Error(validation.errors.join(", "));

      setIsSubmitting(true);
      setError(null);

      try {
        await commentService.update(id, { text: text.trim(), rating });

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
   * Delete a comment.
   *
   * Business rule:
   * - Users can delete only their own comments (enforced client-side).
   * - If a top-level rating comment is deleted, recipe aggregates must be refreshed.
   */
  const deleteComment = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User must be logged in");

      const comment = comments.find((c) => c.id === id);
      if (!comment) throw new Error("Comment not found");

      if (comment.userId !== user.uid) {
        throw new Error("You can only delete your own comments");
      }

      setError(null);

      try {
        await commentService.delete(id);

        if (typeof comment.rating === "number" && !comment.parentCommentId) {
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
   * Add a reply under a parent comment (replies never carry ratings).
   */
  const addReply = useCallback(
    async (parentId: string, text: string) => {
      if (!user) throw new Error("User must be logged in to reply");

      const validation = commentService.validateComment(text);
      if (!validation.isValid) throw new Error(validation.errors.join(", "));

      setError(null);

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
   * Client-side helper for retrieving replies for a parent comment from current state.
   */
  const getReplies = useCallback(
    (parentId: string): Comment[] => commentService.getCommentReplies(comments, parentId),
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
 * Lightweight hook that fetches derived comment/rating statistics for a recipe.
 *
 * Intended for list views (cards/grids) where rendering full comment threads would
 * be wasteful. This hook performs a single fetch and derives stats client-side.
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
    if (!recipeId) {
      setStats({
        totalComments: 0,
        totalReplies: 0,
        avgRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const comments = await commentService.getByRecipe(recipeId);
        setStats(commentService.getCommentStats(comments));
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
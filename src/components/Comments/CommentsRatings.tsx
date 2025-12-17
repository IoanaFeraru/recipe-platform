"use client";

/**
 * CommentsRatings
 *
 * Container/orchestrator component that composes the recipe review experience:
 * aggregated rating summary, authenticated review/comment submission, and the
 * threaded comments list with user avatars.
 *
 * Responsibilities:
 * - Connects to authentication via `useAuth` to determine current user + owner state
 * - Loads and mutates comment/rating data via `useComments` (real-time by default)
 * - Computes whether the current user is the recipe owner (owners can reply but not rate)
 * - Implements “create vs update” behavior for a user’s single review:
 *   - If the user has already rated, submits an update to that existing comment
 *   - Otherwise creates a new top-level comment with optional rating
 * - Fetches and caches avatar URLs for all unique users appearing in comments + replies
 * - Renders explicit loading and error states to avoid partial/incorrect UI
 * - Delegates rendering concerns to `CommentsSection`, `CommentForm`, and `CommentsList`
 * - Wraps the interactive area in `ComponentErrorBoundary` to prevent page breakage
 *
 * Notes / business rules enforced upstream:
 * - One rating per user and “owner cannot rate” rules are enforced in `useComments`
 *   (via `commentService`), while this component focuses on orchestration.
 *
 * @component
 *
 * @param {Object} props
 * @param {string} props.recipeId - Recipe identifier used to fetch comments/ratings
 * @param {string} props.recipeOwnerId - User id of the recipe owner (used for permissions and UI)
 *
 * @example
 * ```tsx
 * <CommentsRatings recipeId={recipe.id} recipeOwnerId={recipe.userId} />
 * ```
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useComments } from "@/hooks/useComments";
import { Rating } from "@/types/comment";
import { fetchUserAvatar } from "@/lib/utils/fetchUserAvatar";
import { ComponentErrorBoundary } from "@/components/ErrorBoundary";

import { CommentsSection } from "./CommentsSection";
import CommentForm from "./CommentForm";
import { CommentsList } from "./CommentsList";

interface CommentsRatingsProps {
  recipeId: string;
  recipeOwnerId: string;
}

export default function CommentsRatings({
  recipeId,
  recipeOwnerId,
}: CommentsRatingsProps) {
  const { user } = useAuth();
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});

  const {
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
  } = useComments({ recipeId, recipeOwnerId, realtime: true });

  const isOwner = user?.uid === recipeOwnerId;

  // Fetch user avatars for all commenters (top-level + replies) and cache them locally.
  useEffect(() => {
    const uniqueUserIds = new Set(topLevelComments.map((c) => c.userId));

    topLevelComments.forEach((comment) => {
      const replies = getReplies(comment.id);
      replies.forEach((reply) => uniqueUserIds.add(reply.userId));
    });

    uniqueUserIds.forEach(async (userId) => {
      if (!userAvatars[userId]) {
        const avatarUrl = await fetchUserAvatar(userId);
        setUserAvatars((prev) => ({ ...prev, [userId]: avatarUrl }));
      }
    });
    // Intentionally keyed to comment changes; avatar cache prevents repeat calls.
  }, [topLevelComments, getReplies, userAvatars]);

  // Handle comment submission (create or update)
  const handleCommentSubmit = async (text: string, rating: Rating | null) => {
    if (userHasRated && userExistingRating) {
      await updateComment(userExistingRating.id, text, rating || undefined);
    } else {
      await addComment(text, rating);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <CommentsSection totalRatings={0} averageRating={0} />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent" />
          <p className="mt-4 text-(--color-text-muted)">Loading comments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <CommentsSection totalRatings={0} averageRating={0} />
        <div className="bg-red-100 border-2 border-red-400 rounded-xl p-6 text-center">
          <p className="text-red-700">
            Failed to load comments. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary componentName="CommentsRatings">
      <div className="space-y-8">
        {/* Header & Rating Display */}
        <CommentsSection totalRatings={totalRatings} averageRating={averageRating} />

        {/* Comment Form */}
        {user ? (
          <CommentForm
            onSubmit={handleCommentSubmit}
            isOwner={isOwner}
            userHasRated={userHasRated}
            isSubmitting={isSubmitting}
            initialText={userExistingRating?.text}
            initialRating={userExistingRating?.rating || null}
          />
        ) : (
          <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-6 text-center">
            <p className="text-(--color-text-muted)">
              Please log in to leave a review or comment
            </p>
          </div>
        )}

        {/* Comments List */}
        <CommentsList
          comments={topLevelComments}
          currentUserId={user?.uid}
          recipeOwnerId={recipeOwnerId}
          onDelete={deleteComment}
          onReply={addReply}
          getReplies={getReplies}
          userAvatars={userAvatars}
        />
      </div>
    </ComponentErrorBoundary>
  );
}
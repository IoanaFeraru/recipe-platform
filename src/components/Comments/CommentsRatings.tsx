"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useComments } from "@/hooks/useComments";
import { Rating } from "@/types/comment";
import { fetchUserAvatar } from "@/lib/utils/fetchUserAvatar";

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

  // Fetch user avatars for all commenters
  useEffect(() => {
    const uniqueUserIds = new Set(topLevelComments.map((c) => c.userId));

    // Add user IDs from all replies
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
  }, [topLevelComments]);

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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
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
          <p className="text-red-700">Failed to load comments. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Rating Display */}
      <CommentsSection
        totalRatings={totalRatings}
        averageRating={averageRating}
      />

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
  );
}
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Comment, Rating } from "@/types/comment";
import { useComments } from "@/hooks/useComments";

interface CommentsRatingsProps {
  recipeId: string;
  recipeOwnerId: string;
}

export default function CommentsRatings({
  recipeId,
  recipeOwnerId,
}: CommentsRatingsProps) {
  const { user } = useAuth();

  const {
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
  } = useComments({ recipeId, recipeOwnerId });

  /* ----------------------------------
   * Local UI state
   * ---------------------------------- */

  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<Rating | null>(null);
  const [hoverRating, setHoverRating] = useState<Rating | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>(
    {}
  );

  const isOwner = user?.uid === recipeOwnerId;

  /* ----------------------------------
   * Handlers
   * ---------------------------------- */

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    await addComment(newComment, rating);
    setNewComment("");
    setRating(null);
  };

  const handleUpdate = async () => {
    if (!userExistingRating || !newComment.trim()) return;

    await updateComment(userExistingRating.id, newComment, rating ?? undefined);
    setNewComment("");
    setRating(null);
  };

  const handleReply = async (parentId: string) => {
    const text = replyText[parentId];
    if (!text?.trim()) return;

    await addReply(parentId, text);
    setReplyText((prev) => ({ ...prev, [parentId]: "" }));
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  /* ----------------------------------
   * Helpers
   * ---------------------------------- */

  const renderStars = (value: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const starValue = i as Rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill={
                i <= (interactive ? hoverRating ?? rating ?? 0 : value)
                  ? "#f59e0b"
                  : "#d1d5db"
              }
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      })}
    </div>
  );

  const formatDate = (t: any) => {
    const d = t?.toDate ? t.toDate() : new Date(t);
    const diffDays = Math.floor(
      (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  /* ----------------------------------
   * Render
   * ---------------------------------- */

  if (loading) {
    return <p className="text-center">Loading comments…</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error.message}</p>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Reviews & Comments</h2>

      {totalRatings > 0 && (
        <div className="flex gap-6 items-center">
          <div className="text-5xl font-bold">
            {averageRating.toFixed(1)}
            <div>{renderStars(Math.round(averageRating))}</div>
          </div>
          <p>{totalRatings} reviews</p>
        </div>
      )}

      {user && (
        <div className="space-y-4">
          {!isOwner && (
            <div>
              <label>Your rating</label>
              {renderStars(rating ?? 0, true)}
            </div>
          )}

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              userHasRated ? "Update your review…" : "Write a comment…"
            }
          />

          <button
            disabled={isSubmitting}
            onClick={userHasRated ? handleUpdate : handleSubmit}
          >
            {userHasRated ? "Update Review" : "Post Comment"}
          </button>
        </div>
      )}

      {topLevelComments.map((c) => {
        const replies = getReplies(c.id);
        const expanded = expandedReplies[c.id];

        return (
          <div key={c.id} className="border rounded p-4">
            <p>{c.userEmail}</p>
            <p>{formatDate(c.createdAt)}</p>
            {c.rating && renderStars(c.rating)}
            <p>{c.text}</p>

            <button onClick={() => toggleReplies(c.id)}>
              Reply ({replies.length})
            </button>

            {expanded && (
              <div className="ml-6 space-y-2">
                <textarea
                  value={replyText[c.id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({
                      ...prev,
                      [c.id]: e.target.value,
                    }))
                  }
                />
                <button onClick={() => handleReply(c.id)}>Reply</button>

                {replies.map((r) => (
                  <div key={r.id}>
                    <p>{r.userEmail}</p>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

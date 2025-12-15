"use client";

import { useState } from "react";
import { Rating } from "@/types/comment";
import StarRating from "./StarRating";
import Button from "@/components/Button";

interface CommentFormProps {
  onSubmit: (text: string, rating: Rating | null) => Promise<void>;
  isOwner: boolean;
  userHasRated: boolean;
  isSubmitting: boolean;
  initialText?: string;
  initialRating?: Rating | null;
}

export default function CommentForm({
  onSubmit,
  isOwner,
  userHasRated,
  isSubmitting,
  initialText = "",
  initialRating = null,
}: CommentFormProps) {
  const [text, setText] = useState(initialText);
  const [rating, setRating] = useState<Rating | null>(initialRating);
  const [hoverRating, setHoverRating] = useState<Rating | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Please write a comment");
      return;
    }

    if (!isOwner && !rating) {
      alert("Please select a rating");
      return;
    }

    try {
      await onSubmit(text, rating);
      setText("");
      setRating(null);
    } catch (error: any) {
      alert(error.message || "Failed to post comment");
    }
  };

  return (
    <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-semibold text-(--color-text) garet-heavy">
        {isOwner
          ? "Reply to Comments"
          : userHasRated
          ? "Edit Your Review"
          : "Leave a Review"}
      </h3>

      {!isOwner && userHasRated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            ℹ️ You've already reviewed this recipe. You can edit your rating and
            comment below.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating (for non-owners) */}
        {!isOwner && (
          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Your Rating *
            </label>
            <StarRating
              value={hoverRating || rating || 0}
              onChange={setRating}
              onHover={setHoverRating}
              size="lg"
            />
          </div>
        )}

        {/* Comment Text */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-(--color-text)">
            Your Comment *
          </label>
          <textarea
            className="w-full border-2 border-(--color-border) rounded-lg p-3 bg-(--color-bg) text-(--color-text) focus:outline-none focus:border-(--color-primary) min-h-24 resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isOwner
                ? "Reply to your reviewers..."
                : userHasRated
                ? "Update your review..."
                : "Share your thoughts about this recipe..."
            }
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting
            ? userHasRated
              ? "Updating..."
              : "Posting..."
            : userHasRated
            ? "Update Review"
            : "Post Comment"}
        </Button>
      </form>
    </div>
  );
}
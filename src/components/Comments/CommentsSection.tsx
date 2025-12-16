"use client";

import React from "react";
import RatingDisplay from "./RatingDisplay";

interface CommentsSectionProps {
  totalRatings: number;
  averageRating: number;
}

/**
 * CommentsSection - Section header with rating display
 * Wraps RatingDisplay with consistent styling
 */
export const CommentsSection: React.FC<CommentsSectionProps> = ({
  totalRatings,
  averageRating,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold garet-heavy text-(--color-text)">
        Reviews & Comments
      </h2>

      {totalRatings > 0 && (
        <RatingDisplay
          averageRating={averageRating}
          totalRatings={totalRatings}
        />
      )}
    </div>
  );
};
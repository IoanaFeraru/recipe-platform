"use client";

/**
 * CommentsSection
 *
 * Presentational section header for the comments/reviews area. It renders the
 * section title and conditionally displays the aggregated rating summary via
 * `RatingDisplay` when rating data exists.
 *
 * Responsibilities:
 * - Provides a consistent heading (“Reviews & Comments”) for the section
 * - Delegates rating visualization to `RatingDisplay`
 * - Hides `RatingDisplay` when there are no ratings to avoid empty UI chrome
 *
 * @component
 *
 * @param {Object} props
 * @param {number} props.totalRatings - Total number of submitted ratings for the recipe
 * @param {number} props.averageRating - Average rating value (typically 0–5)
 *
 * @example
 * ```tsx
 * <CommentsSection totalRatings={totalRatings} averageRating={averageRating} />
 * ```
 */

import React from "react";
import RatingDisplay from "./RatingDisplay";

interface CommentsSectionProps {
  totalRatings: number;
  averageRating: number;
}

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
        <RatingDisplay averageRating={averageRating} totalRatings={totalRatings} />
      )}
    </div>
  );
};
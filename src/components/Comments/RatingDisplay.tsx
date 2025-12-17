"use client";

/**
 * RatingDisplay
 *
 * Presentational component that summarizes recipe ratings. It displays the
 * average rating as a prominent numeric value, a corresponding star
 * visualization, and the total number of reviews. This component contains no
 * business logic and assumes all values are precomputed by the caller.
 *
 * Responsibilities:
 * - Display the average rating rounded to one decimal
 * - Visualize the rating using a read-only star component
 * - Show the total number of submitted reviews with proper pluralization
 *
 * @component
 *
 * @param {Object} props
 * @param {number} props.averageRating - Average rating value (typically 0–5)
 * @param {number} props.totalRatings - Total number of ratings submitted
 *
 * @example
 * ```tsx
 * <RatingDisplay averageRating={4.6} totalRatings={128} />
 * ```
 */

import StarRating from "./StarRating";

interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
}

export default function RatingDisplay({
  averageRating,
  totalRatings,
}: RatingDisplayProps) {
  return (
    <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-(--color-border) rounded-2xl p-6 flex items-center gap-6 shadow-md">
      <div className="text-center">
        <div className="text-5xl font-bold text-yellow-600 garet-heavy">
          {averageRating.toFixed(1)}
        </div>
        <div className="mt-2">
          <StarRating value={Math.round(averageRating)} readonly size="md" />
        </div>
      </div>

      <div className="flex-1">
        <p className="text-lg font-semibold text-(--color-primary)">
          {totalRatings} {totalRatings === 1 ? "Review" : "Reviews"}
        </p>
        <p className="text-sm text-(--color-text-muted)">
          Based on verified ratings
        </p>
      </div>
    </div>
  );
}
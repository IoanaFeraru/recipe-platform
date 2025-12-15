"use client";

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
      {/* Large Rating Number */}
      <div className="text-center">
        <div className="text-5xl font-bold text-yellow-600 garet-heavy">
          {averageRating.toFixed(1)}
        </div>
        <div className="mt-2">
          <StarRating value={Math.round(averageRating)} readonly size="md" />
        </div>
      </div>

      {/* Rating Info */}
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
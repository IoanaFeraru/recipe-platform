"use client";

import React from "react";

interface RecipeCardContentProps {
  title: string;
  description?: string;
  isFavorite: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  favoriteLoading: boolean;
}

/**
 * RecipeCardContent - Title, description, and favorite button
 * Pure presentational component with favorite interaction
 */
export const RecipeCardContent: React.FC<RecipeCardContentProps> = ({
  title,
  description,
  isFavorite,
  onFavoriteToggle,
  favoriteLoading,
}) => {
  return (
    <div className="p-5">
      {/* Title & Favorite */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <h2
          className="text-xl font-bold garet-heavy"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h2>

        <button
          onClick={onFavoriteToggle}
          disabled={favoriteLoading}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="text-xl transition disabled:opacity-50"
          style={{
            color: isFavorite ? "red" : "var(--color-text-muted)",
          }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Description */}
      {description && (
        <p
          className="text-sm mb-3 line-clamp-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </p>
      )}
    </div>
  );
};
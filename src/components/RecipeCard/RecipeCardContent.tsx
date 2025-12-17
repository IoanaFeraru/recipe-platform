/**
 * RecipeCardContent component.
 *
 * Renders the core textual content of a recipe card, including the recipe title,
 * optional short description, and the favorite (like) toggle button. This component
 * is intentionally presentational and does not contain any business logic related
 * to favorites beyond invoking the provided callback.
 *
 * Responsibilities:
 * - Display the recipe title with appropriate visual emphasis
 * - Optionally render a truncated description when available
 * - Render a favorite toggle button reflecting the current favorite state
 * - Disable favorite interactions while a toggle operation is in progress
 *
 * Interaction notes:
 * - Clicking the favorite button invokes `onFavoriteToggle`
 * - Visual state (filled vs. outlined heart) is controlled entirely by `isFavorite`
 * - Accessibility is supported via descriptive aria-labels
 *
 * @param {RecipeCardContentProps} props - Title, description, and favorite state handlers.
 * @returns The main content section of a recipe card.
 */

"use client";

import React from "react";

interface RecipeCardContentProps {
  title: string;
  description?: string;
  isFavorite: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  favoriteLoading: boolean;
}

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
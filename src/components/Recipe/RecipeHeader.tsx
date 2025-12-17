/**
 * RecipeHeader component.
 *
 * Renders the primary header section of a recipe detail page, including the
 * recipe title, creator attribution, and favorite (save) interaction.
 * This component is presentation-focused, with minimal user interaction logic
 * delegated via callback props.
 *
 * Responsibilities:
 * - Display the recipe title prominently as the main page heading
 * - Show creator information (name and optional avatar) when available
 * - Provide a favorite button with visual state (saved / not saved)
 * - Guard favorite actions when the user is not authenticated
 *
 * User interaction behavior:
 * - If the user is not logged in, attempting to favorite triggers a prompt
 * - Favorite button is disabled while favorite state is updating
 * - Visual styling clearly distinguishes saved vs unsaved states
 *
 * Design considerations:
 * - Large, bold title establishes clear visual hierarchy
 * - Creator avatar uses a circular cropped image with a fallback
 * - Button styling aligns with the application’s design system
 *
 * Accessibility notes:
 * - Uses semantic heading (`h1`) for screen reader context
 * - Favorite button includes an aria-label reflecting current state
 * - Disabled state prevents repeated actions during async updates
 *
 * @param {RecipeHeaderProps} props - Recipe title, creator info, and favorite state handlers.
 * @returns The recipe header section with title, author attribution, and favorite control.
 */

"use client";

import React from "react";
import Image from "next/image";
import Button from "@/components/UI/Button";

interface RecipeHeaderProps {
  title: string;
  creator: {
    name: string;
    avatarUrl?: string;
  } | null;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  favoriteLoading: boolean;
  isUserLoggedIn: boolean;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  title,
  creator,
  isFavorite,
  onFavoriteToggle,
  favoriteLoading,
  isUserLoggedIn,
}) => {
  const handleFavoriteClick = () => {
    if (!isUserLoggedIn) {
      alert("Please log in to save recipes");
      return;
    }
    onFavoriteToggle();
  };

  return (
    <div className="mb-6">
      <h1 className="text-5xl font-bold mb-4 text-(--color-text) garet-heavy">
        {title}
      </h1>

      {/* Creator Info */}
      {creator && (
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-(--color-border)">
            <Image
              src={creator.avatarUrl || "/default-avatar.png"}
              alt={creator.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-(--color-text)">By {creator.name}</span>
        </div>
      )}

      {/* Favorite Button */}
      <div className="flex gap-3">
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-(--color-bg) border-2 border-(--color-border) text-(--color-text)"
          } hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "❤️ Saved" : "🤍 Save"}
        </button>
      </div>
    </div>
  );
};
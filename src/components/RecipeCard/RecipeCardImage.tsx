/**
 * RecipeCardImage component.
 *
 * Renders the visual header of a recipe card, consisting of either the recipe’s
 * main image or a fallback placeholder when no image is available. The entire
 * image area acts as a navigation link to the recipe detail page.
 *
 * Responsibilities:
 * - Display the recipe image when an image URL is provided
 * - Render a visually consistent placeholder when no image exists
 * - Provide a clickable area that navigates to the recipe detail route
 *
 * Design considerations:
 * - Maintains a fixed height to ensure consistent card layouts in grids
 * - Uses object-fit styling to properly crop images without distortion
 * - Fallback placeholder prevents layout shifts and empty states
 *
 * Accessibility notes:
 * - Uses descriptive alt text based on the recipe title
 * - Clickable area is implemented via Next.js Link for proper navigation semantics
 *
 * @param {RecipeCardImageProps} props - Recipe identifier, optional image URL, and title.
 * @returns The image section of a recipe card with navigation behavior.
 */

"use client";

import React from "react";
import Link from "next/link";

interface RecipeCardImageProps {
  recipeId: string;
  imageUrl?: string;
  title: string;
}

export const RecipeCardImage: React.FC<RecipeCardImageProps> = ({
  recipeId,
  imageUrl,
  title,
}) => {
  return (
    <Link href={`/recipes/${recipeId}`} passHref>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div
          className="w-full h-48 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-border)" }}
        >
          <span className="text-6xl">🍽️</span>
        </div>
      )}
    </Link>
  );
};
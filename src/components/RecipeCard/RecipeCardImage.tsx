"use client";

import React from "react";
import Link from "next/link";

interface RecipeCardImageProps {
  recipeId: string;
  imageUrl?: string;
  title: string;
}

/**
 * RecipeCardImage - Recipe card image with fallback
 * Pure presentational component
 */
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
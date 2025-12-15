"use client";

import React from "react";

interface RecipeDescriptionProps {
  description?: string;
}

/**
 * RecipeDescription - Displays the recipe description/about section
 */
export const RecipeDescription: React.FC<RecipeDescriptionProps> = ({
  description,
}) => {
  if (!description) return null;

  return (
    <div className="mb-8 text-(--color-text)">
      <h2 className="text-2xl font-semibold mb-3 garet-heavy">
        About this recipe
      </h2>
      <p className="text-lg leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
};
/**
 * RecipeDescription component.
 *
 * Renders the descriptive “About this recipe” section for a recipe detail page.
 * This component is purely presentational and conditionally renders only when
 * a description is provided, avoiding unnecessary layout space for recipes
 * without descriptive text.
 *
 * Responsibilities:
 * - Display a semantic section title for the recipe description
 * - Render multi-line text while preserving author formatting
 * - Gracefully handle missing or empty descriptions
 *
 * Design considerations:
 * - Uses a prominent heading to establish section hierarchy
 * - Larger body text and relaxed line spacing improve readability
 * - `whitespace-pre-line` preserves intentional line breaks entered by authors
 *
 * Accessibility notes:
 * - Semantic heading (`h2`) improves document structure for screen readers
 * - Clear visual separation supports scannability for long-form content
 *
 * @param {RecipeDescriptionProps} props - Optional recipe description text.
 * @returns A formatted description section, or null if no description exists.
 */

"use client";

import React from "react";

interface RecipeDescriptionProps {
  description?: string;
}

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
/**
 * RecipeCardStats component.
 *
 * Displays a concise set of key statistics for a recipe card, including
 * servings, number of ingredients, number of steps, and preparation time.
 * This component is purely presentational and assumes all data has already
 * been validated and formatted by the caller or a domain model.
 *
 * Responsibilities:
 * - Present core quantitative recipe metadata in a compact, readable format
 * - Conditionally display preparation time only when available
 * - Delegate pluralization and count formatting to shared utilities
 *
 * Design considerations:
 * - Uses icons paired with text for quick visual scanning
 * - Maintains consistent spacing and separators for readability in grid layouts
 * - Keeps text size small to avoid overpowering the recipe title and image
 *
 * Accessibility notes:
 * - Text-based indicators ensure information is readable even without icons
 * - Icons are decorative supplements rather than the sole information carriers
 *
 * @param {RecipeCardStatsProps} props - Recipe statistics to be displayed.
 * @returns A compact statistics section suitable for recipe cards in lists or grids.
 */

"use client";

import React from "react";
import { formatCount } from "@/lib/utils/formatting";

interface RecipeCardStatsProps {
  servings: number;
  ingredientsCount: number;
  stepsCount: number;
  totalActiveTime: number;
  formattedTotalTime: string;
}

export const RecipeCardStats: React.FC<RecipeCardStatsProps> = ({
  servings,
  ingredientsCount,
  stepsCount,
  totalActiveTime,
  formattedTotalTime,
}) => {
  return (
    <div
      className="flex flex-wrap gap-3 text-xs px-5 pb-3"
      style={{ color: "var(--color-text-muted)" }}
    >
      <span className="flex items-center gap-1">
        <span className="text-base">👥</span>
        {formatCount(servings, "serving")}
      </span>
      <span>•</span>
      <span className="flex items-center gap-1">
        <span className="text-base">🥄</span>
        {formatCount(ingredientsCount, "ingredient")}
      </span>
      <span>•</span>
      <span className="flex items-center gap-1">
        <span className="text-base">📝</span>
        {formatCount(stepsCount, "step")}
      </span>
      {totalActiveTime > 0 && (
        <>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="text-base">⏱️</span>
            {formattedTotalTime}
          </span>
        </>
      )}
    </div>
  );
};
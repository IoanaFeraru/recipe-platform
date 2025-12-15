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

/**
 * RecipeCardStats - Recipe statistics (servings, ingredients, steps, time)
 * Pure presentational component with formatted data
 */
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
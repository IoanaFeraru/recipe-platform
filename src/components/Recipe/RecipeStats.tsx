"use client";

import React from "react";

interface RecipeStatsProps {
  servings: number;
  onServingsChange: (delta: number) => void;
  totalTime: number;
  formattedTotalTime: string;
  ingredientsCount: number;
  stepsCount: number;
}

/**
 * RecipeStats - Displays and controls recipe statistics
 * Handles servings scaling with increment/decrement controls
 */
export const RecipeStats: React.FC<RecipeStatsProps> = ({
  servings,
  onServingsChange,
  totalTime,
  formattedTotalTime,
  ingredientsCount,
  stepsCount,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Servings Control */}
      <div className="flex items-center gap-2 bg-(--color-bg) border-2 border-(--color-border) rounded-full px-4 py-2">
        <button
          onClick={() => onServingsChange(-1)}
          className="w-8 h-8 rounded-full bg-(--color-primary) text-white font-bold hover:brightness-110 transition flex items-center justify-center"
          aria-label="Decrease servings"
        >
          −
        </button>
        <span className="font-semibold text-(--color-text) min-w-20 text-center">
          {servings} {servings === 1 ? "serving" : "servings"}
        </span>
        <button
          onClick={() => onServingsChange(1)}
          className="w-8 h-8 rounded-full bg-(--color-primary) text-white font-bold hover:brightness-110 transition flex items-center justify-center"
          aria-label="Increase servings"
        >
          +
        </button>
      </div>

      {/* Recipe Statistics */}
      {totalTime > 0 && (
        <StatBadge icon="⏱" label={formattedTotalTime} />
      )}
      <StatBadge
        icon="🥄"
        label={`${ingredientsCount} ${ingredientsCount === 1 ? "ingredient" : "ingredients"}`}
      />
      <StatBadge
        icon="📝"
        label={`${stepsCount} ${stepsCount === 1 ? "step" : "steps"}`}
      />
    </div>
  );
};

/**
 * StatBadge - Individual stat display badge
 */
const StatBadge: React.FC<{ icon: string; label: string }> = ({
  icon,
  label,
}) => (
  <div className="flex items-center gap-2 bg-(--color-bg) border-2 border-(--color-border) rounded-full px-4 py-2">
    <span className="text-xl">{icon}</span>
    <span className="font-medium text-(--color-text)">{label}</span>
  </div>
);
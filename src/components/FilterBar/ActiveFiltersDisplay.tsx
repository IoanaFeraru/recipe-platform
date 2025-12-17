"use client";

/**
 * ActiveFiltersDisplay component.
 *
 * Renders the currently applied recipe filters as removable tags (chips),
 * providing clear visual feedback about active constraints and allowing
 * users to remove individual filters without resetting the entire filter set.
 *
 * Responsibilities:
 * - Display active dietary, difficulty, and meal type filters
 * - Compute and show the total number of active filters
 * - Delegate filter removal actions via explicit callbacks
 *
 * Behavior:
 * - Returns null when no filters are active to avoid unnecessary UI noise
 * - Each filter is represented as a Tag with a contextual label and color
 * - Removal actions are isolated per filter type (dietary, difficulty, meal type)
 *
 * Design notes:
 * - Uses semantic grouping and consistent chip styling for clarity
 * - Color coding reinforces meaning (e.g., success for dietary, danger for hard difficulty)
 * - Animates into view for smooth UX when filters become active
 *
 * @module ActiveFiltersDisplay
 */

import React from "react";
import { DietaryOption } from "@/types/recipe";
import Tag from "@/components/Tag/Tag";

interface ActiveFiltersDisplayProps {
  /** Active dietary filters */
  dietary: DietaryOption[];
  /** Active difficulty filter, if any */
  difficulty: "easy" | "medium" | "hard" | null;
  /** Active meal type filter */
  mealType: string;
  /** Callback to remove a dietary filter */
  onRemoveDietary: (value: DietaryOption) => void;
  /** Callback to remove the difficulty filter */
  onRemoveDifficulty: () => void;
  /** Callback to remove the meal type filter */
  onRemoveMealType: () => void;
}

const DIETARY_LABELS: Record<DietaryOption, string> = {
  vegetarian: "🌱 Vegetarian",
  vegan: "🌿 Vegan",
  pescatarian: "🐟 Pescatarian",
  glutenFree: "🌾 Gluten-Free",
  dairyFree: "🥛 Dairy-Free",
  nutFree: "🥜 Nut-Free",
  halal: "☪️ Halal",
  kosher: "✡️ Kosher",
};

const DIFFICULTY_LABELS = {
  easy: "😊 Easy",
  medium: "😐 Medium",
  hard: "😤 Hard",
};

export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  dietary,
  difficulty,
  mealType,
  onRemoveDietary,
  onRemoveDifficulty,
  onRemoveMealType,
}) => {
  const activeFiltersCount =
    dietary.length + (difficulty ? 1 : 0) + (mealType ? 1 : 0);

  if (activeFiltersCount === 0) {
    return null;
  }

  return (
    <div className="pt-5 border-t-2 border-(--color-border) animate-in fade-in duration-300">
      <p className="text-sm font-semibold text-(--color-text) mb-3">
        ✨ Active Filters ({activeFiltersCount})
      </p>

      <div className="flex flex-wrap gap-2">
        {dietary.map((d) => (
          <Tag
            key={d}
            label={DIETARY_LABELS[d]}
            removable
            onRemove={() => onRemoveDietary(d)}
            bgColor="var(--color-success)"
          />
        ))}

        {difficulty && (
          <Tag
            label={DIFFICULTY_LABELS[difficulty]}
            removable
            onRemove={onRemoveDifficulty}
            bgColor={
              difficulty === "easy"
                ? "var(--color-success)"
                : difficulty === "medium"
                ? "var(--color-warning)"
                : "var(--color-danger)"
            }
          />
        )}

        {mealType && (
          <Tag
            label={`🍽️ ${mealType}`}
            removable
            onRemove={onRemoveMealType}
            bgColor="var(--color-primary)"
          />
        )}
      </div>
    </div>
  );
};
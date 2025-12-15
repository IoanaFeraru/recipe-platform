"use client";

import React from "react";
import { DietaryOption } from "@/types/recipe";
import Tag from "@/components/Tag/Tag";

interface ActiveFiltersDisplayProps {
  dietary: DietaryOption[];
  difficulty: "easy" | "medium" | "hard" | null;
  mealType: string;
  onRemoveDietary: (value: DietaryOption) => void;
  onRemoveDifficulty: () => void;
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

/**
 * ActiveFiltersDisplay - Shows active filters as removable tags
 * Beautiful chip design with smooth animations
 */
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
        {/* Dietary filters */}
        {dietary.map((d) => (
          <Tag
            key={d}
            label={DIETARY_LABELS[d]}
            removable
            onRemove={() => onRemoveDietary(d)}
            bgColor="var(--color-success)"
            onClick={undefined}
          />
        ))}

        {/* Difficulty filter */}
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
            onClick={undefined}
          />
        )}

        {/* Meal type filter */}
        {mealType && (
          <Tag
            label={`🍽️ ${mealType}`}
            removable
            onRemove={onRemoveMealType}
            bgColor="var(--color-primary)"
            onClick={undefined}
          />
        )}
      </div>
    </div>
  );
};
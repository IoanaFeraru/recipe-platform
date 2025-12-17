/**
 * RecipeCardBadges component.
 *
 * Renders the collection of informational badges associated with a recipe card,
 * including difficulty, dietary restrictions, and free-form tags. This component
 * is purely presentational and delegates badge rendering to specialized subcomponents
 * to keep responsibilities clearly separated.
 *
 * Responsibilities:
 * - Conditionally displays the difficulty badge when provided
 * - Renders up to three dietary badges, with a compact overflow indicator
 * - Displays recipe tags via the RecipeTags component
 * - Propagates optional click interactions upward through `onTagClick`
 *
 * Interaction notes:
 * - Clicking any badge invokes the shared `onTagClick` callback, enabling
 *   filtering or navigation logic to be implemented at a higher level
 * - Badge rendering is defensive and skips empty or undefined data sets
 *
 * @param {RecipeCardBadgesProps} props - Badge data and optional click handler.
 * @returns A vertically stacked group of recipe metadata badges.
 */

"use client";

import React from "react";
import { DietaryOption } from "@/types/recipe";
import { DietaryBadge } from "@/components/Tag/CustomTags/DietaryBadge";
import { DifficultyBadge } from "@/components/Tag/CustomTags/DifficultyBadge";
import { RecipeTags } from "@/components/Tag/CustomTags/RecipeTags";

interface RecipeCardBadgesProps {
  difficulty?: "easy" | "medium" | "hard";
  dietary: DietaryOption[];
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export const RecipeCardBadges: React.FC<RecipeCardBadgesProps> = ({
  difficulty,
  dietary,
  tags,
  onTagClick,
}) => {
  return (
    <div className="px-5 pb-3 space-y-3">
      {/* Difficulty Badge */}
      {difficulty && (
        <div>
          <DifficultyBadge
            level={difficulty}
            onClick={() => onTagClick?.(difficulty)}
          />
        </div>
      )}

      {/* Dietary Badges */}
      {dietary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dietary.slice(0, 3).map((diet) => (
            <DietaryBadge
              key={diet}
              type={diet}
              onClick={() => onTagClick?.(diet)}
            />
          ))}
          {dietary.length > 3 && (
            <span className="text-xs text-(--color-text-muted)">
              +{dietary.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <RecipeTags tags={tags} onClick={onTagClick} />
      )}
    </div>
  );
};
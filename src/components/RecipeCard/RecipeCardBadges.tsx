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

/**
 * RecipeCardBadges - Recipe badges (difficulty, dietary, tags)
 * Pure presentational component with tag click delegation
 */
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
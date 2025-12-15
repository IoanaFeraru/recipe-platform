"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DietaryOption } from "@/types/recipe";
import { DietaryBadge } from "@/components/Tag/CustomTags/DietaryBadge";
import { DifficultyBadge } from "@/components/Tag/CustomTags/DifficultyBadge";
import { RecipeTags } from "@/components/Tag/CustomTags/RecipeTags";
import { capitalize } from "@/lib/utils/formatting";

interface RecipeBadgesProps {
  dietary: DietaryOption[];
  difficulty?: "easy" | "medium" | "hard";
  tags: string[];
}

/**
 * RecipeBadges - Displays dietary restrictions, difficulty, and tags
 */
export const RecipeBadges: React.FC<RecipeBadgesProps> = ({
  dietary,
  difficulty,
  tags,
}) => {
  const router = useRouter();

  const handleTagClick = (tag: string) => {
    router.push(`/?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Difficulty Badge */}
      {difficulty && (
        <div>
          <DifficultyBadge level={difficulty} onClick={() => handleTagClick(difficulty)} />
        </div>
      )}

      {/* Dietary Badges */}
      {dietary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dietary.map((diet) => (
            <DietaryBadge
              key={diet}
              type={diet}
              onClick={() => handleTagClick(diet)}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <RecipeTags tags={tags} onClick={handleTagClick} />
      )}
    </div>
  );
};
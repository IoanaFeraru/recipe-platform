/**
 * RecipeBadges component.
 *
 * Renders a collection of interactive badges associated with a recipe,
 * including difficulty level, dietary restrictions, and free-form tags.
 * Each badge acts as a navigational affordance, allowing users to quickly
 * explore related recipes by redirecting to a filtered search view.
 *
 * Responsibilities:
 * - Display difficulty, dietary options, and tags in a clear visual hierarchy
 * - Enable tag-based navigation via client-side routing
 * - Delegate badge rendering to specialized, reusable badge components
 *
 * Design considerations:
 * - Difficulty is shown first to convey recipe complexity at a glance
 * - Dietary badges are grouped to emphasize dietary constraints
 * - Tags are displayed last as secondary, exploratory metadata
 *
 * Navigation behavior:
 * - Clicking any badge updates the route with a query parameter (?q=tag)
 * - Uses Next.js client-side navigation for performance and UX consistency
 *
 * Accessibility notes:
 * - Badges are rendered as interactive elements with clear click affordances
 * - Visual grouping improves scannability for assistive and visual users
 *
 * @param {RecipeBadgesProps} props - Dietary options, difficulty, and tags to display.
 * @returns A vertical stack of clickable recipe metadata badges.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DietaryOption } from "@/types/recipe";
import { DietaryBadge } from "@/components/Tag/CustomTags/DietaryBadge";
import { DifficultyBadge } from "@/components/Tag/CustomTags/DifficultyBadge";
import { RecipeTags } from "@/components/Tag/CustomTags/RecipeTags";

interface RecipeBadgesProps {
  dietary: DietaryOption[];
  difficulty?: "easy" | "medium" | "hard";
  tags: string[];
}

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
          <DifficultyBadge
            level={difficulty}
            onClick={() => handleTagClick(difficulty)}
          />
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
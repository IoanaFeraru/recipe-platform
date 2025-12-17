/**
 * RecipeGrid component.
 *
 * Renders a responsive grid layout of recipe cards and manages the visual
 * loading state while recipe data is being fetched. This component is
 * presentation-focused and delegates all recipe rendering logic to
 * `RecipeCard`, ensuring separation of concerns.
 *
 * Responsibilities:
 * - Display a centered loading spinner while recipes are loading
 * - Render a responsive grid of recipe cards once data is available
 * - Forward tag click interactions to parent components for filtering/navigation
 *
 * Design considerations:
 * - Uses a CSS grid that adapts from 1 to 3 columns based on viewport size
 * - Maintains consistent spacing between cards for visual balance
 * - Keeps loading feedback simple and unobtrusive
 *
 * Accessibility notes:
 * - Loading indicator is visually centered and clearly communicates busy state
 * - Card layout preserves natural tab order for keyboard navigation
 *
 * @param {RecipeGridProps} props - Recipe list, loading state, and optional tag click handler.
 * @returns A loading indicator or a responsive grid of recipe cards.
 */

"use client";

import React from "react";
import RecipeCard from "@/components/RecipeCard/RecipeCard";
import { Recipe } from "@/types/recipe";

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  onTagClick?: (tag: string) => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  loading,
  onTagClick,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
};
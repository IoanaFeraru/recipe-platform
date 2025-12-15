"use client";

import React from "react";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types/recipe";

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  onTagClick?: (tag: string) => void;
}

/**
 * RecipeGrid - Grid layout for recipe cards with loading state
 */
export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  loading,
  onTagClick,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
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
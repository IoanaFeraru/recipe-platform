"use client";

import React from "react";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types/recipe";

interface RecipeGridWithActionsProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: string, recipeName: string) => void;
}

/**
 * RecipeGridWithActions - Recipe grid with edit/delete action overlays
 * Displays recipes in responsive grid with hover actions
 */
export const RecipeGridWithActions: React.FC<RecipeGridWithActionsProps> = ({
  recipes,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="relative group">
          <RecipeCard recipe={recipe} />

          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(recipe)}
              className="bg-(--color-secondary) text-white px-3 py-1 rounded-full text-sm font-semibold hover:brightness-110 transition shadow-[2px_2px_0_0_var(--color-shadow)]"
              aria-label={`Edit ${recipe.title}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(recipe.id!, recipe.title)}
              className="bg-(--color-danger) text-white px-3 py-1 rounded-full text-sm font-semibold hover:brightness-110 transition shadow-[2px_2px_0_0_var(--color-shadow)]"
              aria-label={`Delete ${recipe.title}`}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
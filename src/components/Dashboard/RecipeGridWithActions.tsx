"use client";

/**
 * RecipeGridWithActions
 *
 * Renders a responsive grid of recipe cards enhanced with contextual
 * edit and delete actions. Action buttons are revealed on hover and
 * allow recipe owners to manage their content directly from the grid.
 *
 * This component is typically used in authenticated contexts such as
 * dashboards or profile pages where recipe management is required.
 *
 * @component
 *
 * @param {Object} props
 * @param {Recipe[]} props.recipes - List of recipes to display in the grid
 * @param {(recipe: Recipe) => void} props.onEdit - Callback triggered when the user selects the edit action
 * @param {(recipeId: string, recipeName: string) => void} props.onDelete - Callback triggered when the user selects the delete action
 *
 * @example
 * ```tsx
 * <RecipeGridWithActions
 *   recipes={myRecipes}
 *   onEdit={(recipe) => setEditingRecipe(recipe)}
 *   onDelete={(id, name) => confirmDelete(id, name)}
 * />
 * ```
 */

import React from "react";
import RecipeCard from "@/components/RecipeCard/RecipeCard";
import { Recipe } from "@/types/recipe";

interface RecipeGridWithActionsProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: string, recipeName: string) => void;
}

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
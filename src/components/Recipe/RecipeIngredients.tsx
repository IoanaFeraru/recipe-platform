/**
 * RecipeIngredients component.
 *
 * Provides a presentational, read-only view of a recipe’s ingredients list.
 * This module is intentionally free of business logic: all quantity scaling
 * and formatting is delegated to the parent layer and injected via callback.
 *
 * Responsibilities:
 * - Render a styled list of ingredients for a recipe
 * - Display quantities already scaled/formatted by the caller
 * - Preserve ordering and provide simple visual indexing
 *
 * Design considerations:
 * - Uses a card-style container consistent with the application design system
 * - Numbers ingredients to improve scanability for users while cooking
 * - Separates list items into a memoized subcomponent to reduce re-renders
 *
 * Performance considerations:
 * - `IngredientItem` is memoized to avoid unnecessary re-renders when
 *   unrelated parent state changes
 *
 * Accessibility notes:
 * - Uses semantic list markup (`ul` / `li`) for screen reader compatibility
 * - Text content is provided in plain strings for easy narration
 *
 * @module RecipeIngredients
 */

"use client";

import React from "react";
import { Ingredient } from "@/types/recipe";

interface RecipeIngredientsProps {
  ingredients: Ingredient[];
  getScaledIngredientText: (ingredient: Ingredient) => string;
}

export const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({
  ingredients,
  getScaledIngredientText,
}) => {
  return (
    <div className="bg-(--color-bg) rounded-2xl p-6 border-2 border-(--color-border)">
      <h2 className="text-2xl font-bold mb-4 garet-heavy text-(--color-text)">
        Ingredients
      </h2>
      <ul className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <IngredientItem
            key={index}
            text={getScaledIngredientText(ingredient)}
            index={index}
          />
        ))}
      </ul>
    </div>
  );
};

const IngredientItem: React.FC<{ text: string; index: number }> = React.memo(
  ({ text, index }) => (
    <li className="flex items-start gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-(--color-primary) text-white text-sm flex items-center justify-center font-semibold">
        {index + 1}
      </span>
      <span className="text-(--color-text) leading-relaxed">{text}</span>
    </li>
  )
);

IngredientItem.displayName = "IngredientItem";
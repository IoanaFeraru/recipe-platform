"use client";

import React from "react";
import { Ingredient } from "@/types/recipe";

interface RecipeIngredientsProps {
  ingredients: Ingredient[];
  getScaledIngredientText: (ingredient: Ingredient) => string;
}

/**
 * RecipeIngredients - Displays ingredients list with scaled quantities
 * Pure presentational component that receives pre-formatted text
 */
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

/**
 * IngredientItem - Individual ingredient list item
 * Memoized for performance when list is large
 */
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
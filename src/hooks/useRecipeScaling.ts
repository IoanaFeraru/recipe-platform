import { useState, useCallback, useMemo } from "react";
import { RecipeModel } from "@/lib/models/Recipe.model";
import { Ingredient } from "@/types/recipe";

/**
 * Hook for managing serving size and proportional ingredient scaling.
 *
 * Acts as a thin stateful wrapper around the RecipeModel’s scaling logic.
 * The hook owns only the mutable UI state (current servings) and delegates
 * all domain-specific calculations to the model.
 *
 * Behavior:
 * - Defaults to the recipe’s original servings
 * - Enforces a minimum of 1 serving
 * - Recomputes scaled ingredients only when inputs change
 * - Exposes helpers for increment/decrement, reset, and formatted display
 */
export const useRecipeScaling = (recipeModel: RecipeModel | null) => {
  const [servings, setServings] = useState<number | undefined>(undefined);

  const currentServings = servings ?? recipeModel?.servings ?? 1;

  const scaledIngredients = useMemo(() => {
    if (!recipeModel) return [];
    return recipeModel.getScaledIngredients(currentServings);
  }, [recipeModel, currentServings]);

  const handleServingsChange = useCallback(
    (delta: number) => {
      setServings(prev => {
        const base = prev ?? recipeModel?.servings ?? 1;
        return Math.max(1, base + delta);
      });
    },
    [recipeModel]
  );

  const getScaledIngredientText = useCallback(
    (ingredient: Ingredient): string => {
      if (!recipeModel) return ingredient.name;
      return recipeModel.getScaledIngredientText(ingredient, currentServings);
    },
    [recipeModel, currentServings]
  );

  const resetServings = useCallback(() => {
    setServings(recipeModel?.servings);
  }, [recipeModel]);

  return {
    currentServings,
    scaledIngredients,
    handleServingsChange,
    getScaledIngredientText,
    resetServings
  };
};
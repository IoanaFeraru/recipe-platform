import { useState, useCallback, useMemo } from "react";
import { RecipeModel } from "@/lib/models/Recipe.model";
import { Ingredient } from "@/types/recipe";

/**
 * useRecipeScaling - Custom hook for managing recipe servings and ingredient scaling
 * Encapsulates all scaling logic in one place
 * 
 * @param recipeModel - Recipe domain model
 * @returns Servings state and scaling utilities
 */
export const useRecipeScaling = (recipeModel: RecipeModel | null) => {
  const [servings, setServings] = useState<number | undefined>(undefined);

  // Initialize servings from recipe when it loads
  const currentServings = servings ?? recipeModel?.servings ?? 1;

  // Memoize scaled ingredients to prevent unnecessary recalculations
  const scaledIngredients = useMemo(() => {
    if (!recipeModel) return [];
    return recipeModel.getScaledIngredients(currentServings);
  }, [recipeModel, currentServings]);

  // Handle servings increment/decrement
  const handleServingsChange = useCallback((delta: number) => {
    setServings((prev) => {
      const baseServings = prev ?? recipeModel?.servings ?? 1;
      return Math.max(1, baseServings + delta);
    });
  }, [recipeModel]);

  // Get formatted ingredient text with scaling
  const getScaledIngredientText = useCallback(
    (ingredient: Ingredient): string => {
      if (!recipeModel) return ingredient.name;
      return recipeModel.getScaledIngredientText(ingredient, currentServings);
    },
    [recipeModel, currentServings]
  );

  // Reset servings to recipe default
  const resetServings = useCallback(() => {
    setServings(recipeModel?.servings);
  }, [recipeModel]);

  return {
    currentServings,
    scaledIngredients,
    handleServingsChange,
    getScaledIngredientText,
    resetServings,
  };
};
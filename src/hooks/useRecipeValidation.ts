import { useMemo } from "react";
import { recipeSchema } from "@/lib/recipeSchema";

interface RecipeData {
  title: string;
  ingredients: Array<{ name: string; [key: string]: any }>;
  steps: Array<{ text: string; [key: string]: any }>;
  minActivePrepTime: number;
  maxActivePrepTime: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * useRecipeValidation - Validates recipe data in real-time
 * Uses Zod schema for validation and returns errors by field
 */
export const useRecipeValidation = (data: RecipeData): ValidationResult => {
  const validation = useMemo(() => {
    const result = recipeSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      });
      return { isValid: false, errors: fieldErrors };
    }

    return { isValid: true, errors: {} };
  }, [data]);

  return validation;
};
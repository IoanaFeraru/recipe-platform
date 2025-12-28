import { useMemo } from "react";
import { recipeSchema } from "@/lib/recipeSchema";

interface RecipeData {
  title: string;
  ingredients: Array<{ name: string; [key: string]: unknown }>;
  steps: Array<{ text: string; [key: string]: unknown }>;
  minActivePrepTime: number;
  maxActivePrepTime: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates recipe form data against the shared Zod schema.
 *
 * Intended for form UIs that need immediate, field-level feedback while the user
 * types. Validation is memoized so it only re-runs when the input `data` object
 * reference changes.
 *
 * Output contract:
 * - `isValid` is true only when the schema passes
 * - `errors` is a simple `{ [fieldName]: message }` map (one message per field)
 *
 * Note: If multiple issues occur for the same field, the last one wins in the
 * current implementation.
 */
export const useRecipeValidation = (data: RecipeData): ValidationResult => {
  const validation = useMemo(() => {
    const result = recipeSchema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};

      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          errors[key] = issue.message;
        }
      }

      return { isValid: false, errors };
    }

    return { isValid: true, errors: {} };
  }, [data]);

  return validation;
};
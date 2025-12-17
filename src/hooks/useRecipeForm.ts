import { useState, useEffect, useMemo } from "react";
import { Recipe, Ingredient } from "@/types/recipe";
import { recipeSchema } from "@/lib/recipeSchema";

interface RecipeFormData {
  title: string;
  description: string;
  servings: number | string;
  ingredients: Ingredient[];
  steps: Array<{ text: string; imageUrl?: string; imageFile?: File }>;
  tags: string;
  dietary: string[];
  difficulty: string;
  mealType: string;
  minActiveHours: number;
  minActiveMinutes: number;
  maxActiveHours: number;
  maxActiveMinutes: number;
  minPassiveHours: number;
  minPassiveMinutes: number;
  maxPassiveHours: number;
  maxPassiveMinutes: number;
  hasPassiveTime: boolean;
  mainImageFile: File | null;
  mainImagePreview: string;
}

/**
 * Recipe form state + validation hook.
 *
 * Responsibilities:
 * - Owns the full form state for create/edit flows (including nested arrays).
 * - Normalizes legacy/variant ingredient shapes coming from Firestore (see `initialRecipe` mapping).
 * - Produces a minimal "draft" payload used for schema validation (title/ingredients/steps/active time range).
 * - Enforces the one non-obvious business rule in this form: selecting "vegan" implies "vegetarian".
 *
 * Notes:
 * - This hook intentionally keeps `dietary`, `difficulty`, `mealType`, `tags`, and image fields
 *   out of `recipeSchema` validation, since your schema focuses on critical fields only.
 * - `servings` remains `number | string` because UI controls often emit strings; callers should
 *   coerce before persistence if they rely on numeric semantics.
 */
export const useRecipeForm = (initialRecipe?: Recipe) => {
  const createDefaultFormData = (): RecipeFormData => ({
    title: "",
    description: "",
    servings: 4,
    ingredients: [{ name: "", quantity: undefined, unit: undefined, notes: "" }],
    steps: [{ text: "", imageUrl: undefined, imageFile: undefined }],
    tags: "",
    dietary: [],
    difficulty: "",
    mealType: "",
    minActiveHours: 0,
    minActiveMinutes: 0,
    maxActiveHours: 0,
    maxActiveMinutes: 0,
    minPassiveHours: 0,
    minPassiveMinutes: 0,
    maxPassiveHours: 0,
    maxPassiveMinutes: 0,
    hasPassiveTime: false,
    mainImageFile: null,
    mainImagePreview: "",
  });

  const [formData, setFormData] = useState<RecipeFormData>(createDefaultFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialRecipe) return;

    // Normalize ingredient shapes (supports legacy nesting like ing.name.{name,quantity,unit,notes}).
    const normalizedIngredients: Ingredient[] = (initialRecipe.ingredients || []).map((ing: any) => {
      const name = typeof ing.name === "string" ? ing.name : ing.name?.name || "";
      const quantity =
        ing.name?.quantity !== undefined
          ? ing.name.quantity
          : ing.quantity !== undefined
            ? ing.quantity
            : undefined;
      const unit =
        ing.name?.unit !== undefined ? ing.name.unit : ing.unit !== undefined ? ing.unit : undefined;
      const notes = ing.name?.notes || ing.notes || "";

      return { name, quantity, unit, notes };
    });

    setFormData({
      title: initialRecipe.title,
      description: initialRecipe.description || "",
      servings: initialRecipe.servings || 4,
      ingredients: normalizedIngredients.length
        ? normalizedIngredients
        : [{ name: "", quantity: undefined, unit: undefined, notes: "" }],
      steps: (initialRecipe.steps || []).map((s) => ({
        text: s.text,
        imageUrl: s.imageUrl,
        imageFile: undefined,
      })),
      tags: (initialRecipe.tags || []).join(", "),
      dietary: initialRecipe.dietary || [],
      difficulty: initialRecipe.difficulty || "",
      mealType: initialRecipe.mealType || "",
      minActiveHours: Math.floor((initialRecipe.minActivePrepTime || 0) / 60),
      minActiveMinutes: (initialRecipe.minActivePrepTime || 0) % 60,
      maxActiveHours: Math.floor((initialRecipe.maxActivePrepTime || 0) / 60),
      maxActiveMinutes: (initialRecipe.maxActivePrepTime || 0) % 60,
      minPassiveHours: Math.floor((initialRecipe.minPassiveTime || 0) / 60),
      minPassiveMinutes: (initialRecipe.minPassiveTime || 0) % 60,
      maxPassiveHours: Math.floor((initialRecipe.maxPassiveTime || 0) / 60),
      maxPassiveMinutes: (initialRecipe.maxPassiveTime || 0) % 60,
      hasPassiveTime: Boolean(initialRecipe.minPassiveTime && initialRecipe.maxPassiveTime),
      mainImageFile: null,
      mainImagePreview: initialRecipe.imageUrl || "",
    });
  }, [initialRecipe]);

  const draft = useMemo(
    () => ({
      title: String(formData.title || "").trim(),
      ingredients: formData.ingredients
        .filter((i) => String(i.name || "").trim() !== "")
        .map((i) => ({
          ...i,
          name: String(i.name || "").trim(),
          quantity: i.quantity === undefined ? undefined : parseFloat(String(i.quantity)),
        })),
      steps: formData.steps.filter((s) => String(s.text || "").trim() !== ""),
      minActivePrepTime: formData.minActiveHours * 60 + formData.minActiveMinutes,
      maxActivePrepTime: formData.maxActiveHours * 60 + formData.maxActiveMinutes,
    }),
    [formData]
  );

  const isValid = useMemo(() => {
    const result = recipeSchema.safeParse(draft);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [draft]);

  const updateField = <K extends keyof RecipeFormData>(field: K, value: RecipeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    setFormData((prev) => {
      const nextIngredients = [...prev.ingredients];
      nextIngredients[index] = { ...nextIngredients[index], [field]: value };
      return { ...prev, ingredients: nextIngredients };
    });
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: undefined, unit: undefined, notes: "" }],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateStepText = (index: number, text: string) => {
    setFormData((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = { ...nextSteps[index], text };
      return { ...prev, steps: nextSteps };
    });
  };

  const updateStepImage = (index: number, file: File) => {
    setFormData((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = {
        ...nextSteps[index],
        imageFile: file,
        imageUrl: URL.createObjectURL(file),
      };
      return { ...prev, steps: nextSteps };
    });
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { text: "", imageUrl: undefined, imageFile: undefined }],
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const toggleDietary = (value: string) => {
    setFormData((prev) => {
      const isSelected = prev.dietary.includes(value);
      let nextDietary = isSelected ? prev.dietary.filter((v) => v !== value) : [...prev.dietary, value];

      // Business rule: vegan implies vegetarian.
      if (value === "vegan" && !nextDietary.includes("vegetarian")) {
        nextDietary = [...nextDietary, "vegetarian"];
      }

      // Business rule: do not allow removing vegetarian while vegan is selected.
      if (value === "vegetarian" && prev.dietary.includes("vegan")) {
        return prev;
      }

      return { ...prev, dietary: nextDietary };
    });
  };

  const reset = () => {
    setFormData(createDefaultFormData());
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    setIsSubmitting,
    updateField,
    updateIngredient,
    addIngredient,
    removeIngredient,
    updateStepText,
    updateStepImage,
    addStep,
    removeStep,
    toggleDietary,
    reset,
  };
};
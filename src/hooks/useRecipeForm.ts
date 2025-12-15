// src/hooks/useRecipeForm.ts
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

const createDefaultFormData = (): RecipeFormData => ({
  title: "",
  description: "",
  servings: 4,
  ingredients: [{ name: "", quantity: undefined, unit: "", notes: "" }],
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

/**
 * Custom hook for managing recipe form state
 * Encapsulates form logic, validation, and state management
 */
export const useRecipeForm = (initialRecipe?: Recipe) => {
  const [formData, setFormData] = useState<RecipeFormData>(
    createDefaultFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing recipe data
  useEffect(() => {
    if (initialRecipe) {
      const normalizedIngredients = (initialRecipe.ingredients || []).map(
        (ing: any) => ({
          name: typeof ing.name === "string" ? ing.name : ing.name?.name || "",
          quantity: ing.name?.quantity || ing.quantity || "",
          unit: ing.name?.unit || ing.unit || "",
          notes: ing.name?.notes || ing.notes || "",
        })
      );

      setFormData({
        title: initialRecipe.title,
        description: initialRecipe.description || "",
        servings: initialRecipe.servings || 4,
        ingredients: normalizedIngredients.length
          ? normalizedIngredients
          : [{ name: "", quantity: "", unit: "", notes: "" }],
        steps: initialRecipe.steps.map((s) => ({
          text: s.text,
          imageUrl: s.imageUrl,
          imageFile: undefined,
        })),
        tags: initialRecipe.tags.join(", "),
        dietary: initialRecipe.dietary || [],
        difficulty: initialRecipe.difficulty || "",
        mealType: initialRecipe.mealType || "",
        minActiveHours: Math.floor(initialRecipe.minActivePrepTime / 60),
        minActiveMinutes: initialRecipe.minActivePrepTime % 60,
        maxActiveHours: Math.floor(initialRecipe.maxActivePrepTime / 60),
        maxActiveMinutes: initialRecipe.maxActivePrepTime % 60,
        minPassiveHours: Math.floor(
          (initialRecipe.minPassiveTime || 0) / 60
        ),
        minPassiveMinutes: (initialRecipe.minPassiveTime || 0) % 60,
        maxPassiveHours: Math.floor(
          (initialRecipe.maxPassiveTime || 0) / 60
        ),
        maxPassiveMinutes: (initialRecipe.maxPassiveTime || 0) % 60,
        hasPassiveTime: !!(
          initialRecipe.minPassiveTime && initialRecipe.maxPassiveTime
        ),
        mainImageFile: null,
        mainImagePreview: initialRecipe.imageUrl || "",
      });
    }
  }, [initialRecipe]);

  // Validate form in real-time
  const draft = useMemo(
    () => ({
      title: String(formData.title || "").trim(),
      ingredients: formData.ingredients
        .filter((i) => String(i.name || "").trim() !== "")
        .map((i) => ({
          ...i,
          name: String(i.name || "").trim(),
          quantity:
            i.quantity === "" || i.quantity === undefined
              ? undefined
              : parseFloat(String(i.quantity)),
        })),
      steps: formData.steps.filter((s) => String(s.text || "").trim() !== ""),
      minActivePrepTime:
        formData.minActiveHours * 60 + formData.minActiveMinutes,
      maxActivePrepTime:
        formData.maxActiveHours * 60 + formData.maxActiveMinutes,
    }),
    [formData]
  );

  const isValid = useMemo(() => {
    const result = recipeSchema.safeParse(draft);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [draft]);

  // Update methods
  const updateField = <K extends keyof RecipeFormData>(
    field: K,
    value: RecipeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: any
  ) => {
    setFormData((prev) => {
      const updated = [...prev.ingredients];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ingredients: updated };
    });
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: "", quantity: undefined, unit: "", notes: "" },
      ],
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
      const updated = [...prev.steps];
      updated[index].text = text;
      return { ...prev, steps: updated };
    });
  };

  const updateStepImage = (index: number, file: File) => {
    setFormData((prev) => {
      const updated = [...prev.steps];
      updated[index].imageFile = file;
      updated[index].imageUrl = URL.createObjectURL(file);
      return { ...prev, steps: updated };
    });
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { text: "", imageUrl: undefined, imageFile: undefined },
      ],
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
      let next = prev.dietary.includes(value)
        ? prev.dietary.filter((v) => v !== value)
        : [...prev.dietary, value];

      // Auto-add vegetarian when vegan is selected
      if (value === "vegan" && !next.includes("vegetarian")) {
        next.push("vegetarian");
      }

      // Prevent removing vegetarian if vegan is selected
      if (value === "vegetarian" && prev.dietary.includes("vegan")) {
        return prev;
      }

      return { ...prev, dietary: next };
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
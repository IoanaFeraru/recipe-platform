/**
 * RecipeModal component.
 *
 * Modal-based recipe editor that orchestrates the full create/edit workflow by
 * composing focused child form sections (basic info, dietary options, time inputs,
 * images, ingredients, steps, and tags). The component owns transient UI state,
 * normalizes/validates draft data via `useRecipeValidation`, uploads images to
 * Firebase Storage with progress tracking, and submits a consolidated recipe
 * payload through the provided `onSubmit` callback.
 *
 * Responsibilities:
 * - Maintain local form state for all recipe fields (create and edit modes)
 * - Hydrate state from `editRecipe` when provided; otherwise reset to defaults
 * - Build a normalized validation draft and surface field errors from Zod schema
 * - Enforce image file validation for main and step images
 * - Upload images with resumable progress reporting and resolve download URLs
 * - Normalize and sanitize user input (trim strings, parse numbers, split tags)
 * - Require an authenticated user before persisting changes
 * - Render a guarded UI inside `ComponentErrorBoundary` to prevent modal crashes
 *
 * Business/UI rules:
 * - Submission is blocked when validation fails
 * - Servings is coerced to a positive integer (minimum 1)
 * - Dietary dependency: selecting "vegan" implies "vegetarian"; "vegetarian" is locked when vegan is selected
 * - Passive time fields are included only when `hasPassiveTime` is true
 * - Ingredient rows and steps are filtered to non-empty entries before submission
 *
 * Data/side effects:
 * - Uses Firebase Auth `currentUser` to gate submissions and to populate `authorName`
 * - Uses Firebase Storage resumable uploads to provide per-file progress updates
 * - Uses object URLs for immediate local previews before upload
 *
 * @param {RecipeModalProps} props - Modal state, callbacks, and optional recipe to edit.
 * @returns A modal dialog for creating or editing a recipe, or null when closed.
 */

"use client";

import { useState, useEffect } from "react";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { validateImageFile } from "@/lib/imageValidation";
import { useRecipeValidation } from "@/hooks/useRecipeValidation";
import { ComponentErrorBoundary } from "@/components/ErrorBoundary";
import { RecipeModalHeader } from "./RecipeModalHeader";
import { BasicInfoForm } from "./BasicInfoForm";
import { DietaryOptionsSelector } from "./DietaryOptionsSelector";
import { TimeInputSection } from "./TimeInputSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { IngredientsSection } from "./IngredientsSection";
import { StepsSection } from "./StepsSection";
import { MeasurementUnit } from "@/types/recipe";

interface Ingredient {
  name: string;
  quantity?: string | number;
  unit?: string;
  notes?: string;
}

interface Step {
  text: string;
  imageUrl?: string;
  imageFile?: File;
  [key: string]: unknown;
}

interface RecipeData {
  title: string;
  description?: string;
  servings: number;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: MeasurementUnit;
    notes?: string;
  }>;
  steps: Array<{
    text: string;
    imageUrl?: string;
  }>;
  tags: string[];
  dietary: import("@/types/recipe").DietaryOption[];
  difficulty?: "easy" | "medium" | "hard";
  mealType?: string;
  minActivePrepTime: number;
  maxActivePrepTime: number;
  minPassiveTime?: number;
  maxPassiveTime?: number;
  imageUrl?: string;
}

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecipeData) => Promise<void>;
  editRecipe?: RecipeData & { id?: string };
}

export default function RecipeModal({
  isOpen,
  onClose,
  onSubmit,
  editRecipe,
}: RecipeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState<number | string>(4);
  const [difficulty, setDifficulty] = useState<string>("");
  const [mealType, setMealType] = useState<string>("");
  const [tags, setTags] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [minActiveHours, setMinActiveHours] = useState(0);
  const [minActiveMinutes, setMinActiveMinutes] = useState(0);
  const [maxActiveHours, setMaxActiveHours] = useState(0);
  const [maxActiveMinutes, setMaxActiveMinutes] = useState(0);
  const [minPassiveHours, setMinPassiveHours] = useState(0);
  const [minPassiveMinutes, setMinPassiveMinutes] = useState(0);
  const [maxPassiveHours, setMaxPassiveHours] = useState(0);
  const [maxPassiveMinutes, setMaxPassiveMinutes] = useState(0);
  const [hasPassiveTime, setHasPassiveTime] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [mainImageProgress, setMainImageProgress] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: undefined, unit: "", notes: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { text: "", imageUrl: undefined, imageFile: undefined },
  ]);
  const [stepsProgress, setStepsProgress] = useState<number[]>([0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationData = {
    title: String(title || "").trim(),
    ingredients: ingredients
      .filter((i) => String(i.name || "").trim() !== "")
      .map((i) => ({
        ...i,
        name: String(i.name || "").trim(),
        quantity:
          i.quantity === "" || i.quantity === undefined
            ? undefined
            : parseFloat(String(i.quantity)),
      })),
    steps: steps.filter((s) => String(s.text || "").trim() !== ""),
    minActivePrepTime: minActiveHours * 60 + minActiveMinutes,
    maxActivePrepTime: maxActiveHours * 60 + maxActiveMinutes,
  };

  const { isValid, errors } = useRecipeValidation(validationData);

  useEffect(() => {
    if (editRecipe) {
      setTitle(editRecipe.title);
      setDescription(editRecipe.description || "");
      setServings(editRecipe.servings || 4);
      setDifficulty(editRecipe.difficulty || "");
      setMealType(editRecipe.mealType || "");
      setTags(editRecipe.tags.join(", "));
      setDietary(editRecipe.dietary || []);

      const normalizedIngredients = (editRecipe.ingredients || []).map(
        (ing) => ({
          name: ing.name || "",
          quantity: ing.quantity || "",
          unit: ing.unit || "",
          notes: ing.notes || "",
        })
      );
      setIngredients(
        normalizedIngredients.length
          ? normalizedIngredients
          : [{ name: "", quantity: "", unit: "", notes: "" }]
      );
      setSteps(
        editRecipe.steps.map((s) => ({
          text: s.text,
          imageUrl: s.imageUrl,
          imageFile: undefined,
        }))
      );
      setStepsProgress(editRecipe.steps.map(() => 0));

      setMinActiveHours(Math.floor(editRecipe.minActivePrepTime / 60));
      setMinActiveMinutes(editRecipe.minActivePrepTime % 60);
      setMaxActiveHours(Math.floor(editRecipe.maxActivePrepTime / 60));
      setMaxActiveMinutes(editRecipe.maxActivePrepTime % 60);

      if (editRecipe.minPassiveTime && editRecipe.maxPassiveTime) {
        setHasPassiveTime(true);
        setMinPassiveHours(Math.floor(editRecipe.minPassiveTime / 60));
        setMinPassiveMinutes(editRecipe.minPassiveTime % 60);
        setMaxPassiveHours(Math.floor(editRecipe.maxPassiveTime / 60));
        setMaxPassiveMinutes(editRecipe.maxPassiveTime % 60);
      }

      setMainImagePreview(editRecipe.imageUrl || "");
      setMainImageFile(null);
    } else {
      setTitle("");
      setDescription("");
      setServings(4);
      setDifficulty("");
      setMealType("");
      setTags("");
      setDietary([]);
      setIngredients([{ name: "", quantity: undefined, unit: "", notes: "" }]);
      setSteps([{ text: "", imageUrl: undefined, imageFile: undefined }]);
      setStepsProgress([0]);
      setMinActiveHours(0);
      setMinActiveMinutes(0);
      setMaxActiveHours(0);
      setMaxActiveMinutes(0);
      setMinPassiveHours(0);
      setMinPassiveMinutes(0);
      setMaxPassiveHours(0);
      setMaxPassiveMinutes(0);
      setHasPassiveTime(false);
      setMainImageFile(null);
      setMainImagePreview("");
      setMainImageProgress(0);
    }
  }, [editRecipe]);

  const handleMainImageChange = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
    setMainImageProgress(0);
  };

  const handleStepImageChange = (index: number, file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const updated = [...steps];
    updated[index].imageFile = file;
    updated[index].imageUrl = URL.createObjectURL(file);
    setSteps(updated);

    setStepsProgress((prev) => {
      const newProgress = [...prev];
      newProgress[index] = 0;
      return newProgress;
    });
  };

  const toggleDietary = (value: string) => {
    setDietary((prev) => {
      let next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (value === "vegan" && !next.includes("vegetarian")) {
        next.push("vegetarian");
      }

      if (value === "vegetarian" && prev.includes("vegan")) {
        return prev;
      }

      return next;
    });
  };

  const uploadImageWithProgress = (
    file: File,
    path: string,
    onProgress: (p: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to save a recipe");
      return;
    }

    const displayName = user.displayName || "Unknown";

    const validIngredients = ingredients
      .filter((i) => i.name.trim() !== "")
      .map((i) => ({
        ...i,
        quantity:
          i.quantity === "" || i.quantity === undefined
            ? null
            : parseFloat(String(i.quantity)),
      }));

    const validSteps = steps.filter((s) => s.text.trim() !== "");
    const validTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const minActivePrepTime = minActiveHours * 60 + minActiveMinutes;
    const maxActivePrepTime = maxActiveHours * 60 + maxActiveMinutes;
    const minPassiveTime = minPassiveHours * 60 + minPassiveMinutes;
    const maxPassiveTime = maxPassiveHours * 60 + maxPassiveMinutes;

    const parsedServings = parseInt(String(servings));
    const finalServings =
      isNaN(parsedServings) || parsedServings < 1 ? 1 : parsedServings;

    setIsSubmitting(true);

    try {
      let mainImageUrl = mainImagePreview || null;
      if (mainImageFile) {
        mainImageUrl = await uploadImageWithProgress(
          mainImageFile,
          `recipes/${Date.now()}_${mainImageFile.name}`,
          (p) => setMainImageProgress(p)
        );
      }

      const stepsWithImages = await Promise.all(
        validSteps.map(async (step, idx) => {
          let imageUrl = step.imageUrl || null;

          if (step.imageFile) {
            imageUrl = await uploadImageWithProgress(
              step.imageFile,
              `recipes/steps/${Date.now()}_${step.imageFile.name}`,
              (p) =>
                setStepsProgress((prev) => {
                  const next = [...prev];
                  next[idx] = p;
                  return next;
                })
            );
          }

          return { text: step.text, imageUrl };
        })
      );

      const recipeData: any = {
        title: title.trim(),
        servings: finalServings,
        ingredients: validIngredients,
        steps: stepsWithImages,
        tags: validTags,
        dietary,
        authorName: displayName,
        createdAt: new Date(),
        minActivePrepTime,
        maxActivePrepTime,
      };

      if (description.trim()) recipeData.description = description.trim();
      if (mainImageUrl) recipeData.imageUrl = mainImageUrl;
      if (difficulty) recipeData.difficulty = difficulty;
      if (mealType) recipeData.mealType = mealType;

      if (hasPassiveTime) {
        recipeData.minPassiveTime = minPassiveTime;
        recipeData.maxPassiveTime = maxPassiveTime;
      }

      await onSubmit(recipeData);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ComponentErrorBoundary componentName="RecipeModal">
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
        <div className="bg-(--color-bg) rounded-l-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0_0_var(--color-shadow)]">
          <RecipeModalHeader
            isEditing={!!editRecipe}
            onClose={onClose}
            disabled={isSubmitting}
          />

          <div className="overflow-y-auto flex-1 p-5 space-y-5">
            <BasicInfoForm
              title={title}
              description={description}
              servings={servings}
              difficulty={difficulty}
              mealType={mealType}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onServingsChange={setServings}
              onDifficultyChange={setDifficulty}
              onMealTypeChange={setMealType}
              errors={errors}
            />

            <DietaryOptionsSelector selected={dietary} onToggle={toggleDietary} />

            <TimeInputSection
              minActiveHours={minActiveHours}
              minActiveMinutes={minActiveMinutes}
              maxActiveHours={maxActiveHours}
              maxActiveMinutes={maxActiveMinutes}
              minPassiveHours={minPassiveHours}
              minPassiveMinutes={minPassiveMinutes}
              maxPassiveHours={maxPassiveHours}
              maxPassiveMinutes={maxPassiveMinutes}
              hasPassiveTime={hasPassiveTime}
              onMinActiveHoursChange={setMinActiveHours}
              onMinActiveMinutesChange={setMinActiveMinutes}
              onMaxActiveHoursChange={setMaxActiveHours}
              onMaxActiveMinutesChange={setMaxActiveMinutes}
              onMinPassiveHoursChange={setMinPassiveHours}
              onMinPassiveMinutesChange={setMinPassiveMinutes}
              onMaxPassiveHoursChange={setMaxPassiveHours}
              onMaxPassiveMinutesChange={setMaxPassiveMinutes}
              onHasPassiveTimeChange={setHasPassiveTime}
              errors={errors}
            />

            <ImageUploadSection
              preview={mainImagePreview}
              progress={mainImageProgress}
              isUploading={isSubmitting && !!mainImageFile}
              onChange={handleMainImageChange}
            />

            <IngredientsSection
              ingredients={ingredients}
              onAdd={() =>
                setIngredients([
                  ...ingredients,
                  { name: "", quantity: undefined, unit: "", notes: "" },
                ])
              }
              onRemove={(i) =>
                setIngredients(ingredients.filter((_, idx) => idx !== i))
              }
              onUpdate={(i, field, value) => {
                const updated = [...ingredients];
                updated[i] = { ...updated[i], [field]: value };
                setIngredients(updated);
              }}
              errors={errors}
            />

            <StepsSection
              steps={steps}
              stepsProgress={stepsProgress}
              onAdd={() => {
                setSteps([
                  ...steps,
                  { text: "", imageUrl: undefined, imageFile: undefined },
                ]);
                setStepsProgress((prev) => [...prev, 0]);
              }}
              onRemove={(i) => {
                setSteps(steps.filter((_, idx) => idx !== i));
                setStepsProgress((prev) => prev.filter((_, idx) => idx !== i));
              }}
              onUpdateText={(i, value) => {
                const updated = [...steps];
                updated[i].text = value;
                setSteps(updated);
              }}
              onUpdateImage={handleStepImageChange}
              errors={errors}
            />

            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">
                Tags
              </label>
              <input
                type="text"
                className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text)"
                placeholder="dessert, baking, quick (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 p-5 border-t-2 border-(--color-border) bg-(--color-bg-secondary) rounded-bl-3xl">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isValid}
              className="flex-1 bg-(--color-primary) text-white py-3 rounded-full font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting
                ? editRecipe
                  ? "Updating..."
                  : "Creating..."
                : editRecipe
                ? "Update Recipe"
                : "Create Recipe"}
            </button>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-bg) transition disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { recipeSchema } from "@/lib/recipeSchema";
import { getAuth } from "firebase/auth";
import { validateImageFile } from "@/lib/imageValidation";

interface Ingredient {
  name: string;
  quantity?: string | number;
  unit?: string;
  notes?: string;
}

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editRecipe?: any;
}

const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { value: "vegan", label: "Vegan", icon: "🌿" },
  { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { value: "glutenFree", label: "Gluten-Free", icon: "🌾" },
  { value: "dairyFree", label: "Dairy-Free", icon: "🥛" },
  { value: "nutFree", label: "Nut-Free", icon: "🥜" },
  { value: "halal", label: "Halal", icon: "☪️" },
  { value: "kosher", label: "Kosher", icon: "✡️" },
];

const UNITS = [
  "g",
  "kg",
  "mg",
  "ml",
  "l",
  "cup",
  "tbsp",
  "tsp",
  "oz",
  "lb",
  "piece",
  "slice",
  "pinch",
  "to taste",
];

const MEAL_TYPES = [
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Drink",
  "Other",
];

export default function RecipeModal({
  isOpen,
  onClose,
  onSubmit,
  editRecipe,
}: RecipeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState<number | string>(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: undefined, unit: "", notes: "" },
  ]);
  const [steps, setSteps] = useState<
    Array<{ text: string; imageUrl?: string; imageFile?: File }>
  >([{ text: "", imageUrl: undefined, imageFile: undefined }]);
  const [tags, setTags] = useState("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [mainImageProgress, setMainImageProgress] = useState(0);
  const [stepsProgress, setStepsProgress] = useState<number[]>([0]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("");
  const [mealType, setMealType] = useState<string>("");
  const [minActiveHours, setMinActiveHours] = useState(0);
  const [minActiveMinutes, setMinActiveMinutes] = useState(0);
  const [maxActiveHours, setMaxActiveHours] = useState(0);
  const [maxActiveMinutes, setMaxActiveMinutes] = useState(0);
  const [minPassiveHours, setMinPassiveHours] = useState(0);
  const [minPassiveMinutes, setMinPassiveMinutes] = useState(0);
  const [maxPassiveHours, setMaxPassiveHours] = useState(0);
  const [maxPassiveMinutes, setMaxPassiveMinutes] = useState(0);
  const [hasPassiveTime, setHasPassiveTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (editRecipe) {
      setTitle(editRecipe.title);
      setDescription(editRecipe.description || "");
      setServings(editRecipe.servings || 4);
      const normalizedIngredients = (editRecipe.ingredients || []).map(
        (ing: any) => ({
          name: typeof ing.name === "string" ? ing.name : ing.name?.name || "",
          quantity: ing.name?.quantity || ing.quantity || "",
          unit: ing.name?.unit || ing.unit || "",
          notes: ing.name?.notes || ing.notes || "",
        })
      );

      setIngredients(
        normalizedIngredients.length
          ? normalizedIngredients
          : [{ name: "", quantity: "", unit: "", notes: "" }]
      );
      setSteps(
        editRecipe.steps.map((s: any) => ({
          text: s.text,
          imageUrl: s.imageUrl,
          imageFile: undefined,
        }))
      );
      setStepsProgress(editRecipe.steps.map(() => 0));
      setTags(editRecipe.tags.join(", "));
      setMainImagePreview(editRecipe.imageUrl || "");
      setMainImageFile(null);
      setDietary(editRecipe.dietary || []);
      setDifficulty(editRecipe.difficulty || "");
      setMealType(editRecipe.mealType || "");
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
    } else {
      setTitle("");
      setDescription("");
      setServings(4);
      setIngredients([{ name: "", quantity: undefined, unit: "", notes: "" }]);
      setSteps([{ text: "", imageUrl: undefined, imageFile: undefined }]);
      setStepsProgress([0]);
      setTags("");
      setMainImageFile(null);
      setMainImagePreview("");
      setMainImageProgress(0);
      setDietary([]);
      setDifficulty("");
      setMealType("");
      setMinActiveHours(0);
      setMinActiveMinutes(0);
      setMaxActiveHours(0);
      setMaxActiveMinutes(0);
      setMinPassiveHours(0);
      setMinPassiveMinutes(0);
      setMaxPassiveHours(0);
      setMaxPassiveMinutes(0);
      setHasPassiveTime(false);
    }
  }, [editRecipe]);

  const addIngredient = () =>
    setIngredients([
      ...ingredients,
      { name: "", quantity: undefined, unit: "", notes: "" },
    ]);
  const removeIngredient = (i: number) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[i] = { ...updated[i], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { text: "", imageUrl: undefined, imageFile: undefined },
    ]);
    setStepsProgress((prev) => [...prev, 0]);
  };
  const removeStep = (i: number) => {
    setSteps(steps.filter((_, idx) => idx !== i));
    setStepsProgress((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateStepText = (i: number, value: string) => {
    const updated = [...steps];
    updated[i].text = value;
    setSteps(updated);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // FIX 3: Add image validation check
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        e.target.value = ""; // Clear the input
        return;
      }

      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
      setMainImageProgress(0);
    }
  };

  const handleStepImageChange = (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // FIX 3: Add image validation check
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        e.target.value = ""; // Clear the input
        return;
      }

      const updated = [...steps];
      updated[i].imageFile = file;
      updated[i].imageUrl = URL.createObjectURL(file);
      setSteps(updated);
      setStepsProgress((prev) => {
        const newProgress = [...prev];
        newProgress[i] = 0;
        return newProgress;
      });
    }
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

  const draft = useMemo(
    () => ({
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
    }),
    [
      title,
      ingredients,
      steps,
      minActiveHours,
      minActiveMinutes,
      maxActiveHours,
      maxActiveMinutes,
    ]
  );

  useEffect(() => {
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
      setIsValid(false);
    } else {
      setErrors({});
      setIsValid(true);
    }
  }, [draft]);

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

    // FIX 4: Stricter check to prevent 0 or invalid numbers
    const parsedServings = parseInt(String(servings));
    // Clamping: If parsed value is NaN (empty input) or less than 1, default to 1
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
                  const newProgress = [...prev];
                  newProgress[idx] = p;
                  return newProgress;
                })
            );
          }
          return { text: step.text, imageUrl };
        })
      );

      const recipeData: any = {
        title: title.trim(),
        servings: finalServings, // Use the sanitized number
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
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-(--color-bg) rounded-l-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0_0_var(--color-shadow)]">
        <div className="flex justify-between items-center p-5 border-b-2 border-(--color-border) bg-(--color-bg-secondary) rounded-tl-3xl">
          <h2 className="text-2xl font-bold text-(--color-text) garet-heavy">
            {editRecipe ? "Edit Recipe" : "Create New Recipe"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full bg-(--color-danger) text-white font-bold text-xl hover:brightness-110 transition disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">
                Recipe Title *
              </label>
              <input
                type="text"
                className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary)"
                placeholder="Chocolate Chip Cookies"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="text-sm text-(--color-danger) mt-1">
                  {errors.title}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">
                Servings *
              </label>
              <input
                type="number"
                min="1"
                className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary)"
                value={servings}
                onChange={(e) => {
                  // FIX 5: Allow empty string to let user delete content, otherwise parse int
                  const val = e.target.value;
                  setServings(val === "" ? "" : parseInt(val));
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Description
            </label>
            <textarea
              className="w-full border-2 border-(--color-border)ded-lg p-2.5 bg-(--color-bg-secondary) text-[var,--color-text)] focus:outline-none focus:border-(--color-primary) min-h-20"
              placeholder="A brief description of your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Difficulty & Meal Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">
                Difficulty
              </label>
              <select
                className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary)"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            {/* Meal Type */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">
                Meal Type
              </label>
              <select
                className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary)"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="">Select meal type</option>
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary Options */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Dietary Options
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={
                    opt.value === "vegetarian" && dietary.includes("vegan")
                  }
                  onClick={() => toggleDietary(opt.value)}
                  className={`px-3 py-2 rounded-full text-sm font-semibold transition
                    ${
                      dietary.includes(opt.value)
                        ? "bg-(--color-success) text-white"
                        : "bg-(--color-bg-secondary) border-2 border-(--color-border) text-(--color-text)"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="border-2 border-(--color-border) rounded-lg p-4 bg-(--color-bg-secondary)">
            <label className="block text-sm font-semibold mb-3 text-(--color-text)">
              Time Information *
            </label>
            {errors.maxActivePrepTime && (
              <p className="text-sm text-[var,--color-danger)] mt-2">
                {errors.maxActivePrepTime}
              </p>
            )}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-2 text-(--color-text-muted)">
                Active Prep Time *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={minActiveHours || ""}
                    onChange={(e) =>
                      setMinActiveHours(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center text-(--color-text-muted)">
                    h
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={minActiveMinutes || ""}
                    onChange={(e) =>
                      setMinActiveMinutes(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center text-(--color-text-muted)">
                    m
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={maxActiveHours || ""}
                    onChange={(e) =>
                      setMaxActiveHours(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center text-(--color-text-muted)">
                    h
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={maxActiveMinutes || ""}
                    onChange={(e) =>
                      setMaxActiveMinutes(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center text-(--color-text-muted)">
                    m
                  </span>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={hasPassiveTime}
                onChange={(e) => setHasPassiveTime(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-(--color-text)">
                Add passive time
              </span>
            </label>
            {hasPassiveTime && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={minPassiveHours || ""}
                    onChange={(e) =>
                      setMinPassiveHours(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center">h</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={minPassiveMinutes || ""}
                    onChange={(e) =>
                      setMinPassiveMinutes(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center">m</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={maxPassiveHours || ""}
                    onChange={(e) =>
                      setMaxPassiveHours(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center">h</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
                    placeholder="0"
                    value={maxPassiveMinutes || ""}
                    onChange={(e) =>
                      setMaxPassiveMinutes(parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs self-center">m</span>
                </div>
              </div>
            )}
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Recipe Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="w-full border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-[var,--color-text)] text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-(--color-primary) file:text-white file:cursor-pointer"
            />
            {mainImagePreview && (
              <img
                src={mainImagePreview}
                alt="Preview"
                className="mt-2 w-full h-40 object-cover rounded-lg border-2 border-(--color-border)"
              />
            )}
            {mainImageFile &&
              mainImageProgress > 0 &&
              mainImageProgress < 100 && (
                <div className="mt-2 w-full bg-(--color-bg-secondary) rounded-full h-2">
                  <div
                    className="h-2 bg-(--color-primary) rounded-full transition-all"
                    style={{ width: `${mainImageProgress}%` }}
                  />
                </div>
              )}
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Ingredients *
            </label>
            {errors.ingredients && (
              <p className="text-sm text-(--color-danger) mt-1">
                {errors.ingredients}
              </p>
            )}
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <input
                    type="text"
                    className="col-span-5 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-[var,--color-text)] text-sm"
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(i, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="col-span-2 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary)-[var(--color-text)] text-sm"
                    placeholder="Qty"
                    value={ing.quantity ?? ""}
                    onChange={(e) =>
                      updateIngredient(i, "quantity", e.target.value)
                    }
                  />
                  <select
                    className="col-span-2 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-[var,--color-text)] text-sm"
                    value={ing.unit || ""}
                    onChange={(e) =>
                      updateIngredient(i, "unit", e.target.value)
                    }
                  >
                    <option value="">Unit</option>
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="col-span-2 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-[var,--color-text)] text-sm"
                    placeholder="Notes"
                    value={ing.notes || ""}
                    onChange={(e) =>
                      updateIngredient(i, "notes", e.target.value)
                    }
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="col-span-1 px-2 h-10 rounded-full bg-(--color-danger) text-white hover:brightness-110"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="text-(--color-primary) hover:text-(--color-secondary) font-semibold text-sm"
              >
                + Add Ingredient
              </button>
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Steps *
            </label>
            {errors.steps && (
              <p className="text-sm text-(--color-danger) mt-1">
                {errors.steps}
              </p>
            )}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="border-2 border-(--color-border) rounded-lg p-3 bg-(--color-bg-secondary)"
                >
                  <div className="flex gap-2 mb-2">
                    <span className="font-bold text-(--color-primary)">
                      {i + 1}.
                    </span>
                    <textarea
                      className="flex-1 border border-(--color-border) rounded p-2 bg-(--color-bg) text-[var,--color-text)] min-h-16 text-sm"
                      placeholder={`Step ${i + 1}`}
                      value={step.text}
                      onChange={(e) => updateStepText(i, e.target.value)}
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="px-3 h-8 rounded-full bg-(--color-danger) text-white hover:brightness-110"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleStepImageChange(i, e)}
                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-(--color-secondary) file:text-white file:cursor-pointer"
                  />
                  {step.imageUrl && (
                    <img
                      src={step.imageUrl}
                      alt={`Step ${i + 1}`}
                      className="mt-2 w-full h-24 object-cover rounded border border-(--color-border)"
                    />
                  )}
                  {step.imageFile &&
                    stepsProgress[i] > 0 &&
                    stepsProgress[i] < 100 && (
                      <div className="mt-1 w-full bg-(--color-bg) rounded-full h-1.5">
                        <div
                          className="h-1.5 bg-(--color-success) rounded-full transition-all"
                          style={{ width: `${stepsProgress[i]}%` }}
                        />
                      </div>
                    )}
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="text-(--color-primary) hover:text-(--color-secondary) font-semibold text-sm"
              >
                + Add Step
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Tags
            </label>
            <input
              type="text"
              className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-[var,--color-text)]"
              placeholder="dessert, baking, quick (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t-2 border-(--color-border) bg-(--color-bg-secondary) rounded-bl-3xl">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="flex-1 bg-(--color-primary) text-white py-3 rounded-full font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
            className="px-6 py-3 rounded-full border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-bg) transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
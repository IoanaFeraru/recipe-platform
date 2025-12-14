"use client";

import { useState, useEffect } from "react";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    ingredients: string[];
    steps: Array<{ text: string; imageUrl?: string }>;
    tags: string[];
    imageUrl?: string;
    isVegetarian: boolean;
    isVegan: boolean;
    minActivePrepTime: number;
    maxActivePrepTime: number;
    minPassiveTime?: number;
    maxPassiveTime?: number;
  }) => Promise<void>;
  editRecipe?: {
    id?: string;
    title: string;
    ingredients: string[];
    steps: Array<{ text: string; imageUrl?: string }>;
    tags: string[];
    imageUrl?: string;
    isVegetarian: boolean;
    isVegan: boolean;
    minActivePrepTime: number;
    maxActivePrepTime: number;
    minPassiveTime?: number;
    maxPassiveTime?: number;
  } | null;
}

export default function RecipeModal({ isOpen, onClose, onSubmit, editRecipe }: RecipeModalProps) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<Array<{ text: string; imageUrl?: string; imageFile?: File }>>([{ text: "", imageUrl: undefined, imageFile: undefined }]);
  const [tags, setTags] = useState("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [mainImageProgress, setMainImageProgress] = useState(0);
  const [stepsProgress, setStepsProgress] = useState<number[]>(steps.map(() => 0));
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [minActiveHours, setMinActiveHours] = useState<number>(0);
  const [minActiveMinutes, setMinActiveMinutes] = useState<number>(0);
  const [maxActiveHours, setMaxActiveHours] = useState<number>(0);
  const [maxActiveMinutes, setMaxActiveMinutes] = useState<number>(0);
  const [minPassiveHours, setMinPassiveHours] = useState<number>(0);
  const [minPassiveMinutes, setMinPassiveMinutes] = useState<number>(0);
  const [maxPassiveHours, setMaxPassiveHours] = useState<number>(0);
  const [maxPassiveMinutes, setMaxPassiveMinutes] = useState<number>(0);
  const [hasPassiveTime, setHasPassiveTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editRecipe) {
      setTitle(editRecipe.title);
      setIngredients(editRecipe.ingredients);
      setSteps(editRecipe.steps.map(s => ({ text: s.text, imageUrl: s.imageUrl, imageFile: undefined })));
      setStepsProgress(editRecipe.steps.map(() => 0));
      setTags(editRecipe.tags.join(", "));
      setMainImagePreview(editRecipe.imageUrl || "");
      setMainImageFile(null);
      setIsVegetarian(editRecipe.isVegetarian);
      setIsVegan(editRecipe.isVegan);
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
      } else {
        setHasPassiveTime(false);
        setMinPassiveHours(0);
        setMinPassiveMinutes(0);
        setMaxPassiveHours(0);
        setMaxPassiveMinutes(0);
      }
    } else {
      // Reset form when creating new recipe
      setTitle("");
      setIngredients([""]);
      setSteps([{ text: "", imageUrl: undefined, imageFile: undefined }]);
      setStepsProgress([0]);
      setTags("");
      setMainImageFile(null);
      setMainImagePreview("");
      setMainImageProgress(0);
      setIsVegetarian(false);
      setIsVegan(false);
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

  if (!isOpen) return null;

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, { text: "", imageUrl: undefined, imageFile: undefined }]);
    setStepsProgress(prev => [...prev, 0]);
  };
  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    setStepsProgress(prev => prev.filter((_, i) => i !== index));
  };
  const updateStepText = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].text = value;
    setSteps(newSteps);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
      setMainImageProgress(0);
    }
  };

  const handleStepImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newSteps = [...steps];
      newSteps[index].imageFile = file;
      newSteps[index].imageUrl = URL.createObjectURL(file);
      setSteps(newSteps);
      setStepsProgress(prev => {
        const newProgress = [...prev];
        newProgress[index] = 0;
        return newProgress;
      });
    }
  };

  const uploadImageWithProgress = (file: File, path: string, onProgress: (percent: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    const validIngredients = ingredients.filter(i => i.trim() !== "");
    const validSteps = steps.filter(s => s.text.trim() !== "");
    const validTags = tags.split(",").map(t => t.trim()).filter(t => t !== "");

    const minActivePrepTime = minActiveHours * 60 + minActiveMinutes;
    const maxActivePrepTime = maxActiveHours * 60 + maxActiveMinutes;
    const minPassiveTime = minPassiveHours * 60 + minPassiveMinutes;
    const maxPassiveTime = maxPassiveHours * 60 + maxPassiveMinutes;

    if (!title.trim() || validIngredients.length === 0 || validSteps.length === 0) {
      alert("Please fill in title, at least one ingredient, and at least one step");
      return;
    }

    if (minActivePrepTime <= 0 || maxActivePrepTime <= 0 || minActivePrepTime > maxActivePrepTime) {
      alert("Please enter valid active prep time range");
      return;
    }

    if (hasPassiveTime && (minPassiveTime <= 0 || maxPassiveTime <= 0 || minPassiveTime > maxPassiveTime)) {
      alert("Please enter valid passive time range");
      return;
    }

    setIsSubmitting(true);
    try {
      let mainImageUrl = mainImagePreview;
      if (mainImageFile) {
        mainImageUrl = await uploadImageWithProgress(
          mainImageFile,
          `recipes/${Date.now()}_${mainImageFile.name}`,
          (p) => setMainImageProgress(p)
        );
      }

      const stepsWithImages = await Promise.all(
        validSteps.map(async (step, idx) => {
          if (step.imageFile) {
            const imageUrl = await uploadImageWithProgress(
              step.imageFile,
              `recipes/steps/${Date.now()}_${step.imageFile.name}`,
              (p) => setStepsProgress(prev => {
                const newProgress = [...prev];
                newProgress[idx] = p;
                return newProgress;
              })
            );
            return { text: step.text, imageUrl };
          }
          return { text: step.text, imageUrl: step.imageUrl };
        })
      );

      await onSubmit({
        title: title.trim(),
        ingredients: validIngredients,
        steps: stepsWithImages,
        tags: validTags,
        imageUrl: mainImageUrl || undefined,
        isVegetarian,
        isVegan,
        minActivePrepTime,
        maxActivePrepTime,
        minPassiveTime: hasPassiveTime ? minPassiveTime : undefined,
        maxPassiveTime: hasPassiveTime ? maxPassiveTime : undefined,
      });

      setTitle("");
      setIngredients([""]);
      setSteps([{ text: "", imageUrl: undefined, imageFile: undefined }]);
      setStepsProgress([0]);
      setTags("");
      setMainImageFile(null);
      setMainImagePreview("");
      setMainImageProgress(0);
      setIsVegetarian(false);
      setIsVegan(false);
      setMinActiveHours(0);
      setMinActiveMinutes(0);
      setMaxActiveHours(0);
      setMaxActiveMinutes(0);
      setMinPassiveHours(0);
      setMinPassiveMinutes(0);
      setMaxPassiveHours(0);
      setMaxPassiveMinutes(0);
      setHasPassiveTime(false);
      onClose();
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-bg-secondary);
          border-radius: 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: var(--radius-lg);
          border: 2px solid var(--color-bg-secondary);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-secondary);
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-(--color-bg) rounded-l-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[8px_8px_0_0_var(--color-shadow)]">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b-2 border-(--color-border) bg-(--color-bg-secondary) rounded-tl-3xl">
            <h2 className="text-2xl font-bold text-(--color-text) garet-heavy">
              {editRecipe ? 'Edit Recipe' : 'Create New Recipe'}
            </h2>
            <button 
              onClick={onClose} 
              disabled={isSubmitting}
              className="w-10 h-10 rounded-full bg-(--color-danger) text-white font-bold text-xl hover:brightness-110 transition disabled:opacity-50"
            >
              ×
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto custom-scrollbar flex-1 p-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">Recipe Title *</label>
              <input 
                type="text"
                className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary)"
                placeholder="Chocolate Chip Cookies"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Time Information */}
            <div className="border-2 border-(--color-border) rounded-lg p-4 bg-(--color-bg-secondary)">
              <label className="block text-sm font-semibold mb-3 text-(--color-text)">Time Information *</label>
              
              {/* Active Time */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-2 text-(--color-text-muted)">Active Prep Time *</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex gap-2">
                    <input type="number" min="0" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={minActiveHours || ""} onChange={(e) => setMinActiveHours(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">h</span>
                    <input type="number" min="0" max="59" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={minActiveMinutes || ""} onChange={(e) => setMinActiveMinutes(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">m</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" min="0" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={maxActiveHours || ""} onChange={(e) => setMaxActiveHours(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">h</span>
                    <input type="number" min="0" max="59" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={maxActiveMinutes || ""} onChange={(e) => setMaxActiveMinutes(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">m</span>
                  </div>
                </div>
              </div>

              {/* Passive Time */}
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={hasPassiveTime} onChange={(e) => setHasPassiveTime(e.target.checked)} className="w-4 h-4 accent-(--color-primary)" />
                <span className="text-sm text-(--color-text)">Add passive time</span>
              </label>
              
              {hasPassiveTime && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex gap-2">
                    <input type="number" min="0" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={minPassiveHours || ""} onChange={(e) => setMinPassiveHours(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">h</span>
                    <input type="number" min="0" max="59" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={minPassiveMinutes || ""} onChange={(e) => setMinPassiveMinutes(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">m</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" min="0" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={maxPassiveHours || ""} onChange={(e) => setMaxPassiveHours(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">h</span>
                    <input type="number" min="0" max="59" className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm" placeholder="0" value={maxPassiveMinutes || ""} onChange={(e) => setMaxPassiveMinutes(parseInt(e.target.value) || 0)} />
                    <span className="text-xs self-center text-(--color-text-muted)">m</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dietary */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isVegetarian} onChange={(e) => setIsVegetarian(e.target.checked)} className="w-4 h-4 accent-(--color-success)" />
                <span className="text-sm text-(--color-text)">🌱 Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isVegan} onChange={(e) => setIsVegan(e.target.checked)} className="w-4 h-4 accent-(--color-success)" />
                <span className="text-sm text-(--color-text)">🌿 Vegan</span>
              </label>
            </div>

            {/* Main Image */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">Recipe Image</label>
              <input type="file" accept="image/*" onChange={handleMainImageChange} className="w-full border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-(--color-primary) file:text-white file:cursor-pointer" />
              {mainImagePreview && <img src={mainImagePreview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg border-2 border-(--color-border)" />}
              {mainImageFile && mainImageProgress > 0 && mainImageProgress < 100 && (
                <div className="mt-2 w-full bg-(--color-bg-secondary) rounded-full h-2">
                  <div className="h-2 bg-(--color-primary) rounded-full transition-all" style={{ width: `${mainImageProgress}%` }} />
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">Ingredients *</label>
              <div className="space-y-2">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" className="flex-1 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text)" placeholder={`Ingredient ${i + 1}`} value={ing} onChange={(e) => updateIngredient(i, e.target.value)} />
                    {ingredients.length > 1 && (
                      <button type="button" onClick={() => removeIngredient(i)} className="px-3 rounded-full bg-(--color-danger) text-white hover:brightness-110">×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addIngredient} className="text-(--color-primary) hover:text-(--color-secondary) font-semibold text-sm">+ Add Ingredient</button>
              </div>
            </div>

            {/* Steps */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">Steps *</label>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className="border-2 border-(--color-border) rounded-lg p-3 bg-(--color-bg-secondary)">
                    <div className="flex gap-2 mb-2">
                      <span className="font-bold text-(--color-primary)">{i + 1}.</span>
                      <textarea className="flex-1 border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) min-h-16 text-sm" placeholder={`Step ${i + 1}`} value={step.text} onChange={(e) => updateStepText(i, e.target.value)} />
                      {steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(i)} className="px-3 h-8 rounded-full bg-(--color-danger) text-white hover:brightness-110">×</button>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleStepImageChange(i, e)} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-(--color-secondary) file:text-white file:cursor-pointer" />
                    {step.imageUrl && <img src={step.imageUrl} alt={`Step ${i + 1}`} className="mt-2 w-full h-24 object-cover rounded border border-(--color-border)" />}
                    {step.imageFile && stepsProgress[i] > 0 && stepsProgress[i] < 100 && (
                      <div className="mt-1 w-full bg-(--color-bg) rounded-full h-1.5">
                        <div className="h-1.5 bg-(--color-success) rounded-full transition-all" style={{ width: `${stepsProgress[i]}%` }} />
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addStep} className="text-(--color-primary) hover:text-(--color-secondary) font-semibold text-sm">+ Add Step</button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">Tags</label>
              <input type="text" className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text)" placeholder="dessert, baking, quick" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t-2 border-(--color-border) bg-(--color-bg-secondary) rounded-bl-3xl">
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-(--color-primary) text-white py-3 rounded-full font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] hover:brightness-110 disabled:opacity-50 transition">
              {isSubmitting ? (editRecipe ? "Updating..." : "Creating...") : (editRecipe ? "Update Recipe" : "Create Recipe")}
            </button>
            <button onClick={onClose} disabled={isSubmitting} className="flex-1 bg-(--color-bg) border-2 border-(--color-border) text-(--color-text) py-3 rounded-full font-semibold hover:bg-(--color-bg-secondary) disabled:opacity-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
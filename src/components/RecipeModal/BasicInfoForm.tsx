"use client";

import React from "react";

interface BasicInfoFormProps {
  title: string;
  description: string;
  servings: number | string;
  difficulty: string;
  mealType: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onServingsChange: (value: number | string) => void;
  onDifficultyChange: (value: string) => void;
  onMealTypeChange: (value: string) => void;
  errors?: {
    title?: string;
    servings?: string;
  };
}

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

/**
 * BasicInfoForm - Basic recipe information fields
 */
export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  title,
  description,
  servings,
  difficulty,
  mealType,
  onTitleChange,
  onDescriptionChange,
  onServingsChange,
  onDifficultyChange,
  onMealTypeChange,
  errors,
}) => {
  return (
    <div className="space-y-5">
      {/* Title & Servings Row */}
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
            onChange={(e) => onTitleChange(e.target.value)}
          />
          {errors?.title && (
            <p className="text-sm text-(--color-danger) mt-1">{errors.title}</p>
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
              const val = e.target.value;
              onServingsChange(val === "" ? "" : parseInt(val));
            }}
          />
          {errors?.servings && (
            <p className="text-sm text-(--color-danger) mt-1">{errors.servings}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-(--color-text)">
          Description
        </label>
        <textarea
          className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary) min-h-20"
          placeholder="A brief description of your recipe..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      {/* Difficulty & Meal Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-(--color-text)">
            Difficulty
          </label>
          <select
            className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary)"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-(--color-text)">
            Meal Type
          </label>
          <select
            className="w-full border-2 border-(--color-border) rounded-lg p-2.5 bg-(--color-bg-secondary) text-(--color-text) focus:outline-none focus:border-(--color-primary)"
            value={mealType}
            onChange={(e) => onMealTypeChange(e.target.value)}
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
    </div>
  );
};
"use client";

import React from "react";

interface MealTypeFilterProps {
  mealType: string;
  onMealTypeChange: (mealType: string) => void;
}

const MEAL_TYPES = [
  { value: "Breakfast", icon: "🌅" },
  { value: "Brunch", icon: "🥐" },
  { value: "Lunch", icon: "🍱" },
  { value: "Dinner", icon: "🍽️" },
  { value: "Snack", icon: "🍿" },
  { value: "Dessert", icon: "🍰" },
  { value: "Appetizer", icon: "🥗" },
  { value: "Other", icon: "🍴" },
];

/**
 * MealTypeFilter - Meal type selector with beautiful dropdown
 * Enhanced with icons and styling
 */
export const MealTypeFilter: React.FC<MealTypeFilterProps> = ({
  mealType,
  onMealTypeChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-(--color-text)">
        🍽️ Meal Type
      </label>
      <select
        value={mealType || ""}
        onChange={(e) => onMealTypeChange(e.target.value)}
        className="w-full border-2 border-(--color-border) rounded-lg px-4 py-2 bg-(--color-bg) text-(--color-text) font-semibold focus:outline-none focus:border-(--color-primary) cursor-pointer transition-all hover:border-(--color-primary)"
      >
        <option value="">All Meal Types</option>
        {MEAL_TYPES.map((meal) => (
          <option key={meal.value} value={meal.value}>
            {meal.icon} {meal.value}
          </option>
        ))}
      </select>
    </div>
  );
};
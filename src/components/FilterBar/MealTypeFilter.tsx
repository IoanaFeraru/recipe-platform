"use client";

/**
 * MealTypeFilter component.
 *
 * Renders a controlled dropdown for filtering recipes by meal type. The component
 * is intentionally stateless and delegates selection state to the parent via
 * `mealType` and `onMealTypeChange`, enabling predictable state management and
 * easy integration into larger filter toolbars.
 *
 * Responsibilities:
 * - Display a labeled select input for meal type selection
 * - Provide an “all meal types” option (empty value) to clear the filter
 * - Surface a curated set of meal type options with friendly icons for quick scanning
 *
 * @component
 * @param {MealTypeFilterProps} props - Component props.
 * @param {string} props.mealType - Currently selected meal type (empty string means no filter).
 * @param {(mealType: string) => void} props.onMealTypeChange - Callback invoked when selection changes.
 * @returns {JSX.Element} Meal type select control.
 *
 * @example
 * ```tsx
 * const [mealType, setMealType] = useState("");
 *
 * <MealTypeFilter
 *   mealType={mealType}
 *   onMealTypeChange={setMealType}
 * />
 * ```
 */

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
 * MealTypeFilter - Meal type selector with icon-enhanced dropdown options.
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
        aria-label="Filter by meal type"
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
"use client";

/**
 * DietaryFilter component.
 *
 * Provides a multi-select interface for filtering recipes by dietary
 * preferences (e.g., vegetarian, vegan, gluten-free). Users can toggle
 * individual dietary options on or off, and the component emits the
 * updated selection set to its parent.
 *
 * Responsibilities:
 * - Render all supported dietary options as selectable badges
 * - Maintain selection state externally via controlled props
 * - Notify parent components of selection changes
 *
 * Behavior:
 * - Clicking a badge toggles its presence in the dietary filter list
 * - Selected options are visually emphasized
 * - Displays a count of selected dietary filters when applicable
 *
 * Design notes:
 * - Uses a badge-style button layout for quick scanning and interaction
 * - Color and scale changes provide immediate visual feedback
 * - Stateless and fully controlled by props for predictable behavior
 *
 * @module DietaryFilter
 */

import React from "react";
import { DietaryOption } from "@/types/recipe";

interface DietaryFilterProps {
  dietary: DietaryOption[];
  onDietaryChange: (dietary: DietaryOption[]) => void;
}

const DIETARY_OPTIONS: Array<{
  value: DietaryOption;
  label: string;
  icon: string;
}> = [
  { value: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { value: "vegan", label: "Vegan", icon: "🌿" },
  { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { value: "glutenFree", label: "Gluten-Free", icon: "🌾" },
  { value: "dairyFree", label: "Dairy-Free", icon: "🥛" },
  { value: "nutFree", label: "Nut-Free", icon: "🥜" },
  { value: "halal", label: "Halal", icon: "☪️" },
  { value: "kosher", label: "Kosher", icon: "✡️" },
];

export const DietaryFilter: React.FC<DietaryFilterProps> = ({
  dietary,
  onDietaryChange,
}) => {
  const toggleDietary = (value: DietaryOption) => {
    const newDietary = dietary.includes(value)
      ? dietary.filter((d) => d !== value)
      : [...dietary, value];

    onDietaryChange(newDietary);
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-(--color-text)">
        🥗 Dietary Preferences
        {dietary.length > 0 && (
          <span className="ml-2 text-xs text-(--color-text-muted)">
            ({dietary.length} selected)
          </span>
        )}
      </label>

      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleDietary(option.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${
                dietary.includes(option.value)
                  ? "bg-(--color-success) text-white shadow-[2px_2px_0_0_var(--color-shadow)] scale-105"
                  : "bg-(--color-bg) border-2 border-(--color-border) text-(--color-text) hover:border-(--color-success) hover:scale-105"
              }
            `}
            aria-label={`Toggle ${option.label}`}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
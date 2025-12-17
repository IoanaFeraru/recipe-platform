/**
 * DietaryOptionsSelector component.
 *
 * Renders a multi-select control for recipe dietary restrictions. Each option is displayed
 * as a pill-style button with an icon and label, and selection is controlled externally
 * via the `selected` array and `onToggle` callback.
 *
 * Business rules:
 * - If "vegan" is selected, "vegetarian" becomes non-interactive (disabled) to prevent
 *   contradictory user input, since vegan implies vegetarian in the domain model.
 * - Selection state is derived from `selected` and is not stored locally, ensuring a
 *   single source of truth in the parent form/hook.
 *
 * UX/accessibility notes:
 * - Uses semantic `<button type="button">` elements for keyboard accessibility.
 * - Disabled states communicate non-interactive options (reduced opacity/cursor).
 * - Styling aligns with the application theme via CSS custom properties.
 *
 * @param {DietaryOptionsProps} props - Controlled selection state and toggle handler.
 * @returns A labeled, responsive set of selectable dietary option pills.
 */

"use client";

import React from "react";

interface DietaryOptionsProps {
  selected: string[];
  onToggle: (value: string) => void;
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

export const DietaryOptionsSelector: React.FC<DietaryOptionsProps> = ({
  selected,
  onToggle,
}) => {
  const isSelected = (value: string) => selected.includes(value);

  const isDisabled = (value: string) => {
    return value === "vegetarian" && selected.includes("vegan");
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-(--color-text)">
        Dietary Options
      </label>

      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={isDisabled(opt.value)}
            onClick={() => onToggle(opt.value)}
            className={`px-3 py-2 rounded-full text-sm font-semibold transition
              ${
                isSelected(opt.value)
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
  );
};
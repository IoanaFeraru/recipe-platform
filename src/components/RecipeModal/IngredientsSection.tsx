/**
 * IngredientsSection component.
 *
 * Renders and manages an editable list of recipe ingredients, including name,
 * optional quantity, optional unit selection, and optional notes. The component
 * is intentionally “controlled”: all mutations are delegated to the parent via
 * callbacks, keeping this component presentation-focused and predictable.
 *
 * Responsibilities:
 * - Displays an ingredient editor row for each ingredient in the provided array
 * - Supports adding new ingredient rows and removing existing rows
 * - Emits field-level updates (name, quantity, unit, notes) to the parent
 * - Optionally displays a section-level validation error message
 *
 * Business/UI rules:
 * - At least one ingredient row must remain (remove button is hidden when only one row exists)
 * - Quantity input is permissive but constrained to numeric decimal formats (e.g., "2", "2.5")
 * - Unit selection is restricted to a predefined list to promote consistent data entry
 *
 * Accessibility:
 * - Remove action includes an aria-label for screen reader clarity
 * - Uses semantic form controls (input/select/button) for keyboard navigation
 *
 * @param {IngredientsSectionProps} props - Controlled ingredient list state and mutation handlers.
 * @returns A form section for editing ingredient rows with add/remove and validation display.
 */

"use client";

import React from "react";

interface Ingredient {
  name: string;
  quantity?: string | number;
  unit?: string;
  notes?: string;
}

interface IngredientsSectionProps {
  ingredients: Ingredient[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof Ingredient, value: any) => void;
  errors?: {
    ingredients?: string;
  };
}

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

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredients,
  onAdd,
  onRemove,
  onUpdate,
  errors,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-(--color-text)">
        Ingredients *
      </label>

      {errors?.ingredients && (
        <p className="text-sm text-(--color-danger) mb-2">
          {errors.ingredients}
        </p>
      )}

      <div className="space-y-2">
        {ingredients.map((ing, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start">
            <input
              type="text"
              className="col-span-5 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
              placeholder="Ingredient name"
              value={ing.name}
              onChange={(e) => onUpdate(i, "name", e.target.value)}
            />

            <input
              type="text"
              inputMode="decimal"
              className="col-span-2 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
              placeholder="Qty"
              value={ing.quantity ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  onUpdate(i, "quantity", value);
                }
              }}
            />

            <select
              className="col-span-2 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
              value={ing.unit || ""}
              onChange={(e) => onUpdate(i, "unit", e.target.value)}
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
              className="col-span-2 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
              placeholder="Notes"
              value={ing.notes || ""}
              onChange={(e) => onUpdate(i, "notes", e.target.value)}
            />

            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="col-span-1 px-2 h-10 rounded-full bg-(--color-danger) text-white hover:brightness-110 transition text-lg font-bold"
                aria-label="Remove ingredient"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="text-(--color-primary) hover:text-(--color-secondary) font-semibold text-sm transition"
        >
          + Add Ingredient
        </button>
      </div>
    </div>
  );
};
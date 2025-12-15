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

/**
 * IngredientsSection - Ingredient list management
 * Add, remove, and update ingredients with quantities and units
 */
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
            {/* Name */}
            <input
              type="text"
              className="col-span-5 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
              placeholder="Ingredient name"
              value={ing.name}
              onChange={(e) => onUpdate(i, "name", e.target.value)}
            />

            {/* Quantity */}
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

            {/* Unit */}
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

            {/* Notes */}
            <input
              type="text"
              className="col-span-2 border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
              placeholder="Notes"
              value={ing.notes || ""}
              onChange={(e) => onUpdate(i, "notes", e.target.value)}
            />

            {/* Remove Button */}
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

        {/* Add Button */}
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
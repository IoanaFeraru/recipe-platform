"use client";

import { useState } from "react";
import { DietaryOption } from "@/types/recipe";
import Tag from "./Tag/Tag";

export type SortOption =
  | "az"
  | "za"
  | "dateDesc"
  | "dateAsc"
  | "ratingDesc"
  | "popularityDesc";

interface FilterBarProps {
  dietary: DietaryOption[];
  setDietary: (v: DietaryOption[]) => void;

  difficulty: "easy" | "medium" | "hard" | null;
  setDifficulty: (v: "easy" | "medium" | "hard" | null) => void;

  mealType: string;
  setMealType: (v: string) => void;

  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
}

const DIETARY_OPTIONS: { value: DietaryOption; label: string; icon: string }[] =
  [
    { value: "vegetarian", label: "Vegetarian", icon: "🌱" },
    { value: "vegan", label: "Vegan", icon: "🌿" },
    { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
    { value: "glutenFree", label: "Gluten-Free", icon: "🌾" },
    { value: "dairyFree", label: "Dairy-Free", icon: "🥛" },
    { value: "nutFree", label: "Nut-Free", icon: "🥜" },
    { value: "halal", label: "Halal", icon: "☪️" },
    { value: "kosher", label: "Kosher", icon: "✡️" },
  ];

const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Brunch",
  "Appetizer",
  "Other",
];

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: "dateDesc", label: "Newest First", icon: "🆕" },
  { value: "ratingDesc", label: "Top Rated", icon: "⭐" }, // NEW
  { value: "popularityDesc", label: "Most Popular", icon: "🔥" }, // NEW
  { value: "dateAsc", label: "Oldest First", icon: "📜" },
  { value: "az", label: "A → Z", icon: "🔤" },
  { value: "za", label: "Z → A", icon: "🔡" },
];

export default function FilterBar({
  dietary,
  setDietary,
  difficulty,
  setDifficulty,
  mealType,
  setMealType,
  sortBy,
  setSortBy,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleDietary = (value: DietaryOption) => {
    setDietary(
      dietary.includes(value)
        ? dietary.filter((d) => d !== value)
        : [...dietary, value]
    );
  };

  const resetFilters = () => {
    setDietary([]);
    setDifficulty(null);
    setMealType("");
    setSortBy("dateDesc"); 
  };

  const activeFiltersCount =
    dietary.length + (difficulty ? 1 : 0) + (mealType ? 1 : 0);

  return (
    <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-5 mb-8 shadow-[4px_4px_0_0_var(--color-shadow)]">
      {/* Top Bar - Always Visible */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border-2 border-(--color-border) rounded-full px-4 py-2 bg-(--color-bg) text-(--color-text) font-semibold focus:outline-none focus:border-(--color-primary) cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>

          {/* Show/Hide Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-2 rounded-full bg-(--color-primary) text-white font-semibold hover:brightness-110 transition shadow-[2px_2px_0_0_var(--color-shadow)]"
          >
            {showFilters ? "🔼 Hide" : "🔽 Show"} Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-white text-(--color-primary) px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-full border-2 border-(--color-danger) text-(--color-danger) hover:bg-(--color-danger) hover:text-white transition font-semibold"
          >
            ♻️ Reset All
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-5 pt-5 border-t-2 border-(--color-border) space-y-5">
          {/* Dietary Options */}
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
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleDietary(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    dietary.includes(opt.value)
                      ? "bg-(--color-success) text-white shadow-[2px_2px_0_0_var(--color-shadow)]"
                      : "bg-(--color-bg) border-2 border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary)"
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Meal Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-(--color-text)">
                🎯 Difficulty Level
              </label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(difficulty === d ? null : d)}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition ${
                      difficulty === d
                        ? d === "easy"
                          ? "bg-(--color-success) text-white shadow-[2px_2px_0_0_var(--color-shadow)]"
                          : d === "medium"
                          ? "bg-(--color-warning)-white shadow-[2px_2px_0_0_var(--color-shadow)]"
                          : "bg-(--color-danger) text-white shadow-[2px_2px_0_0_var(--color-shadow)]"
                        : "bg-(--color-bg) border-2 border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary)"
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Type */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-(--color-text)">
                🍽️ Meal Type
              </label>
              <select
                value={mealType || ""}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full border-2 border-(--color-border) rounded-lg px-4 py-2 bg-(--color-bg) text-(--color-text) font-semibold focus:outline-none focus:border-(--color-primary) cursor-pointer"
              >
                <option value="">All Meal Types</option>
                {MEAL_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="pt-3 border-t-2 border-(--color-border)">
              <p className="text-sm font-semibold text-(--color-text) mb-2">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {dietary.map((d) => {
                  const opt = DIETARY_OPTIONS.find((o) => o.value === d);
                  return (
                    <Tag
                      key={d}
                      label={`${opt?.icon} ${opt?.label}`}
                      removable
                      onRemove={() => toggleDietary(d)}
                    />
                  );
                })}
                {difficulty && (
                  <Tag
                    label={`🎯 ${
                      difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
                    }`}
                    removable
                    onRemove={() => setDifficulty(null)}
                  />
                )}
                {mealType && (
                  <Tag
                    label={`🍽️ ${mealType}`}
                    removable
                    onRemove={() => setMealType("")}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
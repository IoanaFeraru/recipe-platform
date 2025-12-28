"use client";

/**
 * FilterBar component.
 *
 * Provides a consolidated UI for sorting and filtering recipe lists. This component
 * coordinates multiple filter sub-components (dietary, difficulty, meal type) and
 * exposes a controlled API via props so that the parent page owns filter state.
 *
 * Responsibilities:
 * - Render sort controls and propagate sort option changes to the parent
 * - Toggle visibility of advanced filters (collapsible panel)
 * - Compute and display the current number of active filters
 * - Provide a one-click reset that restores default sorting and clears filters
 * - Wire “remove filter” actions from ActiveFiltersDisplay back into parent state
 *
 * Composition:
 * - SortButtons: sort option selection
 * - DietaryFilter: multi-select dietary preferences
 * - DifficultySlider: single-select (toggleable) difficulty selection
 * - MealTypeFilter: single-select meal type filter
 * - ActiveFiltersDisplay: chip/tag display for active filters with remove actions
 *
 * UX notes:
 * - Filter panel is collapsible to preserve screen real estate
 * - Active filter count is surfaced directly on the toggle button
 * - Reset action is only shown when filters are active
 *
 * @module FilterBar
 */

import { useState } from "react";
import { DietaryOption } from "@/types/recipe";
import { SortButtons } from "./SortButtons";
import { DietaryFilter } from "./DietaryFilter";
import { DifficultySlider } from "./DifficultySlider";
import { MealTypeFilter } from "./MealTypeFilter";
import { ActiveFiltersDisplay } from "./ActiveFiltersDisplay";

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

  const resetFilters = () => {
    setDietary([]);
    setDifficulty(null);
    setMealType("");
    setSortBy("dateDesc");
  };

  const activeFiltersCount =
    dietary.length + (difficulty ? 1 : 0) + (mealType ? 1 : 0);

  const toggleDietary = (value: DietaryOption) => {
    setDietary(
      dietary.includes(value)
        ? dietary.filter((d) => d !== value)
        : [...dietary, value]
    );
  };

  return (
    <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-3 sm:p-6 mb-4 sm:mb-8 shadow-[4px_4px_0_0_var(--color-shadow)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 pt-2 border-t-2 border-(--color-border)">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
            <label className="text-sm font-semibold text-(--color-text) whitespace-nowrap">
              📊 Sort By
            </label>
            <SortButtons sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-(--color-primary) text-white font-semibold hover:brightness-110 transition shadow-[2px_2px_0_0_var(--color-shadow)] text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
          >
            {showFilters ? "🔼 Hide" : "🔽 Show"} Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-white text-(--color-primary) px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="px-4 sm:px-5 py-2 sm:py-3 rounded-full border-2 border-(--color-danger) text-(--color-danger) hover:bg-(--color-danger) hover:text-white transition font-semibold text-sm sm:text-base w-full sm:w-auto"
          >
            ♻️ Reset All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-(--color-border) space-y-4 sm:space-y-6 animate-in slide-in-from-top duration-300">
          <DietaryFilter dietary={dietary} onDietaryChange={setDietary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <DifficultySlider
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
            />

            <MealTypeFilter
              mealType={mealType}
              onMealTypeChange={setMealType}
            />
          </div>

          <ActiveFiltersDisplay
            dietary={dietary}
            difficulty={difficulty}
            mealType={mealType}
            onRemoveDietary={toggleDietary}
            onRemoveDifficulty={() => setDifficulty(null)}
            onRemoveMealType={() => setMealType("")}
          />
        </div>
      )}
    </div>
  );
}
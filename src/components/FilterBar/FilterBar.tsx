"use client";

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
    <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-6 mb-8 shadow-[4px_4px_0_0_var(--color-shadow)]">
      <div className="flex items-center justify-between pt-2 border-t-2 border-(--color-border)">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-(--color-text)">
              📊 Sort By
            </label>
            <SortButtons sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 rounded-full bg-(--color-primary) text-white font-semibold hover:brightness-110 transition shadow-[2px_2px_0_0_var(--color-shadow)]"
          >
            {showFilters ? "🔼 Hide" : "🔽 Show"} Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-white text-(--color-primary) px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* RIGHT SIDE */}
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="px-5 py-3 rounded-full border-2 border-(--color-danger) text-(--color-danger) hover:bg-(--color-danger) hover:text-white transition font-semibold"
          >
            ♻️ Reset All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-6 pt-6 border-t-2 border-(--color-border) space-y-6 animate-in slide-in-from-top duration-300">
          <DietaryFilter dietary={dietary} onDietaryChange={setDietary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

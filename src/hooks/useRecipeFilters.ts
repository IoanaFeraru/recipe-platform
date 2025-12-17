import { useState, useCallback } from "react";
import { DietaryOption } from "@/types/recipe";

type SortOption = "az" | "za" | "dateDesc" | "dateAsc";

interface RecipeFilters {
  selectedTag: string | null;
  dietary: DietaryOption[];
  difficulty: "easy" | "medium" | "hard" | null;
  mealType: string;
  sortBy: SortOption;
  search: string;
}

interface UseRecipeFiltersReturn {
  filters: RecipeFilters;
  setSelectedTag: (tag: string | null) => void;
  setDietary: (dietary: DietaryOption[]) => void;
  setDifficulty: (difficulty: "easy" | "medium" | "hard" | null) => void;
  setMealType: (mealType: string) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

const DEFAULT_FILTERS: RecipeFilters = {
  selectedTag: null,
  dietary: [],
  difficulty: null,
  mealType: "",
  sortBy: "dateDesc",
  search: "",
};

/**
 * Recipe list filter state hook.
 *
 * Centralizes all UI-level filter criteria used to query and/or post-filter recipes:
 * - taxonomy filters: tag, dietary options, difficulty, meal type
 * - presentation controls: sort order
 * - free-text query: search
 *
 * Provides stable setter callbacks suitable for passing into memoized child components,
 * plus a reset function that clears filters while intentionally preserving the current
 * search query (search is treated as user intent rather than a "toggle" filter).
 *
 * Also computes `activeFiltersCount` for badges/indicators; this excludes `search` and
 * `sortBy` by design, since those are typically always present and would inflate counts.
 *
 * @param initialSearch - Optional initial search string (e.g., from route/query params)
 * @returns Filter state, setters, reset handler, and active filter count
 */
export const useRecipeFilters = (initialSearch: string = ""): UseRecipeFiltersReturn => {
  const [filters, setFilters] = useState<RecipeFilters>({
    ...DEFAULT_FILTERS,
    search: initialSearch,
  });

  const setSelectedTag = useCallback((tag: string | null) => {
    setFilters((prev) => ({ ...prev, selectedTag: tag }));
  }, []);

  const setDietary = useCallback((dietary: DietaryOption[]) => {
    setFilters((prev) => ({ ...prev, dietary }));
  }, []);

  const setDifficulty = useCallback((difficulty: "easy" | "medium" | "hard" | null) => {
    setFilters((prev) => ({ ...prev, difficulty }));
  }, []);

  const setMealType = useCallback((mealType: string) => {
    setFilters((prev) => ({ ...prev, mealType }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      // Non-obvious business rule: keep the current search query on reset.
      search: filters.search,
    });
  }, [filters.search]);

  const activeFiltersCount =
    (filters.selectedTag ? 1 : 0) +
    filters.dietary.length +
    (filters.difficulty ? 1 : 0) +
    (filters.mealType ? 1 : 0);

  return {
    filters,
    setSelectedTag,
    setDietary,
    setDifficulty,
    setMealType,
    setSortBy,
    setSearch,
    resetFilters,
    activeFiltersCount,
  };
};
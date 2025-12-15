"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Recipe } from "@/types/recipe";
import FilterBar from "@/components/FilterBar";
import { useRecipeFilters } from "@/hooks/useRecipeFilters";
import { useRecipePagination } from "@/hooks/useRecipePagination";
import { RecipeGrid } from "@/components/RecipeGrid";
import { PaginationControls } from "@/components/PaginationControls";
import { EmptyState } from "@/components/EmptyState";

/**
 * HomePage - Recipe discovery page
 * Architecture:
 * - useRecipeFilters: Manages all filter state
 * - useRecipePagination: Handles pagination and data fetching
 * - RecipeGrid: Displays recipes in grid layout
 * - PaginationControls: Navigation buttons
 * - EmptyState: No results UI
 */
export default function HomePage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q")?.toLowerCase() ?? "";

  // Filter state management
  const {
    filters,
    setSelectedTag,
    setDietary,
    setDifficulty,
    setMealType,
    setSortBy,
    setSearch,
    resetFilters,
    activeFiltersCount,
  } = useRecipeFilters(initialSearch);

  // Pagination and data fetching
  const {
    recipes,
    loading,
    page,
    hasNext,
    goToNextPage,
    goToPrevPage,
  } = useRecipePagination(filters.selectedTag, filters.sortBy);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch, setSearch]);

  const filteredRecipes = recipes
    .filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(filters.search) ||
        recipe.ingredients.some((i) =>
          i.name.toLowerCase().includes(filters.search)
        ) ||
        recipe.tags.join(" ").toLowerCase().includes(filters.search) ||
        recipe.steps.some((s) => s.text.toLowerCase().includes(filters.search));

      const matchesDietary =
        filters.dietary.length === 0 ||
        filters.dietary.every((d) => recipe.dietary?.includes(d));

      const matchesDifficulty =
        !filters.difficulty || recipe.difficulty === filters.difficulty;

      const matchesMealType =
        !filters.mealType || recipe.mealType === filters.mealType;

      return (
        matchesSearch &&
        matchesDietary &&
        matchesDifficulty &&
        matchesMealType
      );
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "dateAsc":
          return a.createdAt.toMillis() - b.createdAt.toMillis();
        case "dateDesc":
        default:
          return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
    });

  const handleTagClick = (tag: string) => {
    setSelectedTag(filters.selectedTag === tag ? null : tag);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-(--color-text) garet-heavy">
        Discover Recipes
      </h1>

      <FilterBar
        dietary={filters.dietary}
        setDietary={setDietary}
        difficulty={filters.difficulty}
        setDifficulty={setDifficulty}
        mealType={filters.mealType}
        setMealType={setMealType}
        sortBy={filters.sortBy}
        setSortBy={setSortBy as any}
      />

      {!loading && filteredRecipes.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No recipes found."
          message="Try adjusting your filters or search terms."
          action={
            activeFiltersCount > 0
              ? {
                  label: "Clear Filters",
                  onClick: resetFilters,
                }
              : undefined
          }
        />
      ) : (
        <>
          <RecipeGrid
            recipes={filteredRecipes}
            loading={loading}
            onTagClick={handleTagClick}
          />

          {!loading && filteredRecipes.length > 0 && (
            <PaginationControls
              currentPage={page}
              hasNext={hasNext}
              loading={loading}
              onPrevious={goToPrevPage}
              onNext={goToNextPage}
            />
          )}
        </>
      )}
    </main>
  );
}
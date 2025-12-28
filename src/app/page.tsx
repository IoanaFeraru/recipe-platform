"use client";

/**
 * HomePage
 *
 * Primary recipe discovery page that composes filtering, pagination, and result rendering
 * into a single cohesive user flow. This component binds URL query state (search param `q`)
 * to local filter state, applies in-memory filtering/sorting for the current page of recipes,
 * and renders the appropriate UI states (loading, empty, results, pagination).
 *
 * Responsibilities:
 * - Read initial search query from the URL (`?q=`) and keep filter search state in sync
 * - Delegate filter state management to `useRecipeFilters`
 * - Delegate data fetching/pagination to `useRecipePagination`
 * - Apply client-side matching logic for search text, dietary, difficulty, and meal type
 * - Apply client-side sorting for title/date based on selected sort option
 * - Render resilient UI using `PageErrorBoundary`, including empty-state recovery actions
 *
 * Data/Control Flow:
 * - URL `q` -> `useRecipeFilters(initialSearch)` + `setSearch(initialSearch)` on change
 * - `filters.selectedTag` + `filters.sortBy` -> `useRecipePagination(...)`
 * - `recipes` -> `filteredRecipes` (filter + sort) -> `RecipeGrid`
 *
 * UX Notes:
 * - Shows `EmptyState` when not loading and no recipes match current filters/search
 * - Provides a "Clear Filters" call-to-action when the empty state is caused by filters
 * - Displays pagination controls only when results exist and data is not loading
 *
 * @component
 */
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "@/components/FilterBar/FilterBar";
import { useRecipeFilters } from "@/hooks/useRecipeFilters";
import { useRecipePagination } from "@/hooks/useRecipePagination";
import { RecipeGrid } from "@/components/Recipe/RecipeGrid";
import { PaginationControls } from "@/components/UI/PaginationControls";
import { EmptyState } from "@/components/UI";
import { PageErrorBoundary } from "@/components/ErrorBoundary";

function HomePageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q")?.toLowerCase() ?? "";

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

  const { recipes, loading, page, hasNext, goToNextPage, goToPrevPage } =
    useRecipePagination(filters.selectedTag, filters.sortBy);

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
      const getMillis = (date: Date | { toDate(): Date; toMillis(): number }) =>
        'toMillis' in date ? date.toMillis() : date.getTime();

      switch (filters.sortBy) {
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "dateAsc":
          return getMillis(a.createdAt) - getMillis(b.createdAt);
        case "dateDesc":
        default:
          return getMillis(b.createdAt) - getMillis(a.createdAt);
      }
    });

  const handleTagClick = (tag: string) => {
    setSelectedTag(filters.selectedTag === tag ? null : tag);
  };

  return (
    <PageErrorBoundary>
      <main className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8 text-(--color-text) garet-heavy">
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
          setSortBy={setSortBy}
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
    </PageErrorBoundary>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8 text-(--color-text) garet-heavy">
          Discover Recipes
        </h1>
        <div className="flex justify-center items-center min-h-100">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
        </div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
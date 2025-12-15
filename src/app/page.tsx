"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Recipe, DietaryOption } from "@/types/recipe";
import RecipeCard from "@/components/RecipeCard";
import FilterBar from "@/components/FilterBar";
import { fetchRecipesPage } from "@/lib/listenRecipesPaginated";
import { QueryDocumentSnapshot } from "firebase/firestore";

type SortOption = "az" | "za" | "dateDesc" | "dateAsc";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<Map<number, QueryDocumentSnapshot | null>>(new Map([[1, null]]));
  const [hasNext, setHasNext] = useState(false);

  // Filter states
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dietary, setDietary] = useState<DietaryOption[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [mealType, setMealType] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("dateDesc");
  const search = searchParams.get("q")?.toLowerCase() ?? "";

  // Load recipes for a specific page
const loadPage = useCallback(async (pageNum: number) => {
  setLoading(true);
  
  try {
    const cursor = cursors.get(pageNum) || null;
    
    const { recipes: fetchedRecipes, lastDoc, hasNext: hasNextPage } = await fetchRecipesPage(
      cursor,
      selectedTag || undefined,
      sortBy
    );
    
    setRecipes(fetchedRecipes);
    setHasNext(hasNextPage);
    
    if (lastDoc) {
      setCursors(prev => new Map(prev).set(pageNum + 1, lastDoc));
    }
  } catch (error) {
    console.error("Error loading recipes:", error);
  } finally {
    setLoading(false);
  }
}, [cursors, selectedTag, sortBy]);

  // Load page when page number changes
  useEffect(() => {
    loadPage(page);
  }, [page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
      setCursors(new Map([[1, null]]));
    } else {
      loadPage(1);
    }
  }, [selectedTag, dietary, difficulty, mealType, sortBy, search]);

  // Client-side filtering and sorting
  const filteredRecipes = recipes
    .filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(search) ||
        recipe.ingredients.some((i) =>
          i.name.toLowerCase().includes(search)
        ) ||
        recipe.tags.join(" ").toLowerCase().includes(search) ||
        recipe.steps.some((s) =>
          s.text.toLowerCase().includes(search)
        );

      const matchesTag = selectedTag ? recipe.tags.includes(selectedTag) : true;
      const matchesDietary = dietary.length === 0 || dietary.every((d) => recipe.dietary?.includes(d));
      const matchesDifficulty = !difficulty || recipe.difficulty === difficulty;
      const matchesMealType = !mealType || recipe.mealType === mealType;

      return matchesSearch && matchesTag && matchesDietary && matchesDifficulty && matchesMealType;
    })
    .sort((a, b) => {
      switch (sortBy) {
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
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  const goToNextPage = () => {
    if (hasNext) setPage(p => p + 1);
  };

  const goToPrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-(--color-text) garet-heavy">
        Discover Recipes
      </h1>

      <FilterBar
        dietary={dietary}
        setDietary={setDietary}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        mealType={mealType}
        setMealType={setMealType}
        sortBy={sortBy}
        setSortBy={setSortBy as any}
      />

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
        </div>
      )}

      {!loading && filteredRecipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-(--color-text-muted) text-lg">No recipes found.</p>
          <p className="text-(--color-text-muted) text-sm mt-2">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onTagClick={handleTagClick}
              />
            ))}
          </div>

          {/* Simple Pagination */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              disabled={page === 1 || loading}
              onClick={goToPrevPage}
              className="px-6 py-3 rounded-full border-2 border-(--color-border) bg-(--color-bg-secondary) text-(--color-text) font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_0_var(--color-shadow)]"
            >
              ← Previous
            </button>

            <span className="px-4 py-2 text-(--color-text) font-semibold">
              Page {page}
            </span>

            <button
              disabled={!hasNext || loading}
              onClick={goToNextPage}
              className="px-6 py-3 rounded-full border-2 border-(--color-border) bg-(--color-bg-secondary) text-(--color-text) font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_0_var(--color-shadow)]"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </main>
  );
}
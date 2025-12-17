import { useState, useCallback, useEffect, useRef } from "react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { Recipe } from "@/types/recipe";
import { fetchRecipesPage } from "@/lib/listenRecipesPaginated";

type SortOption = "az" | "za" | "dateDesc" | "dateAsc";

interface UseRecipePaginationReturn {
  recipes: Recipe[];
  loading: boolean;
  page: number;
  hasNext: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  resetPagination: () => void;
}

/**
 * Hook for cursor-based recipe pagination.
 *
 * Implements Firestore pagination using document snapshots as cursors and caches
 * the cursor per page so users can navigate backwards without re-fetching
 * intermediate pages.
 *
 * Cache strategy:
 * - Page 1 cursor is always `null` (start of collection)
 * - After loading page N, the hook stores the `lastDoc` as the cursor for page N+1
 *
 * Reset behavior:
 * - When `selectedTag` or `sortBy` changes, pagination resets to page 1 and the cursor cache is cleared.
 */
export const useRecipePagination = (
  selectedTag: string | null,
  sortBy: SortOption
): UseRecipePaginationReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const cursorsRef = useRef<Map<number, QueryDocumentSnapshot | null>>(new Map([[1, null]]));

  const loadPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);

      try {
        const cursor = cursorsRef.current.get(pageNum) ?? null;

        const { recipes: fetchedRecipes, lastDoc, hasNext: hasNextPage } =
          await fetchRecipesPage(cursor, selectedTag || undefined, sortBy);

        setRecipes(fetchedRecipes);
        setHasNext(hasNextPage);

        // Store the cursor for the next page, enabling forward navigation without recomputing.
        if (lastDoc) {
          cursorsRef.current.set(pageNum + 1, lastDoc);
        }
      } catch (error) {
        console.error("Error loading recipes:", error);
        setRecipes([]);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    },
    [selectedTag, sortBy]
  );

  useEffect(() => {
    setPage(1);
    cursorsRef.current = new Map([[1, null]]);
    setRecipes([]);
    setHasNext(false);
  }, [selectedTag, sortBy]);

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

  const resetPagination = useCallback(() => {
    setPage(1);
    cursorsRef.current = new Map([[1, null]]);
    setRecipes([]);
    setHasNext(false);
  }, []);

  const goToNextPage = useCallback(() => {
    if (hasNext) setPage(p => p + 1);
  }, [hasNext]);

  const goToPrevPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1);
  }, [page]);

  return {
    recipes,
    loading,
    page,
    hasNext,
    goToNextPage,
    goToPrevPage,
    resetPagination
  };
};
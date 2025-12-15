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
 * useRecipePagination - Manages recipe pagination state and fetching
 * Handles page state, cursors, and data fetching with Firebase pagination
 */
export const useRecipePagination = (
  selectedTag: string | null,
  sortBy: SortOption
): UseRecipePaginationReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const cursorsRef = useRef<Map<number, QueryDocumentSnapshot | null>>(
    new Map([[1, null]])
  );
  const [hasNext, setHasNext] = useState(false);

  const loadPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);

      try {
        const cursor = cursorsRef.current.get(pageNum) || null;

        const {
          recipes: fetchedRecipes,
          lastDoc,
          hasNext: hasNextPage,
        } = await fetchRecipesPage(cursor, selectedTag || undefined, sortBy);

        setRecipes(fetchedRecipes);
        setHasNext(hasNextPage);

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
    if (hasNext) {
      setPage((p) => p + 1);
    }
  }, [hasNext]);

  const goToPrevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  return {
    recipes,
    loading,
    page,
    hasNext,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  };
};
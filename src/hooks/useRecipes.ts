import { useState, useEffect, useCallback } from "react";
import { Recipe, RecipeFilters, Ingredient } from "@/types/recipe";
import { recipeService } from "@/lib/services/RecipeService";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  QueryConstraint
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseRecipesReturn {
  recipes: Recipe[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for listing recipes with optional filters.
 *
 * Supports two modes:
 * - Static: fetches once via RecipeService and exposes `refetch()`
 * - Realtime: attaches a Firestore listener and keeps the list in sync
 *
 * Important: realtime mode currently mirrors only a subset of RecipeFilters
 * (tag + difficulty) because Firestore query composition is constrained and
 * the hook is optimized for the common list views.
 */
export const useRecipes = (
  filters?: RecipeFilters,
  realtime: boolean = false
): UseRecipesReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await recipeService.list(filters);
      setRecipes(data);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!realtime) {
      fetchRecipes();
      return;
    }

    const constraints: QueryConstraint[] = [];

    if (filters?.tag) {
      constraints.push(where("tags", "array-contains", filters.tag));
    }

    if (filters?.difficulty) {
      constraints.push(where("difficulty", "==", filters.difficulty));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "recipes"), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Recipe[];

        setRecipes(data);
        setLoading(false);
      },
      err => {
        setError(err);
        setLoading(false);
        console.error("Error in real-time listener:", err);
      }
    );

    return () => unsubscribe();
  }, [realtime, filters?.tag, filters?.difficulty, fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipes
  };
};

/**
 * Hook for fetching a single recipe by ID.
 *
 * Uses RecipeService for the read, and normalizes ingredient shape to tolerate
 * legacy / inconsistent stored structures (e.g., nested `ing.name.name`).
 *
 * This hook is intentionally "static" (no listener). If you need live updates,
 * a dedicated realtime variant is preferable to avoid surprising read costs.
 */
export const useRecipe = (id: string | undefined) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await recipeService.getById(id);

        if (!data) {
          setRecipe(null);
          return;
        }

        const ingredients: Ingredient[] = (data.ingredients ?? []).map((ing: any) => ({
          name: typeof ing.name === "string" ? ing.name : ing.name?.name ?? "",
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        }));

        setRecipe({ ...data, ingredients });
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  return { recipe, loading, error };
};

/**
 * Hook for managing recipes owned by a specific user.
 *
 * Provides a small "CRUD + refresh" façade for profile/dashboards:
 * - reads via RecipeService.getByAuthor()
 * - writes via RecipeService.create/update/delete()
 * - refreshes after each mutation to keep UI state consistent
 */
export const useUserRecipes = (userId: string | undefined) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserRecipes = useCallback(async () => {
    if (!userId) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await recipeService.getByAuthor(userId);
      setRecipes(data);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching user recipes:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserRecipes();
  }, [fetchUserRecipes]);

  const createRecipe = useCallback(
    async (recipeData: Omit<Recipe, "id">) => {
      try {
        const id = await recipeService.create(recipeData);
        await fetchUserRecipes();
        return id;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [fetchUserRecipes]
  );

  const updateRecipe = useCallback(
    async (id: string, data: Partial<Recipe>) => {
      try {
        await recipeService.update(id, data);
        await fetchUserRecipes();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [fetchUserRecipes]
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      try {
        await recipeService.delete(id);
        await fetchUserRecipes();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [fetchUserRecipes]
  );

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refetch: fetchUserRecipes
  };
};
import { useState, useEffect, useCallback } from "react";
import { Recipe, RecipeFilters, Ingredient } from "@/types/recipe";
import { recipeService } from "@/lib/services/RecipeService";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseRecipesReturn {
  recipes: Recipe[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching recipes with optional real-time updates
 * Follows functional programming and React hooks patterns
 *
 * @param filters - Optional filters to apply
 * @param realtime - Whether to use real-time updates (default: false)
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
    if (realtime) {
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
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Recipe[];

          setRecipes(data);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
          console.error("Error in real-time listener:", err);
        }
      );

      return () => unsubscribe();
    } else {
      fetchRecipes();
    }
  }, [realtime, fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipes,
  };
};

/**
 * Hook for fetching a single recipe by ID
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
        if (data) {
          const ingredients: Ingredient[] = (data.ingredients ?? []).map(
            (ing: any) => ({
              name:
                typeof ing.name === "string" ? ing.name : ing.name?.name ?? "",
              quantity: ing.quantity,
              unit: ing.unit,
              notes: ing.notes,
            })
          );
          setRecipe({ ...data, ingredients });
        }
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
 * Hook for managing user's recipes
 */
export const useUserRecipes = (userId: string | undefined) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserRecipes = useCallback(async () => {
    if (!userId) {
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
        await fetchUserRecipes(); // Refresh list
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
    refetch: fetchUserRecipes,
  };
};

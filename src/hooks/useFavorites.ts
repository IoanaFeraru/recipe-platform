import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/types/recipe";
import { favoriteService } from "@/lib/services/FavoriteService";
import { useAuth } from "@/context/AuthContext";

interface UseFavoritesReturn {
  favorites: string[];
  favoriteRecipes: Recipe[];
  loading: boolean;
  error: Error | null;
  isFavorite: (recipeId: string) => boolean;
  addFavorite: (recipeId: string) => Promise<void>;
  removeFavorite: (recipeId: string) => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<boolean>;
  clearAllFavorites: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing user favorites
 * Provides real-time updates and favorite operations
 */
export const useFavorites = (
  loadRecipes: boolean = false
): UseFavoritesReturn => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const favoriteIds = await favoriteService.getFavorites(user.uid);
      setFavorites(favoriteIds);

      if (loadRecipes && favoriteIds.length > 0) {
        const recipes = await favoriteService.getFavoriteRecipes(user.uid);
        setFavoriteRecipes(recipes);
      }
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [user, loadRecipes]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setFavoriteRecipes([]);
      setLoading(false);
      return;
    }

    const unsubscribe = favoriteService.listenToFavorites(
      user.uid,
      async (favoriteIds) => {
        setFavorites(favoriteIds);
        setLoading(false);

        if (loadRecipes && favoriteIds.length > 0) {
          try {
            const recipes = await favoriteService.getFavoriteRecipes(user.uid);
            setFavoriteRecipes(recipes);
          } catch (err) {
            console.error("Error loading favorite recipes:", err);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [user, loadRecipes]);

  /**
   * Check if a recipe is favorited
   */
  const isFavorite = useCallback(
    (recipeId: string): boolean => {
      return favorites.includes(recipeId);
    },
    [favorites]
  );

  /**
   * Add a recipe to favorites
   */
  const addFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) {
        throw new Error("User must be logged in to add favorites");
      }

      try {
        await favoriteService.addFavorite(user.uid, recipeId);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user]
  );

  /**
   * Remove a recipe from favorites
   */
  const removeFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) {
        throw new Error("User must be logged in");
      }

      try {
        await favoriteService.removeFavorite(user.uid, recipeId);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user]
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    async (recipeId: string): Promise<boolean> => {
      if (!user) {
        throw new Error("User must be logged in");
      }

      try {
        const newStatus = await favoriteService.toggleFavorite(
          user.uid,
          recipeId
        );
        return newStatus;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user]
  );

  /**
   * Clear all favorites
   */
  const clearAllFavorites = useCallback(async () => {
    if (!user) {
      throw new Error("User must be logged in");
    }

    try {
      await favoriteService.clearAllFavorites(user.uid);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [user]);

  return {
    favorites,
    favoriteRecipes,
    loading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    refetch: fetchFavorites,
  };
};

/**
 * Hook for favorite statistics
 */
export const useFavoriteStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalFavorites: number;
    favoritesByCategory: Record<string, number>;
    recentlyAdded: string[];
  }>({
    totalFavorites: 0,
    favoritesByCategory: {},
    recentlyAdded: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const favoriteStats = await favoriteService.getFavoriteStats(user.uid);
        setStats(favoriteStats);
      } catch (error) {
        console.error("Error fetching favorite stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};

/**
 * Hook to check if a specific recipe is favorited
 * Useful for individual recipe pages
 */
export const useIsFavorite = (recipeId: string | undefined) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !recipeId) {
      setIsFavorite(false);
      setLoading(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const status = await favoriteService.isFavorite(user.uid, recipeId);
        setIsFavorite(status);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkFavorite();
  }, [user, recipeId]);

  const toggle = useCallback(async () => {
    if (!user || !recipeId) return;

    try {
      const newStatus = await favoriteService.toggleFavorite(
        user.uid,
        recipeId
      );
      setIsFavorite(newStatus);
      return newStatus;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }, [user, recipeId]);

  return { isFavorite, loading, toggle };
};
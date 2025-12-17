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
 * Favorites hooks for Firestore-backed recipe bookmarking.
 *
 * Provides:
 * - `useFavorites(loadRecipes)`: real-time favorites list for the current user, with optional hydration to full Recipe
 *   objects for “My Favorites” pages.
 * - `useFavoriteStats()`: lightweight aggregated insights (count, category breakdown, recently created recipes).
 * - `useIsFavorite(recipeId)`: single-recipe favorite state helper for detail pages.
 *
 * Non-obvious business rules:
 * - All favorites are user-scoped and reset to empty on logout.
 * - Real-time synchronization is driven by a Firestore listener from FavoriteService; most UI should rely on the
 *   listener rather than manual refetches.
 * - When `loadRecipes` is enabled, the hook hydrates recipe IDs to Recipe documents and silently filters deleted recipes
 *   (handled inside FavoriteService.getFavoriteRecipes()).
 *
 * Design notes:
 * - `refetch` exists for imperative refreshes (e.g., after navigation), but in real-time mode the listener is the
 *   primary source of truth.
 * - Operations throw if the user is not authenticated to keep calling components explicit about auth gating.
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
      } else if (loadRecipes) {
        setFavoriteRecipes([]);
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

        if (!loadRecipes) return;

        // Only hydrate when requested; failures should not break the favorites IDs experience.
        if (favoriteIds.length === 0) {
          setFavoriteRecipes([]);
          return;
        }

        try {
          const recipes = await favoriteService.getFavoriteRecipes(user.uid);
          setFavoriteRecipes(recipes);
        } catch (err) {
          console.error("Error loading favorite recipes:", err);
        }
      }
    );

    return () => unsubscribe();
  }, [user, loadRecipes]);

  const isFavorite = useCallback(
    (recipeId: string): boolean => favorites.includes(recipeId),
    [favorites]
  );

  const addFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) throw new Error("User must be logged in to add favorites");

      try {
        await favoriteService.addFavorite(user.uid, recipeId);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user]
  );

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) throw new Error("User must be logged in");

      try {
        await favoriteService.removeFavorite(user.uid, recipeId);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user]
  );

  const toggleFavorite = useCallback(
    async (recipeId: string): Promise<boolean> => {
      if (!user) throw new Error("User must be logged in");

      try {
        return await favoriteService.toggleFavorite(user.uid, recipeId);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [user]
  );

  const clearAllFavorites = useCallback(async () => {
    if (!user) throw new Error("User must be logged in");

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
 * Aggregated favorites statistics hook for the current user.
 *
 * Non-obvious business rule:
 * - “Recently added” is based on the favorited recipes’ `createdAt` (recipe creation time),
 *   not the time the user favorited them, because favorites are stored as an array of IDs
 *   without per-entry timestamps.
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
 * Single-recipe favorite status hook for detail pages.
 *
 * Optimized for pages that only need the favorite state of one recipe rather than
 * maintaining the full favorites array. Uses a one-time check on mount and provides
 * a toggle helper that updates local state from the service result.
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
      const newStatus = await favoriteService.toggleFavorite(user.uid, recipeId);
      setIsFavorite(newStatus);
      return newStatus;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }, [user, recipeId]);

  return { isFavorite, loading, toggle };
};
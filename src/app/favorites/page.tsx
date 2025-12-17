/**
 * FavoritesPage
 *
 * User-facing page that displays the currently authenticated user’s saved (favorited)
 * recipes. The page acts as a container that delegates data access and mutations to
 * `useFavorites`, and renders a responsive grid of `RecipeCard` components.
 *
 * Responsibilities:
 * - Fetch the user’s favorites via `useFavorites(true)` (favorites-only mode)
 * - Render clear UX states:
 *   - Loading: spinner while favorites are being fetched
 *   - Error: lightweight failure message when retrieval fails
 *   - Empty: friendly empty-state prompt when no favorites exist
 *   - Success: grid of `RecipeCard` items
 * - Wrap the successful render path in `PageErrorBoundary` so unexpected UI/runtime
 *   errors in the favorites view do not break application navigation
 *
 * Notes / Future Enhancement:
 * - `clearAllFavorites` is intentionally wired but not exposed in the UI yet.
 *   If enabled, it should be gated behind a confirmation dialog due to the
 *   destructive nature of the action.
 *
 * @module FavoritesPage
 */

"use client";

import { RecipeCard } from "@/components/RecipeCard";
import { useFavorites } from "@/hooks/useFavorites";
import { PageErrorBoundary } from "@/components/ErrorBoundary";

export default function FavoritesPage() {
  const { favoriteRecipes, loading, error, clearAllFavorites } = useFavorites(true);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-(--color-danger)">
        Failed to load favorites.
      </div>
    );
  }

  if (!favoriteRecipes.length) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">💔</div>
        <p className="text-(--color-text-muted)-lg">No favorites yet.</p>
        <p className="text-(--color-text-muted) text-sm mt-2">
          Start exploring recipes and save your favorites!
        </p>
      </div>
    );
  }

  return (
    <PageErrorBoundary>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-(--color-text) garet-heavy">
            Your Favorite Recipes
          </h1>

          {/*
            Future: "Clear all" action (destructive). If enabled, add a confirmation modal.
            <button
              onClick={clearAllFavorites}
              className="text-sm text-(--color-danger) hover:underline"
            >
              Clear all
            </button>
          */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </PageErrorBoundary>
  );
}

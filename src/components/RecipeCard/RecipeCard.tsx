/**
 * RecipeCard component.
 *
 * Renders a reusable recipe preview card for grid/list layouts, composed from
 * smaller presentational subcomponents to keep the UI modular and maintainable.
 *
 * Responsibilities:
 * - Wraps the card in a ComponentErrorBoundary to isolate rendering failures
 * - Instantiates a RecipeModel to centralize recipe business logic and formatting
 * - Integrates with favorites state via `useIsFavorite`, exposing an optimistic
 *   toggle handler that prevents navigation / parent click handlers from firing
 * - Delegates rendering to child components:
 *   - RecipeCardImage: hero image and accessible title text
 *   - RecipeCardContent: title/description + favorite control
 *   - RecipeCardStats: basic summary metrics (servings, counts, time)
 *   - RecipeCardBadges: difficulty/dietary/tags with optional tag click callback
 *
 * Interaction notes:
 * - The favorite toggle handler calls `preventDefault` and `stopPropagation`
 *   to avoid triggering navigation when the card is wrapped in a link elsewhere.
 * - Toggle is gated by the hook's `loading` flag to prevent duplicate requests.
 *
 * @param {RecipeCardProps} props - Recipe object and optional tag click handler.
 * @returns A styled recipe card element suitable for grids and lists.
 */

"use client";

import React from "react";
import { Recipe } from "@/types/recipe";
import { useIsFavorite } from "@/hooks/useFavorites";
import { RecipeModel } from "@/lib/models/Recipe.model";
import { ComponentErrorBoundary } from "@/components/ErrorBoundary";

import { RecipeCardImage } from "./RecipeCardImage";
import { RecipeCardContent } from "./RecipeCardContent";
import { RecipeCardStats } from "./RecipeCardStats";
import { RecipeCardBadges } from "./RecipeCardBadges";

interface RecipeCardProps {
  recipe: Recipe;
  onTagClick?: (tag: string) => void;
}

export default function RecipeCard({ recipe, onTagClick }: RecipeCardProps) {
  const recipeModel = new RecipeModel(recipe);
  const { isFavorite, toggle, loading } = useIsFavorite(recipe.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) toggle();
  };

  return (
    <ComponentErrorBoundary componentName="RecipeCard">
      <div
        className="rounded-2xl overflow-hidden hover:shadow-[8px_8px_0_0_var(--color-shadow)] transition-all border-2"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="block cursor-pointer">
          {/* Recipe Image */}
          <RecipeCardImage
            recipeId={recipe.id!}
            imageUrl={recipeModel.imageUrl}
            title={recipeModel.title}
          />

          {/* Recipe Content */}
          <RecipeCardContent
            title={recipeModel.title}
            description={recipeModel.description}
            isFavorite={isFavorite}
            onFavoriteToggle={handleToggleFavorite}
            favoriteLoading={loading}
          />

          {/* Recipe Stats */}
          <RecipeCardStats
            servings={recipeModel.servings}
            ingredientsCount={recipeModel.ingredients.length}
            stepsCount={recipeModel.steps.length}
            totalActiveTime={recipeModel.totalActiveTime}
            formattedTotalTime={recipeModel.formattedTotalTime}
          />
        </div>

        {/* Recipe Badges */}
        <RecipeCardBadges
          difficulty={recipeModel.difficulty}
          dietary={recipeModel.dietary}
          tags={recipeModel.tags}
          onTagClick={onTagClick}
        />
      </div>
    </ComponentErrorBoundary>
  );
}
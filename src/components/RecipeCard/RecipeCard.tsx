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
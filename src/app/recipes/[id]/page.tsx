"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useRecipe } from "@/hooks/useRecipes";
import { useAuth } from "@/context/AuthContext";
import { useIsFavorite } from "@/hooks/useFavorites";
import { RecipeModel } from "@/lib/models/Recipe.model";
import CommentsRatings from "@/components/Comments/CommentsRatings";

import { RecipeImage } from "@/components/Recipe/RecipeImage";
import { RecipeNavigation } from "@/components/Recipe/RecipeNavigation";
import { RecipeHeader } from "@/components/Recipe/RecipeHeader";
import { RecipeStats } from "@/components/Recipe/RecipeStats";
import { RecipeDescription } from "@/components/Recipe/RecipeDescription";
import { RecipeBadges } from "@/components/Recipe/RecipeBadges";
import { RecipeIngredients } from "@/components/Recipe/RecipeIngredients";
import { RecipeInstructions } from "@/components/Recipe/RecipeInstructions";

import { useRecipeScaling } from "@/hooks/useRecipeScaling";
import { useCreatorInfo } from "@/hooks/useCreatorInfo";

/**
 * RecipePage - Main recipe display page
 * Refactored into modular components following separation of concerns
 * 
 * Architecture:
 * - Container component pattern (this file)
 * - Presentational components (Recipe/*)
 * - Custom hooks for business logic
 * - Domain model for data operations (RecipeModel)
 */
export default function RecipePage() {
  const params = useParams();
  const { user } = useAuth();

  const recipeId = typeof params.id === "string" ? params.id : params.id?.[0];
  const { recipe, loading, error } = useRecipe(recipeId);
  const recipeModel = recipe ? new RecipeModel(recipe) : null;

  const { creator } = useCreatorInfo(recipeModel?.authorId, recipeModel?.authorName);
  const { isFavorite, toggle: toggleFavorite, loading: favoriteLoading } = useIsFavorite(recipe?.id);
  const {
    currentServings,
    scaledIngredients,
    handleServingsChange,
    getScaledIngredientText,
  } = useRecipeScaling(recipeModel);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--color-bg) flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent mb-4"></div>
          <p className="text-(--color-text-muted)">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-(--color-text) mb-2">
            Error Loading Recipe
          </h2>
          <p className="text-(--color-text-muted) mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!recipeModel) {
    return (
      <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-(--color-text) mb-2">
            Recipe Not Found
          </h2>
          <p className="text-(--color-text-muted)">
            The recipe you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <RecipeNavigation />
      <RecipeImage imageUrl={recipeModel.imageUrl} title={recipeModel.title} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 -mt-20 relative">
        {/* Header Card */}
        <div className="bg-(--color-bg-secondary) rounded-3xl p-8 mb-8 shadow-lg">
          <RecipeHeader
            title={recipeModel.title}
            creator={creator}
            isFavorite={isFavorite}
            onFavoriteToggle={toggleFavorite}
            favoriteLoading={favoriteLoading}
            isUserLoggedIn={!!user}
          />

          <RecipeStats
            servings={currentServings}
            onServingsChange={handleServingsChange}
            totalTime={recipeModel.totalTime}
            formattedTotalTime={recipeModel.formattedTotalTime}
            ingredientsCount={recipeModel.ingredients.length}
            stepsCount={recipeModel.steps.length}
          />

          <RecipeDescription description={recipeModel.description} />

          <RecipeBadges
            dietary={recipeModel.dietary}
            difficulty={recipeModel.difficulty}
            tags={recipeModel.tags}
          />

          {/* Ingredients & Instructions Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            {/* Ingredients - 1 column */}
            <div className="lg:col-span-1">
              <RecipeIngredients
                ingredients={scaledIngredients}
                getScaledIngredientText={getScaledIngredientText}
              />
            </div>

            {/* Instructions - 2 columns */}
            <div className="lg:col-span-2">
              <RecipeInstructions steps={recipeModel.steps} />
            </div>
          </div>
        </div>

        {/* Comments & Ratings Section */}
        <div className="bg-(--color-bg-secondary) rounded-2xl p-8 mb-8">
          <CommentsRatings
            recipeId={recipeModel.id!}
            recipeOwnerId={recipeModel.authorId}
          />
        </div>
      </div>
    </div>
  );
}
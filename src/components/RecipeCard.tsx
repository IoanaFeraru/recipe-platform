"use client";

import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { useIsFavorite } from "@/hooks/useFavorites";
import { formatTime, formatCount } from "@/lib/utils/formatting";
import { RecipeModel } from "@/lib/models/Recipe.model";
import { DietaryBadge } from "@/components/Tag/CustomTags/DietaryBadge";
import { DifficultyBadge } from "@/components/Tag/CustomTags/DifficultyBadge";
import { RecipeTags } from "@/components/Tag/CustomTags/RecipeTags";
import { color } from "framer-motion";

interface Props {
  recipe: Recipe;
  onTagClick?: (tag: string) => void;
}

export default function RecipeCard({ recipe, onTagClick }: Props) {
  const recipeModel = new RecipeModel(recipe);
  const { isFavorite, toggle, loading } = useIsFavorite(recipe.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) toggle();
  };

  return (
    <div
      className="rounded-2xl overflow-hidden hover:shadow-[8px_8px_0_0_var(--color-shadow)] transition-all border-2"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="block cursor-pointer">
        {/* Recipe Image */}
        <Link href={`/recipes/${recipe.id}`} passHref>
          {recipeModel.imageUrl ? (
            <img
              src={recipeModel.imageUrl}
              alt={recipeModel.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div
              className="w-full h-48 flex items-center justify-center"
              style={{ backgroundColor: "var(--color-border)" }}
            >
              <span className="text-6xl">🍽️</span>
            </div>
          )}
        </Link>

        <div className="p-5">
          {/* Title & Favorite */}
          <div className="flex justify-between items-start gap-2 mb-2">
            <h2
              className="text-xl font-bold garet-heavy"
              style={{ color: "var(--color-text)" }}
            >
              {recipeModel.title}
            </h2>

            <button
              onClick={handleToggleFavorite}
              disabled={loading}
              aria-label="Favorite"
              className="text-xl transition disabled:opacity-50"
              style={{
                color: isFavorite ? "red" : "var(--color-text-muted)",
              }}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Description */}
          {recipeModel.description && (
            <p
              className="text-sm mb-3 line-clamp-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              {recipeModel.description}
            </p>
          )}

          {/* Recipe Stats */}
          <div
            className="flex flex-wrap gap-3 text-xs mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span className="flex items-center gap-1">
              <span className="text-base">👥</span>
              {formatCount(recipeModel.servings, "serving")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="text-base">🥄</span>
              {formatCount(recipeModel.ingredients.length, "ingredient")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="text-base">📝</span>
              {formatCount(recipeModel.steps.length, "step")}
            </span>
            {recipeModel.totalActiveTime > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="text-base">⏱️</span>
                  {recipeModel.formattedTotalTime}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {/* Difficulty */}
      {recipeModel.difficulty && (
        <div className="mb-3 pl-5">
          <DifficultyBadge
            level={recipeModel.difficulty}
            onClick={() => onTagClick?.(recipeModel.difficulty)}
          />
        </div>
      )}

      {/* Dietary Badges */}
      {recipeModel.dietary.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 pl-5">
          {recipeModel.dietary.slice(0, 3).map((diet) => (
            <DietaryBadge
              key={diet}
              type={diet}
              onClick={() => onTagClick?.(diet)}
            />
          ))}
          {recipeModel.dietary.length > 3 && (
            <span className="text-xs text-(--color-text-muted)">
              +{recipeModel.dietary.length - 3}
            </span>
          )}
        </div>
      )}

      {recipeModel.tags.length > 0 && (
        <div className="mb-3 pl-5">
          <RecipeTags tags={recipeModel.tags} onClick={onTagClick} />
        </div>
      )}
    </div>
  );
}

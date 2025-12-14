"use client";

import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { useFavorites } from "@/context/FavoritesContext";

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // prevents the card click from navigating
    if (!recipe.id) return;
    isFavorite(recipe.id) ? removeFavorite(recipe.id) : addFavorite(recipe.id);
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  };

  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <div className="
        bg-(--color-bg-secondary)
        border-2 border-(--color-border)
        rounded-2xl overflow-hidden
        hover:shadow-[8px_8px_0_0_var(--color-shadow)]
        transition-all
        cursor-pointer
      ">
        {/* Image */}
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-(--color-border) flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}

        <div className="p-5">
          {/* Title & Heart Favorite */}
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-xl font-bold garet-heavy text-(--color-text)">
              {recipe.title}
            </h2>

            <button
              onClick={toggleFavorite}
              className={`text-xl transition ${
                recipe.id && isFavorite(recipe.id)
                  ? "text-red-500"
                  : "text-(--color-text-muted) hover:text-red-500"
              }`}
              aria-label="Favorite"
            >
              ❤️
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-(--color-text-muted)">
            <span>🥄 {recipe.ingredients.length} ingredients</span>
            {recipe.ingredients.length > 3 && (
              <>
                <span>•</span>
                <span>{recipe.ingredients.slice(0, 3).join(", ")}…</span>
              </>
            )}
            <span>•</span>
            <span>📝 {recipe.steps.length} steps</span>

            {recipe.minActivePrepTime && recipe.maxActivePrepTime && (
              <>
                <span>•</span>
                <span>
                  ⏱️ {formatTime(recipe.minActivePrepTime)}–{formatTime(recipe.maxActivePrepTime)}
                </span>
              </>
            )}
          </div>

          {/* Dietary badges */}
          <div className="flex gap-2 mt-3">
            {recipe.isVegetarian && (
              <span className="bg-(--color-success) text-white text-xs px-2 py-1 rounded-full">
                🌱 Vegetarian
              </span>
            )}
            {recipe.isVegan && (
              <span className="bg-(--color-success) text-white text-xs px-2 py-1 rounded-full">
                🌿 Vegan
              </span>
            )}
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="bg-(--color-bg) border border-(--color-border) text-(--color-text-muted) text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-xs text-(--color-text-muted)">+{recipe.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { useFavorites } from "@/context/FavoritesContext";
import Tag from "./Tag";

interface Props {
  recipe: Recipe;
  onTagClick?: (tag: string) => void;
}

const dietaryIcons: Record<string, string> = {
  vegetarian: "🌱",
  vegan: "🌿",
  pescatarian: "🐟",
  glutenFree: "🌾",
  dairyFree: "🥛",
  nutFree: "🥜",
  halal: "☪️",
  kosher: "✡️",
};

const dietaryLabels: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  glutenFree: "Gluten-Free",
  dairyFree: "Dairy-Free",
  nutFree: "Nut-Free",
  halal: "Halal",
  kosher: "Kosher",
};

export default function RecipeCard({ recipe, onTagClick }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <div
      className="rounded-2xl overflow-hidden hover:shadow-[8px_8px_0_0_var(--color-shadow)] transition-all border-2"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Card */}
      <Link href={`/recipes/${recipe.id}`} className="block cursor-pointer">
        {/* Image */}
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
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

        <div className="p-5">
          {/* Title & Favorite */}
          <div className="flex justify-between items-start gap-2 mb-2">
            <h2
              className="text-xl font-bold garet-heavy"
              style={{ color: "var(--color-text)" }}
            >
              {recipe.title}
            </h2>
            <button
              onClick={toggleFavorite}
              className="text-xl transition"
              style={{
                color:
                  recipe.id && isFavorite(recipe.id)
                    ? "red"
                    : "var(--color-text-muted)",
              }}
              aria-label="Favorite"
            >
              {recipe.id && isFavorite(recipe.id) ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Description */}
          {recipe.description && (
            <p
              className="text-sm mb-3 line-clamp-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              {recipe.description}
            </p>
          )}

          {/* Info */}
          <div
            className="flex flex-wrap gap-3 text-xs mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span className="flex items-center gap-1">
              <span className="text-base">👥</span>
              {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="text-base">🥄</span>
              {recipe.ingredients.length} ingredients
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="text-base">📝</span>
              {recipe.steps.length} steps
            </span>
            {recipe.minActivePrepTime && recipe.maxActivePrepTime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="text-base">⏱️</span>
                  {formatTime(recipe.minActivePrepTime)}–
                  {formatTime(recipe.maxActivePrepTime)}
                </span>
              </>
            )}
          </div>

          {/* Difficulty */}
          {recipe.difficulty && (
            <div className="mb-3">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor:
                    recipe.difficulty === "easy"
                      ? "var(--color-success)"
                      : recipe.difficulty === "medium"
                      ? "var(--color-warning)"
                      : "var(--color-danger)",
                  color: "white",
                }}
              >
                {recipe.difficulty.charAt(0).toUpperCase() +
                  recipe.difficulty.slice(1)}
              </span>
            </div>
          )}

          {/* Dietary */}
          {recipe.dietary.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {recipe.dietary.slice(0, 3).map((diet) => (
                <span
                  key={diet}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--color-success)",
                    color: "white",
                  }}
                >
                  {dietaryIcons[diet]} {dietaryLabels[diet]}
                </span>
              ))}
              {recipe.dietary.length > 3 && (
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  +{recipe.dietary.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-5 pt-0">
          {recipe.tags.slice(0, 3).map((tag, i) => (
            <Tag
              key={i}
              label={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
            />
          ))}
          {recipe.tags.length > 3 && (
            <span
              className="text-xs self-center"
              style={{ color: "var(--color-text-muted)" }}
            >
              +{recipe.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

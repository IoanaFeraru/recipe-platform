"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipe } from "@/hooks/useRecipes";
import { useAuth } from "@/context/AuthContext";
import { useIsFavorite } from "@/hooks/useFavorites";
import CommentsRatings from "@/components/CommentsRatings";
import Tag from "@/components/Tag";
import {
  formatTime,
  calculateScaledQuantity,
  formatCount,
  capitalize,
  numberToFraction,
} from "@/lib/utils/formatting";
import { fetchUserAvatar } from "@/lib/utils/fetchUserAvatar";

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const recipeId = typeof params.id === "string" ? params.id : params.id?.[0];
  const { recipe, loading, error } = useRecipe(recipeId); 

  const [servings, setServings] = useState<number | undefined>(undefined);

  const [creator, setCreator] = useState<{
    name: string;
    avatarUrl?: string;
  } | null>(null);

  const {
    isFavorite,
    toggle: toggleFavorite,
    loading: favoriteLoading,
  } = useIsFavorite(recipe?.id);

  useEffect(() => {
    if (recipe?.servings && servings === undefined) {
      setServings(recipe.servings);
    }

    if (recipe?.authorId) {
      fetchUserAvatar(recipe.authorId).then((avatarUrl) => {
        setCreator({
          name: recipe.authorName ?? "Unknown",
          avatarUrl,
        });
      });
    }
  }, [recipe, servings]);

  const currentServings = servings ?? recipe?.servings ?? 1;

  const handleFavoriteToggle = () => {
    if (!user) return alert("Please log in to save recipes");
    toggleFavorite();
  };

  const handleServingsChange = (delta: number) => {
    setServings((prev) => {
      const baseServings = prev ?? recipe?.servings ?? 1;
      return Math.max(1, baseServings + delta);
    });
  };

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading recipe: {error.message}
      </div>
    );
  if (!recipe) return <div className="p-8 text-center">Recipe not found</div>;

  const totalTime =
    (recipe.minActivePrepTime || 0) + (recipe.minPassiveTime || 0);

  return (
    <div className="min-h-screen bg-(--color-bg)">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="fixed bottom-8 left-8 z-50 bg-(--color-primary) rounded-full w-14 h-14 flex items-center justify-center"
      >
        ←
      </button>

      {/* Recipe image */}
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-96 object-cover"
        />
      )}

      <div className="max-w-6xl mx-auto px-8 -mt-20 relative">
        <div className="bg-(--color-bg) border-2 rounded-3xl p-8 mb-8">
          <h1 className="text-5xl font-bold mb-4">{recipe.title}</h1>

          {/* Creator */}
          {creator && (
            <div className="flex items-center gap-3 mb-4">
              <img
                src={creator.avatarUrl || "/default-avatar.png"}
                alt={creator.name}
                className="w-10 h-10 rounded-full"
              />
              <span>By {creator.name}</span>
            </div>
          )}

          {/* Favorite */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className={`px-6 py-3 rounded-full font-semibold ${
                isFavorite ? "bg-red-500 text-white" : "bg-gray-200"
              }`}
            >
              {isFavorite ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>

          {/* Servings / Stats */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleServingsChange(-1)}
                className="px-3 py-1 border rounded"
              >
                −
              </button>
              {/* Use currentServings here */}
              <span>{currentServings} servings</span>
              <button
                onClick={() => handleServingsChange(1)}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>
            {totalTime > 0 && <div>⏱ {formatTime(totalTime)}</div>}
            <div>🥄 {formatCount(recipe.ingredients.length, "ingredient")}</div>
            <div>📝 {formatCount(recipe.steps.length, "step")}</div>
          </div>

          {recipe.description && (
            <div className="mb-8 text-(--color-text)">
              <h2 className="text-2xl font-semibold mb-3">About this recipe</h2>
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {recipe.description}
              </p>
            </div>
          )}

          {/* Dietary badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.dietary.map((d) => (
              <span
                key={d}
                className="bg-(--color-success) text-white px-3 py-1 rounded-full text-sm font-semibold"
              >
                {capitalize(d)}
              </span>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map((tag, i) => (
              <Tag
                key={i}
                label={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/?q=${encodeURIComponent(tag)}`);
                }}
              />
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs self-center text-(--color-text-muted)">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>

          {/* Ingredients & Instructions */}
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div>
              <h2 className="text-2xl mb-4">Ingredients</h2>
              <ul>
                {recipe.ingredients.map((ing, i) => {
                  const scaledQty = calculateScaledQuantity(
                    ing.quantity,
                    recipe.servings,
                    currentServings
                  );

                  const quantityText =
                    scaledQty !== undefined ? numberToFraction(scaledQty) : "";

                  const unitText = ing.unit ? ` ${ing.unit}` : "";
                  const notesText = ing.notes ? ` (${ing.notes})` : "";

                  return (
                    <li key={i} className="mb-2">
                      {quantityText}
                      {unitText} <strong>{ing.name}</strong>
                      {notesText}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl mb-4">Instructions</h2>
              <ol>
                {recipe.steps.map((s, i) => (
                  <li key={i} className="mb-6">
                    <p className="font-semibold mb-2">Step {i + 1}</p>
                    <p className="mb-2">{s.text}</p>
                    {s.imageUrl && (
                      <img
                        src={s.imageUrl}
                        alt={`Step ${i + 1}`}
                        className="w-full max-h-80 object-cover rounded-lg"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Comments & Ratings */}
        <div className="bg-(--color-bg-secondary) rounded-2xl p-8">
          <CommentsRatings
            recipeId={recipe.id!}
            recipeOwnerId={recipe.authorId}
          />
        </div>
      </div>
    </div>
  );
}

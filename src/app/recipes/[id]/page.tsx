"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Recipe } from "@/types/recipe";
import CommentsRatings from "@/components/CommentsRatings";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      const id = typeof params.id === "string" ? params.id : params.id?.[0];
      if (!id) return setLoading(false);

      try {
        const snapshot = await getDoc(doc(db, "recipes", id));
        if (snapshot.exists()) {
          setRecipe({ id: snapshot.id, ...snapshot.data() } as Recipe);
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id]);

  if (loading)
    return <p className="p-8 text-center text-(--color-text-muted)">Loading...</p>;
  if (!recipe)
    return <p className="p-8 text-center text-(--color-text-muted)">Recipe not found</p>;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  };

  const handleFavoriteToggle = () => {
    if (!user) return alert("Please log in to add favorites");
    if (!recipe?.id) return;
    isFavorite(recipe.id) ? removeFavorite(recipe.id) : addFavorite(recipe.id);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative space-y-8">
      {/* Floating Back Button: bottom-left */}
      <button
        onClick={() => router.push("/")}
        className="fixed bottom left-10 z-50 bg-(--color-bg-secondary) shadow-lg rounded-full p-4 hover:brightness-110 transition flex items-center justify-center"
        aria-label="Back"
      >
        <img src="/angle-left.svg" alt="Back" width={32} height={32} />
      </button>

      {/* Title & Favorite */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-(--nav-height,0px) bg-(--color-bg) z-40 py-2 px-0">
        <h1 className="text-4xl font-bold garet-heavy text-(--color-text)">
          {recipe.title}
        </h1>
        {user && (
          <button
            onClick={handleFavoriteToggle}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              isFavorite(recipe.id!)
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isFavorite(recipe.id!) ? "❤️ Remove" : "🤍 Add"}
          </button>
        )}
      </div>

      {/* Tags & Dietary Info */}
      <div className="flex flex-wrap gap-2 items-center text-sm text-(--color-text-muted)">
        {recipe.minActivePrepTime && recipe.maxActivePrepTime && (
          <span>
            ⏱️ Active: {formatTime(recipe.minActivePrepTime)}–{formatTime(recipe.maxActivePrepTime)}
          </span>
        )}
        {recipe.minPassiveTime && recipe.maxPassiveTime && (
          <span>
            ⏳ Passive: {formatTime(recipe.minPassiveTime)}–{formatTime(recipe.maxPassiveTime)}
          </span>
        )}
        {recipe.isVegetarian && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">🌱 Vegetarian</span>
        )}
        {recipe.isVegan && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">🌿 Vegan</span>
        )}
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-(--color-bg) border border-(--color-border) text-(--color-text-muted) text-sm px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Main Image */}
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full max-w-3xl rounded-xl shadow-lg mx-auto"
        />
      )}

      {/* Ingredients */}
      <section className="bg-(--color-bg-secondary) p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-3 garet-heavy">Ingredients</h2>
        <ul className="list-disc list-inside space-y-1 text-(--color-text)">
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="bg-(--color-bg-secondary) p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-semibold mb-3 garet-heavy">Steps</h2>
        <ol className="space-y-6">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex flex-col sm:flex-row gap-4">
              <span className="font-bold text-(--color-primary) text-lg">{i + 1}.</span>
              <div className="flex-1 space-y-2">
                <p className="text-(--color-text)">{step.text}</p>
                {step.imageUrl && (
                  <img
                    src={step.imageUrl}
                    alt={`Step ${i + 1}`}
                    className="w-full max-w-md rounded-lg shadow-sm"
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Comments & Ratings */}
      <section className="bg-(--color-bg-secondary) p-6 rounded-xl shadow-md">
        <CommentsRatings recipeId={recipe.id!} recipeOwnerId={recipe.authorId} />
      </section>
    </div>
  );
}

"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { useEffect, useState } from "react";
import { Recipe } from "@/types/recipe";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RecipeCard from "@/components/RecipeCard";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!favorites.length) {
        setRecipes([]);
        setLoading(false);
        return;
      }
      const allRecipes: Recipe[] = [];
      for (const id of favorites) {
        const docRef = doc(db, "recipes", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          allRecipes.push({ id: snapshot.id, ...snapshot.data() } as Recipe);
        }
      }
      setRecipes(allRecipes);
      setLoading(false);
    };
    fetchFavorites();
  }, [favorites]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
      </div>
    );
  }

  if (!recipes.length) {
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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-(--color-text) garet-heavy">
        Your Favorite Recipes
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
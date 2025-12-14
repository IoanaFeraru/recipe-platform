"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { useEffect, useState } from "react";
import { Recipe } from "@/types/recipe";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!favorites.length) {
        setRecipes([]);
        return;
      }
      const allRecipes: Recipe[] = [];
      for (const id of favorites) {
        const docRef = doc(db, "recipes", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) allRecipes.push({ id: snapshot.id, ...snapshot.data() } as Recipe);
      }
      setRecipes(allRecipes);
    };
    fetchFavorites();
  }, [favorites]);

  if (!recipes.length) return <p className="p-8">No favorites yet.</p>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-(--color-text) garet-heavy">Your Favorite Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <RecipeCard recipe={recipe} />
          </Link>
        ))}
      </div>
    </div>
  );
}
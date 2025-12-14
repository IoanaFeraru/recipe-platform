"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createRecipe, listenRecipes, deleteRecipe, updateRecipe } from "@/lib/firestore";
import { Recipe } from "@/types/recipe";
import RecipeModal from "@/components/RecipeModal";
import Link from "next/link";
import Button from "@/components/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const unsubscribe = listenRecipes(setRecipes);
    return unsubscribe;
  }, []);

  if (!user) return <p className="p-8 text-center">Loading...</p>;

  const handleCreateRecipe = async (data: {
    title: string;
    ingredients: string[];
    steps: Array<{ text: string; imageUrl?: string }>;
    tags: string[];
    imageUrl?: string;
    isVegetarian: boolean;
    isVegan: boolean;
    minActivePrepTime: number;
    maxActivePrepTime: number;
    minPassiveTime?: number;
    maxPassiveTime?: number;
  }) => {
    if (editingRecipe) {
      // Update existing recipe
      await updateRecipe(editingRecipe.id!, data);
      setEditingRecipe(null);
    } else {
      // Create new recipe
      await createRecipe({
        ...data,
        authorId: user.uid,
        createdAt: new Date(),
      });
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleDelete = async (recipeId: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      await deleteRecipe(recipeId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const myRecipes = recipes.filter(r => r.authorId === user.uid);

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-(--color-text) garet-heavy">
              My Recipes
            </h1>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="text-base"
            >
              + Create Recipe
            </Button>
          </div>

          {myRecipes.length === 0 ? (
            <div className="text-center py-20 bg-(--color-bg-secondary) rounded-3xl border-2 border-(--color-border)">
              <div className="text-6xl mb-4">🍳</div>
              <p className="text-(--color-text-muted) text-lg mb-6">
                You haven't created any recipes yet.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Create Your First Recipe
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl overflow-hidden hover:shadow-[8px_8px_0_0_var(--color-shadow)] transition-all"
                >
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
                    <h2 className="text-xl font-bold text-(--color-text) mb-2 garet-heavy">
                      {recipe.title}
                    </h2>

                    {/* Recipe Info */}
                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-(--color-text-muted)">
                      <span>🥄 {recipe.ingredients.length} ingredients</span>
                      <span>•</span>
                      <span>📝 {recipe.steps.length} steps</span>
                      {recipe.minActivePrepTime && recipe.maxActivePrepTime && (
                        <>
                          <span>•</span>
                          <span>
                            ⏱️ {formatTime(recipe.minActivePrepTime)}-{formatTime(recipe.maxActivePrepTime)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Dietary Badges */}
                    <div className="flex gap-2 mb-3">
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
                      <div className="flex flex-wrap gap-1 mb-4">
                        {recipe.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="bg-(--color-bg) border border-(--color-border) text-(--color-text-muted) text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {recipe.tags.length > 3 && (
                          <span className="text-(--color-text-muted) text-xs px-2 py-1">
                            +{recipe.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="flex-1 bg-(--color-primary) text-white text-center py-2 rounded-full font-semibold hover:brightness-110 transition text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(recipe)}
                        className="flex-1 bg-(--color-secondary) text-white py-2 rounded-full font-semibold hover:brightness-110 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id!)}
                        className="bg-(--color-danger) text-white px-4 py-2 rounded-full font-semibold hover:brightness-110 transition text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <RecipeModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleCreateRecipe}
            editRecipe={editingRecipe}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
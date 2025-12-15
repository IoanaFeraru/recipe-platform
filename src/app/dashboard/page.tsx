"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createRecipe, listenRecipes, deleteRecipe, updateRecipe } from "@/lib/firestore";
import { Recipe } from "@/types/recipe";
import RecipeModal from "@/components/RecipeModal";
import RecipeCard from "@/components/RecipeCard";
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

  const handleCreateRecipe = async (data: any) => {
    const recipeData = {
      ...data
    };
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id!, recipeData);
      setEditingRecipe(null);
    } else {
      await createRecipe({
        ...recipeData,
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

  const myRecipes = recipes.filter((r) => r.authorId === user.uid);

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-(--color-text) garet-heavy">
            My Recipes
          </h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Create Recipe
          </Button>
        </div>

        {myRecipes.length === 0 ? (
          <div className="text-center py-20 bg-(--color-bg-secondary) rounded-3xl border-2 border-(--color-border)">
            <div className="text-6xl mb-4">🍳</div>
            <p className="text-(--color-text-muted) text-lg mb-6">
              You haven't created any recipes yet.
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Create Your First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRecipes.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <RecipeCard recipe={recipe} />

                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="bg-(--color-secondary) text-white px-3 py-1 rounded-full text-sm font-semibold hover:brightness-110"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id!)}
                    className="bg-(--color-danger) text-white px-3 py-1 rounded-full text-sm font-semibold hover:brightness-110"
                  >
                    🗑️
                  </button>
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
    </ProtectedRoute>
  );
}
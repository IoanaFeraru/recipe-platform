"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserRecipes } from "@/hooks/useRecipes";
import RecipeModal from "@/components/RecipeModal";
import RecipeCard from "@/components/RecipeCard";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null);

  const {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  } = useUserRecipes(user?.uid);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id!, data);
      } else {
        await createRecipe({
          ...data,
          authorId: user!.uid,
          createdAt: new Date(),
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save recipe:", err);
      alert("Failed to save recipe. Please try again.");
    }
  };

  const handleEdit = (recipe: any) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleDelete = async (recipeId: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteRecipe(recipeId);
      } catch (err) {
        console.error("Failed to delete recipe:", err);
        alert("Failed to delete recipe. Please try again.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-red-100 border-2 border-red-400 rounded-xl p-6 text-center">
            <p className="text-red-700">Failed to load recipes. Please try again.</p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-(--color-text) garet-heavy">
            My Recipes
          </h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Create Recipe
          </Button>
        </div>

        {/* Empty State */}
        {recipes.length === 0 ? (
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
          /* Recipe Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <RecipeCard recipe={recipe} />

                {/* Action Buttons */}
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

        {/* Modal */}
        <RecipeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateOrUpdate}
          editRecipe={editingRecipe}
        />
      </div>
    </ProtectedRoute>
  );
}
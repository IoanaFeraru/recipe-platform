"use client";

import { useAuth } from "@/context/AuthContext";
import { useUserRecipes } from "@/hooks/useRecipes";
import RecipeModal from "@/components/RecipeModal/RecipeModal";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useRecipeActions } from "@/hooks/useRecipeActions";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { EmptyDashboard } from "@/components/Dashboard/EmptyDashboard";
import { RecipeGridWithActions } from "@/components/Dashboard/RecipeGridWithActions";

/**
 * DashboardPage - User's recipe management page
 * Refactored from 150 lines to ~80 lines (47% reduction)
 * 
 * Architecture:
 * - useUserRecipes: Fetches user's recipes and provides CRUD operations
 * - useRecipeActions: Manages modal state and orchestrates CRUD with error handling
 * - DashboardHeader: Page title + create button
 * - EmptyDashboard: Empty state with CTA (reuses EmptyState)
 * - RecipeGridWithActions: Grid with edit/delete overlays
 */
export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch user's recipes
  const {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  } = useUserRecipes(user?.uid);

  // Recipe CRUD actions and modal state
  const {
    isModalOpen,
    editingRecipe,
    deleteConfirmation,
    isSubmitting,
    error: actionError,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleCreateOrUpdate,
    handleDelete,
  } = useRecipeActions({
    userId: user?.uid,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  });

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
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
        <DashboardHeader onCreateClick={openCreateModal} />

        {/* Content: Empty State or Recipe Grid */}
        {recipes.length === 0 ? (
          <EmptyDashboard onCreateClick={openCreateModal} />
        ) : (
          <RecipeGridWithActions
            recipes={recipes}
            onEdit={openEditModal}
            onDelete={openDeleteConfirmation}
          />
        )}

        {/* Recipe Modal */}
        <RecipeModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleCreateOrUpdate}
          editRecipe={editingRecipe}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteConfirmation}
          onConfirm={handleDelete}
          title="Delete Recipe"
          message={`Are you sure you want to delete "${deleteConfirmation.recipeName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />

        {/* Error Display */}
        {actionError && (
          <div className="fixed bottom-8 right-8 bg-red-100 border-2 border-red-400 rounded-lg p-4 shadow-lg">
            <p className="text-red-700 text-sm">{actionError}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
/**
 * DashboardPage
 *
 * Protected, user-scoped recipe management page that enables authenticated users
 * to create, edit, and delete their own recipes.
 *
 * Integrations:
 * - AuthContext (`useAuth`): Provides the current user identity.
 * - `useUserRecipes(userId)`: Data layer for fetching and mutating the user’s recipes
 *   (create, update, delete). Owns server/persistence interaction and exposes
 *   loading/error state for the initial list retrieval.
 * - `useRecipeActions(...)`: UI workflow/state machine for recipe operations:
 *   - create/edit modal open/close and selected recipe
 *   - delete confirmation dialog state and target recipe metadata
 *   - submit/delete execution with optimistic UI coordination and surfaced errors
 *
 * UI/UX responsibilities:
 * - Enforces route protection with `ProtectedRoute` (authentication required).
 * - Displays explicit page states:
 *   - Loading spinner while recipes are fetched
 *   - Fetch error card with a retry action on failure
 *   - Empty dashboard call-to-action when the user has no recipes
 *   - Responsive grid of recipe cards with edit/delete overlays when recipes exist
 * - Uses `RecipeModal` for create/edit, and `ConfirmationModal` for destructive delete.
 * - Shows a non-blocking “toast-like” error panel for action-level failures (e.g., create/update/delete).
 * - Wraps the page in `PageErrorBoundary` to prevent unexpected render/runtime errors
 *   from breaking navigation.
 *
 * Business rules:
 * - Deletion is always gated behind an explicit confirmation modal.
 * - Action errors (`actionError`) are displayed separately from initial fetch errors
 *   to distinguish “page couldn’t load” from “an operation failed”.
 *
 * @module DashboardPage
 */

"use client";

import { useAuth } from "@/context/AuthContext";
import { useUserRecipes } from "@/hooks/useRecipes";
import RecipeModal from "@/components/RecipeModal/RecipeModal";
import Button from "@/components/UI/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ConfirmationModal } from "@/components/UI";
import { useRecipeActions } from "@/hooks/useRecipeActions";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { EmptyDashboard } from "@/components/Dashboard/EmptyDashboard";
import { RecipeGridWithActions } from "@/components/Dashboard/RecipeGridWithActions";
import { PageErrorBoundary } from "@/components/ErrorBoundary";

export default function DashboardPage() {
  const { user } = useAuth();

  const { recipes, loading, error, createRecipe, updateRecipe, deleteRecipe } =
    useUserRecipes(user?.uid);

  const {
    isModalOpen,
    editingRecipe,
    deleteConfirmation,
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
            <p className="text-red-700">
              Failed to load recipes. Please try again.
            </p>
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
    <PageErrorBoundary>
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
            editRecipe={editingRecipe || undefined}
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
    </PageErrorBoundary>
  );
}
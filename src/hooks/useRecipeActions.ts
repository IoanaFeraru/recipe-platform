import { useState, useCallback } from "react";
import { Recipe } from "@/types/recipe";

interface UseRecipeActionsProps {
  userId: string | undefined;
  createRecipe: (data: Omit<Recipe, "id">) => Promise<string>;
  updateRecipe: (id: string, data: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

interface UseRecipeActionsReturn {
  isModalOpen: boolean;
  editingRecipe: Recipe | null;
  deleteConfirmation: {
    isOpen: boolean;
    recipeId: string | null;
    recipeName: string;
  };
  isSubmitting: boolean;
  error: string | null;
  openCreateModal: () => void;
  openEditModal: (recipe: Recipe) => void;
  closeModal: () => void;
  openDeleteConfirmation: (recipeId: string, recipeName: string) => void;
  closeDeleteConfirmation: () => void;
  handleCreateOrUpdate: (data: Partial<Recipe>) => Promise<void>;
  handleDelete: () => Promise<void>;
}

/**
 * Recipe CRUD UI orchestration hook.
 *
 * Coordinates recipe create/update/delete flows with UI state that typically accompanies them:
 * - create/edit modal lifecycle (open/close, edit target selection)
 * - delete confirmation lifecycle (open/close, selected recipe metadata)
 * - submission state (single shared `isSubmitting` flag for all operations)
 * - user-facing error state, cleared at the start of each new action
 *
 * The hook is intentionally decoupled from persistence by receiving CRUD functions via props
 * (commonly provided by `useUserRecipes`). This keeps the hook focused on orchestration and
 * component-friendly ergonomics rather than Firestore specifics.
 *
 * Non-obvious business rules:
 * - Create requires an authenticated `userId`; when creating, `authorId` is set to `userId`.
 * - On successful create/update, the modal closes automatically.
 * - On successful delete, the confirmation dialog closes automatically.
 *
 * @param props - Current user id and the CRUD implementations to invoke.
 * @returns Modal/confirmation state plus action handlers for UI components.
 */
export const useRecipeActions = ({
  userId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
}: UseRecipeActionsProps): UseRecipeActionsReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    recipeId: string | null;
    recipeName: string;
  }>({
    isOpen: false,
    recipeId: null,
    recipeName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = useCallback(() => {
    setEditingRecipe(null);
    setIsModalOpen(true);
    setError(null);
  }, []);

  const openEditModal = useCallback((recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecipe(null);
    setError(null);
  }, []);

  const openDeleteConfirmation = useCallback((recipeId: string, recipeName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      recipeId,
      recipeName,
    });
    setError(null);
  }, []);

  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({
      isOpen: false,
      recipeId: null,
      recipeName: "",
    });
    setError(null);
  }, []);

  const handleCreateOrUpdate = useCallback(
    async (data: Partial<Recipe>) => {
      if (!userId) {
        const msg = "User must be logged in";
        setError(msg);
        throw new Error(msg);
      }

      setIsSubmitting(true);
      setError(null);

      try {
        if (editingRecipe) {
          await updateRecipe(editingRecipe.id!, data);
        } else {
          await createRecipe({
            ...(data as Omit<Recipe, "id" | "authorId" | "createdAt">),
            authorId: userId,
            createdAt: new Date(),
          } as Omit<Recipe, "id">);
        }

        closeModal();
      } catch (err) {
        const msg = "Failed to save recipe. Please try again.";
        setError(msg);
        console.error("Failed to save recipe:", err);
        throw new Error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId, editingRecipe, createRecipe, updateRecipe, closeModal]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteConfirmation.recipeId) {
      setError("No recipe selected for deletion");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteRecipe(deleteConfirmation.recipeId);
      closeDeleteConfirmation();
    } catch (err) {
      const msg = "Failed to delete recipe. Please try again.";
      setError(msg);
      console.error("Failed to delete recipe:", err);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteConfirmation.recipeId, deleteRecipe, closeDeleteConfirmation]);

  return {
    isModalOpen,
    editingRecipe,
    deleteConfirmation,
    isSubmitting,
    error,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleCreateOrUpdate,
    handleDelete,
  };
};
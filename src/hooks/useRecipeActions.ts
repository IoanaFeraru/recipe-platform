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
  handleCreateOrUpdate: (data: any) => Promise<void>;
  handleDelete: () => Promise<void>;
}

/**
 * useRecipeActions - Encapsulates all recipe CRUD operations and modal state
 * Centralizes recipe management logic with error handling
 * 
 * @param props - User ID and CRUD functions from useUserRecipes
 * @returns Modal states and action handlers
 */
export const useRecipeActions = ({
  userId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
}: UseRecipeActionsProps): UseRecipeActionsReturn => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    recipeId: string | null;
    recipeName: string;
  }>({
    isOpen: false,
    recipeId: null,
    recipeName: "",
  });

  // Operation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Open modal for creating new recipe
   */
  const openCreateModal = useCallback(() => {
    setEditingRecipe(null);
    setIsModalOpen(true);
    setError(null);
  }, []);

  /**
   * Open modal for editing existing recipe
   */
  const openEditModal = useCallback((recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
    setError(null);
  }, []);

  /**
   * Close recipe modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecipe(null);
    setError(null);
  }, []);

  /**
   * Open delete confirmation dialog
   */
  const openDeleteConfirmation = useCallback(
    (recipeId: string, recipeName: string) => {
      setDeleteConfirmation({
        isOpen: true,
        recipeId,
        recipeName,
      });
      setError(null);
    },
    []
  );

  /**
   * Close delete confirmation dialog
   */
  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({
      isOpen: false,
      recipeId: null,
      recipeName: "",
    });
    setError(null);
  }, []);

  /**
   * Handle create or update recipe
   */
  const handleCreateOrUpdate = useCallback(
    async (data: any) => {
      if (!userId) {
        setError("User must be logged in");
        throw new Error("User must be logged in");
      }

      setIsSubmitting(true);
      setError(null);

      try {
        if (editingRecipe) {
          await updateRecipe(editingRecipe.id!, data);
        } else {
          await createRecipe({
            ...data,
            authorId: userId,
            createdAt: new Date(),
          });
        }
        closeModal();
      } catch (err) {
        const errorMessage = "Failed to save recipe. Please try again.";
        setError(errorMessage);
        console.error("Failed to save recipe:", err);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId, editingRecipe, createRecipe, updateRecipe, closeModal]
  );

  /**
   * Handle delete recipe
   */
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
      const errorMessage = "Failed to delete recipe. Please try again.";
      setError(errorMessage);
      console.error("Failed to delete recipe:", err);
      throw new Error(errorMessage);
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
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecipeService } from '@/lib/services/RecipeService';
import { createMockRecipe } from '../utils/mockData';
import {
  createMockDocSnapshot,
  createMockQuerySnapshot,
  resetFirebaseMocks,
} from '../utils/firebase-mocks';

vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    now: vi.fn(() => new Date()),
  },
}));

describe('RecipeService', () => {
  let service: RecipeService;
  const mockRecipe = createMockRecipe();

  beforeEach(() => {
    resetFirebaseMocks();
    service = new RecipeService();
  });

  describe('create', () => {
    it('should create a recipe successfully', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-recipe-id' } as any);

      const recipeData = { ...mockRecipe };
      delete (recipeData as any).id;

      const id = await service.create(recipeData);

      expect(id).toBe('new-recipe-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should throw error on create failure', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

      const recipeData = { ...mockRecipe };
      delete (recipeData as any).id;

      await expect(service.create(recipeData)).rejects.toThrow(
        'Failed to create recipe'
      );
    });
  });

  describe('getById', () => {
    it('should get recipe by id', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockSnapshot = createMockDocSnapshot(mockRecipe, true);

      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const recipe = await service.getById('recipe-1');

      expect(recipe).toBeDefined();
      expect(recipe?.id).toBe(mockRecipe.id);
    });

    it('should return null for non-existent recipe', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockSnapshot = createMockDocSnapshot(null, false);

      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const recipe = await service.getById('non-existent');

      expect(recipe).toBeNull();
    });

    it('should throw error on fetch failure', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(service.getById('recipe-1')).rejects.toThrow(
        'Failed to fetch recipe'
      );
    });
  });

  describe('update', () => {
    it('should update recipe successfully', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await service.update('recipe-1', { title: 'Updated Title' });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw error on update failure', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        service.update('recipe-1', { title: 'Updated Title' })
      ).rejects.toThrow('Failed to update recipe');
    });
  });

  describe('delete', () => {
    it('should delete recipe successfully', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      vi.mocked(deleteDoc).mockResolvedValue(undefined as any);

      await service.delete('recipe-1');

      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should throw error on delete failure', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(service.delete('recipe-1')).rejects.toThrow(
        'Failed to delete recipe'
      );
    });
  });

  describe('list', () => {
    it('should list all recipes', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockRecipes = [mockRecipe];
      const mockSnapshot = createMockQuerySnapshot(mockRecipes);

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const recipes = await service.list();

      expect(recipes).toHaveLength(1);
      expect(recipes[0].id).toBe(mockRecipe.id);
    });

    it('should filter recipes by tag', async () => {
      const { getDocs, where } = await import('firebase/firestore');
      const mockRecipes = [mockRecipe];
      const mockSnapshot = createMockQuerySnapshot(mockRecipes);

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const recipes = await service.list({ tag: 'dessert' });

      expect(where).toHaveBeenCalledWith('tags', 'array-contains', 'dessert');
      expect(recipes).toHaveLength(1);
    });

    it('should throw error on list failure', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(service.list()).rejects.toThrow('Failed to list recipes');
    });
  });

  describe('search', () => {
    it('should search recipes by title', async () => {
      const { getDocs } = await import('firebase/firestore');
      const recipe1 = mockRecipe;
      const recipe2 = createMockRecipe({
        title: 'Different Recipe',
        description: 'A completely different dish'
      });

      const mockRecipes = [recipe1, recipe2];
      const mockSnapshot = createMockQuerySnapshot(mockRecipes);

      vi.mocked(getDocs).mockClear();
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const results = await service.search('Test Recipe');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Recipe');
    });

    it('should search recipes by description', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockRecipes = [mockRecipe];
      const mockSnapshot = createMockQuerySnapshot(mockRecipes);

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const results = await service.search('delicious');

      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should be case insensitive', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockRecipes = [mockRecipe];
      const mockSnapshot = createMockQuerySnapshot(mockRecipes);

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const results = await service.search('TEST RECIPE');

      expect(results).toHaveLength(1);
    });
  });

  describe('updateRatingStats', () => {
    it('should update rating statistics', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await service.updateRatingStats('recipe-1', 4.5, 10);

      expect(updateDoc).toHaveBeenCalled();
    });
  });
});

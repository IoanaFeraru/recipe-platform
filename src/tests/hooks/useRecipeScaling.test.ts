import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecipeScaling } from '@/hooks/useRecipeScaling';
import { RecipeModel } from '@/lib/models/Recipe.model';
import { createMockRecipe } from '../utils/mockData';

describe('useRecipeScaling', () => {
  let mockRecipeModel: RecipeModel;

  beforeEach(() => {
    const mockRecipe = createMockRecipe({
      servings: 4,
      ingredients: [
        { name: 'Flour', quantity: 2, unit: 'cup' },
        { name: 'Sugar', quantity: 1, unit: 'cup' },
        { name: 'Eggs', quantity: 4, unit: 'piece' },
      ],
    });
    mockRecipeModel = new RecipeModel(mockRecipe);
  });

  it('should initialize with recipe servings', () => {
    const { result } = renderHook(() => useRecipeScaling(mockRecipeModel));
    expect(result.current.currentServings).toBe(4);
  });

  it('should increment servings', () => {
    const { result } = renderHook(() => useRecipeScaling(mockRecipeModel));

    act(() => {
      result.current.handleServingsChange(1);
    });

    expect(result.current.currentServings).toBe(5);
  });

  it('should decrement servings', () => {
    const { result } = renderHook(() => useRecipeScaling(mockRecipeModel));

    act(() => {
      result.current.handleServingsChange(-1);
    });

    expect(result.current.currentServings).toBe(3);
  });

  it('should not go below 1 serving', () => {
    const { result } = renderHook(() => useRecipeScaling(mockRecipeModel));

    act(() => {
      result.current.handleServingsChange(-10);
    });

    expect(result.current.currentServings).toBe(1);
  });

  it('should scale ingredients correctly', () => {
    const { result } = renderHook(() => useRecipeScaling(mockRecipeModel));

    act(() => {
      result.current.handleServingsChange(4);
    });

    const scaledIngredients = result.current.scaledIngredients;
    expect(scaledIngredients).toHaveLength(3);
    expect(scaledIngredients[0].quantity).toBe(4); 
    expect(scaledIngredients[1].quantity).toBe(2); 
  });

  it('should reset servings to original', () => {
    const { result } = renderHook(() => useRecipeScaling(mockRecipeModel));

    act(() => {
      result.current.handleServingsChange(5);
    });
    expect(result.current.currentServings).toBe(9);

    act(() => {
      result.current.resetServings();
    });

    expect(result.current.currentServings).toBe(4);
  });

  it('should handle null recipe model', () => {
    const { result } = renderHook(() => useRecipeScaling(null));

    expect(result.current.currentServings).toBe(1);
    expect(result.current.scaledIngredients).toEqual([]);
  });

  it('should memoize scaled ingredients', () => {
    const { result, rerender } = renderHook(() => useRecipeScaling(mockRecipeModel));

    const firstScaled = result.current.scaledIngredients;
    rerender();
    const secondScaled = result.current.scaledIngredients;

    expect(firstScaled).toBe(secondScaled);
  });
});

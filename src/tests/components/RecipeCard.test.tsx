import { describe, it, expect } from 'vitest';
import { createMockRecipe } from '../utils/mockData';

describe('RecipeCard', () => {
  it('should create mock recipe with required fields', () => {
    const mockRecipe = createMockRecipe();

    expect(mockRecipe).toBeDefined();
    expect(mockRecipe.title).toBe('Test Recipe');
    expect(mockRecipe.servings).toBe(8);
    expect(mockRecipe.difficulty).toBe('medium');
    expect(mockRecipe.tags).toBeInstanceOf(Array);
  });

  it('should override mock recipe fields', () => {
    const customRecipe = createMockRecipe({
      title: 'Custom Title',
      servings: 4
    });

    expect(customRecipe.title).toBe('Custom Title');
    expect(customRecipe.servings).toBe(4);
  });

  it('should have ingredients array', () => {
    const mockRecipe = createMockRecipe();
    expect(mockRecipe.ingredients).toBeInstanceOf(Array);
    expect(mockRecipe.ingredients.length).toBeGreaterThan(0);
  });

  it('should have steps array', () => {
    const mockRecipe = createMockRecipe();
    expect(mockRecipe.steps).toBeInstanceOf(Array);
    expect(mockRecipe.steps.length).toBeGreaterThan(0);
  });

  it('should have valid rating data', () => {
    const mockRecipe = createMockRecipe();
    expect(mockRecipe.avgRating || 0).toBeGreaterThanOrEqual(0);
    expect(mockRecipe.avgRating || 0).toBeLessThanOrEqual(5);
  });

  it('should handle dietary options', () => {
    const veganRecipe = createMockRecipe({
      dietary: ['vegan']
    });

    expect(veganRecipe.dietary).toContain('vegan');
  });
});

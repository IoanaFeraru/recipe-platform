import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecipeFilters } from '@/hooks/useRecipeFilters';

describe('useRecipeFilters', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useRecipeFilters());

    expect(result.current.filters).toEqual({
      selectedTag: null,
      dietary: [],
      difficulty: null,
      mealType: '',
      sortBy: 'dateDesc',
      search: '',
    });
  });

  it('should initialize with custom search', () => {
    const { result } = renderHook(() => useRecipeFilters('pasta'));

    expect(result.current.filters.search).toBe('pasta');
  });

  it('should set selected tag', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setSelectedTag('dessert');
    });

    expect(result.current.filters.selectedTag).toBe('dessert');
  });

  it('should set dietary options', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setDietary(['vegan']);
    });

    expect(result.current.filters.dietary).toEqual(['vegan', 'vegetarian']);
  });

  it('should set difficulty', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setDifficulty('easy');
    });

    expect(result.current.filters.difficulty).toBe('easy');
  });

  it('should set meal type', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setMealType('breakfast');
    });

    expect(result.current.filters.mealType).toBe('breakfast');
  });

  it('should set sort option', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setSortBy('az');
    });

    expect(result.current.filters.sortBy).toBe('az');
  });

  it('should set search', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setSearch('chocolate');
    });

    expect(result.current.filters.search).toBe('chocolate');
  });

  it('should calculate active filters count correctly', () => {
    const { result } = renderHook(() => useRecipeFilters());

    expect(result.current.activeFiltersCount).toBe(0);

    act(() => {
      result.current.setSelectedTag('dessert');
      result.current.setDietary(['vegan']);
      result.current.setDifficulty('easy');
      result.current.setMealType('lunch');
    });

    // 1 tag + 1 dietary + 1 difficulty + 1 mealType = 4
    expect(result.current.activeFiltersCount).toBe(4);
  });

  it('should not count search and sort in active filters', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setSearch('pasta');
      result.current.setSortBy('az');
    });

    expect(result.current.activeFiltersCount).toBe(0);
  });

  it('should reset filters but keep search', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setSelectedTag('dessert');
      result.current.setDietary(['vegan']);
      result.current.setDifficulty('hard');
      result.current.setMealType('dinner');
      result.current.setSearch('chocolate');
      result.current.setSortBy('az');
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({
      selectedTag: null,
      dietary: [],
      difficulty: null,
      mealType: '',
      sortBy: 'dateDesc',
      search: 'chocolate',
    });
  });

  it('should handle multiple filter updates', () => {
    const { result } = renderHook(() => useRecipeFilters());

    act(() => {
      result.current.setSelectedTag('dessert');
    });
    act(() => {
      result.current.setSelectedTag('main');
    });
    act(() => {
      result.current.setSelectedTag(null);
    });

    expect(result.current.filters.selectedTag).toBeNull();
  });
});

import { Recipe } from '@/types/recipe';
import { Comment } from '@/types/comment';

export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
};

export const mockRecipe: Recipe = {
  id: 'recipe-1',
  title: 'Test Recipe',
  description: 'A delicious test recipe',
  ingredients: [
    { name: 'Flour', quantity: 2, unit: 'cup' },
    { name: 'Sugar', quantity: 1, unit: 'cup' },
    { name: 'Eggs', quantity: 3, unit: 'piece' },
  ],
  steps: [
    { text: 'Mix dry ingredients' },
    { text: 'Add wet ingredients' },
    { text: 'Bake at 350°F for 30 minutes' },
  ],
  minActivePrepTime: 15,
  maxActivePrepTime: 15,
  minPassiveTime: 30,
  maxPassiveTime: 30,
  servings: 8,
  difficulty: 'medium',
  imageUrl: 'https://example.com/recipe.jpg',
  authorId: 'test-user-id',
  authorName: 'Test User',
  createdAt: new Date('2024-01-01'),
  avgRating: 4.5,
  reviewCount: 10,
  mealType: 'dessert',
  dietary: ['vegetarian'],
  tags: ['baking', 'dessert'],
};

export const mockRecipes: Recipe[] = [
  mockRecipe,
  {
    ...mockRecipe,
    id: 'recipe-2',
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta dish',
    difficulty: 'easy',
    mealType: 'main',
    dietary: [],
    avgRating: 4.8,
    reviewCount: 25,
  },
  {
    ...mockRecipe,
    id: 'recipe-3',
    title: 'Vegan Buddha Bowl',
    description: 'Healthy and colorful bowl',
    difficulty: 'easy',
    mealType: 'main',
    dietary: ['vegan'],
    avgRating: 4.2,
    reviewCount: 15,
  },
];

export const mockComment: Comment = {
  id: 'comment-1',
  recipeId: 'recipe-1',
  userId: 'test-user-id',
  userEmail: 'test@example.com',
  userPhotoURL: 'https://example.com/photo.jpg',
  text: 'Great recipe!',
  rating: 5,
  createdAt: new Date('2024-01-15'),
};

export const mockComments: Comment[] = [
  mockComment,
  {
    ...mockComment,
    id: 'comment-2',
    rating: 4,
    text: 'Very good, but could use more salt',
    createdAt: new Date('2024-01-16'),
  },
  {
    ...mockComment,
    id: 'comment-3',
    userId: 'another-user-id',
    userEmail: 'another@example.com',
    rating: 5,
    text: 'Perfect!',
    createdAt: new Date('2024-01-17'),
  },
];

// Factory functions
export function createMockRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    ...mockRecipe,
    ...overrides,
    id: overrides.id || `recipe-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export function createMockComment(overrides: Partial<Comment> = {}): Comment {
  return {
    ...mockComment,
    ...overrides,
    id: overrides.id || `comment-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export function createMockUser(overrides: Partial<typeof mockUser> = {}) {
  return {
    ...mockUser,
    ...overrides,
  };
}

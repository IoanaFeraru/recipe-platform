# CookHub Code Refactoring Plan

## 🎯 Goals
1. **Separation of Concerns**: Separate business logic from UI
2. **Reusability**: Create modular, reusable components
3. **Maintainability**: Clear structure and consistent patterns
4. **Type Safety**: Strong typing throughout
5. **Testability**: Easier to test individual units

---

## 📁 Proposed Folder Structure

```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── common/            # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   ├── forms/             # Form-specific components
│   │   ├── RecipeForm/
│   │   ├── IngredientInput/
│   │   └── StepInput/
│   ├── features/          # Feature-specific components
│   │   ├── recipe/
│   │   ├── comments/
│   │   └── favorites/
│   └── layout/            # Layout components
│       ├── Navbar/
│       └── Footer/
├── hooks/                 # Custom React hooks
│   ├── useFavorites.ts
│   ├── useComments.ts
│   └── useImageUpload.ts
├── lib/
│   ├── api/              # API calls
│   ├── services/         # Business logic services
│   │   ├── RecipeService.ts
│   │   ├── CommentService.ts
│   │   ├── FavoriteService.ts
│   │   └── StorageService.ts
│   ├── models/           # Data models (OOP)
│   │   ├── Comment.model.ts
│   │   └── User.model.ts
│   ├── utils/            # Utility functions
│   │   ├── validation.ts
│   │   └── time.ts
│   └── constants/        # Constants and configs
```

---

## 🏗️ Architecture Patterns

### 1. **Object-Oriented Programming (OOP)**

#### Service Layer Pattern
```typescript
// RecipeService.ts - Encapsulates all recipe operations
class RecipeService {
  private collection = collection(db, "recipes");
  
  async create(recipe: Recipe): Promise<string>
  async update(id: string, data: Partial<Recipe>): Promise<void>
  async delete(id: string): Promise<void>
  async getById(id: string): Promise<Recipe | null>
  async list(filters?: RecipeFilters): Promise<Recipe[]>
}
```

#### Model Classes
```typescript
// Recipe.model.ts - Domain model with business logic
class RecipeModel {
  constructor(private data: Recipe) {}
  
  getTotalTime(): number
  getScaledIngredients(servings: number): Ingredient[]
  isVegetarian(): boolean
  validate(): ValidationResult
}
```

### 2. **Functional Programming**

#### Pure Functions
```typescript
// formatting.ts
export const formatTime = (minutes: number): string => { ... }
export const formatDate = (date: Date): string => { ... }
export const calculateScaledQuantity = (
  quantity: number,
  baseServings: number,
  targetServings: number
): number => { ... }
```

#### Custom Hooks (Functional + Hooks)
```typescript
// useRecipes.ts
export const useRecipes = (filters?: RecipeFilters) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Logic here
  return { recipes, loading, error, refetch };
}
```

---

## 🔧 Key Refactoring Areas

### 1. **Extract Business Logic from Components**

**Before:**
```typescript
// Inside RecipeModal.tsx
const handleSubmit = async () => {
  // 200+ lines of validation, transformation, upload logic
}
```

**After:**
```typescript
// RecipeModal.tsx (UI only)
const handleSubmit = async (formData: RecipeFormData) => {
  await recipeService.create(formData);
}

// RecipeService.ts (Business logic)
class RecipeService {
  async create(data: RecipeFormData) {
    const validated = this.validate(data);
    const uploaded = await this.uploadImages(validated);
    return this.save(uploaded);
  }
}
```

### 2. **Component Composition**

Break large components into smaller, focused ones:

```typescript
// RecipeCard.tsx
<RecipeCard>
  <RecipeImage />
  <RecipeHeader />
  <RecipeStats />
  <RecipeDietaryBadges />
  <RecipeTags />
</RecipeCard>
```

### 3. **Custom Hooks for State Management**

```typescript
// useRecipeForm.ts
export const useRecipeForm = (initialData?: Recipe) => {
  const [formData, setFormData] = useState(initialData || defaultRecipe);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  const updateField = (field: string, value: any) => { ... }
  const validate = () => { ... }
  const reset = () => { ... }
  
  return { formData, errors, isValid, updateField, validate, reset };
}
```

### 4. **Service Layer for API Calls**

```typescript
// services/RecipeService.ts
export class RecipeService {
  async create(recipe: Recipe): Promise<string> { ... }
  async update(id: string, data: Partial<Recipe>): Promise<void> { ... }
  async delete(id: string): Promise<void> { ... }
  async list(filters?: RecipeFilters): Promise<Recipe[]> { ... }
}

// Export singleton instance
export const recipeService = new RecipeService();
```

---

## 🎨 Design Patterns to Implement

1. **Repository Pattern**: Abstract data access
2. **Factory Pattern**: Create complex objects (Recipe, Comment)
3. **Observer Pattern**: Already using (React state, Firestore listeners)
4. **Composition**: Build complex UIs from simple components
5. **Dependency Injection**: Pass services to components via context

---

## 📝 Implementation Priority

### Phase 1: Core Infrastructure
1. ✅ Create service classes (RecipeService, CommentService, etc.)
2. ✅ Extract utility functions
3. ✅ Create custom hooks
4. ✅ Define clear types and interfaces

### Phase 2: Component Refactoring
5. ✅ Break down large components
6. ✅ Extract reusable UI components
7. ✅ Implement composition patterns

### Phase 3: Testing & Documentation
8. ✅ Add unit tests for services
9. ✅ Add component tests
10. ✅ Document APIs and patterns

---

## 🚀 Benefits

- **Maintainability**: Changes are isolated and easier to implement
- **Testability**: Services and utilities can

# 🚀 CookHub Refactoring Implementation Guide

## Overview

This guide provides step-by-step instructions for refactoring your CookHub application to follow clean code principles using OOP and Functional Programming paradigms.

---

## 📋 Phase 1: Create Service Layer (OOP)

### Step 2: Implement Core Services

#### B. CommentService.ts
```typescript
// src/lib/services/CommentService.ts
export class CommentService {
  private collection = collection(db, "comments");
  
  async create(comment: Omit<Comment, "id">): Promise<string>
  async getByRecipe(recipeId: string): Promise<Comment[]>
  async update(id: string, data: Partial<Comment>): Promise<void>
  async delete(id: string): Promise<void>
  async updateRecipeRating(recipeId: string, ownerId: string): Promise<void>
}

export const commentService = new CommentService();
```

#### C. FavoriteService.ts
```typescript
// src/lib/services/FavoriteService.ts
export class FavoriteService {
  async getFavorites(userId: string): Promise<string[]>
  async addFavorite(userId: string, recipeId: string): Promise<void>
  async removeFavorite(userId: string, recipeId: string): Promise<void>
  async isFavorite(userId: string, recipeId: string): Promise<boolean>
}

export const favoriteService = new FavoriteService();
```

---

## 📋 Phase 2: Create Utility Functions (Functional)

### Step 1: Create Utils Directory
```bash
mkdir -p src/lib/utils
```

### Step 2: Extract Pure Functions

#### B. validation.ts
```typescript
// src/lib/utils/validation.ts
export const isValidEmail = (email: string): boolean => { ... }
export const isValidPassword = (password: string): boolean => { ... }
export const isValidUrl = (url: string): boolean => { ... }
```

#### C. sorting.ts
```typescript
// src/lib/utils/sorting.ts
export const sortByDate = (a: Recipe, b: Recipe): number => { ... }
export const sortByTitle = (a: Recipe, b: Recipe): number => { ... }
export const sortByRating = (a: Recipe, b: Recipe): number => { ... }
```

---

## 📋 Phase 3: Create Custom Hooks

### Step 1: Implement Data Hooks

#### B. useComments.ts
```typescript
// src/hooks/useComments.ts
export const useComments = (recipeId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const addComment = async (text: string, rating?: number) => { ... }
  const deleteComment = async (id: string) => { ... }
  
  return { comments, loading, addComment, deleteComment };
}
```

#### C. useFavorites.ts (Refactor existing context)
```typescript
// src/hooks/useFavorites.ts
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const addFavorite = async (recipeId: string) => { ... }
  const removeFavorite = async (recipeId: string) => { ... }
  const isFavorite = (recipeId: string) => { ... }
  
  return { favorites, addFavorite, removeFavorite, isFavorite };
}
```

---

## 📋 Phase 4: Component Refactoring

### Step 1: Break Down Large Components

#### Before: RecipeModal (400+ lines)
```typescript
// Single massive component with all logic
export default function RecipeModal({ ... }) {
  // 400+ lines of state, handlers, JSX
}
```

#### After: Modular Structure
```typescript
// RecipeModal.tsx (orchestrator)
export default function RecipeModal({ ... }) {
  const form = useRecipeForm(editRecipe);
  const { uploadImage } = useImageUpload();
  
  return <RecipeModalLayout>
    <RecipeBasicInfo form={form} />
    <RecipeIngredients form={form} />
    <RecipeSteps form={form} />
    <RecipeMetadata form={form} />
  </RecipeModalLayout>
}

// RecipeBasicInfo.tsx (40 lines)
// RecipeIngredients.tsx (60 lines)
// RecipeSteps.tsx (80 lines)
// RecipeMetadata.tsx (50 lines)
```

### Step 2: Create Reusable Components

```
src/components/
├── common/
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   ├── Modal/
│   └── Card/
├── forms/
│   ├── IngredientInput/
│   ├── StepInput/
│   └── TimeInput/
└── features/
    ├── recipe/
    │   ├── RecipeCard/
    │   ├── RecipeHeader/
    │   ├── RecipeStats/
    │   └── RecipeImage/
    └── comments/
        ├── CommentList/
        ├── CommentItem/
        └── CommentForm/
```

---

## 📋 Phase 5: Update Existing Components

### Example: Refactor src/app/page.tsx

#### Before (300+ lines with mixed concerns)
```typescript
export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  // ... 50+ lines of state
  
  useEffect(() => {
    // Complex fetch logic
  }, [many, dependencies]);
  
  const filteredRecipes = recipes.filter(...).sort(...);
  
  // ... 200+ lines of JSX
}
```

#### After (Clean and focused)
```typescript
export default function HomePage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  
  // Use custom hooks for data
  const { recipes, loading } = useRecipes({ search }, true);
  
  // Use custom hooks for filters
  const { filters, updateFilter } = useRecipeFilters();
  
  // Pure function for client-side filtering
  const filteredRecipes = useMemo(
    () => applyFilters(recipes, filters),
    [recipes, filters]
  );
  
  return <RecipeGrid recipes={filteredRecipes} loading={loading} />;
}
```

---

## 📋 Phase 6: Type Definitions

### Create Extended Types
```typescript
// src/types/recipe.ts - ADD:
export interface RecipeFilters {
  tag?: string;
  dietary?: DietaryOption[];
  difficulty?: "easy" | "medium" | "hard";
  mealType?: string;
  search?: string;
}

export interface RecipeFormData {
  // ... form-specific types
}

export interface RecipeStats {
  avgRating: number;
  reviewCount: number;
  totalTime: number;
  difficulty: "easy" | "medium" | "hard";
}
```

---

## 📋 Phase 7: Testing

### Unit Tests for Services
```typescript
// src/lib/services/__tests__/RecipeService.test.ts
describe("RecipeService", () => {
  describe("create", () => {
    it("should create a recipe with default values", async () => {
      const recipe = { title: "Test", ... };
      const id = await recipeService.create(recipe);
      expect(id).toBeDefined();
    });
  });
});
```

### Unit Tests for Utils
```typescript
// src/lib/utils/__tests__/formatting.test.ts
describe("formatTime", () => {
  it("should format hours and minutes correctly", () => {
    expect(formatTime(150)).toBe("2h 30m");
    expect(formatTime(60)).toBe("1h");
    expect(formatTime(45)).toBe("45m");
  });
});
```

---

## 🎯 Migration Checklist

### Phase 2: Hooks ✅
- [ ] Create useImageUpload hook (refactor existing)

### Phase 3: Components
- [ ] Refactor RecipeModal (break into smaller components)
- [ ] Refactor HomePage
- [ ] Create reusable Input components
- [ ] Create reusable Card components

### Phase 4: Testing
- [ ] Add service tests
- [ ] Add utility function tests
- [ ] Add component tests

---

## 🔄 Example Migration: HomePage

### Step-by-Step

1. **Extract data fetching to hook**
```typescript
// Before: In component
useEffect(() => {
  const loadRecipes = async () => { ... }
  loadRecipes();
}, []);

// After: In custom hook
const { recipes, loading } = useRecipes();
```

2. **Extract filtering logic to utils**
```typescript
// Before: In component
const filtered = recipes.filter(r => {
  const matchesSearch = ...
  const matchesTag = ...
  return matchesSearch && matchesTag;
});

// After: Pure function
const filtered = applyRecipeFilters(recipes, filters);
```

3. **Extract sorting to utils**
```typescript
// Before: In component
const sorted = [...filtered].sort((a, b) => {
  switch (sortBy) { ... }
});

// After: Pure function
const sorted = sortRecipes(filtered, sortBy);
```

4. **Use memoization**
```typescript
const processedRecipes = useMemo(
  () => sortRecipes(applyRecipeFilters(recipes, filters), sortBy),
  [recipes, filters, sortBy]
);
```

## 🚀 Next Steps

1. Start with Phase 1 (Services)
2. Move to Phase 2 (Utils & Hooks)
3. Gradually refactor components one at a time
4. Add tests as you go
5. Update documentation

## 📚 Resources

- [React Docs - Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring by Martin Fowler](https://refactoring.com/)

---

**Remember**: Refactor incrementally. Don't try to change everything at once!
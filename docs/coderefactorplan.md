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
1. [ ] Break down large components
2. [ ] Extract reusable UI components
3. [ ] Implement composition patterns

### Phase 3: Testing & Documentation
1. [ ] Add unit tests for services
2. [ ] Add component tests
3. [ ] Document APIs and patterns


## 📋 Phase 2: Create Utility Functions (Functional)

#### C. sorting.ts
```typescript
// src/lib/utils/sorting.ts
export const sortByDate = (a: Recipe, b: Recipe): number => { ... }
export const sortByTitle = (a: Recipe, b: Recipe): number => { ... }
export const sortByRating = (a: Recipe, b: Recipe): number => { ... }
```


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
- [ ] Refractor all components!

### Phase 4: Testing
- [ ] Add service tests
- [ ] Add utility function tests
- [ ] Add component tests

---

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
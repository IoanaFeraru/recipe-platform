# CookHub Codebase Refactoring Plan

### Issues 🔴

**Critical:**
4. RecipeCard (160+ lines) 
5. FilterBar (260+ lines) 
6. CommentsRatings (150+ lines)

**Moderate:**
1. Navbar (90+ lines)
2. ProfilePage (120+ lines)
3. Login/Register pages
4. Missing test coverage across all components

**Architecture:**
11. No error boundary components
12. No loading state components (reused inline)
13. Inconsistent prop drilling vs context usage
14. Mixed validation patterns (inline vs utils)


## PHASE 2: UI Component Refactoring (Priority: MEDIUM)

### CHECKPOINT 2.1: RecipeCard Refactoring
**Target LOC Reduction: 160 → 90 (44% reduction)**

**New Structure:**
```
components/RecipeCard/
├── RecipeCard.tsx (Main component, 60 lines)
├── RecipeCardImage.tsx (20 lines)
├── RecipeCardContent.tsx (40 lines)
├── RecipeCardStats.tsx (30 lines)
├── RecipeCardBadges.tsx (25 lines)
└── index.ts
```

**Actions:**
- [ ] Extract RecipeCardImage (image + fallback)
- [ ] Extract RecipeCardContent (title + description)
- [ ] Extract RecipeCardStats (servings, ingredients, time, steps)
- [ ] Extract RecipeCardBadges (difficulty + dietary + tags)
- [ ] Refactor main RecipeCard to compose children
- [ ] Move favorite logic to hook (useIsFavorite already exists)
- [ ] Test favorite toggle
- [ ] Test tag clicks
- [ ] Test card navigation

---

### CHECKPOINT 2.2: FilterBar Refactoring
**Target LOC Reduction: 260 → 120 (54% reduction)**

**New Structure:**
```
components/FilterBar/
├── FilterBar.tsx (Main orchestrator, 70 lines)
├── SortDropdown.tsx (30 lines)
├── DietaryFilter.tsx (40 lines)
├── DifficultyFilter.tsx (30 lines)
├── MealTypeFilter.tsx (30 lines)
├── ActiveFiltersDisplay.tsx (40 lines)
└── index.ts
```

**Actions:**
- [ ] Create SortDropdown component
- [ ] Create DietaryFilter component (multi-select badges)
- [ ] Create DifficultyFilter component (easy/medium/hard)
- [ ] Create MealTypeFilter component (dropdown)
- [ ] Create ActiveFiltersDisplay component (removable tags)
- [ ] Refactor main FilterBar to compose children
- [ ] Test filter combinations
- [ ] Test reset filters
- [ ] Test active filters display

---

### CHECKPOINT 2.3: CommentsRatings Decomposition
**Target LOC Reduction: 150 → 80 (47% reduction)**

**New Structure:**
```
components/CommentsRatings/
├── CommentsRatings.tsx (Orchestrator, 80 lines)
├── CommentsSection.tsx (40 lines)
├── CommentsList.tsx (30 lines)
└── index.ts
```

**Actions:**
- [ ] Create CommentsSection component (header + rating display)
- [ ] Create CommentsList component (list rendering)
- [ ] Refactor main component to orchestrate
- [ ] Test real-time updates
- [ ] Test comment submission
- [ ] Test rating updates

---

### CHECKPOINT 2.4: Navbar Refactoring
**Target LOC Reduction: 90 → 60 (33% reduction)**

**New Structure:**
```
components/Navbar/
├── Navbar.tsx (Main component, 60 lines)
├── NavbarLogo.tsx (15 lines)
├── NavbarSearch.tsx (25 lines)
├── NavbarActions.tsx (40 lines)
└── index.ts
```

**Actions:**
- [ ] Extract NavbarLogo component
- [ ] Extract NavbarSearch component (search input + handler)
- [ ] Extract NavbarActions component (auth buttons + profile + theme)
- [ ] Refactor main Navbar to compose children
- [ ] Test search functionality
- [ ] Test auth flows
- [ ] Test theme toggle

---

## PHASE 3: Forms & Auth (Priority: MEDIUM)

### CHECKPOINT 3.1: Auth Pages Refactoring

**New Structure:**
```
hooks/
├── useLoginForm.ts (NEW - login form state + validation)
├── useRegisterForm.ts (NEW - register form state + validation)
└── usePasswordForm.ts (NEW - password form logic)

components/Auth/
├── FormField.tsx (NEW - reusable form field)
├── PasswordField.tsx (NEW - password with show/hide)
└── PasswordStrength.tsx (NEW - strength indicator)
```

**Actions:**
- [ ] Create useLoginForm hook (email, password, validation, submission)
- [ ] Create useRegisterForm hook (all register fields + validation)
- [ ] Create usePasswordForm hook (password change logic)
- [ ] Create FormField component (label + input + error)
- [ ] Create PasswordField component (password input with toggle)
- [ ] Create PasswordStrength component (strength bar + message)
- [ ] Refactor LoginPage to use hook + components
- [ ] Refactor RegisterPage to use hook + components
- [ ] Refactor ProfilePage password section
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test submission flows

---

### CHECKPOINT 3.2: ProfilePage Refactoring
**Target LOC Reduction: 120 → 70 (42% reduction)**

**New Structure:**
```
app/profile/page.tsx (Container, 70 lines)
components/Profile/
├── ProfilePhotoSection.tsx (40 lines)
├── ProfileNameSection.tsx (30 lines)
├── ProfilePasswordSection.tsx (40 lines)
├── ProfileDangerZone.tsx (30 lines)
└── index.ts
```

**Actions:**
- [ ] Extract ProfilePhotoSection (photo + upload + preview)
- [ ] Extract ProfileNameSection (name input + save)
- [ ] Extract ProfilePasswordSection (current + new password)
- [ ] Extract ProfileDangerZone (delete account)
- [ ] Refactor ProfilePage to compose sections
- [ ] Test photo upload
- [ ] Test name update
- [ ] Test password change
- [ ] Test account deletion

---

## PHASE 4: Infrastructure & Quality (Priority: HIGH)

### CHECKPOINT 4.1: Shared UI Components

**Create Reusable Components:**
```
components/UI/
├── LoadingSpinner.tsx (spinner with sizes)
├── ErrorMessage.tsx (error display with retry)
├── EmptyState.tsx (empty state with icon + message + CTA)
├── ConfirmDialog.tsx (confirmation modal)
├── Toast.tsx (toast notifications)
└── index.ts
```

**Actions:**
- [ ] Create LoadingSpinner component (small/medium/large)
- [ ] Create ErrorMessage component (message + retry button)
- [ ] Create EmptyState component (icon + message + optional CTA)
- [ ] Create ConfirmDialog component (title + message + actions)
- [ ] Create Toast component (success/error/info/warning)
- [ ] Replace inline loading states across app
- [ ] Replace inline error messages across app
- [ ] Replace inline empty states across app
- [ ] Replace window.confirm with ConfirmDialog
- [ ] Replace window.alert with Toast

---

### CHECKPOINT 4.2: Error Boundaries

**New Structure:**
```
components/ErrorBoundary/
├── ErrorBoundary.tsx (React error boundary)
├── PageErrorBoundary.tsx (page-level errors)
├── ComponentErrorBoundary.tsx (component-level errors)
└── index.ts
```

**Actions:**
- [ ] Create base ErrorBoundary component
- [ ] Create PageErrorBoundary (full page error UI)
- [ ] Create ComponentErrorBoundary (component fallback)
- [ ] Wrap app in RootErrorBoundary
- [ ] Wrap pages in PageErrorBoundary
- [ ] Wrap complex components in ComponentErrorBoundary
- [ ] Add error logging
- [ ] Test error scenarios

---

### CHECKPOINT 4.3: Testing Infrastructure

**Test Structure:**
```
src/tests/
├── components/
│   ├── Recipe/
│   ├── RecipeCard.test.tsx
│   ├── RecipeModal.test.tsx
│   ├── FilterBar.test.tsx
│   └── CommentsRatings.test.tsx
├── hooks/
│   ├── useRecipeScaling.test.ts
│   ├── useRecipeFilters.test.ts
│   └── useRecipePagination.test.ts
├── services/
│   ├── RecipeService.test.ts
│   ├── CommentService.test.ts
│   └── FavoriteService.test.ts
└── utils/
    ├── formatting.test.ts
    └── validation.test.ts
```

**Actions:**
- [ ] Set up Jest + React Testing Library
- [ ] Create test utilities (mock providers, factories)
- [ ] Write unit tests for all hooks (10+ hooks)
- [ ] Write unit tests for utility functions (20+ functions)
- [ ] Write integration tests for services (4 services)
- [ ] Write component tests for Recipe components (8 components)
- [ ] Write component tests for UI components (5+ components)
- [ ] Write E2E tests for critical flows (auth, create recipe, comment)
- [ ] Set up test coverage reporting (target: 80%+)
- [ ] Add CI test runner

---

## PHASE 5: Performance & Optimization (Priority: LOW)

### CHECKPOINT 5.1: Performance Optimizations

**Actions:**
- [ ] Audit React.memo usage (add to list items, cards)
- [ ] Audit useMemo usage (calculations, filtered data)
- [ ] Audit useCallback usage (event handlers, callbacks)
- [ ] Implement virtual scrolling for long lists (recipe grid, comments)
- [ ] Add image lazy loading
- [ ] Add code splitting for routes
- [ ] Add service worker for offline support
- [ ] Optimize bundle size (analyze, tree-shake, dynamic imports)
- [ ] Add performance monitoring
- [ ] Run Lighthouse audit (target: 90+ on all metrics)

---

### CHECKPOINT 5.2: Code Quality & Standards

**Actions:**
- [ ] Set up ESLint with strict rules
- [ ] Set up Prettier with consistent formatting
- [ ] Set up Husky for pre-commit hooks
- [ ] Add TypeScript strict mode
- [ ] Fix all TypeScript any types (30+ instances)
- [ ] Add JSDoc comments to all public functions
- [ ] Create component documentation (Storybook)
- [ ] Create API documentation
- [ ] Add code review checklist
- [ ] Create contributing guidelines

---

## Metrics & Success Criteria

### Code Metrics
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Avg Component LOC | 120 | 60 | 50% |
| Total Components | 35 | 65 | +30 |
| Custom Hooks | 8 | 18 | +10 |
| Test Coverage | 0% | 80% | +80% |
| TypeScript Errors | 0 | 0 | ✓ |
| Largest Component | 650 | 150 | 77% |

### Architecture Goals
- ✅ Domain models encapsulate business logic
- ✅ Services handle data operations
- ✅ Hooks manage feature logic
- ✅ Components are purely presentational
- ✅ Consistent error handling pattern
- ✅ Comprehensive test coverage
- ✅ Performance budgets met

### Timeline Estimate
- **Phase 1**: 3-4 days (Critical components)
- **Phase 2**: 3-4 days (UI components)
- **Phase 3**: 2-3 days (Forms & auth)
- **Phase 4**: 3-4 days (Infrastructure & testing)
- **Phase 5**: 2-3 days (Performance & quality)

**Total**: 13-18 days for complete refactoring

---

## Priority Execution Order

### Week 1: Critical Foundations
1. RecipeModal decomposition (CHECKPOINT 1.1)
2. HomePage refactoring (CHECKPOINT 1.2)
3. DashboardPage refactoring (CHECKPOINT 1.3)
4. Shared UI components (CHECKPOINT 4.1)

### Week 2: UI & Forms
5. RecipeCard refactoring (CHECKPOINT 2.1)
6. FilterBar refactoring (CHECKPOINT 2.2)
7. Auth pages refactoring (CHECKPOINT 3.1)
8. ProfilePage refactoring (CHECKPOINT 3.2)

### Week 3: Quality & Testing
9. Error boundaries (CHECKPOINT 4.2)
10. Testing infrastructure (CHECKPOINT 4.3)
11. Performance optimizations (CHECKPOINT 5.1)
12. Code quality & standards (CHECKPOINT 5.2)

---

## Post-Refactoring Maintenance

### Daily
- Run test suite
- Check TypeScript errors
- Review PRs against checklist

### Weekly
- Run Lighthouse audit
- Review bundle size
- Update documentation
- Refactor one component

### Monthly
- Dependency updates
- Security audit
- Performance review
- Architecture review

---

## Notes

- Preserve existing functionality throughout refactoring
- Add tests before major changes
- Deploy incrementally, not all at once
- Monitor production for regressions
- Keep old code in feature branches until verified
- Update documentation alongside code changes
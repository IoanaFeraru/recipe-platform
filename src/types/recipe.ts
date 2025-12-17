/**
 * Shared domain types for recipes and related concepts.
 *
 * This file defines the canonical data structures used across the application
 * (UI, validation, persistence, and querying). The goal is to keep these types
 * stable, explicit, and free of UI-specific concerns.
 */

/**
 * Supported dietary restrictions and preferences.
 *
 * Used for:
 * - filtering recipes
 * - displaying dietary badges
 * - validating user input
 */
export type DietaryOption =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "glutenFree"
  | "dairyFree"
  | "nutFree"
  | "halal"
  | "kosher";

/**
 * Allowed measurement units for ingredients.
 *
 * Includes metric, imperial, and qualitative units to support
 * free-form recipes (e.g. "salt to taste").
 */
export type MeasurementUnit =
  | "g"
  | "kg"
  | "mg"
  | "ml"
  | "l"
  | "cup"
  | "tbsp"
  | "tsp"
  | "oz"
  | "lb"
  | "piece"
  | "slice"
  | "pinch"
  | "to taste";

/**
 * Criteria used when filtering or searching for recipes.
 *
 * All fields are optional to allow incremental and composable filters.
 */
export interface RecipeFilters {
  tag?: string;
  difficulty?: "easy" | "medium" | "hard";
  authorId?: string;
  dietary?: DietaryOption[];
  mealType?: string;
  minServings?: number;
  maxServings?: number;
}

/**
 * Represents a single ingredient entry in a recipe.
 *
 * Quantity and unit are optional to support cases like:
 * - "salt to taste"
 * - "1 onion, finely chopped"
 */
export interface Ingredient {
  name: string;
  quantity?: number;
  unit?: MeasurementUnit;
  notes?: string;
}

/**
 * Core recipe entity.
 *
 * This model represents the persisted and transferred shape of a recipe.
 * Computed or derived values (e.g. ratings) are included to avoid repeated
 * aggregation at runtime.
 */
export interface Recipe {
  id?: string;

  title: string;
  description?: string;
  servings: number;

  ingredients: Ingredient[];
  steps: Array<{
    text: string;
    imageUrl?: string;
  }>;

  tags: string[];

  imageUrl?: string;

  authorId: string;
  authorName?: string;

  /**
   * Creation timestamp as stored by the persistence layer (e.g. Firestore).
   * Kept as `any` to avoid leaking infrastructure-specific types into the domain.
   */
  createdAt: any;

  /**
   * Aggregated rating data derived from user reviews.
   */
  avgRating?: number;
  reviewCount?: number;

  dietary: DietaryOption[];

  /**
   * Time estimates expressed as ranges to reflect real-world variability.
   */
  minActivePrepTime: number;
  maxActivePrepTime: number;
  minPassiveTime?: number;
  maxPassiveTime?: number;

  difficulty?: "easy" | "medium" | "hard";
  mealType?: string;
}
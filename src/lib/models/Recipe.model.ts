import { Recipe, Ingredient, DietaryOption } from "@/types/recipe";
import { formatTime, numberToFraction } from "@/lib/utils/formatting";

/**
 * Domain model wrapper for Recipe.
 *
 * Provides computed properties and small pieces of business logic that are
 * inconvenient to keep inside React components (formatting, scaling, guards).
 * This class should remain UI-agnostic: it may return display-ready strings,
 * but must not import component code or mutate global state.
 */
export class RecipeModel {
  constructor(private data: Recipe) {}

  get id(): string | undefined { return this.data.id; }
  get title(): string { return this.data.title; }
  get description(): string | undefined { return this.data.description; }
  get imageUrl(): string | undefined { return this.data.imageUrl; }
  get authorId(): string { return this.data.authorId; }
  get authorName(): string | undefined { return this.data.authorName; }
  get tags(): string[] { return this.data.tags; }
  get steps(): Array<{ text: string; imageUrl?: string }> { return this.data.steps; }

  get difficulty(): "easy" | "medium" | "hard" { return this.data.difficulty ?? "medium"; }
  get ingredients(): Ingredient[] { return this.data.ingredients; }
  get dietary(): DietaryOption[] { return this.data.dietary; }

  get totalActiveTime(): number { return this.data.maxActivePrepTime; }
  get totalPassiveTime(): number { return this.data.maxPassiveTime || 0; }
  get totalTime(): number { return this.totalActiveTime + this.totalPassiveTime; }
  get hasPassiveTime(): boolean { return this.totalPassiveTime > 0; }
  get formattedTotalTime(): string { return formatTime(this.totalTime); }
  get formattedActiveTime(): string { return formatTime(this.totalActiveTime); }
  get formattedPassiveTime(): string { return formatTime(this.totalPassiveTime); }

  get servings(): number { return this.data.servings; }

  /**
   * Returns a new ingredient list scaled to the requested servings.
   *
   * Keeps non-quantified ingredients (e.g., "salt to taste") as undefined quantity.
   * Rounds to 2 decimals for stability in UI editing.
   */
  getScaledIngredients(targetServings: number): Ingredient[] {
    const scaleFactor = targetServings / this.servings;

    return this.ingredients.map(ingredient => ({
      ...ingredient,
      quantity:
        ingredient.quantity !== undefined
          ? parseFloat((ingredient.quantity * scaleFactor).toFixed(2))
          : undefined
    }));
  }

  /**
   * Formats a single ingredient line for a given target servings value.
   * Uses fractional formatting to match typical culinary conventions.
   */
  getScaledIngredientText(
    ingredient: Ingredient,
    targetServings: number
  ): string {
    if (ingredient.quantity === undefined) return ingredient.name;

    const scaledQuantity = (ingredient.quantity / this.servings) * targetServings;
    const formattedQuantity = numberToFraction(scaledQuantity);

    let text = `${formattedQuantity}`;
    if (ingredient.unit) text += ` ${ingredient.unit}`;
    text += ` ${ingredient.name}`;
    if (ingredient.notes) text += ` (${ingredient.notes})`;

    return text;
  }

  /**
   * Dietary flag helpers used for badges/filters.
   */
  isDietary(option: DietaryOption): boolean { return this.dietary.includes(option); }
  isVegetarian(): boolean { return this.isDietary("vegetarian"); }
  isVegan(): boolean { return this.isDietary("vegan"); }
  isGlutenFree(): boolean { return this.isDietary("glutenFree"); }

  /**
   * Returns the CSS variable to use for the difficulty badge.
   * Keeps palette decisions centralized and consistent.
   */
  getDifficultyColor(): string {
    switch (this.data.difficulty) {
      case "easy":
        return "var(--color-success)";
      case "medium":
        return "var(--color-warning)";
      case "hard":
        return "var(--color-danger)";
      default:
        return "var(--color-text-muted)";
    }
  }

  /**
   * True when the recipe has at least one non-zero rating and at least one review.
   */
  hasRating(): boolean {
    return (this.data.avgRating || 0) > 0 && (this.data.reviewCount || 0) > 0;
  }

  /**
   * Returns a user-facing rating string suitable for cards and detail headers.
   */
  getFormattedRating(): string {
    if (!this.hasRating()) return "No ratings yet";
    return `${this.data.avgRating?.toFixed(1)} (${this.data.reviewCount} reviews)`;
  }

  /**
   * Validates the current recipe snapshot against basic business rules.
   * This does not replace schema validation; it is intended for UI feedback.
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title?.trim()) { errors.push("Title is required"); }

    if (this.servings < 1) { errors.push("Servings must be at least 1"); }
    if (this.ingredients.length === 0) { errors.push("At least one ingredient is required"); }

    if (this.data.steps.length === 0) { errors.push("At least one step is required"); }

    if (this.data.minActivePrepTime > this.data.maxActivePrepTime) { errors.push("Min active time cannot exceed max active time"); }

    if (
      this.data.minPassiveTime !== undefined &&
      this.data.maxPassiveTime !== undefined &&
      this.data.minPassiveTime > this.data.maxPassiveTime
    ) {
      errors.push("Min passive time cannot exceed max passive time");
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Returns a plain Recipe object (useful for serialization / Firestore writes).
   */
  toJSON(): Recipe {
    return { ...this.data };
  }

  /**
   * Returns a new RecipeModel with the provided partial updates applied.
   */
  update(updates: Partial<Recipe>): RecipeModel {
    return new RecipeModel({
      ...this.data,
      ...updates
    });
  }

  /**
   * Factory for converting Firestore data into a RecipeModel.
   * Keeps the conversion in one place so call sites stay consistent.
   */
  static fromFirestore(data: unknown, id: string): RecipeModel {
    return new RecipeModel({
      id,
      ...(data as object)
    } as Recipe);
  }

  /**
   * Creates a new "blank" recipe template for UI creation flows.
   */
  static createEmpty(authorId: string, authorName: string): RecipeModel {
    return new RecipeModel({
      title: "",
      description: "",
      servings: 4,
      ingredients: [],
      steps: [],
      tags: [],
      dietary: [],
      authorId,
      authorName,
      createdAt: new Date(),
      minActivePrepTime: 0,
      maxActivePrepTime: 0,
      difficulty: "medium",
      mealType: ""
    });
  }
}
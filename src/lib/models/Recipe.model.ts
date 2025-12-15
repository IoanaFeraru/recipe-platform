import { Recipe, Ingredient, DietaryOption } from "@/types/recipe";
import { formatTime, numberToFraction } from "@/lib/utils/formatting";

/**
 * RecipeModel - Domain model with business logic
 * Encapsulates recipe data and operations
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

  get difficulty(): "easy" | "medium" | "hard" {return this.data.difficulty ?? "medium"; }
  
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
   * Scale ingredients for a different number of servings
   */
  getScaledIngredients(targetServings: number): Ingredient[] {
    const scaleFactor = targetServings / this.servings;
    return this.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: ingredient.quantity
        ? parseFloat((ingredient.quantity * scaleFactor).toFixed(2))
        : undefined,
    }));
  }

  /**
   * Get formatted scaled ingredient text
   */
  getScaledIngredientText(ingredient: Ingredient, targetServings: number): string {
    if (!ingredient.quantity) return ingredient.name;

    const scaledQuantity = (ingredient.quantity / this.servings) * targetServings;
    const formattedQuantity = numberToFraction(scaledQuantity);

    let text = `${formattedQuantity}`;
    if (ingredient.unit) text += ` ${ingredient.unit}`;
    text += ` ${ingredient.name}`;
    if (ingredient.notes) text += ` (${ingredient.notes})`;

    return text;
  }

  /**
   * Dietarty checks
   */
  isDietary(option: DietaryOption): boolean { return this.dietary.includes(option); }
  isVegetarian(): boolean { return this.isDietary("vegetarian"); }
  isVegan(): boolean { return this.isDietary("vegan"); }
  isGlutenFree(): boolean { return this.isDietary("glutenFree"); }

  /**
   * Get difficulty color
   */
  getDifficultyColor(): string {
    switch (this.data.difficulty) {
      case "easy": return "var(--color-success)";
      case "medium": return "var(--color-warning)";
      case "hard": return "var(--color-danger)";
      default: return "var(--color-text-muted)";
    }
  }

  /**
   * Check if recipe has a rating
   */
  hasRating(): boolean {
    return (this.data.avgRating || 0) > 0 && (this.data.reviewCount || 0) > 0;
  }

  /**
   * Get formatted rating
   */
  getFormattedRating(): string {
    if (!this.hasRating()) return "No ratings yet";
    return `${this.data.avgRating?.toFixed(1)} (${this.data.reviewCount} reviews)`;
  }

  /**
   * Validate recipe data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title?.trim()) {
      errors.push("Title is required");
    }

    if (this.servings < 1) {
      errors.push("Servings must be at least 1");
    }

    if (this.ingredients.length === 0) {
      errors.push("At least one ingredient is required");
    }

    if (this.data.steps.length === 0) {
      errors.push("At least one step is required");
    }

    if (this.data.minActivePrepTime > this.data.maxActivePrepTime) {
      errors.push("Min active time cannot exceed max active time");
    }

    if (
      this.data.minPassiveTime &&
      this.data.maxPassiveTime &&
      this.data.minPassiveTime > this.data.maxPassiveTime
    ) {
      errors.push("Min passive time cannot exceed max passive time");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object
   */
  toJSON(): Recipe {
    return { ...this.data };
  }

  /**
   * Create a copy with updated data
   */
  update(updates: Partial<Recipe>): RecipeModel {
    return new RecipeModel({
      ...this.data,
      ...updates,
    });
  }

  /**
   * Static factory method
   */
  static fromFirestore(data: any, id: string): RecipeModel {
    return new RecipeModel({
      id,
      ...data,
    } as Recipe);
  }

  /**
   * Create empty recipe template
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
      mealType: "",
    });
  }
}
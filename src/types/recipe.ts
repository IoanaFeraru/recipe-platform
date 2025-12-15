export type DietaryOption =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "glutenFree"
  | "dairyFree"
  | "nutFree"
  | "halal"
  | "kosher";

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

export interface RecipeFilters {
  tag?: string;
  difficulty?: "easy" | "medium" | "hard"; 
  authorId?: string; 
  dietary?: DietaryOption[]; 
  mealType?: string;
  minServings?: number;
  maxServings?: number;
}

export interface Ingredient {
  name: string;
  quantity?: number;
  unit?: MeasurementUnit;
  notes?: string;
}

export interface Recipe {
  id?: string;
  title: string;
  description?: string;
  servings: number;
  ingredients: Ingredient[];
  steps: Array<{ text: string; imageUrl?: string }>;
  tags: string[];
  imageUrl?: string;
  authorId: string;
  authorName?: string;
  createdAt: any;
  avgRating?: number;
  reviewCount?: number;

  dietary: DietaryOption[];

  minActivePrepTime: number;
  maxActivePrepTime: number;
  minPassiveTime?: number;
  maxPassiveTime?: number;

  difficulty?: "easy" | "medium" | "hard";

  mealType?: string;
}

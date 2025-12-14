export interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  steps: Array<{ text: string; imageUrl?: string }>;
  tags: string[];
  imageUrl?: string;
  authorId: string;
  createdAt: any;
  isVegetarian: boolean;
  isVegan: boolean;
  minActivePrepTime: number;
  maxActivePrepTime: number;
  minPassiveTime?: number;
  maxPassiveTime?: number;
}
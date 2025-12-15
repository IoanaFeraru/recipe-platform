import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Recipe, RecipeFilters } from "@/types/recipe";

/**
 * RecipeService - Encapsulates all recipe-related business logic
 * Following OOP principles: Encapsulation, Single Responsibility
 */
export class RecipeService {
  private readonly collectionName = "recipes";
  private readonly collectionRef = collection(db, this.collectionName);

  /**
   * Create a new recipe
   */
  async create(recipeData: Omit<Recipe, "id">): Promise<string> {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...recipeData,
        createdAt: Timestamp.now(),
        avgRating: 0,
        reviewCount: 0,
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create recipe: ${error}`);
    }
  }

  /**
   * Get a single recipe by ID
   */
  async getById(id: string): Promise<Recipe | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Recipe;
    } catch (error) {
      throw new Error(`Failed to fetch recipe: ${error}`);
    }
  }

  /**
   * Update an existing recipe
   */
  async update(id: string, data: Partial<Recipe>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      throw new Error(`Failed to update recipe: ${error}`);
    }
  }

  /**
   * Delete a recipe
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${error}`);
    }
  }

  /**
   * Get all recipes with optional filtering
   */
  async list(filters?: RecipeFilters): Promise<Recipe[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters?.tag) {
        constraints.push(where("tags", "array-contains", filters.tag));
      }

      if (filters?.difficulty) {
        constraints.push(where("difficulty", "==", filters.difficulty));
      }

      if (filters?.dietary && filters.dietary.length > 0) {
        constraints.push(
          where("dietary", "array-contains-any", filters.dietary)
        );
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(this.collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
    } catch (error) {
      throw new Error(`Failed to list recipes: ${error}`);
    }
  }

  /**
   * Get recipes by author
   */
  async getByAuthor(authorId: string): Promise<Recipe[]> {
    try {
      const q = query(
        this.collectionRef,
        where("authorId", "==", authorId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
    } catch (error) {
      throw new Error(`Failed to fetch recipes by author: ${error}`);
    }
  }

  /**
   * Update recipe rating statistics
   */
  async updateRatingStats(
    recipeId: string,
    avgRating: number,
    reviewCount: number
  ): Promise<void> {
    try {
      await this.update(recipeId, { avgRating, reviewCount });
    } catch (error) {
      throw new Error(`Failed to update rating stats: ${error}`);
    }
  }

  /**
   * Search recipes by text
   */
  async search(searchTerm: string): Promise<Recipe[]> {
    // This is a client-side filter - consider using Algolia for production
    const allRecipes = await this.list();
    const term = searchTerm.toLowerCase();

    return allRecipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(term) ||
      recipe.description?.toLowerCase().includes(term) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  }
}

// Export singleton instance
export const recipeService = new RecipeService();
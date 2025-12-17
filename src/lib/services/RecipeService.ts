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
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { Recipe, RecipeFilters } from "@/types/recipe";

/**
 * Recipe persistence service.
 *
 * Provides CRUD and common query operations over the `recipes` collection.
 * This is a thin service-layer wrapper around Firestore to keep data access
 * concerns out of UI components.
 */
export class RecipeService {
  private readonly collectionName = "recipes";
  private readonly collectionRef = collection(db, this.collectionName);

  /**
   * Creates a recipe document and initializes denormalized rating fields.
   * Returns the generated Firestore document id.
   */
  async create(recipeData: Omit<Recipe, "id">): Promise<string> {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...recipeData,
        createdAt: Timestamp.now(),
        avgRating: 0,
        reviewCount: 0
      });

      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create recipe: ${String(error)}`);
    }
  }

  /**
   * Retrieves a recipe by id. Returns null when the document does not exist.
   */
  async getById(id: string): Promise<Recipe | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) return null;

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Recipe;
    } catch (error) {
      throw new Error(`Failed to fetch recipe: ${String(error)}`);
    }
  }

  /**
   * Applies a partial update to an existing recipe document.
   */
  async update(id: string, data: Partial<Recipe>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      throw new Error(`Failed to update recipe: ${String(error)}`);
    }
  }

  /**
   * Permanently deletes a recipe document. Related cleanup (comments, images,
   * favorites) must be handled by the caller/workflow.
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${String(error)}`);
    }
  }

  /**
   * Lists recipes matching optional filters, ordered by createdAt (newest first).
   *
   * Note: Firestore has limitations when combining multiple array operators.
   * If you need both `tag` and `dietary` filtering simultaneously, you may need
   * a different indexing strategy or client-side refinement.
   */
  async list(filters?: RecipeFilters): Promise<Recipe[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.tag) {
        constraints.push(where("tags", "array-contains", filters.tag));
      }

      if (filters?.difficulty) {
        constraints.push(where("difficulty", "==", filters.difficulty));
      }

      if (filters?.dietary && filters.dietary.length > 0) {
        constraints.push(where("dietary", "array-contains-any", filters.dietary));
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(this.collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Recipe[];
    } catch (error) {
      throw new Error(`Failed to list recipes: ${String(error)}`);
    }
  }

  /**
   * Lists recipes for a specific author, ordered by createdAt (newest first).
   */
  async getByAuthor(authorId: string): Promise<Recipe[]> {
    try {
      const q = query(
        this.collectionRef,
        where("authorId", "==", authorId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Recipe[];
    } catch (error) {
      throw new Error(`Failed to fetch recipes by author: ${String(error)}`);
    }
  }

  /**
   * Updates denormalized rating metrics stored on the recipe document.
   * Typically called after comment/review mutations.
   */
  async updateRatingStats(
    recipeId: string,
    avgRating: number,
    reviewCount: number
  ): Promise<void> {
    try {
      await this.update(recipeId, { avgRating, reviewCount });
    } catch (error) {
      throw new Error(`Failed to update rating stats: ${String(error)}`);
    }
  }

  /**
   * Client-side text search over title/description/tags.
   *
   * This fetches all recipes then filters in memory; it is acceptable only for
   * small datasets. For production-scale search, use a dedicated search index.
   */
  async search(searchTerm: string): Promise<Recipe[]> {
    const allRecipes = await this.list();
    const term = searchTerm.toLowerCase();

    return allRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(term) ||
      recipe.description?.toLowerCase().includes(term) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }
}

export const recipeService = new RecipeService();
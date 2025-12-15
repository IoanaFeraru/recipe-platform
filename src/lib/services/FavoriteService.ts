// src/lib/services/FavoriteService.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Unsubscribe,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Recipe } from "@/types/recipe";

/**
 * FavoriteService - Manages user favorites
 * Handles favorite operations and provides helper methods
 */
export class FavoriteService {
  private readonly collectionName = "favorites";

  /**
   * Get user's favorite recipe IDs
   */
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        // Initialize favorites document if it doesn't exist
        await setDoc(docRef, { recipeIds: [] });
        return [];
      }

      return snapshot.data().recipeIds || [];
    } catch (error) {
      throw new Error(`Failed to get favorites: ${error}`);
    }
  }

  /**
   * Listen to real-time favorite updates
   */
  listenToFavorites(
    userId: string,
    callback: (recipeIds: string[]) => void
  ): Unsubscribe {
    const docRef = doc(db, this.collectionName, userId);

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data().recipeIds || []);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error("Error listening to favorites:", error);
      }
    );
  }

  /**
   * Add a recipe to favorites
   */
  async addFavorite(userId: string, recipeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        // Create new favorites document
        await setDoc(docRef, { recipeIds: [recipeId] });
      } else {
        // Update existing favorites
        await updateDoc(docRef, {
          recipeIds: arrayUnion(recipeId),
        });
      }
    } catch (error) {
      throw new Error(`Failed to add favorite: ${error}`);
    }
  }

  /**
   * Remove a recipe from favorites
   */
  async removeFavorite(userId: string, recipeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        recipeIds: arrayRemove(recipeId),
      });
    } catch (error) {
      throw new Error(`Failed to remove favorite: ${error}`);
    }
  }

  /**
   * Check if a recipe is favorited by user
   */
  async isFavorite(userId: string, recipeId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.includes(recipeId);
    } catch (error) {
      console.error("Failed to check favorite status:", error);
      return false;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, recipeId: string): Promise<boolean> {
    const isFav = await this.isFavorite(userId, recipeId);

    if (isFav) {
      await this.removeFavorite(userId, recipeId);
      return false;
    } else {
      await this.addFavorite(userId, recipeId);
      return true;
    }
  }

  /**
   * Get full recipe objects for user's favorites
   */
  async getFavoriteRecipes(userId: string): Promise<Recipe[]> {
    try {
      const favoriteIds = await this.getFavorites(userId);

      if (favoriteIds.length === 0) {
        return [];
      }

      // Fetch all favorite recipes
      const recipePromises = favoriteIds.map(async (id) => {
        const docRef = doc(db, "recipes", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          return {
            id: snapshot.id,
            ...snapshot.data(),
          } as Recipe;
        }
        return null;
      });

      const recipes = await Promise.all(recipePromises);

      // Filter out null values (deleted recipes)
      return recipes.filter((recipe): recipe is Recipe => recipe !== null);
    } catch (error) {
      throw new Error(`Failed to get favorite recipes: ${error}`);
    }
  }

  /**
   * Get favorite count for a recipe
   */
  async getFavoriteCount(recipeId: string): Promise<number> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(
        favoritesRef,
        where("recipeIds", "array-contains", recipeId)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Failed to get favorite count:", error);
      return 0;
    }
  }

  /**
   * Get user's favorite statistics
   */
  async getFavoriteStats(userId: string): Promise<{
    totalFavorites: number;
    favoritesByCategory: Record<string, number>;
    recentlyAdded: string[];
  }> {
    try {
      const favorites = await this.getFavoriteRecipes(userId);

      const favoritesByCategory: Record<string, number> = {};

      favorites.forEach((recipe) => {
        const category = recipe.mealType || "Other";
        favoritesByCategory[category] =
          (favoritesByCategory[category] || 0) + 1;
      });

      // Sort by creation date (most recent first) and take top 5
      const recentlyAdded = favorites
        .sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5)
        .map((r) => r.id!)
        .filter(Boolean);

      return {
        totalFavorites: favorites.length,
        favoritesByCategory,
        recentlyAdded,
      };
    } catch (error) {
      throw new Error(`Failed to get favorite stats: ${error}`);
    }
  }

  /**
   * Remove deleted recipe from all users' favorites
   */
  async removeRecipeFromAllFavorites(recipeId: string): Promise<void> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(
        favoritesRef,
        where("recipeIds", "array-contains", recipeId)
      );

      const snapshot = await getDocs(q);

      const updatePromises = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          recipeIds: arrayRemove(recipeId),
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      throw new Error(
        `Failed to remove recipe from all favorites: ${error}`
      );
    }
  }

  /**
   * Export user's favorites (for backup/export feature)
   */
  async exportFavorites(userId: string): Promise<{
    userId: string;
    exportDate: string;
    favorites: Recipe[];
  }> {
    const favorites = await this.getFavoriteRecipes(userId);

    return {
      userId,
      exportDate: new Date().toISOString(),
      favorites,
    };
  }

  /**
   * Clear all favorites for a user
   */
  async clearAllFavorites(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await setDoc(docRef, { recipeIds: [] });
    } catch (error) {
      throw new Error(`Failed to clear favorites: ${error}`);
    }
  }

  /**
   * Batch add favorites
   */
  async addMultipleFavorites(
    userId: string,
    recipeIds: string[]
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        await setDoc(docRef, { recipeIds });
      } else {
        const currentFavorites = snapshot.data().recipeIds || [];
        const newFavorites = Array.from(
          new Set([...currentFavorites, ...recipeIds])
        );
        await updateDoc(docRef, { recipeIds: newFavorites });
      }
    } catch (error) {
      throw new Error(`Failed to add multiple favorites: ${error}`);
    }
  }
}

// Export singleton instance
export const favoriteService = new FavoriteService();
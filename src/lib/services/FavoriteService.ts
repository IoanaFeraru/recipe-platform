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
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { Recipe } from "@/types/recipe";

/**
 * Favorites persistence service.
 *
 * Stores favorites in a per-user document:
 * - Collection: `favorites`
 * - Doc id: userId
 * - Shape: { recipeIds: string[] }
 *
 * This favors simple reads/writes and realtime updates. It also means some
 * operations (e.g. fetching full recipes, counting favorites globally) require
 * additional reads/queries.
 */
export class FavoriteService {
  private readonly collectionName = "favorites";

  /**
   * Returns a user's favorite recipe ids. If the favorites document does not
   * exist yet, it is created as an empty set.
   */
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        await setDoc(docRef, { recipeIds: [] });
        return [];
      }

      return (snapshot.data().recipeIds || []) as string[];
    } catch (error) {
      throw new Error(`Failed to get favorites: ${String(error)}`);
    }
  }

  /**
   * Subscribes to realtime changes for a user's favorites document.
   * Caller must invoke the returned unsubscribe function.
   */
  listenToFavorites(
    userId: string,
    callback: (recipeIds: string[]) => void
  ): Unsubscribe {
    const docRef = doc(db, this.collectionName, userId);

    return onSnapshot(
      docRef,
      snapshot => {
        callback(snapshot.exists() ? (snapshot.data().recipeIds || []) : []);
      },
      error => {
        // Listener errors should not crash UI; log and keep last known state.
        console.error("Error listening to favorites:", error);
      }
    );
  }

  /**
   * Adds a recipe id to the user's favorites (idempotent).
   * Uses arrayUnion to prevent duplicates.
   */
  async addFavorite(userId: string, recipeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        await setDoc(docRef, { recipeIds: [recipeId] });
        return;
      }

      await updateDoc(docRef, { recipeIds: arrayUnion(recipeId) });
    } catch (error) {
      throw new Error(`Failed to add favorite: ${String(error)}`);
    }
  }

  /**
   * Removes a recipe id from the user's favorites (idempotent).
   *
   * Note: updateDoc will throw if the favorites document does not exist.
   * If you want "silent" behavior for non-existent docs, use setDoc(..., {merge:true})
   * or create the doc in advance via getFavorites().
   */
  async removeFavorite(userId: string, recipeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, { recipeIds: arrayRemove(recipeId) });
    } catch (error) {
      throw new Error(`Failed to remove favorite: ${String(error)}`);
    }
  }

  /**
   * Returns whether a recipe is currently favorited by the user.
   * Fails closed to `false` to avoid breaking UI.
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
   * Toggles favorite status for a recipe.
   *
   * Note: This is not transactional; it does a read then a write. If you need
   * strict atomicity under concurrent updates, use a transaction.
   */
  async toggleFavorite(userId: string, recipeId: string): Promise<boolean> {
    const isFav = await this.isFavorite(userId, recipeId);

    if (isFav) {
      await this.removeFavorite(userId, recipeId);
      return false;
    }

    await this.addFavorite(userId, recipeId);
    return true;
  }

  /**
   * Hydrates the user's favorite ids into full recipe objects.
   * Missing/deleted recipe docs are filtered out.
   */
  async getFavoriteRecipes(userId: string): Promise<Recipe[]> {
    try {
      const favoriteIds = await this.getFavorites(userId);
      if (favoriteIds.length === 0) return [];

      const recipePromises = favoriteIds.map(async id => {
        const recipeRef = doc(db, "recipes", id);
        const snapshot = await getDoc(recipeRef);

        if (!snapshot.exists()) return null;

        return { id: snapshot.id, ...snapshot.data() } as Recipe;
      });

      const recipes = await Promise.all(recipePromises);
      return recipes.filter((r): r is Recipe => r !== null);
    } catch (error) {
      throw new Error(`Failed to get favorite recipes: ${String(error)}`);
    }
  }

  /**
   * Counts how many users have favorited a specific recipe.
   * This is a cross-document query on favorites.recipeIds.
   */
  async getFavoriteCount(recipeId: string): Promise<number> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(favoritesRef, where("recipeIds", "array-contains", recipeId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Failed to get favorite count:", error);
      return 0;
    }
  }

  /**
   * Computes simple analytics for a user's favorites.
   *
   * Note: "recentlyAdded" is based on recipe.createdAt, not the timestamp when
   * the user favorited it (that data is not stored in the current model).
   */
  async getFavoriteStats(userId: string): Promise<{
    totalFavorites: number;
    favoritesByCategory: Record<string, number>;
    recentlyAdded: string[];
  }> {
    try {
      const favorites = await this.getFavoriteRecipes(userId);

      const favoritesByCategory: Record<string, number> = {};
      for (const recipe of favorites) {
        const category = recipe.mealType || "Other";
        favoritesByCategory[category] = (favoritesByCategory[category] || 0) + 1;
      }

      const recentlyAdded = favorites
        .sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5)
        .map(r => r.id!)
        .filter(Boolean);

      return {
        totalFavorites: favorites.length,
        favoritesByCategory,
        recentlyAdded
      };
    } catch (error) {
      throw new Error(`Failed to get favorite stats: ${String(error)}`);
    }
  }

  /**
   * Removes a deleted recipe id from every user's favorites document.
   * Intended to be part of a recipe deletion workflow.
   */
  async removeRecipeFromAllFavorites(recipeId: string): Promise<void> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(favoritesRef, where("recipeIds", "array-contains", recipeId));
      const snapshot = await getDocs(q);

      await Promise.all(
        snapshot.docs.map(d =>
          updateDoc(d.ref, { recipeIds: arrayRemove(recipeId) })
        )
      );
    } catch (error) {
      throw new Error(`Failed to remove recipe from all favorites: ${String(error)}`);
    }
  }

  /**
   * Exports the user's favorites as a JSON-serializable payload.
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
      favorites
    };
  }

  /**
   * Clears all favorites for a user by resetting recipeIds to an empty array.
   */
  async clearAllFavorites(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await setDoc(docRef, { recipeIds: [] });
    } catch (error) {
      throw new Error(`Failed to clear favorites: ${String(error)}`);
    }
  }

  /**
   * Adds multiple recipe ids to favorites, merging with existing ids and
   * deduplicating on the client before writing.
   */
  async addMultipleFavorites(userId: string, recipeIds: string[]): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        await setDoc(docRef, { recipeIds });
        return;
      }

      const current = (snapshot.data().recipeIds || []) as string[];
      const merged = Array.from(new Set([...current, ...recipeIds]));
      await updateDoc(docRef, { recipeIds: merged });
    } catch (error) {
      throw new Error(`Failed to add multiple favorites: ${String(error)}`);
    }
  }
}

export const favoriteService = new FavoriteService();
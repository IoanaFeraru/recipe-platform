import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  where
} from "firebase/firestore";
import { db } from "./firebase";
import { Recipe, Ingredient } from "@/types/recipe";

/**
 * Cursor-based pagination helper for fetching recipes from Firestore.
 *
 * This module encapsulates pagination, filtering, and normalization logic
 * for recipe listing views. It is intentionally read-only and stateless.
 */

const PAGE_SIZE = 6;

/**
 * Fetches a single page of recipes using cursor-based pagination.
 *
 * Pagination strategy:
 * - Always orders by creation date (newest first)
 * - Fetches PAGE_SIZE + 1 documents to detect whether a next page exists
 *
 * @param cursor       Firestore document snapshot to start after (null for first page)
 * @param selectedTag  Optional tag used for filtering
 * @param sortBy       Sort strategy (currently date-based sorting is enforced)
 */
export const fetchRecipesPage = async (
  cursor: QueryDocumentSnapshot | null,
  selectedTag?: string,
  sortBy: "dateDesc" | "dateAsc" | "az" | "za" = "dateDesc"
) => {
  const collectionRef = collection(db, "recipes");
  const constraints: any[] = [];

  if (selectedTag) {
    constraints.push(where("tags", "array-contains", selectedTag));
  }

  constraints.push(orderBy("createdAt", "desc"));

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(PAGE_SIZE + 1));

  const q = query(collectionRef, ...constraints);
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;

  const hasNext = docs.length > PAGE_SIZE;

  const recipes: Recipe[] = docs.slice(0, PAGE_SIZE).map((d) => {
    const data = d.data();

    /**
     * Ingredient normalization:
     * Handles legacy records where `name` may be nested or malformed.
     */
    const ingredients: Ingredient[] = (data.ingredients || []).map(
      (ing: any) => ({
        name: typeof ing.name === "string" ? ing.name : ing.name?.name ?? "",
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes
      })
    );

    return {
      id: d.id,
      title: data.title,
      description: data.description,
      servings: data.servings ?? 1,
      ingredients,
      steps: data.steps ?? [],
      tags: data.tags ?? [],
      imageUrl: data.imageUrl,
      authorId: data.authorId,
      authorName: data.authorName,
      authorAvatarUrl: data.authorAvatarUrl,
      createdAt: data.createdAt,
      dietary: data.dietary ?? [],
      minActivePrepTime: data.minActivePrepTime ?? 0,
      maxActivePrepTime: data.maxActivePrepTime ?? 0,
      minPassiveTime: data.minPassiveTime ?? 0,
      maxPassiveTime: data.maxPassiveTime ?? 0,
      difficulty: data.difficulty,
      mealType: data.mealType,
      cuisine: data.cuisine,
      avgRating: data.avgRating ?? 0,
      reviewCount: data.reviewCount ?? 0
    };
  });

  return {
    recipes,
    lastDoc: hasNext ? docs[PAGE_SIZE - 1] : null,
    hasNext
  };
};

//ToDo: query construction (filters + pagination)
//ToDo: Firestore → Recipe mapping
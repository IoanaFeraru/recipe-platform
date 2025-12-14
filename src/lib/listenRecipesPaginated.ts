import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import { Recipe } from "@/types/recipe";

const PAGE_SIZE = 6;

export const fetchRecipesPage = async (
  cursor: QueryDocumentSnapshot | null
) => {
  const q = cursor
    ? query(
        collection(db, "recipes"),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(PAGE_SIZE + 1)
      )
    : query(
        collection(db, "recipes"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE + 1)
      );

  const snapshot = await getDocs(q);
  const docs = snapshot.docs;

  const hasNext = docs.length > PAGE_SIZE;
  const recipes = docs.slice(0, PAGE_SIZE).map(d => ({
    id: d.id,
    ...d.data()
  })) as Recipe[];

  return {
    recipes,
    lastDoc: hasNext ? docs[PAGE_SIZE - 1] : null,
    hasNext
  };
};

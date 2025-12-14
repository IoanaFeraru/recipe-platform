import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Recipe } from "@/types/recipe";

const recipesCol = collection(db, "recipes");

export const createRecipe = async (recipe: Recipe) => {
  await addDoc(recipesCol, recipe);
};

export const getAllRecipes = async () => {
  const snapshot = await getDocs(recipesCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Recipe[];
};

export const listenRecipes = (callback: (recipes: Recipe[]) => void) => {
  const q = query(recipesCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, snapshot => {
    const recipes = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Recipe));
    callback(recipes);
  });
};

export const updateRecipe = async (id: string, data: Partial<Recipe>) => {
  const docRef = doc(db, "recipes", id);
  await updateDoc(docRef, data);
};

export const deleteRecipe = async (id: string) => {
  const docRef = doc(db, "recipes", id);
  await deleteDoc(docRef);
};
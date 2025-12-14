"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (recipeId: string) => Promise<void>;
  removeFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      const docRef = doc(db, "favorites", user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) setFavorites(snapshot.data().recipeIds || []);
      else await setDoc(docRef, { recipeIds: [] });
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (recipeId: string) => {
    if (!user) return;
    const docRef = doc(db, "favorites", user.uid);
    await updateDoc(docRef, { recipeIds: arrayUnion(recipeId) });
    setFavorites(prev => [...prev, recipeId]);
  };

  const removeFavorite = async (recipeId: string) => {
    if (!user) return;
    const docRef = doc(db, "favorites", user.uid);
    await updateDoc(docRef, { recipeIds: arrayRemove(recipeId) });
    setFavorites(prev => prev.filter(id => id !== recipeId));
  };

  const isFavorite = (recipeId: string) => favorites.includes(recipeId);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
};

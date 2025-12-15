"use client";

import { createContext, useContext, ReactNode } from "react";
import { useIsFavorite as useIsFavoriteHook } from "@/hooks/useFavorites";

interface FavoritesContextType {
  isFavorite: (recipeId: string) => boolean;
  toggleFavorite: (recipeId: string) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const wrapper = (recipeId: string) => {
    const { isFavorite, toggle, loading } = useIsFavoriteHook(recipeId);
    return { isFavorite, toggle, loading };
  };

  const isFavorite = (recipeId: string) => wrapper(recipeId).isFavorite;
  const toggleFavorite = (recipeId: string) => wrapper(recipeId).toggle;
  const loading = false;

  return (
    <FavoritesContext.Provider
      value={{
        isFavorite,
        toggleFavorite,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
};

"use client";

import React from "react";
import { useRouter } from "next/navigation";

/**
 * RecipeNavigation - Fixed position back button for recipe page
 * Follows Material Design FAB pattern
 */
export const RecipeNavigation: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <button
      onClick={handleBack}
      className="fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full bg-(--color-primary) text-white shadow-[4px_4px_0_0_var(--color-shadow)] hover:brightness-110 transition flex items-center justify-center text-2xl font-bold"
      aria-label="Back to recipes"
    >
      ←
    </button>
  );
};
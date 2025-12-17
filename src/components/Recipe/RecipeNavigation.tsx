/**
 * RecipeNavigation component.
 *
 * Provides a fixed-position navigation control that allows users to return
 * to the main recipes listing. This component follows a floating action
 * button (FAB) interaction pattern to ensure persistent availability
 * without interfering with page content.
 *
 * Responsibilities:
 * - Offer a clear and consistent way to navigate back to the recipes overview
 * - Integrate with Next.js client-side routing
 *
 * Design considerations:
 * - Fixed positioning in the bottom-left corner for ergonomic access
 * - Circular FAB styling aligned with the application design system
 * - High visual contrast to ensure visibility over content
 *
 * Accessibility notes:
 * - Uses a semantic button element
 * - Includes an aria-label to describe the navigation action
 *
 * @module RecipeNavigation
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";

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
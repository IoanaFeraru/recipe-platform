"use client";

/**
 * DashboardHeader
 *
 * Presentational header component for the user dashboard.
 * Displays the page title and a primary action button for creating a new recipe.
 * All behavior is delegated to the parent via callbacks.
 *
 * @component
 *
 * @param {Object} props
 * @param {() => void} props.onCreateClick - Callback triggered when the user clicks the "Create Recipe" button
 *
 * @example
 * ```tsx
 * <DashboardHeader onCreateClick={() => setShowCreateModal(true)} />
 * ```
 */

import React from "react";
import Button from "@/components/UI/Button";

interface DashboardHeaderProps {
  onCreateClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onCreateClick,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold text-(--color-text) garet-heavy">
        My Recipes
      </h1>
      <Button variant="primary" onClick={onCreateClick}>
        + Create Recipe
      </Button>
    </div>
  );
};
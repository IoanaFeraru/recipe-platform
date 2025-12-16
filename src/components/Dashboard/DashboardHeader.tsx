"use client";

import React from "react";
import Button from "@/components/UI/Button";

interface DashboardHeaderProps {
  onCreateClick: () => void;
}

/**
 * DashboardHeader - Dashboard page header with title and create button
 * Pure presentational component
 */
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
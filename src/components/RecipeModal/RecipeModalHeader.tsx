"use client";

import React from "react";

interface RecipeModalHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  disabled?: boolean;
}

/**
 * RecipeModalHeader - Modal header with title and close button
 */
export const RecipeModalHeader: React.FC<RecipeModalHeaderProps> = ({
  isEditing,
  onClose,
  disabled = false,
}) => {
  return (
    <div className="flex justify-between items-center p-5 border-b-2 border-(--color-border) bg-(--color-bg-secondary) rounded-tl-3xl">
      <h2 className="text-2xl font-bold text-(--color-text) garet-heavy">
        {isEditing ? "Edit Recipe" : "Create New Recipe"}
      </h2>
      <button
        onClick={onClose}
        disabled={disabled}
        className="w-10 h-10 rounded-full bg-(--color-danger) text-white font-bold text-xl hover:brightness-110 transition disabled:opacity-50"
        aria-label="Close modal"
      >
        ×
      </button>
    </div>
  );
};
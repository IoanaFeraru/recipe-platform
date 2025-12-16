"use client";

import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  hasNext: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * PaginationControls - Previous/Next navigation buttons
 * Handles pagination state and disabled states
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  hasNext,
  loading,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-10">
      <button
        disabled={currentPage === 1 || loading}
        onClick={onPrevious}
        className="px-6 py-3 rounded-full border-2 border-(--color-border) bg-(--color-bg-secondary) text-(--color-text) font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_0_var(--color-shadow)]"
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <span className="px-4 py-2 text-(--color-text) font-semibold">
        Page {currentPage}
      </span>

      <button
        disabled={!hasNext || loading}
        onClick={onNext}
        className="px-6 py-3 rounded-full border-2 border-(--color-border) bg-(--color-bg-secondary) text-(--color-text) font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_0_var(--color-shadow)]"
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
};
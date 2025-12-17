"use client";

/**
 * PaginationControls — Stateless pagination navigation UI.
 *
 * Renders Previous/Next buttons and a page indicator for paginated views.
 * The component is presentation-only and delegates pagination behavior to
 * the parent via callbacks.
 *
 * Behavior:
 * - Disables “Previous” when `currentPage` is 1 or when `loading` is true.
 * - Disables “Next” when `hasNext` is false or when `loading` is true.
 *
 * Accessibility:
 * - Uses semantic buttons with `aria-label` for screen readers.
 * - Disabled states are conveyed via the native `disabled` attribute.
 *
 * @component
 *
 * @param props - Component props.
 * @param props.currentPage - Current page number (1-indexed).
 * @param props.hasNext - Whether a subsequent page exists.
 * @param props.loading - Whether pagination is currently loading (disables navigation).
 * @param props.onPrevious - Handler invoked when the user requests the previous page.
 * @param props.onNext - Handler invoked when the user requests the next page.
 *
 * @example
 * ```tsx
 * <PaginationControls
 *   currentPage={page}
 *   hasNext={hasNext}
 *   loading={loading}
 *   onPrevious={() => setPage((p) => Math.max(1, p - 1))}
 *   onNext={() => setPage((p) => p + 1)}
 * />
 * ```
 */
import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  hasNext: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

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
        type="button"
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
        type="button"
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
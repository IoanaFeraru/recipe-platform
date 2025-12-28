"use client";

/**
 * SortButtons component.
 *
 * Renders a horizontal group of buttons used to control recipe sorting.
 * Each button represents a predefined sort option and visually reflects
 * the currently active selection. The component is fully controlled and
 * delegates state management to the parent via `sortBy` and `onSortChange`.
 *
 * Responsibilities:
 * - Present all supported sort options in a compact, button-based UI
 * - Highlight the active sort option
 * - Notify the parent component when the user selects a new sort order
 *
 * Design notes:
 * - Uses buttons instead of a select element for faster visual scanning
 * - Active state is emphasized via color, scale, and shadow
 * - Stateless and reusable across different listing contexts
 *
 * @component
 * @param {SortButtonsProps} props - Component props
 * @param {SortOption} props.sortBy - Currently active sort option
 * @param {(sortBy: SortOption) => void} props.onSortChange - Callback invoked when the sort option changes
 * @returns {JSX.Element} A group of interactive sort buttons
 */

import React from "react";

type SortOption =
  | "az"
  | "za"
  | "dateDesc"
  | "dateAsc"
  | "ratingDesc"
  | "popularityDesc";

interface SortButtonsProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

const SORT_OPTIONS: Array<{
  value: SortOption;
  label: string;
  icon: string;
}> = [
  { value: "dateDesc", label: "Newest", icon: "🆕" },
  { value: "ratingDesc", label: "Top Rated", icon: "⭐" },
  { value: "popularityDesc", label: "Popular", icon: "🔥" },
  { value: "az", label: "A → Z", icon: "🔤" },
  { value: "za", label: "Z → A", icon: "🔡" },
  { value: "dateAsc", label: "Oldest", icon: "📜" },
];

export const SortButtons: React.FC<SortButtonsProps> = ({
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={`
            px-2 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-all whitespace-nowrap
            ${
              sortBy === option.value
                ? "bg-(--color-primary) text-white shadow-[2px_2px_0_0_var(--color-shadow)] sm:shadow-[4px_4px_0_0_var(--color-shadow)] scale-105"
                : "bg-(--color-bg) border-2 border-(--color-border) text-(--color-text) hover:border-(--color-primary) hover:scale-105"
            }
          `}
          aria-label={`Sort by ${option.label}`}
        >
          <span className="mr-0.5 sm:mr-1">{option.icon}</span>
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
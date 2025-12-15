"use client";

import React from "react";

type SortOption = "az" | "za" | "dateDesc" | "dateAsc" | "ratingDesc" | "popularityDesc";

interface SortButtonsProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string; icon: string }> = [
  { value: "dateDesc", label: "Newest", icon: "🆕" },
  { value: "ratingDesc", label: "Top Rated", icon: "⭐" },
  { value: "popularityDesc", label: "Popular", icon: "🔥" },
  { value: "az", label: "A → Z", icon: "🔤" },
  { value: "za", label: "Z → A", icon: "🔡" },
  { value: "dateAsc", label: "Oldest", icon: "📜" },
];

/**
 * SortButtons - Beautiful sort buttons instead of dropdown
 * Interactive button group with active state
 */
export const SortButtons: React.FC<SortButtonsProps> = ({
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={`
            px-4 py-2 rounded-full font-semibold text-sm transition-all
            ${
              sortBy === option.value
                ? "bg-(--color-primary) text-white shadow-[4px_4px_0_0_var(--color-shadow)] scale-105"
                : "bg-(--color-bg) border-2 border-(--color-border) text-(--color-text) hover:border-(--color-primary) hover:scale-105"
            }
          `}
          aria-label={`Sort by ${option.label}`}
        >
          <span className="mr-1">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
};
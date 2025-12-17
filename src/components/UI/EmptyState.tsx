"use client";

/**
 * EmptyState component.
 *
 * Renders a consistent, user-friendly empty state for views with no content
 * (e.g., empty search results, no favorites, first-time user states). It supports
 * an optional icon, title, helper message, and an optional call-to-action button
 * to guide the user toward the next step.
 */

import React from "react";

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "🔍",
  title = "No results found",
  message = "Try adjusting your filters or search terms.",
  action,
}) => {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">{icon}</div>

      <p className="text-(--color-text-muted) text-lg mb-2">{title}</p>

      {message && (
        <p className="text-(--color-text-muted) text-sm">{message}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-3 rounded-full bg-(--color-primary) text-white font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] hover:brightness-110 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
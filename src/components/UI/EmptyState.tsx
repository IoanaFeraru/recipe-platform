"use client";

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

/**
 * EmptyState - Reusable empty state component
 * Displays when no data is available with optional CTA
 */
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
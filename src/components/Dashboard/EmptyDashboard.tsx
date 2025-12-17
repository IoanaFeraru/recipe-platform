"use client";

/**
 * EmptyDashboard
 *
 * Dashboard-specific empty state component displayed when the user
 * has not created any recipes yet. Acts as a thin wrapper around the
 * reusable EmptyState component, providing copy and actions tailored
 * to the dashboard context.
 *
 * @component
 *
 * @param {Object} props
 * @param {() => void} props.onCreateClick - Callback invoked when the user chooses to create their first recipe
 *
 * @example
 * ```tsx
 * <EmptyDashboard onCreateClick={() => setShowCreateModal(true)} />
 * ```
 */

import React from "react";
import { EmptyState } from "@/components/UI/EmptyState";

interface EmptyDashboardProps {
  onCreateClick: () => void;
}

export const EmptyDashboard: React.FC<EmptyDashboardProps> = ({
  onCreateClick,
}) => {
  return (
    <div className="bg-(--color-bg-secondary) rounded-3xl border-2 border-(--color-border)">
      <EmptyState
        icon="🍳"
        title="You haven't created any recipes yet."
        message="Start your culinary journey by creating your first recipe!"
        action={{
          label: "Create Your First Recipe",
          onClick: onCreateClick,
        }}
      />
    </div>
  );
};
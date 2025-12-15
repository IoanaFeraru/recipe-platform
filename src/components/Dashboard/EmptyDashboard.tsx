"use client";

import React from "react";
import { EmptyState } from "@/components/EmptyState";

interface EmptyDashboardProps {
  onCreateClick: () => void;
}

/**
 * EmptyDashboard - Empty state for dashboard with custom styling
 * Wraps reusable EmptyState component with dashboard-specific props
 */
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
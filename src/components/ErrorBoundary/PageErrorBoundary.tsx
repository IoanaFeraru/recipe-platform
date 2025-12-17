"use client";

/**
 * PageErrorBoundary
 *
 * Page-level error boundary wrapper that catches runtime errors occurring
 * within an entire page subtree and renders a full-screen fallback UI.
 * Intended for use at route or page boundaries to prevent the application
 * from crashing and to provide clear recovery actions to the user.
 *
 * Responsibilities:
 * - Catch unhandled rendering/runtime errors via a shared ErrorBoundary
 * - Optionally report errors to a higher-level handler (logging/monitoring)
 * - Display a user-friendly, full-page fallback with recovery actions
 *
 * Usage:
 * - Wrap complete pages or major route segments
 * - Not intended for small component-level isolation (use ComponentErrorBoundary instead)
 *
 * Recovery options provided:
 * - Refresh the current page
 * - Navigate back to the application home page
 */

import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import Button from "@/components/UI/Button";

interface PageErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  onError,
}) => {
  return (
    <ErrorBoundary
      onError={(error) => onError?.(error)}
      fallback={<PageErrorFallback />}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * PageErrorFallback
 *
 * Full-screen fallback UI displayed when a page-level error is caught.
 * Provides clear messaging and basic recovery actions without relying
 * on client-side routing state.
 */
const PageErrorFallback: React.FC = () => {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">😵</div>

        <h1 className="text-3xl font-bold text-(--color-text) mb-4 garet-heavy">
          Oops! Something went wrong
        </h1>

        <p className="text-(--color-text-muted) mb-8 text-lg">
          We encountered an unexpected error. Don’t worry — it’s not your fault.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={handleRefresh}>
            Refresh Page
          </Button>

          <button
            onClick={handleGoHome}
            className="px-6 py-3 rounded-full border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-bg-secondary) transition"
          >
            Go Home
          </button>
        </div>

        <p className="mt-8 text-sm text-(--color-text-muted)">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default PageErrorBoundary;
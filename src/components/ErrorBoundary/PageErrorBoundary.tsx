"use client";

import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import Button from "@/components/Button";

interface PageErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * PageErrorBoundary - Error boundary for page-level errors
 * Displays a full-page error UI with navigation options
 * 
 * @example
 * // Wrap individual pages
 * <PageErrorBoundary>
 *   <RecipePage />
 * </PageErrorBoundary>
 */
export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  onError,
}) => {
  return (
    <ErrorBoundary
      onError={(error, info) => onError?.(error)}
      fallback={<PageErrorFallback />}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * PageErrorFallback - Full page error display
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
          We encountered an unexpected error. Don't worry, it's not your fault!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={handleRefresh}>
            🔄 Refresh Page
          </Button>
          
          <button
            onClick={handleGoHome}
            className="px-6 py-3 rounded-full border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-bg-secondary) transition"
          >
            🏠 Go Home
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
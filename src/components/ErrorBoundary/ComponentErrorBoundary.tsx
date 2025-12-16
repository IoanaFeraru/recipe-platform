"use client";

import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error) => void;
}

/**
 * ComponentErrorBoundary - Error boundary for individual components
 * Provides a compact fallback that doesn't break page layout
 * 
 * @example
 * // Wrap potentially unstable components
 * <ComponentErrorBoundary componentName="RecipeCard">
 *   <RecipeCard recipe={recipe} />
 * </ComponentErrorBoundary>
 */
export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  fallback,
  componentName = "Component",
  onError,
}) => {
  const defaultFallback = (
    <ComponentErrorFallback componentName={componentName} />
  );

  return (
    <ErrorBoundary
      onError={(error, info) => onError?.(error)}
      fallback={fallback ?? defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * ComponentErrorFallback - Compact error display for components
 */
interface ComponentErrorFallbackProps {
  componentName: string;
}

const ComponentErrorFallback: React.FC<ComponentErrorFallbackProps> = ({
  componentName,
}) => {
  return (
    <div className="flex items-center justify-center p-4 bg-(--color-bg-secondary) rounded-lg border border-(--color-border)">
      <div className="text-center">
        <span className="text-2xl">⚠️</span>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Failed to load {componentName}
        </p>
      </div>
    </div>
  );
};

export default ComponentErrorBoundary;
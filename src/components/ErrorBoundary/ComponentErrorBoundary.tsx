"use client";

/**
 * ComponentErrorBoundary
 *
 * Lightweight wrapper around the shared `ErrorBoundary` that is intended for
 * isolating failures at the component level without breaking overall page
 * layout. It provides a compact default fallback (suitable for cards/sections)
 * and supports overriding the fallback per usage.
 *
 * Capabilities:
 * - Prevents a single component crash from taking down the full page
 * - Optional `componentName` for clearer fallback messaging
 * - Optional `onError` callback for component-scoped logging/monitoring
 * - Optional `fallback` to provide a custom compact UI
 *
 * @example
 * ```tsx
 * // Wrap potentially unstable components
 * <ComponentErrorBoundary componentName="RecipeCard">
 *   <RecipeCard recipe={recipe} />
 * </ComponentErrorBoundary>
 *
 * // With a custom fallback
 * <ComponentErrorBoundary fallback={<SkeletonCard />}>
 *   <RecipeCard recipe={recipe} />
 * </ComponentErrorBoundary>
 * ```
 */

import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error) => void;
}

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
      onError={(error) => onError?.(error)}
      fallback={fallback ?? defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * ComponentErrorFallback
 *
 * Compact, non-disruptive UI used when a component fails to render.
 * Designed to preserve grid/list layouts by keeping a predictable footprint.
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

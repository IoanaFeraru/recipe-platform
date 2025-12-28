"use client";

/**
 * ErrorBoundary
 *
 * React class-based Error Boundary that prevents rendering crashes by catching
 * unhandled errors thrown in the component subtree during render, lifecycle
 * methods, and constructors of child components.
 *
 * Capabilities:
 * - Captures errors with React’s error boundary APIs (getDerivedStateFromError, componentDidCatch)
 * - Renders either a caller-provided fallback UI or a sensible default fallback
 * - Exposes an optional onError callback for logging/monitoring integrations
 * - Supports automatic reset when `resetKeys` change (useful for route changes,
 *   query param changes, or retrying after state transitions)
 *
 * Notes:
 * - Error boundaries do not catch errors in event handlers, async code, or
 *   server-side rendering. Handle those cases separately.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback UI
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With error reporting
 * <ErrorBoundary onError={(error, info) => report(error, info)}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Reset on navigation or key change
 * <ErrorBoundary resetKeys={[route, recipeId]}>
 *   <RecipeDetails />
 * </ErrorBoundary>
 * ```
 */

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Non-obvious business rule: always log boundary-caught errors to console
    // to aid debugging even if an external reporter is configured.
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.arraysEqual(this.props.resetKeys, prevProps.resetKeys)
    ) {
      this.reset();
    }
  }

  private arraysEqual(a: unknown[], b: unknown[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <DefaultErrorFallback error={this.state.error} onReset={this.reset} />
      );
    }

    return this.props.children;
  }
}

/**
 * DefaultErrorFallback
 *
 * Minimal default error UI displayed when no custom fallback is provided.
 * In development, it exposes the error message in a collapsible details block.
 */
interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-(--color-bg-secondary) rounded-xl border-2 border-(--color-danger) m-4">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-(--color-text) mb-2">
        Something went wrong
      </h2>
      <p className="text-(--color-text-muted) mb-4 text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>

      {process.env.NODE_ENV === "development" && error && (
        <details className="mb-4 p-3 bg-(--color-bg) rounded-lg text-sm max-w-md w-full">
          <summary className="cursor-pointer font-semibold text-(--color-text-muted)">
            Error Details
          </summary>
          <pre className="mt-2 text-xs overflow-auto text-(--color-danger)">
            {error.message}
          </pre>
        </details>
      )}

      <button
        onClick={onReset}
        className="px-6 py-2 rounded-full bg-(--color-primary) text-white font-semibold hover:brightness-110 transition"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorBoundary;
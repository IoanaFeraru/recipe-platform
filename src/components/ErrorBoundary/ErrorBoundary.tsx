"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - React error boundary component
 * 
 * Catches JavaScript errors in child components and displays fallback UI
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With error logging
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
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
    
    // Log error
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.arraysEqual(this.props.resetKeys, prevProps.resetKeys)
    ) {
      this.reset();
    }
  }

  private arraysEqual(a: any[], b: any[]): boolean {
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
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * DefaultErrorFallback - Default error UI
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
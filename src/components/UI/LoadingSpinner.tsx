"use client";

import React from "react";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-3",
  lg: "h-12 w-12 border-4",
  xl: "h-16 w-16 border-4",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message,
  className = "",
  fullScreen = false,
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          animate-spin rounded-full
          border-(--color-primary) border-t-transparent
          ${SIZE_CLASSES[size]}
        `}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-(--color-text-muted) text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-(--color-bg) bg-opacity-80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * PageLoader - Full page loading state
 * Use for page-level loading states
 */
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" message={message} />
  </div>
);

/**
 * InlineLoader - Small inline loading indicator
 * Use for button loading states or inline content
 */
export const InlineLoader: React.FC<{ className?: string }> = ({ 
  className = "" 
}) => (
  <LoadingSpinner size="sm" className={className} />
);

export default LoadingSpinner;
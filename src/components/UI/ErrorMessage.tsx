"use client";

import React from "react";

type ErrorVariant = "inline" | "card" | "banner" | "fullPage";
type ErrorSeverity = "error" | "warning" | "info";

interface ErrorMessageProps {
  message: string;
  title?: string;
  variant?: ErrorVariant;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  icon?: string;
}

const SEVERITY_STYLES: Record<ErrorSeverity, {
  bg: string;
  border: string;
  text: string;
  icon: string;
}> = {
  error: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    icon: "❌",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-700",
    icon: "⚠️",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    icon: "ℹ️",
  },
};

/**
 * ErrorMessage - Reusable error display component
 * 
 * @example
 * // Simple inline error
 * <ErrorMessage message="Something went wrong" />
 * 
 * // With retry button
 * <ErrorMessage 
 *   message="Failed to load recipes" 
 *   onRetry={() => refetch()} 
 * />
 * 
 * // Full page error
 * <ErrorMessage 
 *   variant="fullPage"
 *   title="Oops!"
 *   message="We couldn't find what you're looking for"
 * />
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  variant = "card",
  severity = "error",
  onRetry,
  retryLabel = "Try Again",
  className = "",
  icon,
}) => {
  const styles = SEVERITY_STYLES[severity];
  const displayIcon = icon ?? styles.icon;

  // Inline variant - minimal styling
  if (variant === "inline") {
    return (
      <p className={`${styles.text} text-sm ${className}`}>
        {displayIcon} {message}
      </p>
    );
  }

  // Banner variant - full width notification
  if (variant === "banner") {
    return (
      <div
        className={`
          ${styles.bg} ${styles.border} border-2 
          px-4 py-3 rounded-lg flex items-center justify-between
          ${className}
        `}
        role="alert"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{displayIcon}</span>
          <span className={styles.text}>{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`
              ${styles.text} font-semibold hover:underline
              px-3 py-1 rounded transition
            `}
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  // Full page variant - centered with large icon
  if (variant === "fullPage") {
    return (
      <div className={`min-h-screen flex items-center justify-center p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{displayIcon}</div>
          {title && (
            <h2 className="text-2xl font-bold text-(--color-text) mb-2 garet-heavy">
              {title}
            </h2>
          )}
          <p className="text-(--color-text-muted) mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 rounded-full bg-(--color-primary) text-white font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] hover:brightness-110 transition"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Card variant (default) - boxed error message
  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border-2 
        rounded-xl p-6 text-center
        ${className}
      `}
      role="alert"
    >
      <div className="text-4xl mb-3">{displayIcon}</div>
      {title && (
        <h3 className={`text-lg font-bold ${styles.text} mb-2`}>
          {title}
        </h3>
      )}
      <p className={styles.text}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-5 py-2 rounded-full bg-(--color-primary) text-white font-semibold shadow-[2px_2px_0_0_var(--color-shadow)] hover:brightness-110 transition"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};

/**
 * NetworkError - Pre-configured network error component
 */
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorMessage
    variant="card"
    title="Connection Error"
    message="Please check your internet connection and try again."
    icon="🌐"
    onRetry={onRetry}
  />
);

/**
 * NotFoundError - Pre-configured 404 error component
 */
export const NotFoundError: React.FC<{ 
  resource?: string;
  onBack?: () => void;
}> = ({ resource = "page", onBack }) => (
  <ErrorMessage
    variant="fullPage"
    title="Not Found"
    message={`The ${resource} you're looking for doesn't exist or has been removed.`}
    icon="🔍"
    onRetry={onBack}
    retryLabel="Go Back"
  />
);

export default ErrorMessage;
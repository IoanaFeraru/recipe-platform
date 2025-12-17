"use client";

/**
 * PasswordStrengthIndicator
 *
 * Presentational UI component that visualizes password strength using a compact
 * progress bar and helper message. Intended to be used alongside password inputs
 * to provide immediate feedback as the user types.
 *
 * Responsibilities:
 * - Conditionally render strength feedback (via the `show` flag)
 * - Map a normalized strength level (weak/medium/strong) to consistent UI styling
 * - Expose progress semantics for assistive technologies
 *
 * Accessibility:
 * - Uses `role="progressbar"` with `aria-valuenow/min/max` to communicate strength score
 * - Provides an `aria-label` that includes the strength level for screen readers
 *
 * @component
 *
 * @example
 * ```tsx
 * <PasswordStrengthIndicator
 *   strength={passwordStrength}
 *   show={password.length > 0}
 * />
 * ```
 */
import React from "react";
import { PasswordStrength as PasswordStrengthType } from "@/lib/utils/validation";

interface PasswordStrengthProps {
  strength: PasswordStrengthType;
  show?: boolean;
}

const STRENGTH_CONFIG = {
  weak: {
    width: "w-1/3",
    color: "bg-red-500",
    textColor: "text-red-600",
  },
  medium: {
    width: "w-2/3",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
  },
  strong: {
    width: "w-full",
    color: "bg-green-500",
    textColor: "text-green-600",
  },
} as const;

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({
  strength,
  show = true,
}) => {
  if (!show) return null;

  const config = STRENGTH_CONFIG[strength.level];

  return (
    <div className="mt-1 animate-in fade-in duration-200">
      <div className="h-1 rounded bg-(--color-border) overflow-hidden">
        <div
          className={`h-1 rounded transition-all duration-300 ${config.width} ${config.color}`}
          role="progressbar"
          aria-valuenow={strength.score}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label={`Password strength: ${strength.level}`}
        />
      </div>

      <p className={`text-xs mt-1 ${config.textColor}`}>{strength.message}</p>
    </div>
  );
};

export default PasswordStrengthIndicator;
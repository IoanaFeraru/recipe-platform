"use client";

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
};

/**
 * PasswordStrength - Visual password strength indicator
 * Shows a progress bar and message based on password strength
 * 
 * @example
 * <PasswordStrength strength={passwordStrength} show={password.length > 0} />
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({
  strength,
  show = true,
}) => {
  if (!show) return null;

  const config = STRENGTH_CONFIG[strength.level];

  return (
    <div className="mt-1 animate-in fade-in duration-200">
      {/* Progress bar */}
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
      
      {/* Message */}
      <p className={`text-xs mt-1 ${config.textColor}`}>
        {strength.message}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
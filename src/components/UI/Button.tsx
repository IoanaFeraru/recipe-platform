"use client";

/**
 * Button component.
 *
 * Provides a reusable, styled button abstraction aligned with the application’s
 * design system. It supports primary and destructive (danger) variants and an
 * optional icon-only mode for compact, square buttons used in toolbars or
 * action icons.
 *
 * Styling and behavior are centralized to ensure visual consistency and to
 * reduce duplication across the UI layer.
 */

import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger";
  iconOnly?: boolean;
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  iconOnly = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full
    font-semibold
    shadow-[4px_4px_0_0_var(--color-shadow)]
    transition hover:brightness-110
    text-sm
    overflow-hidden
  `;

  const variantClasses =
    variant === "primary"
      ? "bg-[var(--color-primary)] text-white"
      : "bg-[var(--color-danger)] text-white";

  const sizeClasses = iconOnly ? "w-10 h-10 p-0" : "px-4 py-2";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
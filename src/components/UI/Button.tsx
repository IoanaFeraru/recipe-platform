"use client";

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

  const iconSizeClasses = iconOnly ? "w-10 h-10 p-0" : "px-4 py-2";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${iconSizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

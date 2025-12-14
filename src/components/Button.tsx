"use client";

import React, { ButtonHTMLAttributes } from "react";
import Image from "next/image";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger";
  icon?: string;
  iconOnly?: boolean;
}

export default function Button({
  variant = "primary",
  icon,
  iconOnly = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-full
    px-4 py-2
    font-semibold
    shadow-[4px_4px_0_0_var(--color-shadow)]
    transition hover:brightness-110
    text-sm
  `;

  const variantClasses =
    variant === "primary"
      ? "bg-[var(--color-primary)] text-white"
      : "bg-[var(--color-danger)] text-white";

  const iconSizeClasses = iconOnly
    ? "w-13 h-13 p-0"
    : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${iconSizeClasses} ${className}`}
      {...props}
    >
      {icon && (
        <Image
          src={icon}
          alt=""
          width={40}
          height={40}
        />
      )}

      {!iconOnly && children}
    </button>
  );
}

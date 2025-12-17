"use client";

/**
 * FormField
 *
 * Reusable form field abstraction that standardizes form inputs across the
 * application. Encapsulates label rendering, accessibility attributes,
 * validation error display, and optional custom input rendering.
 *
 * Responsibilities:
 * - Render a labeled form control with consistent styling
 * - Support common input attributes (type, placeholder, autocomplete, disabled)
 * - Display validation errors with proper ARIA semantics
 * - Allow full override of the input via `children` for advanced use cases
 *
 * Accessibility:
 * - Associates label and input via `htmlFor` / `id`
 * - Exposes validation state through `aria-invalid`
 * - Links error messages using `aria-describedby`
 * - Uses `role="alert"` for screen reader announcements
 *
 * Usage Patterns:
 * - Default text-based inputs (email, password, text, etc.)
 * - Custom inputs (selects, textareas, masked inputs) via `children`
 *
 * @component
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   name="email"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   error={errors.email}
 *   required
 * />
 * ```
 */
import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
  className = "",
  children,
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={name}
        className="text-sm font-medium text-(--color-text)"
      >
        {label}
        {required && <span className="text-(--color-danger) ml-1">*</span>}
      </label>

      {children ? (
        children
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={`
            px-3 py-2 rounded-md
            border border-(--color-border)
            bg-(--color-bg)
            text-(--color-text)
            focus:outline-none focus:ring-2 focus:ring-(--color-primary)
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow
            ${error ? "border-(--color-danger) ring-1 ring-(--color-danger)" : ""}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}

      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-(--color-danger) mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
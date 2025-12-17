"use client";

/**
 * PasswordField
 *
 * Reusable password input component that standardizes password entry UX across the
 * application. Provides a show/hide toggle, optional Caps Lock detection, and
 * accessible validation messaging.
 *
 * Responsibilities:
 * - Render a labeled password input with consistent styling
 * - Toggle visibility between masked and plain text values
 * - Detect Caps Lock state during typing and optionally notify consumers
 * - Display validation errors with proper ARIA semantics
 *
 * Accessibility:
 * - Associates label and input via `htmlFor` / `id`
 * - Uses `aria-invalid` to expose validation state
 * - Links error text via `aria-describedby`
 * - Toggle button includes an `aria-label` describing the action
 *
 * @component
 *
 * @example
 * ```tsx
 * <PasswordField
 *   label="Password"
 *   name="password"
 *   value={password}
 *   onChange={setPassword}
 *   showCapsLockWarning
 * />
 * ```
 */
import React, { useState, useCallback } from "react";

interface PasswordFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  showCapsLockWarning?: boolean;
  onCapsLockChange?: (isOn: boolean) => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  placeholder = "••••••••",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
  showCapsLockWarning = true,
  onCapsLockChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      const isCapsLock = e.getModifierState("CapsLock");
      setCapsLock(isCapsLock);
      onCapsLockChange?.(isCapsLock);
    },
    [onCapsLockChange]
  );

  const toggleVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-(--color-text)">
        {label}
        {required && <span className="text-(--color-danger) ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={handleKeyUp}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={`
            w-full pr-14 px-3 py-2 rounded-md
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

        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors z-10"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>

        {showCapsLockWarning && capsLock && (
          <p className="absolute left-0 top-full mt-1 text-xs text-yellow-600 z-0">
            ⚠️ Caps Lock is on
          </p>
        )}
      </div>

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

export default PasswordField;
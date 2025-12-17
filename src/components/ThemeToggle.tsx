"use client";

/**
 * Theme toggle switch component.
 *
 * A controlled UI component that renders an accessible on/off switch,
 * typically used for toggling application themes (e.g., light/dark mode).
 * The component is stateless and delegates all state management to its parent
 * via props.
 *
 * Behavior:
 * - `checked` controls the visual and logical state of the toggle
 * - `onChange` is invoked when the user toggles the switch
 * - Uses a visually hidden checkbox for accessibility, with a styled track
 *   and thumb driven by CSS peer selectors
 *
 * This component is presentation-only and intentionally contains no
 * theme-specific logic, making it reusable for other boolean settings.
 */
interface ThemeToggleProps {
  checked: boolean;
  onChange: () => void;
}

export default function ThemeToggle({ checked, onChange }: ThemeToggleProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-10 h-5 bg-(--color-border) rounded-full peer-checked:bg-(--color-primary) transition-colors"/>
      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"/>
    </label>
  );
}

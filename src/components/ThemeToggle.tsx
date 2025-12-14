"use client";

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

      <div
        className="
          w-10 h-5
          bg-(--color-border)
          rounded-full
          peer-checked:bg-(--color-primary)
          transition-colors
        "
      />

      <div
        className="
          absolute left-0.5 top-0.5
          w-4 h-4
          bg-white
          rounded-full
          transition-transform
          peer-checked:translate-x-5
        "
      />
    </label>
  );
}

"use client";

/**
 * NavbarSearch component.
 *
 * Provides a controlled search input for filtering or querying recipes
 * from the navigation bar. This component is purely presentational and
 * delegates all state management and routing concerns to its parent.
 *
 * Responsibilities:
 * - Render a styled text input suitable for navbar usage
 * - Emit user-entered search text via a callback
 * - Support a customizable placeholder with a sensible default
 *
 * Design notes:
 * - Optimized for horizontal layouts with a constrained max width
 * - Integrates with the global color and focus ring system
 * - Uses a semi-transparent background to blend with the navbar
 *
 * Accessibility:
 * - Includes an explicit aria-label for screen readers
 *
 * @module NavbarSearch
 */

import React from "react";

interface NavbarSearchProps {
  /** Current search value */
  value: string;
  /** Callback invoked when the search value changes */
  onChange: (value: string) => void;
  /** Optional placeholder text for the input */
  placeholder?: string;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({
  value,
  onChange,
  placeholder = "Search recipes...",
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 max-w-md px-3 py-2 rounded-md placeholder-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-shadow"
      style={{
        backgroundColor: "rgba(193,157,125,0.5)",
        border: "none",
      }}
      aria-label="Search recipes"
    />
  );
};

export default NavbarSearch;
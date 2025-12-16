"use client";

import React from "react";

interface NavbarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * NavbarSearch - Search input component
 */
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
        border: "none" 
      }}
      aria-label="Search recipes"
    />
  );
};

export default NavbarSearch;
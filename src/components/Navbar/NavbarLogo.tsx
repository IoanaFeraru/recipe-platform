"use client";

/**
 * NavbarLogo component.
 *
 * Renders the application brand identity within the navigation bar.
 * Provides a clickable logo and brand name that navigates the user
 * back to the home page. This component is purely presentational and
 * contains no business logic.
 *
 * Responsibilities:
 * - Display the application logo image
 * - Display the application brand name
 * - Provide a consistent navigation entry point to the home route
 *
 * Design notes:
 * - Uses Next.js Link for client-side navigation
 * - Styling aligns with the global typography and color system
 * - Hover state reinforces brand interactivity
 *
 * @module NavbarLogo
 */

import React from "react";
import Link from "next/link";

interface NavbarLogoProps {
  /** Source URL for the brand logo image */
  logoSrc: string;
}

export const NavbarLogo: React.FC<NavbarLogoProps> = ({ logoSrc }) => {
  return (
    <Link
      href="/"
      className="flex items-center gap-1 sm:gap-2 text-(--color-text) text-xl sm:text-3xl hover:text-(--color-primary) transition-colors garet-heavy shrink-0"
    >
      <img
        src={logoSrc}
        alt="CookHub Logo"
        width={48}
        height={48}
        className="align-middle w-8 h-8 sm:w-12 sm:h-12"
      />
      <span className="leading-none">CookHub</span>
    </Link>
  );
};

export default NavbarLogo;
"use client";

import React from "react";
import Link from "next/link";

interface NavbarLogoProps {
  logoSrc: string;
}

/**
 * NavbarLogo - Brand logo and title component
 */
export const NavbarLogo: React.FC<NavbarLogoProps> = ({ logoSrc }) => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-(--color-text) text-3xl hover:text-(--color-primary) transition-colors garet-heavy"
    >
      <img
        src={logoSrc}
        alt="CookHub Logo"
        width={48}
        height={48}
        className="h-auto align-middle"
      />
      <span className="leading-none">CookHub</span>
    </Link>
  );
};

export default NavbarLogo;
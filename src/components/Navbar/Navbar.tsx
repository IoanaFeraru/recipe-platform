"use client";

/**
 * Navbar component.
 *
 * Serves as the primary application navigation bar, fixed to the top of the
 * viewport. It coordinates high-level navigation concerns, including branding,
 * search state synchronization with the URL, theme switching, and authenticated
 * user actions.
 *
 * Responsibilities:
 * - Display the application logo with theme-aware assets
 * - Provide a search input synchronized with the `q` URL query parameter
 * - Expose authentication-related actions (login/logout, profile access)
 * - Allow users to toggle between light and dark themes
 * - Maintain a sticky layout for consistent access during navigation
 *
 * Design notes:
 * - Delegates visual rendering and interaction details to focused subcomponents
 *   (NavbarLogo, NavbarSearch, NavbarActions)
 * - Keeps routing and state orchestration centralized for predictability
 * - Uses Next.js navigation hooks to ensure client-side transitions
 *
 * @module Navbar
 */

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarSearch } from "./NavbarSearch";
import { NavbarActions } from "./NavbarActions";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme, logoSrc } = useTheme();

  const search = searchParams.get("q") ?? "";

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    router.push(`/?${params.toString()}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 px-6 py-3 bg-(--color-bg-secondary) shadow-md">
      <NavbarLogo logoSrc={logoSrc} />

      <NavbarSearch value={search} onChange={handleSearch} />

      <NavbarActions
        user={user}
        theme={theme}
        onLogout={handleLogout}
        onThemeToggle={toggleTheme}
      />
    </nav>
  );
}
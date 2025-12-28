"use client";

/**
 * NavbarActions component.
 *
 * Renders the right-hand action area of the main navigation bar. This component
 * adapts its output based on authentication state, exposing different controls
 * for authenticated and guest users while consistently providing theme
 * switching functionality.
 *
 * Responsibilities:
 * - Display authentication-dependent actions (profile, favorites, dashboard, logout)
 * - Display guest actions (login and registration) when unauthenticated
 * - Provide a theme toggle control with visual state indication
 * - Delegate concrete action rendering to focused subcomponents
 *
 * Design notes:
 * - Authentication state is injected via props to keep the component stateless
 * - UI concerns are separated into AuthenticatedActions and GuestActions for clarity
 * - Icon-only buttons are used for compact navigation affordances
 *
 * @module NavbarActions
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "../UI/Button";
import ThemeToggle from "../ThemeToggle";
import type { User } from "firebase/auth";

interface NavbarActionsProps {
  user: User | null;
  theme: "light" | "dark";
  onLogout: () => void;
  onThemeToggle: () => void;
}

export const NavbarActions: React.FC<NavbarActionsProps> = ({
  user,
  theme,
  onLogout,
  onThemeToggle,
}) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {user ? (
        <AuthenticatedActions user={user} onLogout={onLogout} />
      ) : (
        <GuestActions />
      )}

      <ThemeToggle checked={theme === "dark"} onChange={onThemeToggle} />
      <span className="ml-1 sm:ml-2 text-sm hidden sm:inline" aria-hidden="true">
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
    </div>
  );
};

const AuthenticatedActions: React.FC<{
  user: User;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  return (
    <>
      <Link href="/favorites" aria-label="Favorites">
        <Button variant="primary" iconOnly className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2">
          <img src="/fi-sr-heart.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </Link>

      <Link href="/dashboard" aria-label="My Recipes">
        <Button variant="primary" iconOnly className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2">
          <img src="/books.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </Link>

      <Link href="/profile" aria-label="Profile">
        <Button
          variant="primary"
          iconOnly
          className="relative w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full shrink-0 overflow-hidden"
        >
          <Image
            src={user.photoURL || "/default-profile.svg"}
            alt="Profile"
            fill
            sizes="(max-width: 640px) 32px, 40px"
            className="object-cover"
            style={{ borderRadius: "9999px" }}
          />
        </Button>
      </Link>

      <Button
        variant="danger"
        onClick={onLogout}
        iconOnly
        aria-label="Logout"
        className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2"
      >
        <img src="/user-logout.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </>
  );
};

const GuestActions: React.FC = () => {
  return (
    <>
      <Link href="/login">
        <Button variant="primary" className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap">Log In</Button>
      </Link>
      <Link href="/register">
        <Button variant="primary" className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap">Register</Button>
      </Link>
    </>
  );
};

export default NavbarActions;
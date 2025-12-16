"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "../Button";
import ThemeToggle from "../ThemeToggle";
import type { User } from "firebase/auth";

interface NavbarActionsProps {
  user: User | null;
  theme: "light" | "dark";
  onLogout: () => void;
  onThemeToggle: () => void;
}

/**
 * NavbarActions - User action buttons and theme toggle
 * Renders different content based on auth state
 */
export const NavbarActions: React.FC<NavbarActionsProps> = ({
  user,
  theme,
  onLogout,
  onThemeToggle,
}) => {
  return (
    <div className="flex items-center gap-2">
      {user ? (
        <AuthenticatedActions user={user} onLogout={onLogout} />
      ) : (
        <GuestActions />
      )}
      
      <ThemeToggle checked={theme === "dark"} onChange={onThemeToggle} />
      <span className="ml-2 text-sm" aria-hidden="true">
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
    </div>
  );
};

/**
 * AuthenticatedActions - Actions for logged-in users
 */
const AuthenticatedActions: React.FC<{
  user: User;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  return (
    <>
      <Link href="/favorites" aria-label="Favorites">
        <Button variant="primary" iconOnly>
          <img src="/fi-sr-heart.svg" alt="" className="w-5 h-5" />
        </Button>
      </Link>
      
      <Link href="/dashboard" aria-label="My Recipes">
        <Button variant="primary" iconOnly>
          <img src="/books.svg" alt="" className="w-5 h-5" />
        </Button>
      </Link>
      
      <Link href="/profile" aria-label="Profile">
        <Button
          variant="primary"
          iconOnly
          className="relative w-10 h-10 p-0 rounded-full flex-none overflow-hidden"
        >
          <Image
            src={user.photoURL || "/default-profile.svg"}
            alt="Profile"
            fill
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
      >
        <img src="/user-logout.svg" alt="" className="w-5 h-5" />
      </Button>
    </>
  );
};

/**
 * GuestActions - Actions for non-authenticated users
 */
const GuestActions: React.FC = () => {
  return (
    <>
      <Link href="/login">
        <Button variant="primary">Log In</Button>
      </Link>
      <Link href="/register">
        <Button variant="primary">Register</Button>
      </Link>
    </>
  );
};

export default NavbarActions;
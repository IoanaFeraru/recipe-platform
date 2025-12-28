"use client";

/**
 * MobileMenu component.
 *
 * Provides a hamburger menu for mobile devices that contains all navigation
 * actions. The menu slides in from the right and includes user actions,
 * theme toggle, and authentication options.
 *
 * Responsibilities:
 * - Display hamburger button on mobile devices
 * - Show/hide slide-out menu with smooth animations
 * - Render all navigation actions in a vertical layout
 * - Close menu when clicking outside or on a navigation item
 *
 * @module MobileMenu
 */

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "../UI/Button";
import ThemeToggle from "../ThemeToggle";
import type { User } from "firebase/auth";

interface MobileMenuProps {
  user: User | null;
  theme: "light" | "dark";
  onLogout: () => void;
  onThemeToggle: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  theme,
  onLogout,
  onThemeToggle,
  isOpen,
  onToggle,
  onClose,
}) => {
  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-mobile-menu]")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-md hover:bg-(--color-bg) transition-colors"
        aria-label="Toggle menu"
        data-mobile-menu="button"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 w-full bg-(--color-text) transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-(--color-text) transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-(--color-text) transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-out Menu */}
      <div
        data-mobile-menu="panel"
        className={`fixed top-0 right-0 h-full w-64 bg-(--color-bg-secondary) shadow-xl z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="self-end mb-6 p-2 rounded-md hover:bg-(--color-bg) transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Menu Items */}
          <div className="flex flex-col gap-4 flex-1">
            {user ? (
              <AuthenticatedMenuItems
                user={user}
                onLogout={onLogout}
                onClose={onClose}
              />
            ) : (
              <GuestMenuItems onClose={onClose} />
            )}

            {/* Theme Toggle */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-(--color-border)">
              <span className="text-sm font-semibold text-(--color-text)">
                {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </span>
              <ThemeToggle checked={theme === "dark"} onChange={onThemeToggle} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AuthenticatedMenuItems: React.FC<{
  user: User;
  onLogout: () => void;
  onClose: () => void;
}> = ({ user, onLogout, onClose }) => {
  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* Profile Section */}
      <Link
        href="/profile"
        onClick={onClose}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg) transition-colors"
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
          <Image
            src={user.photoURL || "/default-profile.svg"}
            alt="Profile"
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-(--color-text) truncate">
            {user.displayName || "User"}
          </span>
          <span className="text-xs text-(--color-text-muted) truncate">
            View Profile
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <Link
        href="/favorites"
        onClick={onClose}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg) transition-colors"
      >
        <img src="/fi-sr-heart.svg" alt="" className="w-6 h-6" />
        <span className="font-medium text-(--color-text)">Favorites</span>
      </Link>

      <Link
        href="/dashboard"
        onClick={onClose}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg) transition-colors"
      >
        <img src="/books.svg" alt="" className="w-6 h-6" />
        <span className="font-medium text-(--color-text)">My Recipes</span>
      </Link>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-danger)/10 transition-colors text-(--color-danger) mt-auto"
      >
        <img src="/user-logout.svg" alt="" className="w-6 h-6" />
        <span className="font-medium">Logout</span>
      </button>
    </>
  );
};

const GuestMenuItems: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <>
      <Link href="/login" onClick={onClose}>
        <Button variant="primary" className="w-full justify-center">
          Log In
        </Button>
      </Link>

      <Link href="/register" onClick={onClose}>
        <Button variant="primary" className="w-full justify-center">
          Register
        </Button>
      </Link>
    </>
  );
};

export default MobileMenu;

"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  logoSrc: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Application theme context for client-side light/dark mode management.
 *
 * Responsibilities:
 * - Stores and restores the user’s theme preference using `localStorage`
 * - Applies the active theme to `document.documentElement` via a `data-theme` attribute (for CSS variables/selectors)
 * - Exposes a `toggleTheme()` action for UI controls
 * - Computes and preloads a theme-appropriate logo asset to reduce visual flashing during theme changes
 *
 * Behavior:
 * - Defaults to `"light"` when no persisted preference exists
 * - Persists any theme change immediately to `localStorage`
 * - Sets `data-theme="dark"` for dark mode and clears the attribute for light mode
 *
 * Usage:
 * Wrap your application tree with `ThemeProvider`, then consume via `useTheme()`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [logoSrc, setLogoSrc] = useState<string>("/logoLight.svg");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : ""
    );
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const src = theme === "dark" ? "/logoDark.svg" : "/logoLight.svg";
    const img = new Image();
    img.src = src;
    setLogoSrc(src);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, logoSrc }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
/**
 * Layout
 *
 * Application root layout for the Next.js App Router.
 * This file defines global document structure, metadata, fonts, and top-level providers
 * used across the entire application.
 *
 * Responsibilities:
 * - Declare site-wide metadata (title, description, app icon) for SEO and browser UI
 * - Load and apply global fonts (Geist Sans / Geist Mono) via CSS variables
 * - Import global styles (`globals.css`)
 * - Compose global infrastructure providers:
 *   - `ErrorBoundary` for catching unexpected render/runtime errors
 *   - `AuthProvider` for authentication state and actions
 *   - `ThemeProvider` for light/dark mode state and theme persistence
 * - Render persistent UI elements shared across pages (Navbar, ScrollToTop)
 *
 * Rendering Notes:
 * - `Navbar` is mounted inside providers to access auth/theme context.
 * - `ScrollToTop` is always available for long pages.
 * - The `children` slot renders the active route content under the global chrome.
 *
 * @module RootLayout
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import ScrollToTop from "@/components/UI/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CookHub",
  description: "Your recipes",
  icons: {
    icon: new URL("./icon.svg", import.meta.url),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <Navbar />
              {children}
            </ThemeProvider>
          </AuthProvider>
          <ScrollToTop />
        </ErrorBoundary>
      </body>
    </html>
  );
}

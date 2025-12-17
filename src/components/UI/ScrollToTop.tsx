"use client";

/**
 * Floating “scroll-to-top” action button for long pages.
 *
 * Renders a fixed-position button in the bottom-right corner that becomes
 * visible only after the user scrolls beyond a configurable threshold
 * (currently 300px). When activated, it smoothly scrolls the viewport to
 * the top of the page.
 *
 * Key behaviors:
 * - Visibility toggles based on `window.scrollY`
 * - Smooth scroll uses the native browser API for best performance
 * - Scroll listener is registered once and cleaned up on unmount
 *
 * Accessibility:
 * - Uses a semantic <button> element for keyboard interaction
 * - Includes a descriptive `title` and image `alt` text
 *
 * @component
 *
 * @example
 * ```tsx
 * // Place in a page or layout so it is present across scrollable content
 * <ScrollToTop />
 * ```
 */
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 300);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    handleScroll(); // Initialize visibility on mount (supports reload mid-scroll)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full shadow-[4px_4px_0_0_var(--color-shadow)] flex items-center justify-center bg-(--color-primary) text-white transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } hover:brightness-110`}
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <Image src="/caret-up.svg" alt="" width={24} height={24} />
    </button>
  );
}
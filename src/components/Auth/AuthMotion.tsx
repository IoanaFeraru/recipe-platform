"use client";

/**
 * AuthMotion
 *
 * Animation wrapper for authentication-related pages and components.
 * Applies a subtle entrance and exit transition using Framer Motion,
 * while fully respecting the user's reduced motion accessibility
 * preferences.
 *
 * Responsibilities:
 * - Animate auth UI on mount and unmount
 * - Gracefully disable animations when `prefers-reduced-motion` is enabled
 * - Act as a transparent wrapper with no layout side effects
 *
 * Animation Behavior:
 * - Enter: fade in with slight upward motion
 * - Exit: fade out with slight upward motion
 * - Uses a smooth, ease-in-out cubic-bezier curve
 *
 * Accessibility:
 * - Automatically disables animations when reduced motion is requested
 *
 * @component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be animated
 *
 * @example
 * ```tsx
 * <AuthMotion>
 *   <LoginForm />
 * </AuthMotion>
 * ```
 */
import { motion, useReducedMotion } from "framer-motion";

export default function AuthMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.45,
          ease: [0.42, 0, 0.58, 1],
        },
      }}
      exit={{
        opacity: 0,
        y: -8,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      }}
    >
      {children}
    </motion.div>
  );
}
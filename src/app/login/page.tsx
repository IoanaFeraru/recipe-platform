/**
 * LoginPage
 *
 * User authentication page for signing into CookHub. This page acts as a container that
 * wires up form state and submission behavior via `useLoginForm`, and renders the
 * login UI using shared Auth components for consistent styling and UX.
 *
 * Responsibilities:
 * - Consume `useLoginForm` to manage:
 *   - Controlled input state for email and password
 *   - Submission lifecycle (`isSubmitting`) and error messaging
 *   - “Shake” animation trigger for invalid credentials or failed submissions
 * - Render a consistent auth layout using `AuthCard` and `AuthMotion`
 * - Provide navigation to related auth flows:
 *   - Forgot password (`/forgot-password`)
 *   - Registration (`/register`)
 * - Wrap the page in `PageErrorBoundary` to prevent authentication UI failures from
 *   breaking app navigation
 *
 * UX / Accessibility:
 * - Uses semantic form submission to support keyboard and assistive technologies
 * - Displays errors in an alert region (`role="alert"`) for screen reader announcement
 * - Enables caps-lock warning via `PasswordField` to reduce login friction
 *
 * Architecture:
 * - Container + presentational pattern:
 *   - Hook contains business logic; UI composed from reusable components
 * - Animation is isolated to the container (`framer-motion`) for a clean separation
 *
 * @module LoginPage
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/UI/Button";
import { AuthCard, AuthMotion, FormField, PasswordField } from "@/components/Auth";
import { useLoginForm } from "@/hooks/useLoginForm";
import { PageErrorBoundary } from "@/components/ErrorBoundary";

/**
 * LoginPage - User login page
 */
export default function LoginPage() {
  const {
    email,
    password,
    error,
    isSubmitting,
    shake,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <PageErrorBoundary>
      <motion.div
        animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <AuthMotion>
          <AuthCard title="Welcome back" subtitle="Log in to your CookHub account">
            {/* Error message */}
            {error && (
              <div
                className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-3 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <FormField
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                required
                autoComplete="email"
              />

              <PasswordField
                label="Password"
                name="password"
                value={password}
                onChange={setPassword}
                required
                autoComplete="current-password"
                showCapsLockWarning
              />

              {/* Forgot password link */}
              <div className="text-right text-sm">
                <Link
                  href="/forgot-password"
                  className="text-(--color-primary) hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="mt-2 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Register link */}
            <p className="text-sm text-center mt-4 text-(--color-text-muted)">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-(--color-primary) hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </AuthCard>
        </AuthMotion>
      </motion.div>
    </PageErrorBoundary>
  );
}
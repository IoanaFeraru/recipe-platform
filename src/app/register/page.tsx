/**
 * RegisterPage
 *
 * User registration page for CookHub.
 *
 * Responsibilities:
 * - Render the registration UI inside a page-level error boundary
 * - Collect user credentials (email, password, confirmation, display name)
 * - Display password strength feedback and caps-lock warnings
 * - Handle form submission, validation feedback, and loading state via `useRegisterForm`
 * - Provide animated UX feedback (shake on error, entry motion)
 * - Offer navigation to the login page for existing users
 *
 * Architecture:
 * - Business logic and validation are encapsulated in `useRegisterForm`
 * - Presentation is composed from reusable auth components:
 *   - `AuthCard` for layout
 *   - `AuthMotion` for entrance animation
 *   - `FormField` and `PasswordField` for inputs
 *   - `PasswordStrengthIndicator` for real-time feedback
 *
 * @module RegisterPage
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/UI/Button";
import {
  AuthCard,
  AuthMotion,
  FormField,
  PasswordField,
  PasswordStrengthIndicator,
} from "@/components/Auth";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { PageErrorBoundary } from "@/components/ErrorBoundary";

export default function RegisterPage() {
  const {
    email,
    password,
    confirmPassword,
    name,
    error,
    isSubmitting,
    shake,
    passwordStrength,
    setEmail,
    setPassword,
    setConfirmPassword,
    setName,
    handleSubmit,
  } = useRegisterForm();

  return (
    <PageErrorBoundary>
      <motion.div
        animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <AuthMotion>
          <AuthCard
            title="Create account"
            subtitle="Join CookHub and save your favorite recipes"
          >
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

              <div>
                <PasswordField
                  label="Password"
                  name="password"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="new-password"
                  showCapsLockWarning
                />
                <PasswordStrengthIndicator
                  strength={passwordStrength}
                  show={password.length > 0}
                />
              </div>

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                autoComplete="new-password"
                showCapsLockWarning
              />

              <FormField
                label="Name"
                name="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={setName}
                required
                autoComplete="name"
              />

              <Button
                type="submit"
                variant="primary"
                className="mt-2 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Register"}
              </Button>
            </form>

            {/* Login link */}
            <p className="text-sm text-center mt-4 text-(--color-text-muted)">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-(--color-primary) hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </AuthCard>
        </AuthMotion>
      </motion.div>
    </PageErrorBoundary>
  );
}
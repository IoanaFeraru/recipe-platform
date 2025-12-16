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
              Don't have an account?{" "}
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
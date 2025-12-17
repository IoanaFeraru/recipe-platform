"use client";

/**
 * AuthCard
 *
 * Layout wrapper component for authentication-related pages such as
 * login, registration, and password reset. It provides a consistent
 * centered card layout with a title, optional subtitle, and flexible
 * content area for forms and actions.
 *
 * Responsibilities:
 * - Center authentication content within the viewport
 * - Provide a visually distinct card container
 * - Display a primary title and optional descriptive subtitle
 * - Render arbitrary child components (e.g., forms, buttons, links)
 *
 * @component
 *
 * @param {Object} props
 * @param {string} props.title - Primary heading displayed at the top of the card
 * @param {string} [props.subtitle] - Optional secondary text shown below the title
 * @param {React.ReactNode} props.children - Form elements or other auth-related content
 *
 * @example
 * ```tsx
 * <AuthCard
 *   title="Welcome Back"
 *   subtitle="Sign in to your account"
 * >
 *   <LoginForm />
 * </AuthCard>
 * ```
 */
interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex justify-center items-start px-4 pt-20 pb-6 bg-(--color-bg)">
      <div className="w-full max-w-md bg-(--color-bg-secondary) rounded-xl shadow-lg p-6">
        <h1 className="text-3xl mb-1 text-center garet-heavy text-(--color-text)">
          {title}
        </h1>

        {subtitle && (
          <p className="text-center text-(--color-text-muted) mb-4">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
"use client";

/**
 * ProtectedRoute component.
 *
 * Acts as a route guard for authenticated-only pages. This component checks
 * the current authentication state via the AuthContext and automatically
 * redirects unauthenticated users to the login page.
 *
 * While the authentication state is being resolved, a loading indicator is
 * rendered to prevent protected content from flashing briefly on screen.
 *
 * Intended usage is to wrap page-level components or layouts that require
 * a logged-in user.
 */

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
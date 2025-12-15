"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthMotion from "@/components/AuthMotion";
import { motion } from "framer-motion";
import { validateEmail, validateRequiredText } from "@/lib/utils/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // === Validation using validation.ts utils ===
    const emailValidation = validateEmail(email);
    const passwordValidation = validateRequiredText(password, "Password");

    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Invalid email");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "Password is required");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    // === Attempt login ===
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <AuthMotion>
        <AuthCard title="Welcome back" subtitle="Log in to your CookHub account">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-(--color-text)">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-(--color-text)">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-14 px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-(--color-text-muted) hover:text-(--color-primary) z-10"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

                {capsLock && (
                  <p className="absolute left-0 top-full mt-1 text-xs text-yellow-600 z-0">
                    Caps Lock is on
                  </p>
                )}
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right text-sm">
              <Link href="/forgot-password" className="text-(--color-primary) hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" className="mt-2 w-full">
              Login
            </Button>
          </form>

          {/* Register link */}
          <p className="text-sm text-center mt-4 text-(--color-text-muted)">
            Don’t have an account?{" "}
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
  );
}
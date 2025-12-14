"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthMotion from "@/components/AuthMotion";
import { motion } from "framer-motion";

type Strength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): {
  level: Strength;
  score: number;
  message: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1)
    return { level: "weak", score, message: "Too short or too simple" };

  if (score === 2)
    return { level: "medium", score, message: "Add numbers or symbols" };

  return { level: "strong", score, message: "Strong password" };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [capsLock, setCapsLock] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const strength = getPasswordStrength(password);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    try {
      await register(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
    <AuthMotion>
      <AuthCard
        title="Create account"
        subtitle="Join CookHub and save your favorite recipes"
      >
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-(--color-text)">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded-md border border-(--color-border)
                        bg-(--color-bg) focus:outline-none focus:ring-2
                        focus:ring-(--color-primary)"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-(--color-text)">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded-md border border-(--color-border)
                        bg-(--color-bg) focus:outline-none focus:ring-2
                        focus:ring-(--color-primary)"
              required
            />
          </div>
          {capsLock && (
            <p className="text-xs text-yellow-600 mt-1">
              Caps Lock is on
            </p>
          )}
          {password && (
            <div className="mt-1">
              <div className="h-1 rounded bg-(--color-border)">
                <div
                  className={`
                    h-1 rounded transition-all
                    ${strength.level === "weak" && "w-1/3 bg-red-500"}
                    ${strength.level === "medium" && "w-2/3 bg-yellow-500"}
                    ${strength.level === "strong" && "w-full bg-green-500"}
                  `}
                />
              </div>
              <p className="text-xs mt-1 text-(--color-text-muted)">
                {strength.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-(--color-text)">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-3 py-2 rounded-md border border-(--color-border)
                        bg-(--color-bg) focus:outline-none focus:ring-2
                        focus:ring-(--color-primary)"
              required
            />
            {capsLock && (
              <p className="text-xs text-yellow-600 mt-1">
                Caps Lock is on
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="mt-2 w-full">
            Register
          </Button>
        </form>

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
  );
}

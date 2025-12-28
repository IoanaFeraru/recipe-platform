import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { validateEmail, validateRequiredText } from "@/lib/utils/validation";

interface UseLoginFormReturn {
  email: string;
  password: string;
  showPassword: boolean;
  capsLock: boolean;
  error: string;
  isSubmitting: boolean;
  shake: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  toggleShowPassword: () => void;
  setCapsLock: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Login form controller hook.
 *
 * Owns the state and event handlers for an email/password login form and wires
 * the UI to the authentication layer (`useAuth().login`) and post-auth routing.
 *
 * Non-obvious business rules:
 * - Runs client-side validation before calling `login()` to avoid unnecessary
 *   auth requests and to provide immediate UX feedback.
 * - On any validation or authentication failure, triggers a brief "shake"
 *   animation and exposes an `error` message for the UI.
 * - Successful authentication redirects the user to `/dashboard`.
 *
 * UX features:
 * - `showPassword` supports password visibility toggling without altering the
 *   underlying `password` value.
 * - `capsLock` is exposed for UI hints; this hook does not detect Caps Lock
 *   itself (the component should set it via keyboard events).
 *
 * @returns Form field state, derived UI state, and imperative handlers for login flows.
 */
export const useLoginForm = (): UseLoginFormReturn => {
  const { login } = useAuth();
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Invalid email");
        triggerShake();
        return;
      }

      const passwordValidation = validateRequiredText(password, "Password");
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error || "Password is required");
        triggerShake();
        return;
      }

      setIsSubmitting(true);

      try {
        await login(email, password);
        router.push("/dashboard");
      } catch (err: unknown) {
        // Security/UX: do not leak which field failed; show generic message.
        setError("Invalid credentials");
        triggerShake();
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, login, router, triggerShake]
  );

  return {
    email,
    password,
    showPassword,
    capsLock,
    error,
    isSubmitting,
    shake,
    setEmail,
    setPassword,
    toggleShowPassword,
    setCapsLock,
    handleSubmit,
    clearError,
  };
};

export default useLoginForm;
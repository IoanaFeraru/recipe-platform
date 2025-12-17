import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { validateEmail, validatePassword, validatePasswordMatch, validateRequiredText, PasswordStrength, getPasswordStrength } from "@/lib/utils/validation";

interface UseRegisterFormReturn {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  capsLock: boolean;
  error: string;
  isSubmitting: boolean;
  shake: boolean;
  passwordStrength: PasswordStrength;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setName: (value: string) => void;
  setCapsLock: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * Registration form hook.
 *
 * Owns all state and submission logic for the signup flow:
 * - tracks form fields (email, password, confirmation, display name)
 * - computes password strength for UI feedback
 * - validates inputs before attempting registration
 * - creates Firebase Auth account via AuthContext
 * - sets the user's displayName via Firebase Auth profile update
 * - navigates to /dashboard on success
 *
 * UI behavior:
 * - `error` is a single message representing the first failing validation or server error
 * - `shake` is a transient flag (400ms) intended to drive a shake animation on errors
 * - `capsLock` is controlled by the caller (key event handling lives in the component)
 */
export const useRegisterForm = (): UseRegisterFormReturn => {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [capsLock, setCapsLock] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const validations = [
        validateEmail(email),
        validatePassword(password),
        validatePasswordMatch(password, confirmPassword),
        validateRequiredText(name, "Name")
      ];

      const failed = validations.find(v => !v.isValid);
      if (failed) {
        setError(failed.error ?? "Validation failed");
        triggerShake();
        return;
      }

      setIsSubmitting(true);

      try {
        const userCredential = await register(email, password);

        // Keep profile updates close to the auth action so UI can rely on displayName shortly after signup.
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }

        router.push("/dashboard");
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as any).message)
            : "Registration failed";

        setError(message);
        triggerShake();
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, confirmPassword, name, register, router, triggerShake]
  );

  return {
    email,
    password,
    confirmPassword,
    name,
    capsLock,
    error,
    isSubmitting,
    shake,
    passwordStrength,
    setEmail,
    setPassword,
    setConfirmPassword,
    setName,
    setCapsLock,
    handleSubmit,
    clearError
  };
};

export default useRegisterForm;
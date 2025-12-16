import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { validateEmail, validateRequiredText } from "@/lib/utils/validation";

interface UseLoginFormReturn {
  // Form state
  email: string;
  password: string;
  showPassword: boolean;
  capsLock: boolean;
  error: string;
  isSubmitting: boolean;
  shake: boolean;
  
  // Actions
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  toggleShowPassword: () => void;
  setCapsLock: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * useLoginForm - Custom hook for login form state and logic
 * 
 * Encapsulates:
 * - Form state management
 * - Validation logic
 * - Submission handling
 * - Error management
 * - UI state (shake animation, caps lock detection)
 * 
 * @example
 * const { email, setEmail, handleSubmit, error } = useLoginForm();
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError("Invalid credentials");
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login, router, triggerShake]);

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
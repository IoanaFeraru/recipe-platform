import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequiredText,
  PasswordStrength,
  getPasswordStrength,
} from "@/lib/utils/validation";

interface UseRegisterFormReturn {
  // Form state
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  capsLock: boolean;
  error: string;
  isSubmitting: boolean;
  shake: boolean;
  
  // Computed
  passwordStrength: PasswordStrength;
  
  // Actions
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setName: (value: string) => void;
  setCapsLock: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

/**
 * useRegisterForm - Custom hook for registration form state and logic
 * 
 * Encapsulates:
 * - Form state management
 * - Validation logic with password strength
 * - Submission handling with profile update
 * - Error management
 * - UI state (shake animation, caps lock detection)
 * 
 * @example
 * const { 
 *   email, setEmail, 
 *   passwordStrength,
 *   handleSubmit 
 * } = useRegisterForm();
 */
export const useRegisterForm = (): UseRegisterFormReturn => {
  const { register } = useAuth();
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  
  // UI state
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  // Computed password strength
  const passwordStrength = useMemo(() => {
    return getPasswordStrength(password);
  }, [password]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Run all validations
    const validations = [
      validateEmail(email),
      validatePassword(password),
      validatePasswordMatch(password, confirmPassword),
      validateRequiredText(name, "Name"),
    ];

    const failedValidation = validations.find((v) => !v.isValid);
    if (failedValidation) {
      setError(failedValidation.error ?? "Validation failed");
      triggerShake();
      return;
    }

    // Submit
    setIsSubmitting(true);
    
    try {
      const userCredential = await register(email, password);

      if (userCredential.user) {
        await updateProfile(userCredential.user, { 
          displayName: name.trim() 
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, confirmPassword, name, register, router, triggerShake]);

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
    clearError,
  };
};

export default useRegisterForm;
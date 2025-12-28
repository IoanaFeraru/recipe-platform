/**
 * Centralized validation and sanitization utilities.
 *
 * This module provides reusable, framework-agnostic validation logic for:
 * - authentication (email, password)
 * - generic text, number, URL, and array inputs
 * - recipe-specific business rules
 * - comments and ratings
 * - image uploads
 * - batch and form-level validation
 *
 * The design goal is to keep validation logic deterministic, composable,
 * and independent of UI concerns.
 */

/* ======================================================
 * CORE TYPES
 * ====================================================== */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordStrength {
  level: "weak" | "medium" | "strong";
  score: number;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

/* ======================================================
 * EMAIL VALIDATION
 * ====================================================== */

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
};

/* ======================================================
 * PASSWORD VALIDATION
 * ====================================================== */

export const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { level: "weak", score, message: "Too short or too simple" };
  }

  if (score === 2) {
    return {
      level: "medium",
      score,
      message: "Add numbers or symbols for better security"
    };
  }

  return { level: "strong", score, message: "Strong password" };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters"
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: "Password must be less than 128 characters"
    };
  }

  return { isValid: true };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true };
};

/* ======================================================
 * URL VALIDATION
 * ====================================================== */

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: "URL is required" };
  }

  if (!isValidUrl(url)) {
    return { isValid: false, error: "Invalid URL format" };
  }

  return { isValid: true };
};

/* ======================================================
 * TEXT VALIDATION
 * ====================================================== */

export const validateRequiredText = (
  text: string,
  fieldName: string = "Field"
): ValidationResult => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

export const validateTextLength = (
  text: string,
  minLength: number,
  maxLength: number,
  fieldName: string = "Field"
): ValidationResult => {
  const length = text.trim().length;

  if (length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`
    };
  }

  if (length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be less than ${maxLength} characters`
    };
  }

  return { isValid: true };
};

/* ======================================================
 * NUMBER VALIDATION
 * ====================================================== */

export const isPositiveNumber = (value: unknown): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const isNonNegativeNumber = (value: unknown): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

export const validatePositiveNumber = (
  value: unknown,
  fieldName: string = "Value"
): ValidationResult => {
  if (value === undefined || value === null || value === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (!isPositiveNumber(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a positive number`
    };
  }

  return { isValid: true };
};

export const validateNumberRange = (
  value: unknown,
  min: number,
  max: number,
  fieldName: string = "Value"
): ValidationResult => {
  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`
    };
  }

  return { isValid: true };
};

/* ======================================================
 * RECIPE-SPECIFIC VALIDATION
 * ====================================================== */

export const validateServings = (servings: unknown): ValidationResult => {
  const num = Number(servings);

  if (isNaN(num)) {
    return { isValid: false, error: "Servings must be a number" };
  }

  if (num < 1) {
    return { isValid: false, error: "Servings must be at least 1" };
  }

  if (num > 100) {
    return { isValid: false, error: "Servings cannot exceed 100" };
  }

  return { isValid: true };
};

export const validateIngredientName = (name: string): ValidationResult => {
  return validateRequiredText(name, "Ingredient name");
};

export const validateStepText = (text: string): ValidationResult => {
  const required = validateRequiredText(text, "Step description");
  if (!required.isValid) return required;

  return validateTextLength(text, 10, 1000, "Step description");
};

export const validateRecipeTitle = (title: string): ValidationResult => {
  const required = validateRequiredText(title, "Recipe title");
  if (!required.isValid) return required;

  return validateTextLength(title, 3, 100, "Recipe title");
};

export const validateRecipeDescription = (
  description: string
): ValidationResult => {
  if (description && description.trim().length > 0) {
    return validateTextLength(description, 10, 500, "Recipe description");
  }

  return { isValid: true };
};

export const validateRating = (rating: unknown): ValidationResult => {
  return validateNumberRange(rating, 1, 5, "Rating");
};

export const validatePrepTime = (
  minTime: number,
  maxTime: number
): ValidationResult => {
  if (minTime < 0 || maxTime < 0) {
    return { isValid: false, error: "Time cannot be negative" };
  }

  if (minTime > maxTime) {
    return {
      isValid: false,
      error: "Minimum time cannot exceed maximum time"
    };
  }

  if (maxTime === 0) {
    return {
      isValid: false,
      error: "Maximum time must be greater than 0"
    };
  }

  return { isValid: true };
};

/* ======================================================
 * TAG VALIDATION
 * ====================================================== */

export const validateTag = (tag: string): ValidationResult => {
  const trimmed = tag.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: "Tag cannot be empty" };
  }

  if (trimmed.length > 30) {
    return {
      isValid: false,
      error: "Tag must be less than 30 characters"
    };
  }

  if (!/^[a-zA-Z0-9\s-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Tag can only contain letters, numbers, spaces, and hyphens"
    };
  }

  return { isValid: true };
};

export const validateTags = (tags: string[]): ValidationResult => {
  if (tags.length === 0) {
    return { isValid: true };
  }

  if (tags.length > 10) {
    return { isValid: false, error: "Maximum 10 tags allowed" };
  }

  for (const tag of tags) {
    const result = validateTag(tag);
    if (!result.isValid) return result;
  }

  return { isValid: true };
};

/* ======================================================
 * ARRAY VALIDATION
 * ====================================================== */

export const validateNonEmptyArray = (
  array: unknown[],
  fieldName: string = "Items"
): ValidationResult => {
  if (!Array.isArray(array) || array.length === 0) {
    return {
      isValid: false,
      error: `At least one ${fieldName} is required`
    };
  }

  return { isValid: true };
};

/* ======================================================
 * COMMENT VALIDATION
 * ====================================================== */

export const validateComment = (
  text: string,
  rating?: number | null
): ValidationResult => {
  const textValidation = validateRequiredText(text, "Comment");
  if (!textValidation.isValid) return textValidation;

  const lengthValidation = validateTextLength(text, 1, 1000, "Comment");
  if (!lengthValidation.isValid) return lengthValidation;

  if (rating !== undefined && rating !== null) {
    return validateRating(rating);
  }

  return { isValid: true };
};

/* ======================================================
 * IMAGE VALIDATION
 * ====================================================== */

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
];

export const validateImageFile = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Please upload JPG, PNG, or WebP"
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`
    };
  }

  return { isValid: true };
};

/* ======================================================
 * BATCH & FORM VALIDATION
 * ====================================================== */

export const validateMultiple = (
  validations: ValidationResult[]
): ValidationResult => {
  const errors = validations
    .filter(v => !v.isValid)
    .map(v => v.error)
    .filter(Boolean) as string[];

  if (errors.length > 0) {
    return { isValid: false, error: errors.join("; ") };
  }

  return { isValid: true };
};

export const createFormValidation = (
  validations: Record<string, ValidationResult>
): FormValidation => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid) {
      isValid = false;
      errors[field] = result.error || "Validation failed";
    }
  }

  return { isValid, errors };
};

/* ======================================================
 * SANITIZATION
 * ====================================================== */

export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, " ");
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizeTags = (tagsString: string): string[] => {
  return tagsString
    .split(",")
    .map(tag => sanitizeText(tag))
    .filter(tag => tag.length > 0);
};
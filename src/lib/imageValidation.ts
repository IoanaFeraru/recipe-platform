/**
 * Image upload validation utilities.
 *
 * This module centralizes client-side constraints for image uploads to ensure
 * consistent validation, good user experience, and reduced unnecessary traffic
 * to Firebase Storage.
 */

/**
 * Maximum allowed image size in megabytes.
 *
 * Chosen to balance image quality with upload performance and storage costs.
 */
export const MAX_FILE_SIZE_MB = 5;

/**
 * Maximum allowed image size in bytes.
 *
 * Derived from MAX_FILE_SIZE_MB to align with the File API,
 * which reports file sizes in bytes.
 */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Permitted MIME types for image uploads.
 *
 * Covers common web formats and modern mobile formats.
 * Both "image/jpeg" and "image/jpg" are included for compatibility,
 * although "image/jpeg" is the official MIME type.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "image/heif"
];

/**
 * Standardized result returned by validation functions.
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an image file against upload constraints.
 *
 * This function performs lightweight client-side checks to provide immediate
 * feedback and prevent unnecessary upload attempts.
 *
 * Validation rules:
 * - a file must be provided
 * - the MIME type must be allowed
 * - the file size must not exceed the configured limit
 *
 * @param file File selected via the File API
 */
export const validateImageFile = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: "No file provided." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Please upload JPG, PNG, or WebP."
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size too large. Max size is ${MAX_FILE_SIZE_MB}MB.`
    };
  }

  return { isValid: true };
};
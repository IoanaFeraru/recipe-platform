export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "image/heif"
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an image file for size and format.
 * @param file The file to validate
 * @returns { isValid: boolean, error?: string }
 */
export const validateImageFile = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: "No file provided." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Please upload JPG, PNG, or WebP.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size too large. Max size is ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  return { isValid: true };
};
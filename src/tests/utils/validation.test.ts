import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  validateEmail,
  getPasswordStrength,
  validatePassword,
  validatePasswordMatch,
  isValidUrl,
  validateUrl,
  validateRequiredText,
  validateTextLength,
  isPositiveNumber,
  isNonNegativeNumber,
  validatePositiveNumber,
  validateNumberRange,
  validateServings,
  validateIngredientName,
  validateStepText,
  validateRecipeTitle,
  validateRecipeDescription,
  validateRating,
  validatePrepTime,
  validateTag,
  validateTags,
  validateNonEmptyArray,
  validateComment,
  validateImageFile,
  validateMultiple,
  sanitizeText,
  sanitizeEmail,
  sanitizeTags,
  createFormValidation,
} from '@/lib/utils/validation';

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should pass for valid email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail for empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should fail for invalid format', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });
  });
});

describe('Password Validation', () => {
  describe('getPasswordStrength', () => {
    it('should rate weak passwords', () => {
      const result = getPasswordStrength('abc');
      expect(result.level).toBe('weak');
    });

    it('should rate medium passwords', () => {
      const result = getPasswordStrength('password123');
      expect(result.level).toBe('medium');
    });

    it('should rate strong passwords', () => {
      const result = getPasswordStrength('Pass123!@#');
      expect(result.level).toBe('strong');
      expect(result.score).toBeGreaterThan(2);
    });
  });

  describe('validatePassword', () => {
    it('should pass for valid password', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
    });

    it('should fail for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('should fail for short password', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });

    it('should fail for too long password', () => {
      const result = validatePassword('a'.repeat(130));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('less than 128');
    });
  });

  describe('validatePasswordMatch', () => {
    it('should pass for matching passwords', () => {
      const result = validatePasswordMatch('password', 'password');
      expect(result.isValid).toBe(true);
    });

    it('should fail for non-matching passwords', () => {
      const result = validatePasswordMatch('password', 'different');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords do not match');
    });
  });
});

describe('URL Validation', () => {
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://invalid')).toBe(true); // Actually valid
    });
  });
});

describe('Text Validation', () => {
  describe('validateRequiredText', () => {
    it('should pass for non-empty text', () => {
      const result = validateRequiredText('Hello');
      expect(result.isValid).toBe(true);
    });

    it('should fail for empty text', () => {
      const result = validateRequiredText('', 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name is required');
    });

    it('should fail for whitespace only', () => {
      const result = validateRequiredText('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateTextLength', () => {
    it('should pass for valid length', () => {
      const result = validateTextLength('Hello', 3, 10);
      expect(result.isValid).toBe(true);
    });

    it('should fail for too short', () => {
      const result = validateTextLength('Hi', 3, 10, 'Message');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3');
    });

    it('should fail for too long', () => {
      const result = validateTextLength('Hello World', 3, 5, 'Message');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('less than 5');
    });
  });
});

describe('Number Validation', () => {
  describe('isPositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(isPositiveNumber(5)).toBe(true);
      expect(isPositiveNumber('10')).toBe(true);
    });

    it('should reject zero and negative', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-5)).toBe(false);
    });

    it('should reject non-numbers', () => {
      expect(isPositiveNumber('abc')).toBe(false);
    });
  });

  describe('isNonNegativeNumber', () => {
    it('should validate non-negative numbers', () => {
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(5)).toBe(true);
    });

    it('should reject negative', () => {
      expect(isNonNegativeNumber(-5)).toBe(false);
    });
  });

  describe('validateNumberRange', () => {
    it('should pass for number in range', () => {
      const result = validateNumberRange(5, 1, 10);
      expect(result.isValid).toBe(true);
    });

    it('should fail for number below range', () => {
      const result = validateNumberRange(0, 1, 10);
      expect(result.isValid).toBe(false);
    });

    it('should fail for number above range', () => {
      const result = validateNumberRange(15, 1, 10);
      expect(result.isValid).toBe(false);
    });

    it('should fail for non-number', () => {
      const result = validateNumberRange('abc', 1, 10);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Recipe Validation', () => {
  describe('validateServings', () => {
    it('should pass for valid servings', () => {
      expect(validateServings(4).isValid).toBe(true);
      expect(validateServings(50).isValid).toBe(true);
    });

    it('should fail for less than 1', () => {
      const result = validateServings(0);
      expect(result.isValid).toBe(false);
    });

    it('should fail for more than 100', () => {
      const result = validateServings(101);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateRecipeTitle', () => {
    it('should pass for valid title', () => {
      const result = validateRecipeTitle('Chocolate Cake');
      expect(result.isValid).toBe(true);
    });

    it('should fail for too short', () => {
      const result = validateRecipeTitle('Ab');
      expect(result.isValid).toBe(false);
    });

    it('should fail for too long', () => {
      const result = validateRecipeTitle('a'.repeat(101));
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateStepText', () => {
    it('should pass for valid step', () => {
      const result = validateStepText('Mix all ingredients together');
      expect(result.isValid).toBe(true);
    });

    it('should fail for too short', () => {
      const result = validateStepText('Mix it');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateRating', () => {
    it('should pass for valid rating', () => {
      expect(validateRating(3).isValid).toBe(true);
      expect(validateRating(5).isValid).toBe(true);
    });

    it('should fail for out of range', () => {
      expect(validateRating(0).isValid).toBe(false);
      expect(validateRating(6).isValid).toBe(false);
    });
  });

  describe('validatePrepTime', () => {
    it('should pass for valid times', () => {
      const result = validatePrepTime(10, 30);
      expect(result.isValid).toBe(true);
    });

    it('should fail for negative times', () => {
      const result = validatePrepTime(-5, 30);
      expect(result.isValid).toBe(false);
    });

    it('should fail when min > max', () => {
      const result = validatePrepTime(30, 10);
      expect(result.isValid).toBe(false);
    });

    it('should fail when max is 0', () => {
      const result = validatePrepTime(0, 0);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Tag Validation', () => {
  describe('validateTag', () => {
    it('should pass for valid tag', () => {
      expect(validateTag('dessert').isValid).toBe(true);
      expect(validateTag('gluten-free').isValid).toBe(true);
    });

    it('should fail for empty tag', () => {
      const result = validateTag('');
      expect(result.isValid).toBe(false);
    });

    it('should fail for too long tag', () => {
      const result = validateTag('a'.repeat(31));
      expect(result.isValid).toBe(false);
    });

    it('should fail for invalid characters', () => {
      const result = validateTag('tag@#$');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateTags', () => {
    it('should pass for valid tags', () => {
      const result = validateTags(['dessert', 'chocolate']);
      expect(result.isValid).toBe(true);
    });

    it('should pass for empty array', () => {
      const result = validateTags([]);
      expect(result.isValid).toBe(true);
    });

    it('should fail for too many tags', () => {
      const result = validateTags(Array(11).fill('tag'));
      expect(result.isValid).toBe(false);
    });

    it('should fail for invalid tag', () => {
      const result = validateTags(['valid', 'invalid@tag']);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Array Validation', () => {
  describe('validateNonEmptyArray', () => {
    it('should pass for non-empty array', () => {
      const result = validateNonEmptyArray([1, 2, 3]);
      expect(result.isValid).toBe(true);
    });

    it('should fail for empty array', () => {
      const result = validateNonEmptyArray([]);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Comment Validation', () => {
  it('should pass for valid comment', () => {
    const result = validateComment('Great recipe!', 5);
    expect(result.isValid).toBe(true);
  });

  it('should fail for empty comment', () => {
    const result = validateComment('');
    expect(result.isValid).toBe(false);
  });

  it('should fail for invalid rating', () => {
    const result = validateComment('Great recipe!', 6);
    expect(result.isValid).toBe(false);
  });
});

describe('File Validation', () => {
  it('should pass for valid image', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.isValid).toBe(true);
  });

  it('should fail for invalid type', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
  });

  it('should fail for too large file', () => {
    const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
  });
});

describe('Sanitization', () => {
  describe('sanitizeText', () => {
    it('should trim and collapse whitespace', () => {
      expect(sanitizeText('  hello   world  ')).toBe('hello world');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim', () => {
      expect(sanitizeEmail('  Test@EXAMPLE.com  ')).toBe('test@example.com');
    });
  });

  describe('sanitizeTags', () => {
    it('should parse and sanitize tags', () => {
      expect(sanitizeTags('  dessert  ,  baking  , ')).toEqual(['dessert', 'baking']);
    });
  });
});

describe('Batch Validation', () => {
  describe('validateMultiple', () => {
    it('should pass when all valid', () => {
      const result = validateMultiple([
        { isValid: true },
        { isValid: true },
      ]);
      expect(result.isValid).toBe(true);
    });

    it('should fail when any invalid', () => {
      const result = validateMultiple([
        { isValid: true },
        { isValid: false, error: 'Error 1' },
        { isValid: false, error: 'Error 2' },
      ]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Error 1');
      expect(result.error).toContain('Error 2');
    });
  });

  describe('createFormValidation', () => {
    it('should create valid form validation', () => {
      const result = createFormValidation({
        email: { isValid: true },
        password: { isValid: true },
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should create invalid form validation', () => {
      const result = createFormValidation({
        email: { isValid: false, error: 'Invalid email' },
        password: { isValid: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email');
    });
  });
});

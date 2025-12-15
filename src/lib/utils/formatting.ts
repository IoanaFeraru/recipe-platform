/**
 * Pure utility functions for formatting
 * Following functional programming principles
 */

/**
 * Format minutes into human-readable time
 * @param minutes - Total minutes
 * @returns Formatted string (e.g., "2h 30m", "45m")
 */
export const formatTime = (minutes: number): string => {
  if (minutes === 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
};

/**
 * Convert decimal number to fraction representation
 * @param num - Decimal number
 * @returns Fraction string (e.g., "1/2", "1 1/3")
 */
export const numberToFraction = (num: number): string => {
  if (num % 1 === 0) return num.toString();

  const wholePart = Math.floor(num);
  const fractionalPart = num - wholePart;
  const tolerance = 0.01;

  const commonFractions = [
    { value: 0.5, fraction: "1/2" },
    { value: 1 / 3, fraction: "1/3" },
    { value: 2 / 3, fraction: "2/3" },
    { value: 0.25, fraction: "1/4" },
    { value: 0.75, fraction: "3/4" },
    { value: 0.2, fraction: "1/5" },
    { value: 0.4, fraction: "2/5" },
    { value: 0.6, fraction: "3/5" },
    { value: 0.8, fraction: "4/5" },
    { value: 1 / 6, fraction: "1/6" },
    { value: 5 / 6, fraction: "5/6" },
    { value: 0.125, fraction: "1/8" },
    { value: 0.375, fraction: "3/8" },
    { value: 0.625, fraction: "5/8" },
    { value: 0.875, fraction: "7/8" },
  ];

  for (const { value, fraction } of commonFractions) {
    if (Math.abs(fractionalPart - value) < tolerance) {
      return wholePart === 0 ? fraction : `${wholePart} ${fraction}`;
    }
  }

  return num.toFixed(2).replace(/\.?0+$/, "");
};

/**
 * Calculate scaled quantity for different servings
 * @param baseQuantity - Original quantity
 * @param baseServings - Original servings
 * @param targetServings - Target servings
 * @returns Scaled quantity
 */
export const calculateScaledQuantity = (
  baseQuantity: number | undefined,
  baseServings: number,
  targetServings: number
): number | undefined => {
  if (baseQuantity === undefined || baseServings === 0) {
    return undefined;
  }

  const safeTargetServings = targetServings > 0 ? targetServings : baseServings;
  return (baseQuantity / baseServings) * safeTargetServings;
};

/**
 * Format date relative to now
 * @param date - Date to format
 * @returns Relative date string (e.g., "Today", "Yesterday", "3 days ago")
 */
export const formatRelativeDate = (date: Date | any): string => {
  const d = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return d.toLocaleDateString();
};

/**
 * Format absolute date
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | any): string => {
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString();
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

/**
 * Pluralize word based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string
 */
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  return count === 1 ? singular : plural || `${singular}s`;
};

/**
 * Format count with pluralization
 * @param count - Number to format
 * @param singular - Singular form
 * @param plural - Plural form (optional)
 * @returns Formatted string (e.g., "1 recipe", "5 recipes")
 */
export const formatCount = (
  count: number,
  singular: string,
  plural?: string
): string => {
  return `${count} ${pluralize(count, singular, plural)}`;
};

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format array as comma-separated list
 * @param items - Array of strings
 * @param max - Maximum items to show
 * @returns Formatted string
 */
export const formatList = (items: string[], max?: number): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  const displayItems = max ? items.slice(0, max) : items;
  const remaining = items.length - displayItems.length;

  const list = displayItems.join(", ");
  return remaining > 0 ? `${list} +${remaining} more` : list;
};

/**
 * Parse tags from comma-separated string
 * @param tagsString - Comma-separated tags
 * @returns Array of trimmed tags
 */
export const parseTags = (tagsString: string): string[] => {
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
};

/**
 * Format rating to one decimal place
 * @param rating - Rating number
 * @returns Formatted rating string
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};
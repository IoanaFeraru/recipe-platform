/**
 * Pure formatting utilities.
 *
 * This module contains deterministic, side-effect-free helpers used to convert
 * raw data into human-readable strings for UI rendering. All functions are pure
 * and safe to reuse across components.
 */

/* ======================================================
 * TIME
 * ====================================================== */

/**
 * Formats a duration in minutes using compact hour/minute notation.
 */
export const formatTime = (minutes: number): string => {
  if (minutes === 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
};

/* ======================================================
 * NUMBERS & FRACTIONS
 * ====================================================== */

/**
 * Converts a decimal number into a common culinary fraction when possible.
 * Falls back to a trimmed decimal representation if no match is found.
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
    { value: 0.875, fraction: "7/8" }
  ];

  for (const { value, fraction } of commonFractions) {
    if (Math.abs(fractionalPart - value) < tolerance) {
      return wholePart === 0 ? fraction : `${wholePart} ${fraction}`;
    }
  }

  return num.toFixed(2).replace(/\.?0+$/, "");
};

/**
 * Scales an ingredient quantity based on servings.
 */
export const calculateScaledQuantity = (
  baseQuantity: number | undefined,
  baseServings: number,
  targetServings: number
): number | undefined => {
  if (baseQuantity === undefined || baseServings === 0) {
    return undefined;
  }

  const safeTarget = targetServings > 0 ? targetServings : baseServings;
  return (baseQuantity / baseServings) * safeTarget;
};

/* ======================================================
 * DATES
 * ====================================================== */

/**
 * Formats a date as a relative, human-friendly string.
 */
export const formatRelativeDate = (date: Date | { toDate(): Date }): string => {
  const d = 'toDate' in date ? date.toDate() : date;
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
 * Formats a date as a locale-aware absolute date string.
 */
export const formatDate = (date: Date | { toDate(): Date }): string => {
  const d = 'toDate' in date ? date.toDate() : date;
  return d.toLocaleDateString();
};

/* ======================================================
 * TEXT
 * ====================================================== */

/**
 * Truncates text and appends an ellipsis if it exceeds the limit.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

/**
 * Capitalizes the first character of a string.
 */
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/* ======================================================
 * PLURALIZATION & COUNTS
 * ====================================================== */

/**
 * Returns the correct singular or plural form for a given count.
 */
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  return count === 1 ? singular : plural || `${singular}s`;
};

/**
 * Formats a numeric count with proper pluralization.
 */
export const formatCount = (
  count: number,
  singular: string,
  plural?: string
): string => {
  return `${count} ${pluralize(count, singular, plural)}`;
};

/* ======================================================
 * LISTS & TAGS
 * ====================================================== */

/**
 * Formats an array of strings as a comma-separated list,
 * optionally truncated with a "+X more" suffix.
 */
export const formatList = (items: string[], max?: number): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  const visible = max ? items.slice(0, max) : items;
  const remaining = items.length - visible.length;

  const list = visible.join(", ");
  return remaining > 0 ? `${list} +${remaining} more` : list;
};

/**
 * Parses a comma-separated tag string into a clean array.
 */
export const parseTags = (tagsString: string): string[] => {
  return tagsString
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);
};

/* ======================================================
 * RATINGS
 * ====================================================== */

/**
 * Formats a numeric rating to a single decimal place.
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};
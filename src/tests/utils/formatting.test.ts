import { describe, it, expect } from 'vitest';
import {
  formatTime,
  numberToFraction,
  calculateScaledQuantity,
  formatRelativeDate,
  formatDate,
  truncateText,
  pluralize,
  formatCount,
  capitalize,
  formatList,
  parseTags,
  formatRating,
} from '@/lib/utils/formatting';

describe('formatTime', () => {
  it('should format hours and minutes', () => {
    expect(formatTime(150)).toBe('2h 30m');
  });

  it('should format only hours', () => {
    expect(formatTime(120)).toBe('2h');
  });

  it('should format only minutes', () => {
    expect(formatTime(45)).toBe('45m');
  });

  it('should handle zero', () => {
    expect(formatTime(0)).toBe('0m');
  });

  it('should handle 1 minute', () => {
    expect(formatTime(1)).toBe('1m');
  });
});

describe('numberToFraction', () => {
  it('should return whole numbers as string', () => {
    expect(numberToFraction(2)).toBe('2');
    expect(numberToFraction(10)).toBe('10');
  });

  it('should convert 0.5 to 1/2', () => {
    expect(numberToFraction(0.5)).toBe('1/2');
  });

  it('should convert 0.25 to 1/4', () => {
    expect(numberToFraction(0.25)).toBe('1/4');
  });

  it('should convert 0.75 to 3/4', () => {
    expect(numberToFraction(0.75)).toBe('3/4');
  });

  it('should convert 0.33 to 1/3', () => {
    expect(numberToFraction(1 / 3)).toBe('1/3');
  });

  it('should handle mixed numbers', () => {
    expect(numberToFraction(2.5)).toBe('2 1/2');
    expect(numberToFraction(1.25)).toBe('1 1/4');
  });

  it('should return decimal for non-common fractions', () => {
    const result = numberToFraction(2.37);
    expect(result).toBe('2 3/8');
  });
});

describe('calculateScaledQuantity', () => {
  it('should scale up correctly', () => {
    expect(calculateScaledQuantity(2, 4, 8)).toBe(4);
  });

  it('should scale down correctly', () => {
    expect(calculateScaledQuantity(4, 8, 4)).toBe(2);
  });

  it('should handle same servings', () => {
    expect(calculateScaledQuantity(2, 4, 4)).toBe(2);
  });

  it('should return undefined for undefined quantity', () => {
    expect(calculateScaledQuantity(undefined, 4, 8)).toBeUndefined();
  });

  it('should handle zero base servings', () => {
    expect(calculateScaledQuantity(2, 0, 4)).toBeUndefined();
  });

  it('should handle fractional results', () => {
    expect(calculateScaledQuantity(3, 4, 6)).toBe(4.5);
  });
});

describe('formatRelativeDate', () => {
  it('should format today', () => {
    const today = new Date();
    expect(formatRelativeDate(today)).toBe('Today');
  });

  it('should format yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('should format days ago', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
  });

  it('should format weeks ago', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(formatRelativeDate(twoWeeksAgo)).toBe('2 weeks ago');
  });

  it('should format months ago', () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
    expect(formatRelativeDate(twoMonthsAgo)).toBe('2 months ago');
  });

  it('should format absolute date for old dates', () => {
    const oldDate = new Date('2020-01-01');
    const result = formatRelativeDate(oldDate);
    expect(result).toContain('2020');
  });
});

describe('truncateText', () => {
  it('should not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('should truncate long text', () => {
    expect(truncateText('Hello World, this is a test', 10)).toBe('Hello Worl...');
  });

  it('should handle exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('should trim before adding ellipsis', () => {
    expect(truncateText('Hello     World', 7)).toBe('Hello...');
  });
});

describe('pluralize', () => {
  it('should return singular for 1', () => {
    expect(pluralize(1, 'recipe')).toBe('recipe');
  });

  it('should return plural for 0', () => {
    expect(pluralize(0, 'recipe')).toBe('recipes');
  });

  it('should return plural for 2+', () => {
    expect(pluralize(5, 'recipe')).toBe('recipes');
  });

  it('should use custom plural', () => {
    expect(pluralize(2, 'person', 'people')).toBe('people');
  });

  it('should add s for default plural', () => {
    expect(pluralize(3, 'item')).toBe('items');
  });
});

describe('formatCount', () => {
  it('should format count with singular', () => {
    expect(formatCount(1, 'recipe')).toBe('1 recipe');
  });

  it('should format count with plural', () => {
    expect(formatCount(5, 'recipe')).toBe('5 recipes');
  });

  it('should use custom plural', () => {
    expect(formatCount(3, 'person', 'people')).toBe('3 people');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('formatList', () => {
  it('should return empty string for empty array', () => {
    expect(formatList([])).toBe('');
  });

  it('should return single item', () => {
    expect(formatList(['apple'])).toBe('apple');
  });

  it('should format two items', () => {
    expect(formatList(['apple', 'banana'])).toBe('apple, banana');
  });

  it('should format multiple items', () => {
    expect(formatList(['apple', 'banana', 'orange'])).toBe('apple, banana, orange');
  });

  it('should limit items with max', () => {
    expect(formatList(['a', 'b', 'c', 'd', 'e'], 3)).toBe('a, b, c +2 more');
  });

  it('should not add more text if within max', () => {
    expect(formatList(['a', 'b', 'c'], 5)).toBe('a, b, c');
  });
});

describe('parseTags', () => {
  it('should parse comma-separated tags', () => {
    expect(parseTags('dessert, baking, chocolate')).toEqual(['dessert', 'baking', 'chocolate']);
  });

  it('should trim whitespace', () => {
    expect(parseTags('  dessert  ,  baking  ')).toEqual(['dessert', 'baking']);
  });

  it('should filter empty tags', () => {
    expect(parseTags('dessert,,baking,')).toEqual(['dessert', 'baking']);
  });

  it('should handle empty string', () => {
    expect(parseTags('')).toEqual([]);
  });

  it('should handle single tag', () => {
    expect(parseTags('dessert')).toEqual(['dessert']);
  });
});

describe('formatRating', () => {
  it('should format to one decimal place', () => {
    expect(formatRating(4.5)).toBe('4.5');
  });

  it('should add decimal for whole numbers', () => {
    expect(formatRating(5)).toBe('5.0');
  });

  it('should round to one decimal', () => {
    expect(formatRating(4.567)).toBe('4.6');
  });
});

/**
 * XIV Dye Tools v2.0.0 - Shared Utilities
 *
 * Phase 12: Architecture Refactor
 * Reusable utility functions across the application
 *
 * @module shared/utils
 */

/**
 * Generate a simple checksum for data integrity checking
 * Uses a simple hash function (not cryptographically secure, but sufficient for cache validation)
 */
export function generateChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

import {
  RGB_MIN,
  RGB_MAX,
  HUE_MIN,
  HUE_MAX,
  SATURATION_MIN,
  SATURATION_MAX,
  VALUE_MIN,
  VALUE_MAX,
  PATTERNS,
} from './constants';

// ============================================================================
// Math Utilities
// ============================================================================

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Round a number to a specific decimal place
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate the distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a number is even
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * Check if a number is odd
 */
export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format a number with proper thousand separators
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length - 3) + '...' : text;
}

/**
 * Repeat a string n times
 */
export function repeatString(text: string, times: number): string {
  return text.repeat(Math.max(0, times));
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Get unique values from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by a key function
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

/**
 * Sort array by property
 */
export function sortByProperty<T>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter array items, removing nulls
 */
export function filterNulls<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * Flatten a nested array
 */
export function flatten<T>(array: Array<T | T[]>): T[] {
  return array.reduce((acc: T[], item: T | T[]) => {
    if (Array.isArray(item)) {
      acc.push(...item);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

/**
 * Chunk an array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Find differences between two arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((item) => !array2.includes(item));
}

/**
 * Find intersection of two arrays
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((item) => array2.includes(item));
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Merge two objects recursively
 */
export function mergeObjects<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target } as Record<string, unknown>;
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
        result[key] = mergeObjects(
          (result[key] as Record<string, unknown>) || {},
          sourceValue as Partial<Record<string, unknown>>
        );
      } else {
        result[key] = sourceValue;
      }
    }
  }
  return result as T;
}

/**
 * Pick specific properties from an object
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

/**
 * Omit specific properties from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Create an HTML element with optional attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    className?: string;
    id?: string;
    innerHTML?: string;
    textContent?: string;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (options?.className) element.className = options.className;
  if (options?.id) element.id = options.id;
  if (options?.innerHTML) element.innerHTML = options.innerHTML;
  if (options?.textContent) element.textContent = options.textContent;
  return element;
}

/**
 * Query select a single element
 */
export function querySelector<T extends Element>(
  selector: string,
  parent?: Document | Element
): T | null {
  return (parent || document).querySelector(selector) as T | null;
}

/**
 * Query select all elements
 */
export function querySelectorAll<T extends Element>(
  selector: string,
  parent?: Document | Element
): T[] {
  return Array.from((parent || document).querySelectorAll(selector)) as T[];
}

/**
 * Add a class to an element
 */
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

/**
 * Remove a class from an element
 */
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

/**
 * Toggle a class on an element
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): void {
  element.classList.toggle(className, force);
}

/**
 * Check if an element has a class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate a hexadecimal color string
 */
export function isValidHexColor(hex: string): boolean {
  return PATTERNS.HEX_COLOR.test(hex);
}

/**
 * Validate RGB values
 */
export function isValidRGB(r: number, g: number, b: number): boolean {
  return (
    r >= RGB_MIN && r <= RGB_MAX && g >= RGB_MIN && g <= RGB_MAX && b >= RGB_MIN && b <= RGB_MAX
  );
}

/**
 * Validate HSV values
 */
export function isValidHSV(h: number, s: number, v: number): boolean {
  return (
    h >= HUE_MIN &&
    h <= HUE_MAX &&
    s >= SATURATION_MIN &&
    s <= SATURATION_MAX &&
    v >= VALUE_MIN &&
    v <= VALUE_MAX
  );
}

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  return PATTERNS.EMAIL.test(email);
}

/**
 * Validate a URL
 */
export function isValidURL(url: string): boolean {
  return PATTERNS.URL.test(url);
}

// ============================================================================
// Debounce and Throttle
// ============================================================================

/**
 * Debounce a function to delay its execution
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle a function to limit its execution frequency
 */
export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn(...args);
      lastCall = now;
    }
  };
}

// ============================================================================
// Promise Utilities
// ============================================================================

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function n times with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxAttempts - 1) {
        await sleep(delayMs * Math.pow(2, i)); // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Race between a promise and a timeout
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

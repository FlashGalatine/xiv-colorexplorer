/**
 * @xivdyetools/core - Shared Utilities
 *
 * Reusable utility functions (environment-agnostic)
 *
 * @module utils
 */

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
} from '../constants/index.js';

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

// ============================================================================
// Async Utilities
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

// ============================================================================
// Data Integrity Utilities
// ============================================================================

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

/**
 * XIV Dye Tools v2.0.0 - Storage Service
 *
 * Phase 12: Architecture Refactor
 * Safe localStorage wrapper with defensive checks
 *
 * @module services/storage-service
 */

import { ErrorCode, AppError } from '@shared/types';
import { STORAGE_PREFIX } from '@shared/constants';

// ============================================================================
// Storage Service Class
// ============================================================================

/**
 * Safe localStorage wrapper with error handling and quota management
 */
export class StorageService {
  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = `${STORAGE_PREFIX}_test`;
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get an item from localStorage with type safety
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      if (!this.isAvailable()) {
        return defaultValue || null;
      }

      const item = localStorage.getItem(key);

      if (item === null) {
        return defaultValue || null;
      }

      // Try to parse as JSON if it looks like JSON
      if (item.startsWith('{') || item.startsWith('[')) {
        try {
          return JSON.parse(item) as T;
        } catch {
          // If JSON parsing fails, return as string
          return item as T;
        }
      }

      return item as T;
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error);
      return defaultValue || null;
    }
  }

  /**
   * Set an item in localStorage with error handling
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      if (!this.isAvailable()) {
        console.warn('localStorage is not available');
        return false;
      }

      const serialized = typeof value === 'string' ? value : JSON.stringify(value);

      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          throw new AppError(
            ErrorCode.STORAGE_QUOTA_EXCEEDED,
            'Storage quota exceeded. Please clear some data.',
            'error'
          );
        }
      }

      console.error(`Failed to set item in localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      if (!this.isAvailable()) {
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): boolean {
    try {
      if (!this.isAvailable()) {
        return false;
      }

      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
      return false;
    }
  }

  /**
   * Get all storage keys
   */
  static getKeys(): string[] {
    try {
      if (!this.isAvailable()) {
        return [];
      }

      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.warn('Failed to get storage keys', error);
      return [];
    }
  }

  /**
   * Get all items with a specific prefix
   */
  static getItemsByPrefix<T = unknown>(prefix: string): Record<string, T> {
    const result: Record<string, T> = {};

    try {
      if (!this.isAvailable()) {
        return result;
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              result[key] = JSON.parse(value) as T;
            } catch {
              result[key] = value as T;
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to get items by prefix: ${prefix}`, error);
    }

    return result;
  }

  /**
   * Check if a key exists in localStorage
   */
  static hasItem(key: string): boolean {
    try {
      if (!this.isAvailable()) {
        return false;
      }

      return localStorage.getItem(key) !== null;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get the size of localStorage in bytes
   */
  static getSize(): number {
    let size = 0;

    try {
      if (!this.isAvailable()) {
        return 0;
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            size += key.length + value.length;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to calculate storage size', error);
    }

    return size;
  }

  /**
   * Get the number of items stored
   */
  static getItemCount(): number {
    try {
      if (!this.isAvailable()) {
        return 0;
      }

      return localStorage.length;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Remove all items with a specific prefix
   */
  static removeByPrefix(prefix: string): number {
    let removed = 0;

    try {
      if (!this.isAvailable()) {
        return 0;
      }

      const keys = this.getKeys();
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
          removed++;
        }
      }
    } catch (error) {
      console.warn(`Failed to remove items by prefix: ${prefix}`, error);
    }

    return removed;
  }

  /**
   * Store data with TTL (time to live)
   */
  static setItemWithTTL<T>(key: string, value: T, ttlMs: number): boolean {
    try {
      const data = {
        value,
        expiresAt: Date.now() + ttlMs,
      };

      return this.setItem(key, data);
    } catch (error) {
      console.error(`Failed to set item with TTL: ${key}`, error);
      return false;
    }
  }

  /**
   * Get data with TTL, returns null if expired
   */
  static getItemWithTTL<T>(key: string, defaultValue?: T): T | null {
    try {
      const data = this.getItem<{ value: T; expiresAt: number }>(key);

      if (!data) {
        return defaultValue || null;
      }

      if (data.expiresAt && Date.now() > data.expiresAt) {
        this.removeItem(key);
        return defaultValue || null;
      }

      return data.value || defaultValue || null;
    } catch (error) {
      console.warn(`Failed to get item with TTL: ${key}`, error);
      return defaultValue || null;
    }
  }

  /**
   * Create a namespaced storage instance
   */
  static createNamespace(prefix: string): NamespacedStorage {
    return new NamespacedStorage(prefix);
  }
}

// ============================================================================
// Namespaced Storage Class
// ============================================================================

/**
 * Storage instance with automatic key prefixing
 */
export class NamespacedStorage {
  constructor(private prefix: string) {}

  private getFullKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  getItem<T>(key: string, defaultValue?: T): T | null {
    return StorageService.getItem(this.getFullKey(key), defaultValue);
  }

  setItem<T>(key: string, value: T): boolean {
    return StorageService.setItem(this.getFullKey(key), value);
  }

  removeItem(key: string): boolean {
    return StorageService.removeItem(this.getFullKey(key));
  }

  hasItem(key: string): boolean {
    return StorageService.hasItem(this.getFullKey(key));
  }

  clear(): boolean {
    const keysToRemove = StorageService.getKeys().filter((k) => k.startsWith(this.prefix));

    for (const key of keysToRemove) {
      StorageService.removeItem(key);
    }

    return true;
  }

  getAll<T = unknown>(): Record<string, T> {
    return StorageService.getItemsByPrefix(this.prefix);
  }

  setItemWithTTL<T>(key: string, value: T, ttlMs: number): boolean {
    return StorageService.setItemWithTTL(this.getFullKey(key), value, ttlMs);
  }

  getItemWithTTL<T>(key: string, defaultValue?: T): T | null {
    return StorageService.getItemWithTTL(this.getFullKey(key), defaultValue);
  }
}

/**
 * Convenience export of app storage namespace
 */
export const appStorage = StorageService.createNamespace('xivdyetools');

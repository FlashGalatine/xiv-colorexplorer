/**
 * API Service Singleton Wrapper
 * Wraps xivdyetools-core APIService with singleton pattern and localStorage cache
 */

import {
  APIService as CoreAPIService,
  type ICacheBackend,
  type PriceData,
  type CachedData
} from 'xivdyetools-core';
import { logger } from '@shared/logger';

/**
 * LocalStorage Cache Backend for browser environment
 * Exported for testing purposes
 */
export class LocalStorageCacheBackend implements ICacheBackend {
  private keyPrefix = 'xivdyetools_api_';

  get(key: string): CachedData<PriceData> | null {
    try {
      const data = localStorage.getItem(this.keyPrefix + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  set(key: string, value: CachedData<PriceData>): void {
    try {
      localStorage.setItem(this.keyPrefix + key, JSON.stringify(value));
    } catch (error) {
      logger.warn('Failed to cache price data:', error);
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.keyPrefix + key);
    } catch {
      // Ignore errors
    }
  }

  clear(): void {
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.keyPrefix)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore errors
    }
  }

  keys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.keyPrefix)) {
          keys.push(key.substring(this.keyPrefix.length));
        }
      }
      return keys;
    } catch {
      return [];
    }
  }
}

/**
 * Web app singleton wrapper for APIService
 * Maintains backward compatibility with existing code using getInstance()
 */
export class APIService {
  private static instance: CoreAPIService | null = null;

  /**
   * Get singleton instance of APIService
   */
  static getInstance(): CoreAPIService {
    if (!APIService.instance) {
      const cacheBackend = new LocalStorageCacheBackend();
      APIService.instance = new CoreAPIService(cacheBackend);
      logger.info('✅ APIService initialized from xivdyetools-core with localStorage cache');
    }
    return APIService.instance;
  }

  /**
   * Reset singleton (for testing)
   */
  static resetInstance(): void {
    APIService.instance = null;
  }

  /**
   * Format price with commas and G suffix
   * Delegates to core APIService
   */
  static formatPrice(price: number): string {
    return CoreAPIService.formatPrice(price);
  }

  /**
   * Clear all cached price data
   */
  static async clearCache(): Promise<void> {
    return APIService.getInstance().clearCache();
  }

  /**
   * Get price data for a specific item
   */
  static async getPriceData(
    itemID: number,
    worldID?: number,
    dataCenterID?: string
  ): Promise<PriceData | null> {
    return APIService.getInstance().getPriceData(itemID, worldID, dataCenterID);
  }
}

// Export singleton instance for direct use
export const apiService = APIService.getInstance();

// Re-export types
export type { PriceData };

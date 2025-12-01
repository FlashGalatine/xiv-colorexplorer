/**
 * API Service Singleton Wrapper
 * Wraps xivdyetools-core APIService with IndexedDB cache (F4)
 */

import {
  APIService as CoreAPIService,
  type ICacheBackend,
  type PriceData,
  type CachedData,
} from 'xivdyetools-core';
import { indexedDBService, STORES } from './indexeddb-service';
import { logger } from '@shared/logger';

/**
 * IndexedDB Cache Backend for browser environment (F4)
 * Uses IndexedDB for larger storage capacity and better performance
 * Falls back to memory-only if IndexedDB is unavailable
 */
export class IndexedDBCacheBackend implements ICacheBackend {
  private memoryCache: Map<string, CachedData<PriceData>> = new Map();
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the backend asynchronously
   */
  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const success = await indexedDBService.initialize();
      if (success) {
        await this.loadFromStorage();
      }
    })();

    return this.initPromise;
  }

  get(key: string): CachedData<PriceData> | null {
    // Return from memory cache for sync operation
    return this.memoryCache.get(key) ?? null;
  }

  set(key: string, value: CachedData<PriceData>): void {
    // Update memory cache immediately
    this.memoryCache.set(key, value);

    // Persist to IndexedDB asynchronously
    indexedDBService.set(STORES.PRICE_CACHE, key, value).catch((error) => {
      logger.warn('Failed to persist price data to IndexedDB:', error);
    });
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    indexedDBService.delete(STORES.PRICE_CACHE, key).catch((error) => {
      logger.warn('Failed to delete from IndexedDB:', error);
    });
  }

  clear(): void {
    this.memoryCache.clear();
    indexedDBService.clear(STORES.PRICE_CACHE).catch((error) => {
      logger.warn('Failed to clear IndexedDB cache:', error);
    });
  }

  keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * Load all cached data from IndexedDB into memory
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const keys = await indexedDBService.keys(STORES.PRICE_CACHE);
      for (const key of keys) {
        const data = await indexedDBService.get<CachedData<PriceData>>(STORES.PRICE_CACHE, key);
        if (data) {
          this.memoryCache.set(key, data);
        }
      }
      if (keys.length > 0) {
        logger.debug(`Loaded ${keys.length} price cache entries from IndexedDB`);
      }
    } catch (error) {
      logger.warn('Failed to load price cache from IndexedDB:', error);
    }
  }
}

/**
 * LocalStorage Cache Backend (fallback when IndexedDB unavailable)
 * @deprecated Use IndexedDBCacheBackend instead
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
      keysToDelete.forEach((key) => localStorage.removeItem(key));
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
  private static cacheBackend: IndexedDBCacheBackend | null = null;
  private static initialized: boolean = false;

  /**
   * Get singleton instance of APIService
   */
  static getInstance(): CoreAPIService {
    if (!APIService.instance) {
      // Use IndexedDB cache backend (F4)
      APIService.cacheBackend = new IndexedDBCacheBackend();
      APIService.instance = new CoreAPIService(APIService.cacheBackend);
      logger.info('✅ APIService initialized from xivdyetools-core with IndexedDB cache');

      // Initialize cache backend asynchronously (won't block)
      void APIService.cacheBackend.initialize().then(() => {
        APIService.initialized = true;
        logger.debug('IndexedDB cache backend initialized');
      });
    }
    return APIService.instance;
  }

  /**
   * Check if the cache backend is fully initialized
   */
  static isInitialized(): boolean {
    return APIService.initialized;
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

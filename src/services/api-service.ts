/**
 * XIV Dye Tools v2.0.0 - API Service
 *
 * Phase 12: Architecture Refactor
 * Universalis API integration with caching and debouncing
 *
 * @module services/api-service
 */

import type { PriceData, CachedData } from '@shared/types';
import { ErrorCode, AppError } from '@shared/types';
import {
  UNIVERSALIS_API_BASE,
  UNIVERSALIS_API_TIMEOUT,
  UNIVERSALIS_API_RETRY_COUNT,
  UNIVERSALIS_API_RETRY_DELAY,
  API_CACHE_TTL,
  API_RATE_LIMIT_DELAY,
} from '@shared/constants';
import { retry, sleep } from '@shared/utils';
import { appStorage } from './storage-service';

// ============================================================================
// API Service Class
// ============================================================================

/**
 * Service for Universalis API integration
 * Handles price data fetching with caching and debouncing
 */
export class APIService {
  private static instance: APIService | null = null;
  private cache: Map<string, CachedData<PriceData>> = new Map();
  private pendingRequests: Map<string, Promise<PriceData | null>> = new Map();
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;

  /**
   * Get or create singleton instance
   */
  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  /**
   * Private constructor for singleton
   */
  private constructor() {
    this.loadCacheFromStorage();
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const cached = appStorage.getItem<Record<string, CachedData<PriceData>>>('price_cache', {});

      if (cached && typeof cached === 'object') {
        for (const [key, value] of Object.entries(cached)) {
          // Check if cache entry has expired
          if (value && typeof value === 'object' && 'timestamp' in value && 'ttl' in value) {
            const cachedData = value as CachedData<PriceData>;
            if (Date.now() - cachedData.timestamp < cachedData.ttl) {
              this.cache.set(key, cachedData);
            }
          }
        }
      }

      console.info(`✅ Loaded ${this.cache.size} cached prices from storage`);
    } catch (error) {
      console.warn('Failed to load cache from storage', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const cacheObject: Record<string, CachedData<PriceData>> = {};

      for (const [key, value] of this.cache.entries()) {
        // Only save non-expired entries
        if (Date.now() - value.timestamp < value.ttl) {
          cacheObject[key] = value;
        }
      }

      appStorage.setItem('price_cache', cacheObject);
    } catch (error) {
      console.warn('Failed to save cache to storage', error);
    }
  }

  /**
   * Get price from cache if available and not expired
   */
  private getCachedPrice(cacheKey: string): PriceData | null {
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Set price in cache
   */
  private setCachedPrice(cacheKey: string, data: PriceData): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: API_CACHE_TTL,
    });

    this.saveCacheToStorage();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    appStorage.setItem('price_cache', {});
    console.info('✅ Price cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; memoryEstimate: string } {
    let bytes = 0;
    for (const value of this.cache.values()) {
      bytes += JSON.stringify(value).length;
    }

    const mb = (bytes / 1024 / 1024).toFixed(2);
    return { size: this.cache.size, memoryEstimate: `${mb} MB` };
  }

  // ============================================================================
  // API Calls
  // ============================================================================

  /**
   * Fetch price data for a dye from Universalis API
   * Implements caching, debouncing, and retry logic
   */
  async getPriceData(
    itemID: number,
    worldID?: number,
    dataCenterID?: string
  ): Promise<PriceData | null> {
    try {
      // Build cache key
      const cacheKey = this.buildCacheKey(itemID, worldID, dataCenterID);

      // Check cache first
      const cached = this.getCachedPrice(cacheKey);
      if (cached) {
        console.info(`📦 Price cache hit for item ${itemID}`);
        return cached;
      }

      // Check if request is already pending (deduplication)
      if (this.pendingRequests.has(cacheKey)) {
        console.info(`⏳ Using pending request for item ${itemID}`);
        return await this.pendingRequests.get(cacheKey)!;
      }

      // Create pending request
      const promise = this.fetchPriceData(itemID, worldID, dataCenterID).then(
        (data) => {
          this.pendingRequests.delete(cacheKey);
          if (data) {
            this.setCachedPrice(cacheKey, data);
          }
          return data;
        },
        (error) => {
          this.pendingRequests.delete(cacheKey);
          throw error;
        }
      );

      this.pendingRequests.set(cacheKey, promise);
      return await promise;
    } catch (error) {
      console.error('Failed to fetch price data:', error);
      return null;
    }
  }

  /**
   * Internal method to fetch price data from API
   */
  private async fetchPriceData(
    itemID: number,
    worldID?: number,
    dataCenterID?: string
  ): Promise<PriceData | null> {
    // Rate limiting: ensure minimum delay between requests
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < API_RATE_LIMIT_DELAY) {
      await sleep(API_RATE_LIMIT_DELAY - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();

    // Build API URL
    const url = this.buildApiUrl(itemID, worldID, dataCenterID);

    try {
      const data = await retry(
        () => this.fetchWithTimeout(url, UNIVERSALIS_API_TIMEOUT),
        UNIVERSALIS_API_RETRY_COUNT,
        UNIVERSALIS_API_RETRY_DELAY
      );

      if (!data) {
        return null;
      }

      // Parse and validate response
      return this.parseApiResponse(data, itemID);
    } catch (error) {
      throw new AppError(
        ErrorCode.API_CALL_FAILED,
        `Failed to fetch price data for item ${itemID}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'warning'
      );
    }
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    timeoutMs: number
  ): Promise<{
    results?: Array<{
      itemId: number;
      nq?: {
        minListing?: {
          dc?: { price: number };
          world?: { price: number };
          region?: { price: number };
        };
      };
      hq?: {
        minListing?: {
          dc?: { price: number };
          world?: { price: number };
          region?: { price: number };
        };
      };
    }>;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid content type: expected application/json');
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parse and validate API response
   */
  private parseApiResponse(
    data: {
      results?: Array<{
        itemId: number;
        nq?: {
          minListing?: {
            dc?: { price: number };
            world?: { price: number };
            region?: { price: number };
          };
        };
        hq?: {
          minListing?: {
            dc?: { price: number };
            world?: { price: number };
            region?: { price: number };
          };
        };
      }>;
    },
    itemID: number
  ): PriceData | null {
    try {
      // Parse aggregated endpoint response format
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        console.warn(`No price data available for item ${itemID}`);
        return null;
      }

      const result = data.results[0];
      if (!result || result.itemId !== itemID) {
        console.warn(`Item ID mismatch: expected ${itemID}, got ${result?.itemId}`);
        return null;
      }

      // Try to get price from nq.minListing (prefer DC, then world, then region)
      let price: number | null = null;

      if (result.nq?.minListing) {
        // Prefer data center price
        if (result.nq.minListing.dc?.price) {
          price = result.nq.minListing.dc.price;
        }
        // Fall back to world price
        else if (result.nq.minListing.world?.price) {
          price = result.nq.minListing.world.price;
        }
        // Fall back to region price
        else if (result.nq.minListing.region?.price) {
          price = result.nq.minListing.region.price;
        }
      }

      // If no NQ price, try HQ
      if (!price && result.hq?.minListing) {
        if (result.hq.minListing.dc?.price) {
          price = result.hq.minListing.dc.price;
        } else if (result.hq.minListing.world?.price) {
          price = result.hq.minListing.world.price;
        } else if (result.hq.minListing.region?.price) {
          price = result.hq.minListing.region.price;
        }
      }

      if (!price) {
        console.warn(`No price data available for item ${itemID}`);
        return null;
      }

      return {
        itemID,
        currentAverage: Math.round(price),
        currentMinPrice: Math.round(price), // Using same price for all fields
        currentMaxPrice: Math.round(price),
        lastUpdate: Date.now(),
      };
    } catch (error) {
      console.error(`Failed to parse price data for item ${itemID}:`, error);
      return null;
    }
  }

  /**
   * Build API URL for item price query
   */
  private buildApiUrl(itemID: number, worldID?: number, dataCenterID?: string): string {
    // Universalis API endpoint: /api/v2/aggregated/{dataCenter or worldName}/{itemIDs}
    const pathSegment = dataCenterID || 'universal'; // 'universal' gets global average
    return `${UNIVERSALIS_API_BASE}/aggregated/${pathSegment}/${itemID}`;
  }

  /**
   * Build cache key from parameters
   */
  private buildCacheKey(itemID: number, worldID?: number, dataCenterID?: string): string {
    if (dataCenterID) {
      return `${itemID}_${dataCenterID}`;
    }
    if (worldID) {
      return `${itemID}_${worldID}`;
    }
    return `${itemID}_global`;
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  /**
   * Fetch prices for multiple items
   */
  async getPricesForItems(itemIDs: number[]): Promise<Map<number, PriceData>> {
    const results = new Map<number, PriceData>();

    for (const itemID of itemIDs) {
      const price = await this.getPriceData(itemID);
      if (price) {
        results.set(itemID, price);
      }
    }

    return results;
  }

  /**
   * Fetch prices for dyes in a specific data center
   */
  async getPricesForDataCenter(
    itemIDs: number[],
    dataCenterID: string
  ): Promise<Map<number, PriceData>> {
    const results = new Map<number, PriceData>();

    for (const itemID of itemIDs) {
      const price = await this.getPriceData(itemID, undefined, dataCenterID);
      if (price) {
        results.set(itemID, price);
      }
    }

    return results;
  }

  // ============================================================================
  // Health Checks
  // ============================================================================

  /**
   * Check if Universalis API is available
   */
  async isAPIAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${UNIVERSALIS_API_BASE}/stats`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get API status information
   */
  async getAPIStatus(): Promise<{ available: boolean; latency: number }> {
    const start = Date.now();

    try {
      const available = await this.isAPIAvailable();
      const latency = Date.now() - start;

      return { available, latency };
    } catch {
      return { available: false, latency: -1 };
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Format price for display (FFXIV Gil format: 69,420G)
   */
  static formatPrice(price: number): string {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    // Return with small "G" suffix using <small> tag for half-height
    return `${formattedNumber}<small>G</small>`;
  }

  /**
   * Calculate price trend (simplified)
   */
  static getPriceTrend(
    currentPrice: number,
    previousPrice: number
  ): { trend: 'up' | 'down' | 'stable'; change: number; changePercent: number } {
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice === 0 ? 0 : (change / previousPrice) * 100;

    let trend: 'up' | 'down' | 'stable';
    if (change > previousPrice * 0.05) {
      trend = 'up';
    } else if (change < -previousPrice * 0.05) {
      trend = 'down';
    } else {
      trend = 'stable';
    }

    return { trend, change, changePercent: Math.round(changePercent * 100) / 100 };
  }

  /**
   * Reset the singleton instance
   */
  static reset(): void {
    APIService.instance = null;
  }
}

/**
 * Convenience export of singleton instance
 */
export const apiService = APIService.getInstance();

/**
 * Community Preset Service
 * Fetches community presets from the xivdyetools-worker API
 *
 * @module services/community-preset-service
 */

import { logger } from '@shared/logger';
import type { PresetCategory } from 'xivdyetools-core';

// ============================================
// Types
// ============================================

export type PresetStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface CommunityPreset {
  id: string;
  name: string;
  description: string;
  category_id: PresetCategory;
  dyes: number[];
  tags: string[];
  author_discord_id: string | null;
  author_name: string | null;
  vote_count: number;
  status: PresetStatus;
  is_curated: boolean;
  created_at: string;
  updated_at: string;
}

export interface PresetListResponse {
  presets: CommunityPreset[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  is_curated: boolean;
  preset_count: number;
}

export interface PresetFilters {
  category?: PresetCategory;
  search?: string;
  status?: PresetStatus;
  sort?: 'popular' | 'recent' | 'name';
  page?: number;
  limit?: number;
  is_curated?: boolean;
}

// ============================================
// Configuration
// ============================================

/**
 * Default API URL - can be overridden via environment or config
 */
const DEFAULT_API_URL = 'https://xivdyetools-presets-api.ashejunius.workers.dev';

/**
 * Cache TTL in milliseconds (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Request timeout in milliseconds
 */
const REQUEST_TIMEOUT = 10000;

// ============================================
// Cache Implementation
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttl: number = CACHE_TTL) {
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// ============================================
// Service Implementation
// ============================================

/**
 * Community Preset Service
 * Singleton service for fetching community presets from the API
 */
export class CommunityPresetService {
  private static instance: CommunityPresetService | null = null;

  private readonly apiUrl: string;
  private readonly cache: SimpleCache<unknown>;
  private initialized = false;
  private available = false;

  private constructor() {
    // Try to get API URL from environment or use default
    this.apiUrl =
      (typeof window !== 'undefined' && (window as unknown as { PRESET_API_URL?: string }).PRESET_API_URL) ||
      DEFAULT_API_URL;
    this.cache = new SimpleCache(CACHE_TTL);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CommunityPresetService {
    if (!CommunityPresetService.instance) {
      CommunityPresetService.instance = new CommunityPresetService();
    }
    return CommunityPresetService.instance;
  }

  /**
   * Initialize the service and check API availability
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.available;
    }

    try {
      // Test API connectivity with a lightweight request
      const response = await this.fetchWithTimeout(`${this.apiUrl}/health`, {
        method: 'GET',
      });

      this.available = response.ok;
      this.initialized = true;

      if (this.available) {
        logger.info('CommunityPresetService: API available');
      } else {
        logger.warn('CommunityPresetService: API returned non-OK status');
      }
    } catch (error) {
      logger.warn('CommunityPresetService: API not available', error);
      this.available = false;
      this.initialized = true;
    }

    return this.available;
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make API request with error handling
   */
  private async request<T>(path: string, cacheKey?: string): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = this.cache.get(cacheKey) as T | null;
      if (cached) {
        return cached;
      }
    }

    const url = `${this.apiUrl}${path}`;

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorData.message || `API request failed: ${response.status}`);
      }

      const data = (await response.json()) as T;

      // Cache successful response
      if (cacheKey) {
        this.cache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // ============================================
  // Public API Methods
  // ============================================

  /**
   * Get presets with optional filtering
   */
  async getPresets(filters: PresetFilters = {}): Promise<PresetListResponse> {
    const params = new URLSearchParams();

    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.is_curated !== undefined) params.set('is_curated', String(filters.is_curated));

    const query = params.toString();
    const path = `/api/v1/presets${query ? `?${query}` : ''}`;
    const cacheKey = `presets:${query}`;

    return this.request<PresetListResponse>(path, cacheKey);
  }

  /**
   * Get featured presets (top voted)
   */
  async getFeaturedPresets(): Promise<CommunityPreset[]> {
    const response = await this.request<{ presets: CommunityPreset[] }>(
      '/api/v1/presets/featured',
      'presets:featured'
    );
    return response.presets;
  }

  /**
   * Get a single preset by ID
   */
  async getPreset(id: string): Promise<CommunityPreset | null> {
    try {
      return await this.request<CommunityPreset>(`/api/v1/presets/${id}`, `preset:${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all categories with preset counts
   */
  async getCategories(): Promise<CategoryWithCount[]> {
    const response = await this.request<{ categories: CategoryWithCount[] }>(
      '/api/v1/categories',
      'categories'
    );
    return response.categories;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('CommunityPresetService: Cache cleared');
  }

  /**
   * Invalidate specific cache entries
   */
  invalidatePresets(): void {
    // Clear all preset-related cache entries
    this.cache.delete('presets:featured');
    this.cache.delete('categories');
    // Note: Individual preset queries will expire naturally
  }
}

// Export singleton instance
export const communityPresetService = CommunityPresetService.getInstance();

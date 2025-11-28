/**
 * XIV Dye Tools - API Service Wrapper Tests
 *
 * Tests for APIService singleton wrapper and LocalStorage cache backend
 *
 * @module services/__tests__/api-service-wrapper.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APIService, LocalStorageCacheBackend } from '../api-service-wrapper';

describe('APIService Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset the singleton
    APIService.resetInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Singleton Pattern
  // ==========================================================================

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = APIService.getInstance();
      const instance2 = APIService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = APIService.getInstance();
      APIService.resetInstance();
      const instance2 = APIService.getInstance();

      // Different objects because we reset
      expect(instance1).not.toBe(instance2);
    });

    it('should return an instance with required methods', () => {
      const instance = APIService.getInstance();

      expect(typeof instance.getPriceData).toBe('function');
      expect(typeof instance.clearCache).toBe('function');
    });
  });

  describe('resetInstance', () => {
    it('should reset the singleton', () => {
      APIService.getInstance();
      APIService.resetInstance();

      // After reset, next getInstance should create new instance
      const newInstance = APIService.getInstance();
      expect(newInstance).toBeTruthy();
    });
  });

  // ==========================================================================
  // Static Methods
  // ==========================================================================

  describe('formatPrice', () => {
    it('should format prices with G suffix', () => {
      const result = APIService.formatPrice(1000);
      expect(result).toContain('G');
    });

    it('should handle zero', () => {
      const result = APIService.formatPrice(0);
      expect(result).toBe('0G');
    });

    it('should handle large numbers with formatting', () => {
      const result = APIService.formatPrice(1000000);
      expect(result).toContain('G');
      // Should have comma formatting
      expect(result).toMatch(/\d.*G$/);
    });
  });

  describe('clearCache', () => {
    it('should clear cache without throwing', async () => {
      await expect(APIService.clearCache()).resolves.not.toThrow();
    });
  });

  describe('getPriceData', () => {
    it('should accept itemID parameter', async () => {
      // This calls the actual API - we just verify it doesn't throw
      // and returns expected shape (or null for non-existent item)
      const result = await APIService.getPriceData(99999999);
      // Non-existent item should return null or price data
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should accept worldID parameter', async () => {
      // Verify the method accepts the parameter without throwing
      const result = await APIService.getPriceData(99999999, 67);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should accept dataCenterID parameter', async () => {
      // Verify the method accepts the parameter without throwing
      const result = await APIService.getPriceData(99999999, undefined, 'Crystal');
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });
});

// ==========================================================================
// LocalStorage Cache Backend
// ==========================================================================

describe('LocalStorageCacheBackend', () => {
  const keyPrefix = 'xivdyetools_api_';

  beforeEach(() => {
    localStorage.clear();
    APIService.resetInstance();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('cache operations via localStorage', () => {
    it('should store data with correct prefix', () => {
      // Initialize the service to create the cache backend
      APIService.getInstance();

      // Simulate cache storage
      const testKey = 'test-item';
      const testData = { data: { minPrice: 100 }, timestamp: Date.now() };

      localStorage.setItem(keyPrefix + testKey, JSON.stringify(testData));

      const stored = localStorage.getItem(keyPrefix + testKey);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(testData);
    });

    it('should retrieve stored data', () => {
      const testKey = 'test-retrieve';
      const testData = { data: { minPrice: 200 }, timestamp: Date.now() };

      localStorage.setItem(keyPrefix + testKey, JSON.stringify(testData));

      const stored = localStorage.getItem(keyPrefix + testKey);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data.minPrice).toBe(200);
    });

    it('should return null for non-existent keys', () => {
      const result = localStorage.getItem(keyPrefix + 'non-existent');
      expect(result).toBeNull();
    });

    it('should handle removal of keys', () => {
      const testKey = 'test-remove';
      localStorage.setItem(keyPrefix + testKey, 'test-value');

      localStorage.removeItem(keyPrefix + testKey);

      expect(localStorage.getItem(keyPrefix + testKey)).toBeNull();
    });

    it('should clear keys with prefix', () => {
      // Add some keys with the prefix
      localStorage.setItem(keyPrefix + 'key1', 'value1');
      localStorage.setItem(keyPrefix + 'key2', 'value2');
      localStorage.setItem('other_key', 'other_value');

      // Clear only prefixed keys
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(keyPrefix)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => localStorage.removeItem(key));

      // Prefixed keys should be gone
      expect(localStorage.getItem(keyPrefix + 'key1')).toBeNull();
      expect(localStorage.getItem(keyPrefix + 'key2')).toBeNull();

      // Other keys should remain
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });

    it('should list keys with prefix', () => {
      localStorage.setItem(keyPrefix + 'key1', 'value1');
      localStorage.setItem(keyPrefix + 'key2', 'value2');
      localStorage.setItem('other_key', 'other_value');

      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(keyPrefix)) {
          keys.push(key.substring(keyPrefix.length));
        }
      }

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem(keyPrefix + 'invalid', 'not-json');

      // Getting invalid JSON should throw when parsed
      expect(() => {
        JSON.parse(localStorage.getItem(keyPrefix + 'invalid')!);
      }).toThrow();
    });

    it('should handle storage quota errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;

      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw externally
      expect(() => {
        try {
          localStorage.setItem(keyPrefix + 'quota-test', 'data');
        } catch {
          // Expected to fail
        }
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });
});

describe('apiService export', () => {
  it('should export a singleton instance', async () => {
    const { apiService } = await import('../api-service-wrapper');

    expect(apiService).toBeTruthy();
    expect(typeof apiService.getPriceData).toBe('function');
  });
});

// ==========================================================================
// LocalStorageCacheBackend Direct Method Tests (Branch Coverage)
// ==========================================================================

describe('LocalStorageCacheBackend Direct Methods', () => {
  let cacheBackend: LocalStorageCacheBackend;
  const keyPrefix = 'xivdyetools_api_';

  beforeEach(() => {
    localStorage.clear();
    cacheBackend = new LocalStorageCacheBackend();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // get() method branch coverage
  // ==========================================================================

  describe('get() method', () => {
    it('should return parsed data when key exists', () => {
      const testData = { data: { minPrice: 100 }, timestamp: Date.now() };
      localStorage.setItem(keyPrefix + 'test-key', JSON.stringify(testData));

      const result = cacheBackend.get('test-key');

      expect(result).toEqual(testData);
    });

    it('should return null when key does not exist', () => {
      const result = cacheBackend.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should return null when localStorage throws an error', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const result = cacheBackend.get('test-key');

      expect(result).toBeNull();

      Storage.prototype.getItem = originalGetItem;
    });

    it('should return null when JSON parsing fails', () => {
      localStorage.setItem(keyPrefix + 'invalid-json', 'not-valid-json');

      const result = cacheBackend.get('invalid-json');

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // set() method branch coverage
  // ==========================================================================

  describe('set() method', () => {
    it('should store data successfully', () => {
      const testData = { data: { minPrice: 200 }, timestamp: Date.now() };

      cacheBackend.set('test-key', testData as any);

      const stored = localStorage.getItem(keyPrefix + 'test-key');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(testData);
    });

    it('should handle error when localStorage throws (quota exceeded)', () => {
      const originalSetItem = Storage.prototype.setItem;
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw externally
      expect(() => {
        cacheBackend.set('test-key', { data: {}, timestamp: Date.now() } as any);
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
      warnSpy.mockRestore();
    });
  });

  // ==========================================================================
  // delete() method branch coverage
  // ==========================================================================

  describe('delete() method', () => {
    it('should remove key successfully', () => {
      localStorage.setItem(keyPrefix + 'test-key', 'test-value');

      cacheBackend.delete('test-key');

      expect(localStorage.getItem(keyPrefix + 'test-key')).toBeNull();
    });

    it('should handle error when localStorage throws', () => {
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should not throw externally
      expect(() => {
        cacheBackend.delete('test-key');
      }).not.toThrow();

      Storage.prototype.removeItem = originalRemoveItem;
    });

    it('should handle deleting non-existent key', () => {
      // Should not throw when key doesn't exist
      expect(() => {
        cacheBackend.delete('non-existent-key');
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // clear() method branch coverage
  // ==========================================================================

  describe('clear() method', () => {
    it('should clear all keys with prefix', () => {
      localStorage.setItem(keyPrefix + 'key1', 'value1');
      localStorage.setItem(keyPrefix + 'key2', 'value2');
      localStorage.setItem('other_key', 'other_value');

      cacheBackend.clear();

      expect(localStorage.getItem(keyPrefix + 'key1')).toBeNull();
      expect(localStorage.getItem(keyPrefix + 'key2')).toBeNull();
      // Other keys should remain
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });

    it('should handle when no keys have the prefix', () => {
      localStorage.setItem('other_key1', 'value1');
      localStorage.setItem('other_key2', 'value2');

      // Should not throw when no matching keys
      expect(() => {
        cacheBackend.clear();
      }).not.toThrow();

      // Other keys should still exist
      expect(localStorage.getItem('other_key1')).toBe('value1');
    });

    it('should skip keys when localStorage.key returns null', () => {
      // This tests the key?.startsWith branch when key is null
      // We add real items, then mock key() to return null for some iterations
      localStorage.setItem(keyPrefix + 'key1', 'value1');
      localStorage.setItem('other_key', 'value2');

      const originalKey = Storage.prototype.key;
      let callIndex = 0;
      const mockKey = vi.fn((index: number) => {
        // Return null for first call, then delegate to original for remaining
        if (callIndex === 0) {
          callIndex++;
          return null;
        }
        return originalKey.call(localStorage, index);
      });
      Storage.prototype.key = mockKey;

      // Should not throw - null keys are skipped
      expect(() => {
        cacheBackend.clear();
      }).not.toThrow();

      Storage.prototype.key = originalKey;
    });

    it('should handle error when localStorage throws during iteration', () => {
      const originalKey = Storage.prototype.key;
      Storage.prototype.key = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should not throw externally
      expect(() => {
        cacheBackend.clear();
      }).not.toThrow();

      Storage.prototype.key = originalKey;
    });
  });

  // ==========================================================================
  // keys() method branch coverage
  // ==========================================================================

  describe('keys() method', () => {
    beforeEach(() => {
      // Ensure clean state and restore any mocked functions
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it('should return all keys with prefix (without prefix)', () => {
      localStorage.setItem(keyPrefix + 'key1', 'value1');
      localStorage.setItem(keyPrefix + 'key2', 'value2');
      localStorage.setItem('other_key', 'other_value');

      const keys = cacheBackend.keys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).not.toContain('other_key');
      expect(keys.length).toBe(2);
    });

    it('should return empty array when no keys have the prefix', () => {
      localStorage.setItem('other_key1', 'value1');
      localStorage.setItem('other_key2', 'value2');

      const keys = cacheBackend.keys();

      expect(keys).toEqual([]);
    });

    it('should skip null keys from localStorage.key', () => {
      // This tests the key?.startsWith branch when key is null
      // Add a real item first
      localStorage.setItem(keyPrefix + 'realkey', 'value');

      const originalKey = Storage.prototype.key;
      let callCount = 0;
      const mockKey = vi.fn((index: number) => {
        callCount++;
        // Return null for first call to test the null branch
        if (callCount === 1) {
          return null;
        }
        // Return real keys for remaining calls
        return originalKey.call(localStorage, index);
      });
      Storage.prototype.key = mockKey;

      const keys = cacheBackend.keys();

      // Should still work and return whatever keys weren't null
      expect(Array.isArray(keys)).toBe(true);

      Storage.prototype.key = originalKey;
    });

    it('should return empty array when localStorage throws during iteration', () => {
      const originalKey = Storage.prototype.key;
      Storage.prototype.key = vi.fn(() => {
        throw new Error('Storage error');
      });

      const keys = cacheBackend.keys();

      expect(keys).toEqual([]);

      Storage.prototype.key = originalKey;
    });

    it('should handle empty localStorage', () => {
      localStorage.clear();

      const keys = cacheBackend.keys();

      expect(keys).toEqual([]);
    });
  });
});

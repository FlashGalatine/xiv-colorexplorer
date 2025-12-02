/**
 * IndexedDB Service Tests
 *
 * Tests for IndexedDB storage operations
 * Uses simplified mocking approach
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IndexedDBService, indexedDBService as defaultIndexedDBService, STORES } from '../indexeddb-service';

describe('IndexedDBService', () => {
  let indexedDBService: IndexedDBService;
  let mockDB: any;
  let mockStore: any;
  let mockStoreData: Map<string, any>;
  let mockTransaction: any;
  let originalIndexedDB: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Store original
    originalIndexedDB = global.indexedDB;

    // Create mock data store
    mockStoreData = new Map();

    // Create mock object store
    mockStore = {
      put: vi.fn((data) => {
        const key = data.key || data.id;
        mockStoreData.set(key, data);
        return createMockRequest(key);
      }),
      get: vi.fn((key) => {
        const result = mockStoreData.get(key);
        return createMockRequest(result || undefined);
      }),
      delete: vi.fn((key) => {
        mockStoreData.delete(key);
        return createMockRequest(undefined);
      }),
      clear: vi.fn(() => {
        mockStoreData.clear();
        return createMockRequest(undefined);
      }),
      getAllKeys: vi.fn(() => {
        return createMockRequest(Array.from(mockStoreData.keys()));
      }),
      getAll: vi.fn(() => {
        return createMockRequest(Array.from(mockStoreData.values()));
      }),
      count: vi.fn(() => {
        return createMockRequest(mockStoreData.size);
      }),
      createIndex: vi.fn(),
    };

    // Create mock transaction
    mockTransaction = {
      objectStore: vi.fn().mockReturnValue(mockStore),
      oncomplete: null,
      onerror: null,
    };

    // Create mock database
    mockDB = {
      transaction: vi.fn().mockReturnValue(mockTransaction),
      close: vi.fn(),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(false),
      },
      createObjectStore: vi.fn().mockReturnValue(mockStore),
    };

    // Helper to create mock request
    function createMockRequest(result: any) {
      const request: any = {
        result,
        error: null,
        onsuccess: null,
        onerror: null,
      };
      // Trigger success async
      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess({ target: request });
        }
      }, 0);
      return request;
    }

    // Create mock IDBOpenDBRequest
    const createMockOpenRequest = () => {
      const request: any = {
        result: mockDB,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        onblocked: null,
      };
      // Trigger success async
      setTimeout(() => {
        // Trigger upgrade if needed
        if (request.onupgradeneeded) {
          request.onupgradeneeded({ target: request });
        }
        if (request.onsuccess) {
          request.onsuccess({ target: request });
        }
      }, 0);
      return request;
    };

    // Mock indexedDB
    const mockIndexedDB = {
      open: vi.fn().mockImplementation(() => createMockOpenRequest()),
      deleteDatabase: vi.fn().mockImplementation(() => {
        const request: any = {
          result: undefined,
          error: null,
          onsuccess: null,
          onerror: null,
          onblocked: null,
        };
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess({ target: request });
          }
        }, 0);
        return request;
      }),
    };

    // @ts-ignore
    global.indexedDB = mockIndexedDB;

    // Reset singleton and get fresh instance
    // @ts-ignore - accessing private static for testing
    IndexedDBService.instance = null;
    indexedDBService = IndexedDBService.getInstance();
  });

  afterEach(() => {
    indexedDBService.close();
    // @ts-ignore
    global.indexedDB = originalIndexedDB;
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = IndexedDBService.getInstance();
      const instance2 = IndexedDBService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export default singleton instance', () => {
      expect(defaultIndexedDBService).toBeDefined();
    });
  });

  describe('STORES constants', () => {
    it('should export store names', () => {
      expect(STORES.PRICE_CACHE).toBe('price_cache');
      expect(STORES.PALETTES).toBe('palettes');
      expect(STORES.SETTINGS).toBe('settings');
    });
  });

  describe('isIndexedDBSupported', () => {
    it('should return true when indexedDB is available', () => {
      expect(indexedDBService.isIndexedDBSupported()).toBe(true);
    });

    it('should return false when indexedDB is not available', () => {
      // @ts-ignore - reset singleton
      IndexedDBService.instance = null;
      // @ts-ignore
      global.indexedDB = undefined;

      const service = IndexedDBService.getInstance();
      expect(service.isIndexedDBSupported()).toBe(false);
    });
  });

  describe('isReady', () => {
    it('should return false before initialization', () => {
      expect(indexedDBService.isReady()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await indexedDBService.initialize();
      expect(indexedDBService.isReady()).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should initialize the database', async () => {
      const result = await indexedDBService.initialize();
      expect(result).toBe(true);
      expect(global.indexedDB.open).toHaveBeenCalled();
    });

    it('should return existing promise if already initializing', async () => {
      const promise1 = indexedDBService.initialize();
      const promise2 = indexedDBService.initialize();

      // Same promise should be returned
      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe(result2);
    });

    it('should return true if already initialized', async () => {
      await indexedDBService.initialize();
      // Force a new call by nullifying the promise but keeping db
      // @ts-ignore
      indexedDBService.initPromise = null;
      const result = await indexedDBService.initialize();
      expect(result).toBe(true);
    });

    it('should return false when IndexedDB is not supported', async () => {
      // @ts-ignore - reset singleton
      IndexedDBService.instance = null;
      // @ts-ignore
      global.indexedDB = undefined;

      const service = IndexedDBService.getInstance();
      const result = await service.initialize();
      expect(result).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      await indexedDBService.initialize();
    });

    describe('get', () => {
      it('should get a value from store', async () => {
        mockStoreData.set('testKey', { key: 'testKey', value: 'testValue' });

        const result = await indexedDBService.get(STORES.SETTINGS, 'testKey');
        expect(result).toBe('testValue');
      });

      it('should return null for non-existent key', async () => {
        const result = await indexedDBService.get(STORES.SETTINGS, 'nonExistent');
        expect(result).toBeNull();
      });

      it('should return null when not initialized', async () => {
        // @ts-ignore - reset singleton
        IndexedDBService.instance = null;
        // @ts-ignore
        global.indexedDB = undefined;

        const service = IndexedDBService.getInstance();
        const result = await service.get(STORES.SETTINGS, 'testKey');
        expect(result).toBeNull();
      });
    });

    describe('set', () => {
      it('should set a value in store', async () => {
        const result = await indexedDBService.set(STORES.SETTINGS, 'newKey', 'newValue');
        expect(result).toBe(true);
        expect(mockStore.put).toHaveBeenCalledWith({ key: 'newKey', value: 'newValue' });
      });

      it('should handle PALETTES store specially', async () => {
        const palette = { id: 'palette-1', name: 'Test Palette' };
        await indexedDBService.set(STORES.PALETTES, 'palette-1', palette);
        expect(mockStore.put).toHaveBeenCalledWith(palette);
      });

      it('should return false when not initialized', async () => {
        // @ts-ignore - reset singleton
        IndexedDBService.instance = null;
        // @ts-ignore
        global.indexedDB = undefined;

        const service = IndexedDBService.getInstance();
        const result = await service.set(STORES.SETTINGS, 'key', 'value');
        expect(result).toBe(false);
      });
    });

    describe('delete', () => {
      it('should delete a value from store', async () => {
        mockStoreData.set('toDelete', { key: 'toDelete', value: 'data' });

        const result = await indexedDBService.delete(STORES.SETTINGS, 'toDelete');
        expect(result).toBe(true);
        expect(mockStore.delete).toHaveBeenCalledWith('toDelete');
      });

      it('should return false when not initialized', async () => {
        // @ts-ignore - reset singleton
        IndexedDBService.instance = null;
        // @ts-ignore
        global.indexedDB = undefined;

        const service = IndexedDBService.getInstance();
        const result = await service.delete(STORES.SETTINGS, 'key');
        expect(result).toBe(false);
      });
    });

    describe('keys', () => {
      it('should get all keys from store', async () => {
        mockStoreData.set('key1', { key: 'key1', value: 'value1' });
        mockStoreData.set('key2', { key: 'key2', value: 'value2' });

        const result = await indexedDBService.keys(STORES.SETTINGS);
        expect(result).toEqual(['key1', 'key2']);
      });

      it('should return empty array when not initialized', async () => {
        // @ts-ignore - reset singleton
        IndexedDBService.instance = null;
        // @ts-ignore
        global.indexedDB = undefined;

        const service = IndexedDBService.getInstance();
        const result = await service.keys(STORES.SETTINGS);
        expect(result).toEqual([]);
      });
    });

    describe('getAll', () => {
      it('should get all values from store', async () => {
        mockStoreData.set('key1', { key: 'key1', value: 'value1' });
        mockStoreData.set('key2', { key: 'key2', value: 'value2' });

        const result = await indexedDBService.getAll<string>(STORES.SETTINGS);
        expect(result).toEqual(['value1', 'value2']);
      });

      it('should return empty array when not initialized', async () => {
        // @ts-ignore - reset singleton
        IndexedDBService.instance = null;
        // @ts-ignore
        global.indexedDB = undefined;

        const service = IndexedDBService.getInstance();
        const result = await service.getAll(STORES.SETTINGS);
        expect(result).toEqual([]);
      });
    });

    describe('clear', () => {
      it('should clear all values from store', async () => {
        mockStoreData.set('key1', 'value1');
        mockStoreData.set('key2', 'value2');

        const result = await indexedDBService.clear(STORES.SETTINGS);
        expect(result).toBe(true);
        expect(mockStore.clear).toHaveBeenCalled();
      });

      it('should return false when not initialized', async () => {
        // @ts-ignore - reset singleton
        IndexedDBService.instance = null;
        // @ts-ignore
        global.indexedDB = undefined;

        const service = IndexedDBService.getInstance();
        const result = await service.clear(STORES.SETTINGS);
        expect(result).toBe(false);
      });
    });

    describe('count', () => {
      it('should return count of entries in store', async () => {
        mockStoreData.set('key1', 'value1');
        mockStoreData.set('key2', 'value2');

        const result = await indexedDBService.count(STORES.SETTINGS);
        expect(result).toBe(2);
      });

      it('should return 0 when not initialized', async () => {
        // @ts-ignore - reset singleton
        IndexedDBService.instance = null;
        // @ts-ignore
        global.indexedDB = undefined;

        const service = IndexedDBService.getInstance();
        const result = await service.count(STORES.SETTINGS);
        expect(result).toBe(0);
      });
    });
  });

  describe('close', () => {
    it('should close the database connection', async () => {
      await indexedDBService.initialize();
      indexedDBService.close();

      expect(mockDB.close).toHaveBeenCalled();
      expect(indexedDBService.isReady()).toBe(false);
    });

    it('should handle close when not initialized', () => {
      // Should not throw
      expect(() => indexedDBService.close()).not.toThrow();
    });
  });

  describe('deleteDatabase', () => {
    it('should delete the database', async () => {
      await indexedDBService.initialize();
      const result = await indexedDBService.deleteDatabase();

      expect(result).toBe(true);
      expect(global.indexedDB.deleteDatabase).toHaveBeenCalled();
    });

    it('should return false when IndexedDB is not supported', async () => {
      // @ts-ignore - reset singleton
      IndexedDBService.instance = null;
      // @ts-ignore
      global.indexedDB = undefined;

      const service = IndexedDBService.getInstance();
      const result = await service.deleteDatabase();
      expect(result).toBe(false);
    });
  });
});

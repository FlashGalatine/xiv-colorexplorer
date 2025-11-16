/**
 * XIV Dye Tools - StorageService Unit Tests
 * Tests for safe localStorage wrapper
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService, NamespacedStorage } from '../storage-service';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (StorageService.isAvailable()) {
      StorageService.clear();
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (StorageService.isAvailable()) {
      StorageService.clear();
    }
  });

  // ============================================================================
  // Storage Availability Tests
  // ============================================================================

  describe('isAvailable', () => {
    it('should check if localStorage is available', () => {
      const available = StorageService.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  // ============================================================================
  // Basic CRUD Operations Tests
  // ============================================================================

  describe('setItem and getItem', () => {
    it('should store and retrieve string values', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('testKey', 'testValue');
      const result = StorageService.getItem('testKey');
      expect(result).toBe('testValue');
    });

    it('should store and retrieve objects', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const obj = { name: 'test', value: 123 };
      StorageService.setItem('objKey', obj);
      const result = StorageService.getItem('objKey');
      expect(result).toEqual(obj);
    });

    it('should store and retrieve numbers', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('numKey', 42);
      const result = StorageService.getItem('numKey');
      expect(result).toEqual(42);
    });

    it('should return null for non-existent keys', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const result = StorageService.getItem('nonExistent');
      expect(result).toBeNull();
    });

    it('should return default value for non-existent keys', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const result = StorageService.getItem('nonExistent', 'defaultValue');
      expect(result).toBe('defaultValue');
    });
  });

  describe('removeItem', () => {
    it('should remove stored item', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('removeTest', 'value');
      expect(StorageService.hasItem('removeTest')).toBe(true);

      StorageService.removeItem('removeTest');
      expect(StorageService.hasItem('removeTest')).toBe(false);
    });

    it('should handle removing non-existent items', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      expect(() => {
        StorageService.removeItem('nonExistent');
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('key1', 'value1');
      StorageService.setItem('key2', 'value2');

      const before = StorageService.getItemCount();
      expect(before).toBeGreaterThan(0);

      StorageService.clear();

      const after = StorageService.getItemCount();
      expect(after).toBe(0);
    });
  });

  // ============================================================================
  // Key Management Tests
  // ============================================================================

  describe('getKeys', () => {
    it('should return array of all keys', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('key1', 'value1');
      StorageService.setItem('key2', 'value2');

      const keys = StorageService.getKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('hasItem', () => {
    it('should check if item exists', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('exists', 'value');
      expect(StorageService.hasItem('exists')).toBe(true);
      expect(StorageService.hasItem('notExists')).toBe(false);
    });
  });

  describe('getItemCount', () => {
    it('should return number of stored items', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.clear();
      expect(StorageService.getItemCount()).toBe(0);

      StorageService.setItem('key1', 'value1');
      expect(StorageService.getItemCount()).toBe(1);

      StorageService.setItem('key2', 'value2');
      expect(StorageService.getItemCount()).toBe(2);
    });
  });

  // ============================================================================
  // Prefix Operations Tests
  // ============================================================================

  describe('getItemsByPrefix', () => {
    it('should retrieve items matching prefix', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('app_key1', 'value1');
      StorageService.setItem('app_key2', 'value2');
      StorageService.setItem('other_key', 'value3');

      const items = StorageService.getItemsByPrefix('app_');
      expect(Object.keys(items).length).toBe(2);
    });
  });

  describe('removeByPrefix', () => {
    it('should remove items matching prefix', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItem('temp_key1', 'value1');
      StorageService.setItem('temp_key2', 'value2');
      StorageService.setItem('perm_key', 'value3');

      const removed = StorageService.removeByPrefix('temp_');
      expect(removed).toBe(2);

      expect(StorageService.hasItem('temp_key1')).toBe(false);
      expect(StorageService.hasItem('perm_key')).toBe(true);
    });
  });

  // ============================================================================
  // TTL (Time-To-Live) Tests
  // ============================================================================

  describe('setItemWithTTL and getItemWithTTL', () => {
    it('should store and retrieve items with TTL', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItemWithTTL('tempKey', 'tempValue', 10000);
      const result = StorageService.getItemWithTTL('tempKey');
      expect(result).toBe('tempValue');
    });

    it('should return null for expired items', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItemWithTTL('expireKey', 'value', 10); // 10ms TTL
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait 50ms

      const result = StorageService.getItemWithTTL('expireKey');
      expect(result).toBeNull();
    });

    it('should return default value for expired items', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.setItemWithTTL('expireKey2', 'value', 10);
      await new Promise(resolve => setTimeout(resolve, 50));

      const result = StorageService.getItemWithTTL('expireKey2', 'default');
      expect(result).toBe('default');
    });
  });

  // ============================================================================
  // NamespacedStorage Tests
  // ============================================================================

  describe('NamespacedStorage', () => {
    it('should prefix all keys', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const ns = StorageService.createNamespace('app_');
      ns.setItem('key1', 'value1');

      expect(StorageService.hasItem('app_key1')).toBe(true);
    });

    it('should isolate namespaces', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const ns1 = StorageService.createNamespace('app1_');
      const ns2 = StorageService.createNamespace('app2_');

      ns1.setItem('key', 'value1');
      ns2.setItem('key', 'value2');

      expect(ns1.getItem('key')).toBe('value1');
      expect(ns2.getItem('key')).toBe('value2');
    });

    it('should support clear within namespace', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const ns = StorageService.createNamespace('temp_');
      ns.setItem('key1', 'value1');
      ns.setItem('key2', 'value2');

      StorageService.setItem('other_key', 'value3');

      ns.clear();

      expect(ns.getItem('key1')).toBeNull();
      expect(StorageService.hasItem('other_key')).toBe(true);
    });

    it('should support TTL in namespace', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const ns = StorageService.createNamespace('ttl_');
      ns.setItemWithTTL('key', 'value', 10);

      expect(ns.getItemWithTTL('key')).toBe('value');

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(ns.getItemWithTTL('key')).toBeNull();
    });
  });

  // ============================================================================
  // Size Calculation Tests
  // ============================================================================

  describe('getSize', () => {
    it('should calculate storage size', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.clear();
      const sizeBefore = StorageService.getSize();

      StorageService.setItem('largeKey', 'x'.repeat(1000));
      const sizeAfter = StorageService.getSize();

      expect(sizeAfter).toBeGreaterThan(sizeBefore);
    });
  });
});

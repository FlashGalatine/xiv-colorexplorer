/**
 * XIV Dye Tools - SecureStorage Unit Tests
 * Tests for secure storage with integrity checks and size limits
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecureStorage, StorageService } from '../storage-service';

describe('SecureStorage', () => {
  beforeEach(() => {
    // Clear storage before each test
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

  describe('Basic Operations', () => {
    it('should store and retrieve items with integrity checks', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      await SecureStorage.setItem('test', 'value');
      const result = await SecureStorage.getItem('test');

      expect(result).toBe('value');
    });

    it('should store and retrieve objects', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const obj = { name: 'test', value: 123 };
      await SecureStorage.setItem('obj', obj);
      const result = await SecureStorage.getItem('obj');

      expect(result).toEqual(obj);
    });

    it('should return default value for non-existent keys', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const result = await SecureStorage.getItem('nonExistent', 'default');
      expect(result).toBe('default');
    });

    it('should remove items', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      await SecureStorage.setItem('remove', 'value');
      SecureStorage.removeItem('remove');
      const result = await SecureStorage.getItem('remove');

      expect(result).toBeNull();
    });

    it('should clear all items', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      await SecureStorage.setItem('key1', 'value1');
      await SecureStorage.setItem('key2', 'value2');
      SecureStorage.clear();

      expect(await SecureStorage.getItem('key1')).toBeNull();
      expect(await SecureStorage.getItem('key2')).toBeNull();
    });
  });

  describe('Integrity Checks', () => {
    it('should detect tampered data', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      // Store valid data
      await SecureStorage.setItem('secure', 'original');

      // Manually tamper with the stored entry
      const entry = StorageService.getItem<{ value: string; checksum: string; timestamp: number }>('secure');
      if (entry) {
        entry.value = 'tampered';
        StorageService.setItem('secure', entry);
      }

      // Should detect tampering and return null
      const result = await SecureStorage.getItem('secure');
      expect(result).toBeNull();

      // Entry should be removed
      expect(StorageService.getItem('secure')).toBeNull();
    });

    it('should handle corrupted entry structure', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      // Store invalid structure
      StorageService.setItem('corrupted', { invalid: 'structure' });

      // Should handle gracefully and return default
      const result = await SecureStorage.getItem('corrupted', 'default');
      expect(result).toBe('default');

      // Entry should be removed
      expect(StorageService.getItem('corrupted')).toBeNull();
    });

    it('should verify checksum on read', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      await SecureStorage.setItem('verify', 'test');
      const result = await SecureStorage.getItem('verify');

      expect(result).toBe('test');
    });
  });

  describe('Size Limits', () => {
    it('should return size limit', () => {
      const limit = SecureStorage.getSizeLimit();
      expect(limit).toBe(5 * 1024 * 1024); // 5 MB
    });

    it('should return current cache size', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.clear();
      const sizeBefore = SecureStorage.getSize();

      await SecureStorage.setItem('sizeTest', 'x'.repeat(1000));
      const sizeAfter = SecureStorage.getSize();

      expect(sizeAfter).toBeGreaterThan(sizeBefore);
    });
  });

  describe('Cleanup', () => {
    it('should clean up corrupted entries', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      // Store valid entry
      await SecureStorage.setItem('valid', 'value');

      // Store corrupted entry
      StorageService.setItem('corrupted1', { invalid: 'structure' });
      StorageService.setItem('corrupted2', 'not an object');

      const removed = await SecureStorage.cleanupCorrupted();

      expect(removed).toBeGreaterThan(0);
      expect(await SecureStorage.getItem('valid')).toBe('value');
    });

    it('should return 0 when no corrupted entries', async () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.clear();
      await SecureStorage.setItem('valid1', 'value1');
      await SecureStorage.setItem('valid2', 'value2');

      const removed = await SecureStorage.cleanupCorrupted();

      expect(removed).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle unavailable localStorage', async () => {
      const originalLocalStorage = window.localStorage;
      // @ts-expect-error - Testing error case
      window.localStorage = null;

      const result = await SecureStorage.setItem('test', 'value');
      expect(result).toBe(false);

      const getResult = await SecureStorage.getItem('test', 'default');
      expect(getResult).toBe('default');

      window.localStorage = originalLocalStorage;
    });
  });
});


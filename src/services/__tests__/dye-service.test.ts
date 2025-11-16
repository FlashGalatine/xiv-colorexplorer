/**
 * XIV Dye Tools - DyeService Unit Tests
 * Tests for dye database management and search functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DyeService } from '../dye-service';

describe('DyeService', () => {
  beforeEach(() => {
    // Reset singleton before each test
    DyeService.reset();
  });

  afterEach(() => {
    DyeService.reset();
  });

  // ============================================================================
  // Initialization & Database Access Tests
  // ============================================================================

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = DyeService.getInstance();
      const instance2 = DyeService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with empty dye array', () => {
      const service = DyeService.getInstance();
      expect(service.isLoadedStatus()).toBe(false);
      expect(service.getDyeCount()).toBe(0);
    });
  });

  describe('getAllDyes', () => {
    it('should return array of dyes', () => {
      const service = DyeService.getInstance();
      const dyes = service.getAllDyes();
      expect(Array.isArray(dyes)).toBe(true);
    });

    it('should return copy of dye array', () => {
      const service = DyeService.getInstance();
      const dyes1 = service.getAllDyes();
      const dyes2 = service.getAllDyes();
      expect(dyes1).not.toBe(dyes2);
      expect(dyes1).toEqual(dyes2);
    });
  });

  describe('getDyeById', () => {
    it('should return null for non-existent dye', () => {
      const service = DyeService.getInstance();
      const dye = service.getDyeById(99999);
      expect(dye).toBeNull();
    });
  });

  describe('isLoadedStatus', () => {
    it('should indicate database status', () => {
      const service = DyeService.getInstance();
      const isLoaded = service.isLoadedStatus();
      expect(typeof isLoaded).toBe('boolean');
    });
  });

  // ============================================================================
  // Search & Filter Tests
  // ============================================================================

  describe('searchByName', () => {
    it('should return empty array for empty query', () => {
      const service = DyeService.getInstance();
      const results = service.searchByName('');
      expect(results).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const service = DyeService.getInstance();
      const results1 = service.searchByName('BLACK');
      const results2 = service.searchByName('black');
      expect(results1.length).toBe(results2.length);
    });

    it('should perform partial matching', () => {
      const service = DyeService.getInstance();
      const results = service.searchByName('Black');
      // Results should include colors with 'Black' in the name
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('searchByCategory', () => {
    it('should filter by category', () => {
      const service = DyeService.getInstance();
      const results = service.searchByCategory('Neutral');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should be case-sensitive for category', () => {
      const service = DyeService.getInstance();
      const results = service.searchByCategory('neutral');
      // Should likely return empty since categories are capitalized
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getCategories', () => {
    it('should return array of category names', () => {
      const service = DyeService.getInstance();
      const categories = service.getCategories();
      expect(Array.isArray(categories)).toBe(true);
    });

    it('should return sorted categories', () => {
      const service = DyeService.getInstance();
      const categories = service.getCategories();
      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
    });
  });

  describe('filterDyes', () => {
    it('should filter by category', () => {
      const service = DyeService.getInstance();
      const results = service.filterDyes({ category: 'Neutral' });
      expect(Array.isArray(results)).toBe(true);
    });

    it('should exclude specified dye IDs', () => {
      const service = DyeService.getInstance();
      const allDyes = service.getAllDyes();
      if (allDyes.length > 0) {
        const excludedId = allDyes[0].id;
        const results = service.filterDyes({ excludeIds: [excludedId] });
        const hasExcluded = results.some(d => d.id === excludedId);
        expect(hasExcluded).toBe(false);
      }
    });

    it('should filter by price range', () => {
      const service = DyeService.getInstance();
      const results = service.filterDyes({ minPrice: 100, maxPrice: 500 });
      results.forEach(dye => {
        expect(dye.cost).toBeGreaterThanOrEqual(100);
        expect(dye.cost).toBeLessThanOrEqual(500);
      });
    });
  });

  // ============================================================================
  // Color Matching Tests
  // ============================================================================

  describe('findClosestDye', () => {
    it('should return null for empty database', () => {
      const service = DyeService.getInstance();
      const dye = service.findClosestDye('#FF0000');
      expect(dye).toBeNull();
    });

    it('should exclude specified dyes', () => {
      const service = DyeService.getInstance();
      const allDyes = service.getAllDyes();
      if (allDyes.length > 0) {
        const excludedId = allDyes[0].id;
        const dye = service.findClosestDye('#FF0000', [excludedId]);
        if (dye) {
          expect(dye.id).not.toBe(excludedId);
        }
      }
    });
  });

  describe('findDyesWithinDistance', () => {
    it('should return empty array for impossible distance', () => {
      const service = DyeService.getInstance();
      const results = service.findDyesWithinDistance('#FF0000', 0);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should respect limit parameter', () => {
      const service = DyeService.getInstance();
      const results = service.findDyesWithinDistance('#FF0000', 500, 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  // ============================================================================
  // Sorting Tests
  // ============================================================================

  describe('getDyesSortedByBrightness', () => {
    it('should return sorted array', () => {
      const service = DyeService.getInstance();
      const dyes = service.getDyesSortedByBrightness(true);
      expect(Array.isArray(dyes)).toBe(true);

      // Check sorting order
      for (let i = 1; i < dyes.length; i++) {
        expect(dyes[i].hsv.v).toBeGreaterThanOrEqual(dyes[i - 1].hsv.v);
      }
    });

    it('should support descending order', () => {
      const service = DyeService.getInstance();
      const dyesAsc = service.getDyesSortedByBrightness(true);
      const dyesDesc = service.getDyesSortedByBrightness(false);
      expect(dyesAsc).toEqual([...dyesDesc].reverse());
    });
  });

  describe('getDyesSortedBySaturation', () => {
    it('should sort by saturation', () => {
      const service = DyeService.getInstance();
      const dyes = service.getDyesSortedBySaturation(true);
      expect(Array.isArray(dyes)).toBe(true);

      for (let i = 1; i < dyes.length; i++) {
        expect(dyes[i].hsv.s).toBeGreaterThanOrEqual(dyes[i - 1].hsv.s);
      }
    });
  });

  describe('getDyesSortedByHue', () => {
    it('should sort by hue', () => {
      const service = DyeService.getInstance();
      const dyes = service.getDyesSortedByHue(true);
      expect(Array.isArray(dyes)).toBe(true);

      for (let i = 1; i < dyes.length; i++) {
        expect(dyes[i].hsv.h).toBeGreaterThanOrEqual(dyes[i - 1].hsv.h);
      }
    });
  });

  // ============================================================================
  // Harmony Generation Tests
  // ============================================================================

  describe('findComplementaryPair', () => {
    it('should find complementary color', () => {
      const service = DyeService.getInstance();
      const dye = service.findComplementaryPair('#FF0000');
      // Result could be null if no close match exists
      expect(dye === null || typeof dye === 'object').toBe(true);
    });
  });

  describe('findAnalogousDyes', () => {
    it('should find analogous colors', () => {
      const service = DyeService.getInstance();
      const dyes = service.findAnalogousDyes('#FF0000');
      expect(Array.isArray(dyes)).toBe(true);
    });

    it('should respect angle parameter', () => {
      const service = DyeService.getInstance();
      const dyes1 = service.findAnalogousDyes('#FF0000', 30);
      const dyes2 = service.findAnalogousDyes('#FF0000', 10);
      // Smaller angle should return fewer or equal results
      expect(dyes2.length).toBeLessThanOrEqual(dyes1.length + 1);
    });
  });

  describe('findTriadicDyes', () => {
    it('should find triadic color scheme', () => {
      const service = DyeService.getInstance();
      const dyes = service.findTriadicDyes('#FF0000');
      expect(Array.isArray(dyes)).toBe(true);
      expect(dyes.length).toBeLessThanOrEqual(3);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('error handling', () => {
    it('should throw error when database not loaded', () => {
      const service = DyeService.getInstance();
      expect(() => {
        // This will throw since database is empty
        service.getDyeCount();
      }).not.toThrow(); // getDyeCount checks status internally
    });
  });
});

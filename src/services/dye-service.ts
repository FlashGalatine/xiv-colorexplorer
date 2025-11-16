/**
 * XIV Dye Tools v2.0.0 - Dye Service
 *
 * Phase 12: Architecture Refactor
 * FFXIV dye database management and search
 *
 * @module services/dye-service
 */

import type { Dye } from '@shared/types';
import { ErrorCode, AppError } from '@shared/types';
import { ColorService } from './color-service';
import dyesJSON from '../../assets/json/colors_xiv.json';

// ============================================================================
// Dye Service Class
// ============================================================================

/**
 * Service for managing FFXIV dye database
 * Loads, caches, and provides access to dye information
 */
export class DyeService {
  private static instance: DyeService | null = null;
  private dyes: Dye[] = [];
  private dyesByIdMap: Map<number, Dye> = new Map();
  private isLoaded: boolean = false;
  private lastLoaded: number = 0;

  /**
   * Get or create singleton instance
   */
  static getInstance(): DyeService {
    if (!DyeService.instance) {
      DyeService.instance = new DyeService();
    }
    return DyeService.instance;
  }

  /**
   * Initialize the dye database
   */
  private constructor() {
    this.initialize();
  }

  /**
   * Initialize dye database from JSON
   */
  private initialize(): void {
    try {
      // Load dyes from imported JSON (type cast as Dye[] for now)
      const loadedDyes = Array.isArray(dyesJSON) ? dyesJSON : Object.values(dyesJSON);
      this.dyes = loadedDyes as Dye[];

      if (!Array.isArray(this.dyes) || this.dyes.length === 0) {
        throw new Error('Invalid dye database format');
      }

      // Build ID map for fast lookups
      this.dyesByIdMap.clear();
      for (const dye of this.dyes) {
        this.dyesByIdMap.set(dye.id, dye);
        if (dye.itemID) {
          this.dyesByIdMap.set(dye.itemID, dye);
        }
      }

      this.isLoaded = true;
      this.lastLoaded = Date.now();

      console.info(`✅ Dye database loaded: ${this.dyes.length} dyes`);
    } catch (error) {
      this.isLoaded = false;
      throw new AppError(
        ErrorCode.DATABASE_LOAD_FAILED,
        `Failed to load dye database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'critical'
      );
    }
  }

  // ============================================================================
  // Database Access
  // ============================================================================

  /**
   * Get all dyes
   */
  getAllDyes(): Dye[] {
    this.ensureLoaded();
    return [...this.dyes];
  }

  /**
   * Get dye by ID
   */
  getDyeById(id: number): Dye | null {
    this.ensureLoaded();
    return this.dyesByIdMap.get(id) || null;
  }

  /**
   * Get multiple dyes by IDs
   */
  getDyesByIds(ids: number[]): Dye[] {
    this.ensureLoaded();
    return ids.map((id) => this.dyesByIdMap.get(id)).filter((dye): dye is Dye => dye !== undefined);
  }

  /**
   * Check if database is loaded
   */
  isLoadedStatus(): boolean {
    return this.isLoaded;
  }

  /**
   * Get timestamp of last load
   */
  getLastLoadedTime(): number {
    return this.lastLoaded;
  }

  /**
   * Get total dye count
   */
  getDyeCount(): number {
    this.ensureLoaded();
    return this.dyes.length;
  }

  // ============================================================================
  // Search & Filter
  // ============================================================================

  /**
   * Search dyes by name (case-insensitive, partial match)
   */
  searchByName(query: string): Dye[] {
    this.ensureLoaded();
    const lowerQuery = query.toLowerCase().trim();

    if (lowerQuery.length === 0) {
      return [];
    }

    return this.dyes.filter((dye) => dye.name.toLowerCase().includes(lowerQuery));
  }

  /**
   * Search dyes by category
   */
  searchByCategory(category: string): Dye[] {
    this.ensureLoaded();
    const lowerCategory = category.toLowerCase();

    return this.dyes.filter((dye) => dye.category.toLowerCase() === lowerCategory);
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    this.ensureLoaded();
    const categories = new Set<string>();

    for (const dye of this.dyes) {
      categories.add(dye.category);
    }

    return Array.from(categories).sort();
  }

  /**
   * Filter dyes with optional exclusion list
   */
  filterDyes(
    filter: {
      category?: string;
      excludeIds?: number[];
      minPrice?: number;
      maxPrice?: number;
    } = {}
  ): Dye[] {
    this.ensureLoaded();
    let results = [...this.dyes];

    if (filter.category) {
      results = results.filter((dye) => dye.category === filter.category);
    }

    if (filter.excludeIds && filter.excludeIds.length > 0) {
      const excludeSet = new Set(filter.excludeIds);
      results = results.filter((dye) => !excludeSet.has(dye.id));
    }

    if (filter.minPrice !== undefined) {
      results = results.filter((dye) => dye.cost >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      results = results.filter((dye) => dye.cost <= filter.maxPrice!);
    }

    return results;
  }

  /**
   * Find closest dye to a given hex color
   */
  findClosestDye(hex: string, excludeIds: number[] = []): Dye | null {
    this.ensureLoaded();

    let closest: Dye | null = null;
    let minDistance = Infinity;

    const excludeSet = new Set(excludeIds);

    for (const dye of this.dyes) {
      if (excludeSet.has(dye.id)) {
        continue;
      }

      try {
        const distance = ColorService.getColorDistance(hex, dye.hex);

        if (distance < minDistance) {
          minDistance = distance;
          closest = dye;
        }
      } catch {
        // Skip invalid colors
        continue;
      }
    }

    return closest;
  }

  /**
   * Find dyes within a color distance threshold
   */
  findDyesWithinDistance(hex: string, maxDistance: number, limit?: number): Dye[] {
    this.ensureLoaded();
    const results: Array<{ dye: Dye; distance: number }> = [];

    for (const dye of this.dyes) {
      try {
        const distance = ColorService.getColorDistance(hex, dye.hex);

        if (distance <= maxDistance) {
          results.push({ dye, distance });
        }
      } catch {
        // Skip invalid colors
        continue;
      }
    }

    // Sort by distance ascending
    results.sort((a, b) => a.distance - b.distance);

    if (limit) {
      results.splice(limit);
    }

    return results.map((item) => item.dye);
  }

  /**
   * Get dyes sorted by brightness
   */
  getDyesSortedByBrightness(ascending: boolean = true): Dye[] {
    this.ensureLoaded();

    return [...this.dyes].sort((a, b) => {
      const brightnessA = a.hsv.v;
      const brightnessB = b.hsv.v;

      return ascending ? brightnessA - brightnessB : brightnessB - brightnessA;
    });
  }

  /**
   * Get dyes sorted by saturation
   */
  getDyesSortedBySaturation(ascending: boolean = true): Dye[] {
    this.ensureLoaded();

    return [...this.dyes].sort((a, b) => {
      const satA = a.hsv.s;
      const satB = b.hsv.s;

      return ascending ? satA - satB : satB - satA;
    });
  }

  /**
   * Get dyes sorted by hue
   */
  getDyesSortedByHue(ascending: boolean = true): Dye[] {
    this.ensureLoaded();

    return [...this.dyes].sort((a, b) => {
      const hueA = a.hsv.h;
      const hueB = b.hsv.h;

      return ascending ? hueA - hueB : hueB - hueA;
    });
  }

  // ============================================================================
  // Harmony & Palette Generation
  // ============================================================================

  /**
   * Find dyes that form a complementary color pair
   */
  findComplementaryPair(hex: string): Dye | null {
    this.ensureLoaded();

    const complementaryHex = ColorService.invert(hex);
    return this.findClosestDye(complementaryHex);
  }

  /**
   * Find analogous dyes (adjacent on color wheel)
   */
  findAnalogousDyes(hex: string, angle: number = 30): Dye[] {
    this.ensureLoaded();

    const baseDye = this.findClosestDye(hex);
    if (!baseDye) return [];

    const baseHue = baseDye.hsv.h;
    const results: Array<{ dye: Dye; hueDiff: number }> = [];

    for (const dye of this.dyes) {
      const hueDiff = Math.min(Math.abs(dye.hsv.h - baseHue), 360 - Math.abs(dye.hsv.h - baseHue));

      if (hueDiff >= angle - 15 && hueDiff <= angle + 15 && dye.id !== baseDye.id) {
        results.push({ dye, hueDiff });
      }
    }

    // Sort by hue difference
    results.sort((a, b) => a.hueDiff - b.hueDiff);

    return results.map((item) => item.dye);
  }

  /**
   * Find triadic color scheme (colors 120° apart on color wheel)
   */
  findTriadicDyes(hex: string): Dye[] {
    this.ensureLoaded();

    const baseDye = this.findClosestDye(hex);
    if (!baseDye) return [];

    const baseHue = baseDye.hsv.h;
    const secondHue = (baseHue + 120) % 360;
    const thirdHue = (baseHue + 240) % 360;

    const findByHueRange = (hue: number, tolerance: number = 30): Dye | null => {
      let closest: Dye | null = null;
      let minDiff = Infinity;

      for (const dye of this.dyes) {
        const diff = Math.min(Math.abs(dye.hsv.h - hue), 360 - Math.abs(dye.hsv.h - hue));

        if (diff <= tolerance && diff < minDiff) {
          minDiff = diff;
          closest = dye;
        }
      }

      return closest;
    };

    const results: Dye[] = [baseDye];
    const second = findByHueRange(secondHue);
    if (second) results.push(second);
    const third = findByHueRange(thirdHue);
    if (third) results.push(third);

    return results;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Ensure database is loaded, throw error if not
   */
  private ensureLoaded(): void {
    if (!this.isLoaded) {
      throw new AppError(ErrorCode.DATABASE_LOAD_FAILED, 'Dye database is not loaded', 'critical');
    }
  }

  /**
   * Reset the singleton instance
   */
  static reset(): void {
    DyeService.instance = null;
  }
}

/**
 * Convenience export of singleton instance
 */
export const dyeService = DyeService.getInstance();

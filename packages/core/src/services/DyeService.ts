/**
 * @xivdyetools/core - Dye Service
 *
 * FFXIV dye database management and search
 * Environment-agnostic (Node.js + Browser)
 *
 * @module services/DyeService
 */

import type { Dye } from '../types/index.js';
import { ErrorCode, AppError } from '../types/index.js';
import { ColorService } from './ColorService.js';

// ============================================================================
// Dye Service Class
// ============================================================================

/**
 * Service for managing FFXIV dye database
 * Loads, caches, and provides access to dye information
 *
 * @example
 * // Node.js
 * import { DyeService, dyeDatabase } from '@xivdyetools/core';
 * const dyeService = new DyeService(dyeDatabase);
 *
 * // Browser (Vite auto-imports JSON)
 * import { DyeService, dyeDatabase } from '@xivdyetools/core';
 * const dyeService = new DyeService(dyeDatabase);
 */
export class DyeService {
  private dyes: Dye[] = [];
  private dyesByIdMap: Map<number, Dye> = new Map();
  private isLoaded: boolean = false;
  private lastLoaded: number = 0;

  /**
   * Initialize the dye database
   * @param dyeData - Array of dyes or JSON object with dye array
   */
  constructor(dyeData?: unknown) {
    if (dyeData) {
      this.initialize(dyeData);
    }
  }

  /**
   * Initialize dye database from data
   */
  private initialize(dyeData: unknown): void {
    try {
      // Support both array and object formats
      const loadedDyes = Array.isArray(dyeData) ? dyeData : Object.values(dyeData as object);

      if (!Array.isArray(loadedDyes) || loadedDyes.length === 0) {
        throw new Error('Invalid dye database format');
      }

      // Normalize dyes: map itemID to id if needed
      this.dyes = loadedDyes.map((dye: unknown) => {
        const normalizedDye = dye as Record<string, unknown>;

        // If the dye has itemID but no id, use itemID as the id
        if (normalizedDye.itemID && !normalizedDye.id) {
          normalizedDye.id = normalizedDye.itemID;
        }

        return normalizedDye as unknown as Dye;
      });

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
   * Get all dyes (defensive copy)
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

      // Exclude Facewear dyes from results
      if (dye.category === 'Facewear') {
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
        // Exclude Facewear dyes from recommendations
        if (dye.category === 'Facewear') {
          continue;
        }

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
    return this.findHarmonyDyesByOffsets(hex, [120, 240]);
  }

  /**
   * Find square color scheme (colors 90° apart on color wheel)
   */
  findSquareDyes(hex: string): Dye[] {
    return this.findHarmonyDyesByOffsets(hex, [90, 180, 270]);
  }

  /**
   * Find tetradic color scheme (two complementary pairs)
   */
  findTetradicDyes(hex: string): Dye[] {
    // Two adjacent hues + their complements (e.g., base+60 and base+240)
    return this.findHarmonyDyesByOffsets(hex, [60, 180, 240]);
  }

  /**
   * Find monochromatic dyes (same hue, varying saturation/brightness)
   */
  findMonochromaticDyes(hex: string, limit: number = 6): Dye[] {
    this.ensureLoaded();

    const baseDye = this.findClosestDye(hex);
    if (!baseDye) return [];

    const baseHue = baseDye.hsv.h;
    const results: Array<{ dye: Dye; satValDiff: number }> = [];

    // Find dyes with similar hue but different saturation/value
    for (const dye of this.dyes) {
      const hueDiff = Math.min(Math.abs(dye.hsv.h - baseHue), 360 - Math.abs(dye.hsv.h - baseHue));

      // Hue must be very close (within ±15°)
      if (hueDiff <= 15 && dye.id !== baseDye.id) {
        // Calculate difference in saturation and value
        const satDiff = Math.abs(dye.hsv.s - baseDye.hsv.s);
        const valDiff = Math.abs(dye.hsv.v - baseDye.hsv.v);
        const satValDiff = satDiff + valDiff;

        results.push({ dye, satValDiff });
      }
    }

    // Sort by saturation/value difference (prefer more variety)
    results.sort((a, b) => b.satValDiff - a.satValDiff);

    return results.slice(0, limit).map((item) => item.dye);
  }

  /**
   * Find compound harmony (analogous + complementary)
   */
  findCompoundDyes(hex: string): Dye[] {
    // ±30° from base + complement
    return this.findHarmonyDyesByOffsets(hex, [30, -30, 180], { tolerance: 35 });
  }

  /**
   * Find split-complementary harmony (±30° from the complementary hue)
   */
  findSplitComplementaryDyes(hex: string): Dye[] {
    return this.findHarmonyDyesByOffsets(hex, [150, 210]);
  }

  /**
   * Find shades (similar tones, ±15°)
   */
  findShadesDyes(hex: string): Dye[] {
    this.ensureLoaded();

    return this.findAnalogousDyes(hex, 15);
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
   * Generic helper for hue-based harmonies
   */
  private findHarmonyDyesByOffsets(
    hex: string,
    offsets: number[],
    options: { tolerance?: number } = {}
  ): Dye[] {
    this.ensureLoaded();

    const baseDye = this.findClosestDye(hex);
    if (!baseDye) return [];

    const usedDyeIds = new Set<number>([baseDye.id]);
    const results: Dye[] = [];
    const baseHue = baseDye.hsv.h;
    const tolerance = options.tolerance ?? 45;

    for (const offset of offsets) {
      const targetHue = (baseHue + offset + 360) % 360;
      const match = this.findClosestDyeByHue(targetHue, usedDyeIds, tolerance);
      if (match) {
        results.push(match);
        usedDyeIds.add(match.id);
      }
    }

    return results;
  }

  /**
   * Find closest dye by hue difference with graceful fallback
   */
  private findClosestDyeByHue(
    targetHue: number,
    usedIds: Set<number>,
    tolerance: number
  ): Dye | null {
    let withinTolerance: { dye: Dye; diff: number } | null = null;
    let bestOverall: { dye: Dye; diff: number } | null = null;

    for (const dye of this.dyes) {
      if (usedIds.has(dye.id) || dye.category === 'Facewear') {
        continue;
      }

      const diff = Math.min(Math.abs(dye.hsv.h - targetHue), 360 - Math.abs(dye.hsv.h - targetHue));

      if (!bestOverall || diff < bestOverall.diff) {
        bestOverall = { dye, diff };
      }

      if (diff <= tolerance) {
        if (!withinTolerance || diff < withinTolerance.diff) {
          withinTolerance = { dye, diff };
        }
      }
    }

    return withinTolerance?.dye ?? bestOverall?.dye ?? null;
  }
}

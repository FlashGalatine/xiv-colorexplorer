/**
 * XIV Dye Tools v3.0.0 - Feature Flag Service
 *
 * Manages the v2/v3 UI toggle with LocalStorage persistence.
 * Enables gradual rollout of the new two-panel layout.
 *
 * @module services/feature-flag-service
 */

import { appStorage } from './storage-service';
import { logger } from '@shared/logger';

// ============================================================================
// Types
// ============================================================================

export type UIVersion = 'v2' | 'v3';

export interface FeatureFlagState {
  uiVersion: UIVersion;
  hasSeenV3Prompt: boolean;
  v3OptInDate: string | null;
}

type FeatureFlagListener = (state: FeatureFlagState) => void;

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'xivdyetools_feature_flags';
const URL_PARAM = 'ui';

const DEFAULT_STATE: FeatureFlagState = {
  uiVersion: 'v2',
  hasSeenV3Prompt: false,
  v3OptInDate: null,
};

// ============================================================================
// Feature Flag Service
// ============================================================================

/**
 * Feature flag service for managing the v2/v3 UI transition
 *
 * Usage:
 * ```typescript
 * // Check current UI version
 * if (FeatureFlagService.getUIVersion() === 'v3') {
 *   loadV3Layout();
 * }
 *
 * // Switch to v3
 * FeatureFlagService.setUIVersion('v3');
 *
 * // Subscribe to changes
 * FeatureFlagService.subscribe((state) => {
 *   console.log('UI version changed to:', state.uiVersion);
 * });
 * ```
 */
export class FeatureFlagService {
  private static state: FeatureFlagState = DEFAULT_STATE;
  private static listeners: Set<FeatureFlagListener> = new Set();
  private static initialized = false;

  /**
   * Initialize the feature flag service
   * Loads persisted state and checks for URL override
   */
  static initialize(): void {
    if (this.initialized) return;

    // Load persisted state
    const stored = appStorage.getItem<FeatureFlagState>(STORAGE_KEY, DEFAULT_STATE);
    this.state = { ...DEFAULT_STATE, ...stored };

    // Check for URL parameter override (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlOverride = urlParams.get(URL_PARAM) as UIVersion | null;
    if (urlOverride === 'v2' || urlOverride === 'v3') {
      logger.info(`[FeatureFlagService] URL override detected: ui=${urlOverride}`);
      // Don't persist URL overrides, just use for this session
      this.state.uiVersion = urlOverride;
    }

    this.initialized = true;
    logger.info(`[FeatureFlagService] Initialized with UI version: ${this.state.uiVersion}`);
  }

  /**
   * Get the current UI version
   */
  static getUIVersion(): UIVersion {
    if (!this.initialized) this.initialize();
    return this.state.uiVersion;
  }

  /**
   * Set the UI version
   * @param version - 'v2' or 'v3'
   * @param persist - Whether to save to LocalStorage (default: true)
   */
  static setUIVersion(version: UIVersion, persist = true): void {
    if (!this.initialized) this.initialize();

    const previousVersion = this.state.uiVersion;
    this.state.uiVersion = version;

    // Track opt-in date for v3
    if (version === 'v3' && previousVersion === 'v2') {
      this.state.v3OptInDate = new Date().toISOString();
      logger.info('[FeatureFlagService] User opted into v3 UI');
    }

    if (persist) {
      this.persistState();
    }

    this.notifyListeners();
  }

  /**
   * Check if the user is using the v3 UI
   */
  static isV3(): boolean {
    return this.getUIVersion() === 'v3';
  }

  /**
   * Check if the user is using the v2 UI
   */
  static isV2(): boolean {
    return this.getUIVersion() === 'v2';
  }

  /**
   * Mark that the user has seen the v3 prompt
   * (Used to prevent showing the floating badge repeatedly)
   */
  static markV3PromptSeen(): void {
    if (!this.initialized) this.initialize();
    this.state.hasSeenV3Prompt = true;
    this.persistState();
  }

  /**
   * Check if user has seen the v3 prompt
   */
  static hasSeenV3Prompt(): boolean {
    if (!this.initialized) this.initialize();
    return this.state.hasSeenV3Prompt;
  }

  /**
   * Reset the v3 prompt seen state
   * (For showing the badge again in a new session)
   */
  static resetV3PromptSeen(): void {
    if (!this.initialized) this.initialize();
    this.state.hasSeenV3Prompt = false;
    this.persistState();
  }

  /**
   * Get the full feature flag state
   */
  static getState(): Readonly<FeatureFlagState> {
    if (!this.initialized) this.initialize();
    return { ...this.state };
  }

  /**
   * Subscribe to feature flag changes
   * @returns Unsubscribe function
   */
  static subscribe(listener: FeatureFlagListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Generate a URL with the UI version parameter
   * Useful for sharing links that force a specific UI version
   */
  static getURLWithVersion(version: UIVersion): string {
    const url = new URL(window.location.href);
    url.searchParams.set(URL_PARAM, version);
    return url.toString();
  }

  /**
   * Remove the UI version parameter from the current URL
   * (For cleaning up after testing)
   */
  static clearURLParam(): void {
    const url = new URL(window.location.href);
    if (url.searchParams.has(URL_PARAM)) {
      url.searchParams.delete(URL_PARAM);
      window.history.replaceState({}, '', url.toString());
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private static persistState(): void {
    appStorage.setItem(STORAGE_KEY, this.state);
  }

  private static notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        logger.error('[FeatureFlagService] Listener error:', error);
      }
    });
  }
}

// Auto-initialize on module load
FeatureFlagService.initialize();

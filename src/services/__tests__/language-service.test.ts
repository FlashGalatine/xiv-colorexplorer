/**
 * XIV Dye Tools - Language Service Tests
 *
 * Comprehensive tests for multi-language support service
 * Covers locale management, translations, and utility methods
 *
 * @module services/__tests__/language-service.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LanguageService } from '../language-service';
import { StorageService } from '../storage-service';
import { STORAGE_KEYS, DEFAULT_LOCALE, LOCALE_DISPLAY_INFO } from '@shared/constants';
import type { LocaleCode } from '@shared/i18n-types';

describe('LanguageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Locale Management
  // ==========================================================================

  describe('getCurrentLocale', () => {
    it('should return current locale code', () => {
      const locale = LanguageService.getCurrentLocale();

      expect(typeof locale).toBe('string');
      expect(locale.length).toBe(2);
    });
  });

  describe('getCurrentLocaleDisplay', () => {
    it('should return locale display info', () => {
      const display = LanguageService.getCurrentLocaleDisplay();

      expect(display).toHaveProperty('code');
      expect(display).toHaveProperty('name');
      expect(display).toHaveProperty('flag');
      expect(display).toHaveProperty('englishName');
    });

    it('should return display info matching current locale', () => {
      const currentLocale = LanguageService.getCurrentLocale();
      const display = LanguageService.getCurrentLocaleDisplay();

      expect(display.code).toBe(currentLocale);
    });
  });

  describe('setLocale', () => {
    it('should change the current locale', async () => {
      const originalLocale = LanguageService.getCurrentLocale();
      const newLocale = originalLocale === 'en' ? 'ja' : 'en';

      await LanguageService.setLocale(newLocale);

      expect(LanguageService.getCurrentLocale()).toBe(newLocale);

      // Restore
      await LanguageService.setLocale(originalLocale);
    });

    it('should save locale to storage', async () => {
      const originalLocale = LanguageService.getCurrentLocale();

      await LanguageService.setLocale('fr');

      const saved = StorageService.getItem<LocaleCode>(STORAGE_KEYS.LOCALE);
      expect(saved).toBe('fr');

      // Restore
      await LanguageService.setLocale(originalLocale);
    });

    it('should notify all subscribers', async () => {
      const originalLocale = LanguageService.getCurrentLocale();
      const listener = vi.fn();
      const unsubscribe = LanguageService.subscribe(listener);

      const newLocale = originalLocale === 'ko' ? 'en' : 'ko';
      await LanguageService.setLocale(newLocale);

      expect(listener).toHaveBeenCalledWith(newLocale);

      unsubscribe();
      await LanguageService.setLocale(originalLocale);
    });

    it('should fall back to default for invalid locale', async () => {
      const originalLocale = LanguageService.getCurrentLocale();

      await LanguageService.setLocale('invalid' as LocaleCode);

      expect(LanguageService.getCurrentLocale()).toBe(DEFAULT_LOCALE);

      // Restore if different
      if (originalLocale !== DEFAULT_LOCALE) {
        await LanguageService.setLocale(originalLocale);
      }
    });

    it('should handle listener errors gracefully', async () => {
      const originalLocale = LanguageService.getCurrentLocale();
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const unsubscribe = LanguageService.subscribe(errorListener);

      const newLocale = originalLocale === 'de' ? 'en' : 'de';
      // Should not throw
      await expect(LanguageService.setLocale(newLocale)).resolves.not.toThrow();

      unsubscribe();
      await LanguageService.setLocale(originalLocale);
    });
  });

  // ==========================================================================
  // Subscription
  // ==========================================================================

  describe('subscribe', () => {
    it('should add listener and return unsubscribe function', async () => {
      const originalLocale = LanguageService.getCurrentLocale();
      const listener = vi.fn();
      const unsubscribe = LanguageService.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');

      const newLocale = originalLocale === 'ja' ? 'en' : 'ja';
      await LanguageService.setLocale(newLocale);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      await LanguageService.setLocale(originalLocale);
    });

    it('should remove listener when unsubscribe is called', async () => {
      const originalLocale = LanguageService.getCurrentLocale();
      const listener = vi.fn();
      const unsubscribe = LanguageService.subscribe(listener);

      const locale1 = originalLocale === 'ja' ? 'en' : 'ja';
      await LanguageService.setLocale(locale1);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      const locale2 = locale1 === 'de' ? 'en' : 'de';
      await LanguageService.setLocale(locale2);
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again

      await LanguageService.setLocale(originalLocale);
    });

    it('should support multiple subscribers', async () => {
      const originalLocale = LanguageService.getCurrentLocale();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsub1 = LanguageService.subscribe(listener1);
      const unsub2 = LanguageService.subscribe(listener2);

      const newLocale = originalLocale === 'fr' ? 'en' : 'fr';
      await LanguageService.setLocale(newLocale);

      expect(listener1).toHaveBeenCalledWith(newLocale);
      expect(listener2).toHaveBeenCalledWith(newLocale);

      unsub1();
      unsub2();
      await LanguageService.setLocale(originalLocale);
    });
  });

  // ==========================================================================
  // Translation Methods
  // ==========================================================================

  describe('t (translation)', () => {
    it('should return key if translation not found', () => {
      const result = LanguageService.t('non.existent.key.xyz123');
      expect(result).toBe('non.existent.key.xyz123');
    });
  });

  describe('tInterpolate', () => {
    it('should return key with placeholders replaced if translation not found', () => {
      const result = LanguageService.tInterpolate('test.key.xyz123', { name: 'Test' });
      // Since key doesn't exist, returns the key itself
      expect(result).toBe('test.key.xyz123');
    });
  });

  // ==========================================================================
  // Core Library Proxy Methods
  // ==========================================================================

  describe('getDyeName', () => {
    it('should return dye name or null for non-existent ID', () => {
      // Test with a known non-existent ID
      const result = LanguageService.getDyeName(999999);
      expect(result).toBeNull();
    });

    it('should return localized name for valid dye ID', () => {
      // Jet Black has itemID 30116
      const result = LanguageService.getDyeName(30116);
      expect(typeof result).toBe('string');
    });
  });

  describe('getCategory', () => {
    it('should return localized category', () => {
      const result = LanguageService.getCategory('Red');
      expect(typeof result).toBe('string');
    });
  });

  describe('getAcquisition', () => {
    it('should return localized acquisition', () => {
      const result = LanguageService.getAcquisition('Weaver');
      expect(typeof result).toBe('string');
    });
  });

  describe('getHarmonyType', () => {
    it('should return localized harmony type', () => {
      const result = LanguageService.getHarmonyType('complementary');
      expect(typeof result).toBe('string');
    });
  });

  describe('getVisionType', () => {
    it('should return localized vision type', () => {
      const result = LanguageService.getVisionType('protanopia');
      expect(typeof result).toBe('string');
    });
  });

  describe('getLabel', () => {
    it('should return localized label', () => {
      const result = LanguageService.getLabel('category');
      expect(typeof result).toBe('string');
    });
  });

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  describe('getAvailableLocales', () => {
    it('should return all available locale display info', () => {
      const locales = LanguageService.getAvailableLocales();

      expect(locales).toBe(LOCALE_DISPLAY_INFO);
      expect(locales.length).toBe(6); // en, ja, de, fr, ko, zh
    });
  });

  describe('isValidLocale', () => {
    it('should return true for valid locales', () => {
      expect(LanguageService.isValidLocale('en')).toBe(true);
      expect(LanguageService.isValidLocale('ja')).toBe(true);
      expect(LanguageService.isValidLocale('de')).toBe(true);
      expect(LanguageService.isValidLocale('fr')).toBe(true);
      expect(LanguageService.isValidLocale('ko')).toBe(true);
      expect(LanguageService.isValidLocale('zh')).toBe(true);
    });

    it('should return false for invalid locales', () => {
      expect(LanguageService.isValidLocale('invalid')).toBe(false);
      expect(LanguageService.isValidLocale('')).toBe(false);
      expect(LanguageService.isValidLocale(null)).toBe(false);
      expect(LanguageService.isValidLocale(undefined)).toBe(false);
      expect(LanguageService.isValidLocale(123)).toBe(false);
    });
  });

  describe('preloadLocales', () => {
    it('should preload multiple locales without error', async () => {
      // Should not throw
      await expect(LanguageService.preloadLocales(['ja', 'de'])).resolves.not.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(LanguageService.preloadLocales([])).resolves.not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear cached translations without error', () => {
      LanguageService.clearCache();
      // No error thrown
      expect(true).toBe(true);
    });
  });

  describe('isReady', () => {
    it('should return boolean indicating initialization state', () => {
      const ready = LanguageService.isReady();
      expect(typeof ready).toBe('boolean');
    });
  });
});

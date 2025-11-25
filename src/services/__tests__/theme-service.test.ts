/**
 * XIV Dye Tools - Theme Service Integration Tests
 * Tests for 10-theme system, persistence, and DOM integration
 */

import type { ThemeName } from '@shared/types';
import { ThemeService } from '../theme-service';
import { StorageService } from '../storage-service';

describe('ThemeService Integration', () => {
  beforeEach(() => {
    // Clear storage before each test
    if (StorageService.isAvailable()) {
      StorageService.clear();
    }
    // Reset theme to default
    ThemeService.resetToDefault();
  });

  afterEach(() => {
    if (StorageService.isAvailable()) {
      StorageService.clear();
    }
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    it('should initialize with default theme', () => {
      const theme = ThemeService.getCurrentTheme();
      expect(theme).toBeDefined();
      expect(typeof theme).toBe('string');
    });

    it('should load saved theme from storage', () => {
      ThemeService.setTheme('standard-dark');
      const current = ThemeService.getCurrentTheme();
      expect(current).toBe('standard-dark');
    });

    it('should have a valid theme object', () => {
      const themeObj = ThemeService.getCurrentThemeObject();
      expect(themeObj).toBeDefined();
      expect(themeObj.name).toBeDefined();
      expect(themeObj.palette).toBeDefined();
      expect(themeObj.isDark).toBeDefined();
    });
  });

  // ============================================================================
  // Theme Selection Tests
  // ============================================================================

  describe('Theme Selection', () => {
    it('should support all 9 theme variants', () => {
      const themes = ThemeService.getAllThemes();
      expect(themes.length).toBe(9);
    });

    it('should switch between light and dark themes', () => {
      const lightTheme = 'standard-light';
      const darkTheme = 'standard-dark';

      ThemeService.setTheme(lightTheme as ThemeName);
      expect(ThemeService.getCurrentTheme()).toBe(lightTheme);

      ThemeService.setTheme(darkTheme as ThemeName);
      expect(ThemeService.getCurrentTheme()).toBe(darkTheme);
    });

    it('should toggle dark mode', () => {
      ThemeService.setTheme('standard-light' as ThemeName);
      ThemeService.toggleDarkMode();

      expect(ThemeService.getCurrentTheme()).toBe('standard-dark');

      ThemeService.toggleDarkMode();
      expect(ThemeService.getCurrentTheme()).toBe('standard-light');
    });

    it('should validate theme names', () => {
      expect(() => {
        ThemeService.setTheme('invalid-theme' as ThemeName);
      }).toThrow();
    });

    it('should reset to default theme', () => {
      ThemeService.setTheme('sugar-riot' as ThemeName);
      ThemeService.resetToDefault();

      const theme = ThemeService.getCurrentTheme();
      expect(theme).toBeDefined();
    });
  });

  // ============================================================================
  // Theme Variants Tests
  // ============================================================================

  describe('Theme Variants', () => {
    it('should get light variant of a theme', () => {
      const light = ThemeService.getLightVariant('standard-dark');
      expect(light).toBe('standard-light');
    });

    it('should get dark variant of a theme', () => {
      const dark = ThemeService.getDarkVariant('standard-light');
      expect(dark).toBe('standard-dark');
    });

    it('should get theme variants by base name', () => {
      const variants = ThemeService.getThemeVariants('standard');
      expect(variants.length).toBe(2); // light and dark
      expect(variants).toContain('standard-light');
      expect(variants).toContain('standard-dark');
    });

    it('should identify dark mode correctly', () => {
      ThemeService.setTheme('cotton-candy' as ThemeName);
      expect(ThemeService.isDarkMode()).toBe(false);

      ThemeService.setTheme('sugar-riot' as ThemeName);
      expect(ThemeService.isDarkMode()).toBe(true);
    });
  });

  // ============================================================================
  // Palette and Colors Tests
  // ============================================================================

  describe('Theme Palettes and Colors', () => {
    it('should provide complete palette with all required colors', () => {
      const theme = ThemeService.getCurrentThemeObject();
      const palette = theme.palette;

      expect(palette.primary).toBeDefined();
      expect(palette.background).toBeDefined();
      expect(palette.text).toBeDefined();
      expect(palette.border).toBeDefined();
      expect(palette.backgroundSecondary).toBeDefined();
      expect(palette.cardBackground).toBeDefined();
      expect(palette.textMuted).toBeDefined();
    });

    it('should get color from current theme palette', () => {
      ThemeService.setTheme('og-classic-dark' as ThemeName);

      const primary = ThemeService.getColor('primary');
      expect(primary).toBeDefined();
      expect(primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should have valid hex colors in all palettes', () => {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      const themes = ThemeService.getAllThemes();

      themes.forEach((theme) => {
        Object.values(theme.palette).forEach((color) => {
          expect(color).toMatch(hexPattern);
        });
      });
    });

    it('should distinguish light and dark theme backgrounds', () => {
      // Light theme backgrounds should be lighter than dark
      ThemeService.setTheme('standard-light' as ThemeName);
      const lightBg = ThemeService.getColor('background');

      ThemeService.setTheme('standard-dark' as ThemeName);
      const darkBg = ThemeService.getColor('background');

      expect(lightBg).not.toBe(darkBg);
    });
  });

  // ============================================================================
  // Persistence Tests
  // ============================================================================

  describe('Theme Persistence', () => {
    it('should persist theme selection in storage', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      // Clear storage first to get clean state
      StorageService.clear();

      ThemeService.setTheme('parchment-light' as ThemeName);
      // appStorage uses double prefix (xivdyetools_xivdyetools_theme)
      const saved = StorageService.getItem('xivdyetools_xivdyetools_theme');
      expect(saved).toBe('parchment-light');
    });

    it('should maintain theme selection across calls', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.clear();

      ThemeService.setTheme('standard-dark' as ThemeName);
      const current = ThemeService.getCurrentTheme();
      expect(current).toBe('standard-dark');
    });

    it('should fall back to default if storage is invalid', () => {
      if (!StorageService.isAvailable()) {
        expect(true).toBe(true);
        return;
      }

      StorageService.clear();
      // Use correct double-prefix key for appStorage
      StorageService.setItem('xivdyetools_xivdyetools_theme', 'invalid-theme');
      ThemeService.initialize();

      const current = ThemeService.getCurrentTheme();
      expect(current).toBeDefined();
    });
  });

  // ============================================================================
  // Subscription/Observer Tests
  // ============================================================================

  describe('Theme Change Subscriptions', () => {
    it('should notify subscribers when theme changes', () => {
      let notifiedTheme: string | null = null;

      const unsubscribe = ThemeService.subscribe((theme) => {
        notifiedTheme = theme;
      });

      ThemeService.setTheme('cotton-candy' as ThemeName);
      expect(notifiedTheme).toBe('cotton-candy');

      unsubscribe();
    });

    it('should allow multiple subscribers', () => {
      const themes1: string[] = [];
      const themes2: string[] = [];

      const unsub1 = ThemeService.subscribe((t) => themes1.push(t));
      const unsub2 = ThemeService.subscribe((t) => themes2.push(t));

      ThemeService.setTheme('og-classic-dark' as ThemeName);

      expect(themes1.length).toBeGreaterThan(0);
      expect(themes2.length).toBeGreaterThan(0);

      unsub1();
      unsub2();
    });

    it('should unsubscribe properly', () => {
      let callCount = 0;

      const unsubscribe = ThemeService.subscribe(() => {
        callCount++;
      });

      ThemeService.setTheme('standard-light' as ThemeName);
      const firstCount = callCount;

      unsubscribe();
      ThemeService.setTheme('standard-dark' as ThemeName);

      expect(callCount).toBe(firstCount);
    });
  });

  // ============================================================================
  // DOM Integration Tests
  // ============================================================================

  describe('DOM Integration', () => {
    it('should apply theme class to document element', () => {
      if (typeof document === 'undefined') {
        expect(true).toBe(true);
        return;
      }

      ThemeService.setTheme('hydaelyn-light' as ThemeName);
      const root = document.documentElement;

      expect(root.classList.contains('theme-hydaelyn-light')).toBe(true);
    });

    it('should set CSS custom properties', () => {
      if (typeof document === 'undefined') {
        expect(true).toBe(true);
        return;
      }

      ThemeService.setTheme('sugar-riot' as ThemeName);
      const root = document.documentElement;

      const primaryColor = root.style.getPropertyValue('--theme-primary');
      expect(primaryColor.length).toBeGreaterThan(0);
    });

    it('should remove old theme classes when switching', () => {
      if (typeof document === 'undefined') {
        expect(true).toBe(true);
        return;
      }

      ThemeService.setTheme('og-classic-dark' as ThemeName);
      const root = document.documentElement;

      ThemeService.setTheme('sugar-riot' as ThemeName);

      expect(root.classList.contains('theme-og-classic-dark')).toBe(false);
      expect(root.classList.contains('theme-sugar-riot')).toBe(true);
    });
  });

  // ============================================================================
  // All Themes Coverage Tests
  // ============================================================================

  describe('All 9 Theme Coverage', () => {
    const expectedThemes = [
      'standard-light',
      'standard-dark',
      'hydaelyn-light',
      'og-classic-dark',
      'parchment-light',
      'cotton-candy',
      'sugar-riot',
      'grayscale-light',
      'grayscale-dark',
    ];

    expectedThemes.forEach((themeName) => {
      it(`should support ${themeName} theme`, () => {
        expect(() => {
          ThemeService.setTheme(themeName as ThemeName);
        }).not.toThrow();

        expect(ThemeService.getCurrentTheme()).toBe(themeName);
      });

      it(`should provide valid palette for ${themeName}`, () => {
        ThemeService.setTheme(themeName as ThemeName);
        const theme = ThemeService.getCurrentThemeObject();

        expect(theme.palette.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.palette.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});

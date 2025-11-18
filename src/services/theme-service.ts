/**
 * XIV Dye Tools v2.0.0 - Theme Service
 *
 * Phase 12: Architecture Refactor
 * 10-theme system management
 *
 * @module services/theme-service
 */

import type { Theme, ThemeName, ThemePalette } from '@shared/types';
import { ErrorCode, AppError } from '@shared/types';
import { THEME_NAMES, DEFAULT_THEME, STORAGE_KEYS } from '@shared/constants';
import { appStorage } from './storage-service';

// ============================================================================
// Theme Definitions
// ============================================================================

const THEME_PALETTES: Record<ThemeName, ThemePalette> = {
  'standard-light': {
    primary: '#781A1A',
    background: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
    backgroundSecondary: '#F3F4F6',
    cardBackground: '#FFFFFF',
    cardHover: '#F3F4F6',
    textMuted: '#6B7280',
  },
  'standard-dark': {
    primary: '#C99156',
    background: '#120A0A',
    text: '#F3F4F6',
    border: '#4A2C17',
    backgroundSecondary: '#1F1010',
    cardBackground: '#321919',
    cardHover: '#412121',
    textMuted: '#D6B898',
  },
  'hydaelyn-light': {
    primary: '#0EA5E9',
    background: '#F0F9FF',
    text: '#1F2937',
    border: '#E0F2FE',
    backgroundSecondary: '#E0F2FE',
    cardBackground: '#FFFFFF',
    cardHover: '#E0F2FE',
    textMuted: '#0C4A6E',
  },
  'hydaelyn-dark': {
    primary: '#38BDF8',
    background: '#0C2D47',
    text: '#E0F2FE',
    border: '#164E63',
    backgroundSecondary: '#164E63',
    cardBackground: '#0C2D47',
    cardHover: '#164E63',
    textMuted: '#7DD3FC',
  },
  'classic-light': {
    primary: '#1E40AF',
    background: '#EFF6FF',
    text: '#1F2937',
    border: '#DBEAFE',
    backgroundSecondary: '#DBEAFE',
    cardBackground: '#FFFFFF',
    cardHover: '#DBEAFE',
    textMuted: '#1E40AF',
  },
  'classic-dark': {
    primary: '#60A5FA',
    background: '#1E3A8A',
    text: '#DBEAFE',
    border: '#1E40AF',
    backgroundSecondary: '#1E40AF',
    cardBackground: '#1E3A8A',
    cardHover: '#1E40AF',
    textMuted: '#93C5FD',
  },
  'parchment-light': {
    primary: '#D97706',
    background: '#FEF3C7',
    text: '#78350F',
    border: '#FCD34D',
    backgroundSecondary: '#FEF9E7',
    cardBackground: '#FEF3C7',
    cardHover: '#FEF9E7',
    textMuted: '#92400E',
  },
  'parchment-dark': {
    primary: '#FBBF24',
    background: '#78350F',
    text: '#FEF3C7',
    border: '#D97706',
    backgroundSecondary: '#92400E',
    cardBackground: '#78350F',
    cardHover: '#92400E',
    textMuted: '#FCD34D',
  },
  'sugar-riot-light': {
    primary: '#EC4899',
    background: '#FFFFFF',
    text: '#831843',
    border: '#FBCFE8',
    backgroundSecondary: '#FDF2F8',
    cardBackground: '#FFFFFF',
    cardHover: '#FDF2F8',
    textMuted: '#9F1239',
  },
  'sugar-riot-dark': {
    primary: '#F472B6',
    background: '#500724',
    text: '#FDF2F8',
    border: '#EC4899',
    backgroundSecondary: '#831843',
    cardBackground: '#500724',
    cardHover: '#831843',
    textMuted: '#F9A8D4',
  },
  'grayscale-light': {
    primary: '#404040',
    background: '#FFFFFF',
    text: '#000000',
    border: '#D1D5DB',
    backgroundSecondary: '#F3F4F6',
    cardBackground: '#FFFFFF',
    cardHover: '#F3F4F6',
    textMuted: '#6B7280',
  },
  'grayscale-dark': {
    primary: '#6B7280',
    background: '#111827',
    text: '#F3F4F6',
    border: '#374151',
    backgroundSecondary: '#1F2937',
    cardBackground: '#111827',
    cardHover: '#1F2937',
    textMuted: '#9CA3AF',
  },
};

// ============================================================================
// Theme Service Class
// ============================================================================

/**
 * Service for managing theme system
 * Handles loading, saving, and applying themes
 */
export class ThemeService {
  private static currentTheme: ThemeName = DEFAULT_THEME;
  private static listeners: Set<(theme: ThemeName) => void> = new Set();

  /**
   * Initialize theme service
   */
  static initialize(): void {
    const saved = appStorage.getItem<ThemeName>(STORAGE_KEYS.THEME);
    if (saved && this.isValidThemeName(saved)) {
      this.currentTheme = saved;
    } else {
      this.currentTheme = DEFAULT_THEME;
    }

    this.applyTheme(this.currentTheme);
    console.info(`✅ Theme service initialized: ${this.currentTheme}`);
  }

  /**
   * Get the current theme
   */
  static getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  /**
   * Get theme object with palette
   */
  static getTheme(name: ThemeName): Theme {
    if (!this.isValidThemeName(name)) {
      throw new AppError(ErrorCode.INVALID_THEME, `Invalid theme name: ${name}`, 'error');
    }

    const isDark = name.endsWith('-dark');
    return {
      name,
      palette: THEME_PALETTES[name],
      isDark,
    };
  }

  /**
   * Get the current theme object
   */
  static getCurrentThemeObject(): Theme {
    return this.getTheme(this.currentTheme);
  }

  /**
   * Get all available themes
   */
  static getAllThemes(): Theme[] {
    return THEME_NAMES.map((name) => this.getTheme(name));
  }

  /**
   * Set the current theme
   */
  static setTheme(themeName: ThemeName): void {
    if (!this.isValidThemeName(themeName)) {
      throw new AppError(ErrorCode.INVALID_THEME, `Invalid theme name: ${themeName}`, 'error');
    }

    this.currentTheme = themeName;
    this.applyTheme(themeName);
    appStorage.setItem(STORAGE_KEYS.THEME, themeName);

    // Notify listeners
    this.listeners.forEach((listener) => listener(themeName));

    console.info(`✅ Theme changed to: ${themeName}`);
  }

  /**
   * Toggle between light and dark variants of the current theme
   */
  static toggleDarkMode(): void {
    const isCurrentlyDark = this.currentTheme.endsWith('-dark');
    const baseName = this.currentTheme.replace(/-dark$|(-light)$/, '');
    const newTheme = (isCurrentlyDark ? `${baseName}-light` : `${baseName}-dark`) as ThemeName;

    this.setTheme(newTheme);
  }

  /**
   * Apply theme to document
   */
  private static applyTheme(themeName: ThemeName): void {
    const theme = this.getTheme(themeName);
    const root = document.documentElement;

    // Remove all theme classes
    THEME_NAMES.forEach((name) => {
      root.classList.remove(`theme-${name}`);
    });

    // Add current theme class
    root.classList.add(`theme-${themeName}`);

    // Set CSS custom properties
    const palette = theme.palette;
    const style = root.style;

    style.setProperty('--theme-primary', palette.primary);
    style.setProperty('--theme-background', palette.background);
    style.setProperty('--theme-text', palette.text);
    style.setProperty('--theme-border', palette.border);
    style.setProperty('--theme-background-secondary', palette.backgroundSecondary);
    style.setProperty('--theme-card-background', palette.cardBackground);
    style.setProperty('--theme-card-hover', palette.cardHover);
    style.setProperty('--theme-text-muted', palette.textMuted);
  }

  /**
   * Check if a theme name is valid
   */
  private static isValidThemeName(name: unknown): name is ThemeName {
    return typeof name === 'string' && THEME_NAMES.includes(name as ThemeName);
  }

  /**
   * Get color from current theme palette
   */
  static getColor(key: keyof ThemePalette): string {
    const palette = THEME_PALETTES[this.currentTheme];
    return palette[key];
  }

  /**
   * Check if current theme is dark
   */
  static isDarkMode(): boolean {
    return this.currentTheme.endsWith('-dark');
  }

  /**
   * Get the light variant of a theme
   */
  static getLightVariant(themeName: ThemeName): ThemeName {
    const baseName = themeName.replace(/-dark$|(-light)$/, '');
    return `${baseName}-light` as ThemeName;
  }

  /**
   * Get the dark variant of a theme
   */
  static getDarkVariant(themeName: ThemeName): ThemeName {
    const baseName = themeName.replace(/-dark$|(-light)$/, '');
    return `${baseName}-dark` as ThemeName;
  }

  /**
   * Subscribe to theme changes
   */
  static subscribe(listener: (theme: ThemeName) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Reset to default theme
   */
  static resetToDefault(): void {
    this.setTheme(DEFAULT_THEME);
  }

  /**
   * Get theme names by base (e.g., 'standard' returns both light and dark)
   */
  static getThemeVariants(baseName: string): ThemeName[] {
    return THEME_NAMES.filter((name) => name.startsWith(baseName)) as ThemeName[];
  }
}

/**
 * Initialize theme service on module load
 */
if (typeof document !== 'undefined') {
  // Defer initialization to after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ThemeService.initialize();
    });
  } else {
    ThemeService.initialize();
  }
}

/**
 * XIV Dye Tools v2.0.0 - Shared Type Definitions
 *
 * Phase 12: Architecture Refactor
 * Comprehensive type definitions for the application
 *
 * @module shared/types
 */

// ============================================================================
// Color Type System
// ============================================================================

/**
 * RGB color representation
 * @example { r: 255, g: 0, b: 0 } // Red
 */
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * HSV color representation (Hue, Saturation, Value)
 * @example { h: 0, s: 100, v: 100 } // Bright red
 */
export interface HSV {
  h: number; // 0-360 degrees
  s: number; // 0-100 percent
  v: number; // 0-100 percent
}

/**
 * Hexadecimal color string (branded type for type safety)
 * @example "#FF0000"
 */
export type HexColor = string & { readonly __brand: 'HexColor' };

/**
 * Helper to create branded HexColor type
 */
export function createHexColor(hex: string): HexColor {
  return hex as HexColor;
}

// ============================================================================
// Colorblindness Types
// ============================================================================

/**
 * Vision types supported by accessibility checker
 */
export type VisionType = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';

/**
 * 3x3 transformation matrix for colorblindness simulation
 * [row][column] indexing for RGB to RGB transformation
 */
export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

/**
 * Colorblindness transformation matrices (Brettel 1997)
 */
export interface ColorblindMatrices {
  deuteranopia: Matrix3x3;
  protanopia: Matrix3x3;
  tritanopia: Matrix3x3;
  achromatopsia: Matrix3x3;
}

// ============================================================================
// FFXIV Dye Types
// ============================================================================

/**
 * FFXIV dye object with color and metadata
 */
export interface Dye {
  itemID: number;
  id: number;
  name: string;
  hex: string; // #RRGGBB
  rgb: RGB;
  hsv: HSV;
  category: string; // 'Neutral', 'Red', 'Blue', etc.
  acquisition: string; // How to obtain the dye
  cost: number; // Gil cost
}

/**
 * Dye database with search and filtering
 */
export interface DyeDatabase {
  dyes: Dye[];
  lastLoaded: number;
  isLoaded: boolean;
}

// ============================================================================
// Theme Types
// ============================================================================

/**
 * Theme names available in the system
 */
export type ThemeName =
  | 'standard-light'
  | 'standard-dark'
  | 'hydaelyn-light'
  | 'hydaelyn-dark'
  | 'classic-light'
  | 'classic-dark'
  | 'parchment-light'
  | 'parchment-dark'
  | 'sugar-riot-light'
  | 'sugar-riot-dark'
  | 'grayscale-light'
  | 'grayscale-dark';

/**
 * Color palette for a theme
 */
export interface ThemePalette {
  primary: string;
  background: string;
  text: string;
  border: string;
  backgroundSecondary: string;
  cardBackground: string;
  textMuted: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  name: ThemeName;
  palette: ThemePalette;
  isDark: boolean;
}

// ============================================================================
// Application State Types
// ============================================================================

/**
 * Global application state
 */
export interface AppState {
  currentTheme: ThemeName;
  prefersDarkMode: boolean;
  showPrices: boolean;
  lastUpdate: number;
}

/**
 * Tool-specific state extending AppState
 */
export interface AccessibilityState extends AppState {
  visionType: VisionType;
  dualDyesEnabled: boolean;
  selectedDyes: number[]; // Item IDs of selected dyes
}

export interface HarmonyState extends AppState {
  harmonyType:
    | 'complementary'
    | 'analogous'
    | 'triadic'
    | 'split-complementary'
    | 'tetradic'
    | 'square';
  baseColor: HexColor;
  selectedDyes: number[];
}

export interface MatcherState extends AppState {
  imageUrl: string;
  sampleSize: number; // 1-64 pixels
  zoomLevel: number;
  matchedDyeId: number | null;
}

export interface ComparisonState extends AppState {
  selectedDyes: number[]; // Up to 4 dye IDs
  exportFormat: 'json' | 'css' | 'text';
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Universalis API response for item prices
 */
export interface PriceData {
  itemID: number;
  currentAverage: number;
  currentMinPrice: number;
  currentMaxPrice: number;
  lastUpdate: number;
}

/**
 * FFXIV Data Center information
 */
export interface DataCenter {
  name: string;
  region: string;
  worlds: number[];
}

/**
 * FFXIV World (server) information
 */
export interface World {
  id: number;
  name: string;
}

/**
 * API response status
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Cached API data with TTL
 */
export interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Severity levels for application errors
 */
export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

/**
 * Custom error class with severity and code
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: ErrorSeverity = 'error'
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      stack: this.stack,
    };
  }
}

/**
 * Error codes for different failure scenarios
 */
export enum ErrorCode {
  INVALID_HEX_COLOR = 'INVALID_HEX_COLOR',
  INVALID_RGB_VALUE = 'INVALID_RGB_VALUE',
  DYE_NOT_FOUND = 'DYE_NOT_FOUND',
  DATABASE_LOAD_FAILED = 'DATABASE_LOAD_FAILED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  API_CALL_FAILED = 'API_CALL_FAILED',
  INVALID_THEME = 'INVALID_THEME',
  IMAGE_LOAD_FAILED = 'IMAGE_LOAD_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Generic result type for operations that might fail
 */
export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Async result type
 */
export type AsyncResult<T> = Promise<Result<T>>;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Record of values by key
 */
export type Record<K extends string | number | symbol, V> = {
  [P in K]: V;
};

/**
 * Vitest Global Setup
 *
 * Initializes services needed for tests
 */

import { vi } from 'vitest';
import { LanguageService } from '@services/language-service';

// Mock window.matchMedia for tests that need it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the logger module to prevent SSR import issues
// Use vi.fn() so tests can spy on these methods
vi.mock('@shared/logger', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    table: vi.fn(),
  };

  const mockPerf = {
    start: vi.fn(),
    end: vi.fn(() => 0),
    measure: vi.fn(async (_label, fn) => await fn()),
    measureSync: vi.fn((_label, fn) => fn()),
    getMetrics: vi.fn(() => null),
    getAllMetrics: vi.fn(() => ({})),
    logMetrics: vi.fn(),
    clearMetrics: vi.fn(),
  };

  return {
    logger: mockLogger,
    perf: mockPerf,
    __setTestEnvironment: vi.fn(),
    initErrorTracking: vi.fn(),
  };
});

// Initialize LanguageService before all tests
beforeAll(async () => {
  // Initialize LanguageService which loads English translations by default
  await LanguageService.initialize();
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});

/**
 * Vitest Global Setup
 *
 * Initializes services needed for tests
 */

import { vi } from 'vitest';
import { LanguageService } from '@services/language-service';

// Initialize LanguageService before all tests
beforeAll(async () => {
  // Initialize LanguageService which loads English translations by default
  await LanguageService.initialize();
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});

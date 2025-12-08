# Testing Strategy

This document explains the testing approach for the xivdyetools-web-app.

## Test Types

### Unit Tests
- **Framework**: Vitest
- **Environment**: jsdom
- **Coverage Target**: 85%+ (currently ~90%)

Unit tests cover all services, components, and utilities that don't require real network requests or complex DOM interactions.

### Integration Tests
- **Tool**: MSW (Mock Service Worker)
- **Location**: `src/services/__tests__/*.integration.test.ts`

Integration tests use MSW to intercept network requests and provide mock responses, allowing us to test API services without hitting real endpoints.

## Files Excluded from Coverage

The following files are marked with `/* istanbul ignore file */` and excluded from coverage metrics:

### API Services
- `community-preset-service.ts` - Fetches from real API
- `hybrid-preset-service.ts` - Combines local and API presets
- `preset-submission-service.ts` - Submits to real API

**Reason**: These services make real HTTP requests. While we have integration tests with MSW to verify behavior, they're excluded from unit test coverage because:
1. They're tested via MSW integration tests
2. Their core logic depends on network responses
3. The pure validation functions are tested separately

### Modal Components
- `collection-manager-modal.ts` - Complex modal with file upload, DOM manipulation
- `add-to-collection-menu.ts` - Positioned dropdown menu

**Reason**: These components:
1. Create complex DOM structures dynamically
2. Use browser APIs like `getBoundingClientRect()` for positioning
3. Handle file uploads and downloads
4. Are best tested via E2E testing with real browser interaction

### Type Definitions
- `browser-api-types.ts` - TypeScript interfaces only

**Reason**: Contains only type definitions with no runtime code.

## MSW Setup

Mock Service Worker is configured in:
- `src/__tests__/mocks/handlers.ts` - API request handlers
- `src/__tests__/mocks/server.ts` - MSW server setup
- `src/__tests__/setup.ts` - Server lifecycle hooks

### Adding New Handlers

```typescript
// In handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/endpoint', () => {
    return HttpResponse.json({ data: 'mock' });
  }),
];
```

### Testing Error Scenarios

```typescript
// In your test file
import { server } from '../../__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

it('handles server error', async () => {
  server.use(
    http.get('/api/endpoint', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );

  // Your test code
});
```

## E2E Testing with Playwright

E2E tests run in real browsers and test complete user flows.

### Setup

```bash
# Install Playwright browsers (first time only)
npx playwright install
```

### Configuration

Playwright is configured in `playwright.config.ts`:
- **Test directory**: `e2e/`
- **Base URL**: `http://localhost:5173`
- **Web server**: Automatically starts Vite dev server

### E2E Test Files

- `e2e/collection-manager.spec.ts` - Collection manager modal and app navigation tests
- `e2e/harmony-generator.spec.ts` - Harmony Generator tool tests

### What E2E Tests Cover

1. **App Initialization**
   - Application loads successfully with correct title
   - Tool navigation buttons are visible
   - Tool switching works correctly

2. **App Navigation**
   - Navigate between different tools (harmony, matcher, accessibility, etc.)
   - Tool state persistence across page interactions

3. **Collection Manager Modal** (partially skipped - see Known Issues)
   - Shows Manage Collections button in favorites panel

4. **Harmony Generator Tool** (28 tests)
   - Tool loading and UI elements
   - Hex color input and color picker
   - Dye selector integration
   - All 9 harmony type generation
   - Suggestions mode switching (Simple/Expanded)
   - Companion dyes slider functionality
   - Dye filters section
   - Market board integration
   - Export functionality
   - Saved palettes modal
   - State persistence across page reloads

### Known E2E Issues

**Nested Button Problem**: Some collection manager tests are skipped because the "Manage Collections" button is nested inside another `<button>` element (the favorites panel header). This is invalid HTML and prevents reliable click handling in Playwright.

**Location**: `src/components/dye-selector.ts:450-492`
**Fix Required**: Change the favorites-header from `<button>` to `<div role="button">` with proper keyboard handling.

### Running E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run with Playwright UI (interactive)
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('should open collection manager', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click the manage collections button
  await page.locator('#manage-collections-btn').click();

  // Verify modal is visible
  await expect(page.locator('.collection-manager-modal')).toBeVisible();
});
```

## Running Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm test -- --watch

# Specific file
npm test -- src/services/__tests__/auth-service.test.ts

# E2E tests
npm run test:e2e

# E2E with browser UI
npm run test:e2e:headed
```

## Coverage Configuration

Coverage thresholds are configured in `vitest.config.ts`:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

Files explicitly excluded from coverage are also listed in `vitest.config.ts` under `coverage.exclude`.

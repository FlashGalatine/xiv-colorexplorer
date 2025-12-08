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

## Future: E2E Testing

For comprehensive testing of modal components and full user flows, consider adding Playwright:

```bash
npm install -D @playwright/test
npx playwright install
```

E2E tests would cover:
1. Modal open/close interactions
2. Form submissions through modals
3. File upload/download flows
4. Menu positioning and keyboard navigation

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
```

## Coverage Configuration

Coverage thresholds are configured in `vitest.config.ts`:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

Files explicitly excluded from coverage are also listed in `vitest.config.ts` under `coverage.exclude`.

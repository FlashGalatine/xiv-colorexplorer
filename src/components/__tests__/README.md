# Component Testing Guide

This directory contains tests for all UI components in the XIV Dye Tools application.

## Testing Infrastructure

### Test Framework

- **Test Runner**: Vitest 1.6.1
- **DOM Environment**: jsdom (for simulating browser environment)
- **Assertion Library**: Vitest's built-in `expect` API
- **Testing Utilities**: @testing-library/dom, @testing-library/user-event

### Test Coverage

#### Current Coverage (as of 2025-11-18)

| Module | Tests | Status |
|--------|-------|--------|
| BaseComponent | 39 | ✅ Passing |
| ThemeSwitcher | 29 | ✅ Passing |
| DyeSelector | 44 | ✅ Passing |
| ToolsDropdown | 33 | ✅ Passing |
| MobileBottomNav | 39 | ✅ Passing |
| AppLayout | 46 | ✅ Passing |
| **Total** | **230** | **✅ All Passing** |

**UI Components: 100% Coverage** ✅
Target: 80%+ coverage for all components

## Test Structure

### Test Utilities (`test-utils.ts`)

The `test-utils.ts` file provides helper functions for component testing:

```typescript
import { renderComponent, cleanupComponent, expectElement } from './test-utils';

// Render a component for testing
const [component, container] = renderComponent(MyComponent);

// Clean up after test
cleanupComponent(component, container);

// Use custom assertions
expectElement.toBeVisible(element);
expectElement.toHaveClass(element, 'active');
```

#### Key Utilities

1. **Container Management**
   - `createTestContainer()` - Creates isolated DOM container
   - `cleanupTestContainer()` - Removes container after test
   - `renderComponent()` - Creates, renders, and returns component + container
   - `cleanupComponent()` - Destroys component and cleans up container

2. **Component Lifecycle**
   - `createComponent()` - Creates component without initializing
   - `renderComponent()` - Creates and initializes component
   - `waitForComponent()` - Async helper for waiting on component updates

3. **Mock Data**
   - `mockDyeData` - Sample dye objects for testing
   - `mockThemes` - Sample theme definitions
   - `MockLocalStorage` - In-memory localStorage implementation

4. **Custom Assertions**
   - `expectElement.toBeVisible()`
   - `expectElement.toBeHidden()`
   - `expectElement.toHaveClass()`
   - `expectElement.toHaveText()`
   - `expectElement.toHaveAttribute()`

### Test File Organization

Each component test file follows this structure:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MyComponent } from '../my-component';
import { renderComponent, cleanupComponent } from './test-utils';

describe('MyComponent', () => {
  let container: HTMLElement;
  let component: MyComponent;

  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    if (component && container) {
      cleanupComponent(component, container);
    }
  });

  describe('Feature Group 1', () => {
    it('should do something', () => {
      [component, container] = renderComponent(MyComponent);
      // Test assertions...
    });
  });
});
```

## Writing Component Tests

### 1. Basic Rendering Tests

```typescript
describe('Rendering', () => {
  it('should render component elements', () => {
    [component, container] = renderComponent(MyComponent);

    const button = container.querySelector('#my-button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Click Me');
  });
});
```

### 2. User Interaction Tests

```typescript
describe('User Interactions', () => {
  it('should handle button clicks', () => {
    [component, container] = renderComponent(MyComponent);

    const button = container.querySelector('#my-button') as HTMLButtonElement;
    button.click();

    // Assert expected behavior
    expect(/* ... */).toBe(/* ... */);
  });
});
```

### 3. Service Integration Tests

```typescript
describe('Service Integration', () => {
  it('should integrate with ThemeService', () => {
    [component, container] = renderComponent(MyComponent);

    ThemeService.setTheme('hydaelyn-dark');

    // Assert component responds to service changes
    expect(/* ... */).toBe(/* ... */);
  });
});
```

### 4. Lifecycle Tests

```typescript
describe('Lifecycle', () => {
  it('should clean up event listeners on destroy', () => {
    [component, container] = renderComponent(MyComponent);

    const listenerCount = component['listeners'].size;
    component.destroy();

    expect(component['listeners'].size).toBe(0);
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- src/components/__tests__/my-component.test.ts
```

### Run with Coverage Report

```bash
npm run test:coverage
```

### Run in Watch Mode (auto-rerun on file changes)

```bash
npm test -- --watch
```

### Run in UI Mode (visual test runner)

```bash
npm run test:ui
```

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests:

```typescript
// ✅ Good - each test creates its own component
it('test 1', () => {
  [component, container] = renderComponent(MyComponent);
  // ...
});

it('test 2', () => {
  [component, container] = renderComponent(MyComponent);
  // ...
});

// ❌ Bad - tests share component state
let component: MyComponent;

beforeEach(() => {
  [component, container] = renderComponent(MyComponent);
});

it('test 1', () => {
  component.someMethod(); // Modifies shared state
});

it('test 2', () => {
  // Relies on test 1's modifications - fragile!
});
```

### 2. Container Scoping

Always query within the component's container, not globally:

```typescript
// ✅ Good - scoped to container
const button = container.querySelector('#my-button');

// ❌ Bad - global query (can find elements from other tests)
const button = document.querySelector('#my-button');
```

### 3. Async Handling

Use `waitForComponent()` for async operations:

```typescript
it('should update after async operation', async () => {
  [component, container] = renderComponent(MyComponent);

  ThemeService.setTheme('hydaelyn-dark');

  await waitForComponent(100); // Wait for subscription + re-render

  const activeElement = container.querySelector('.active');
  expect(activeElement).not.toBeNull();
});
```

### 4. Cleanup

Always clean up components and containers:

```typescript
afterEach(() => {
  if (component && container) {
    cleanupComponent(component, container);
  }
});
```

### 5. Descriptive Test Names

Use clear, descriptive test names that explain what is being tested:

```typescript
// ✅ Good
it('should close dropdown when clicking outside', () => { /* ... */ });

// ❌ Bad
it('test dropdown', () => { /* ... */ });
```

## Common Testing Patterns

### Testing Service Integration

Components often integrate with services like ThemeService, DyeService, etc.:

```typescript
import { ThemeService } from '@services/theme-service';
import { StorageService, appStorage } from '@services/storage-service';
import { STORAGE_KEYS } from '@shared/constants';

it('should persist theme to storage', () => {
  [component, container] = renderComponent(ThemeSwitcher);

  ThemeService.setTheme('hydaelyn-dark');

  // Verify persistence using appStorage (namespaced storage)
  const savedTheme = appStorage.getItem<ThemeName>(STORAGE_KEYS.THEME);
  expect(savedTheme).toBe('hydaelyn-dark');
});
```

### Testing DOM Updates

Verify that components update the DOM correctly:

```typescript
it('should apply theme class to document root', () => {
  [component, container] = renderComponent(ThemeSwitcher);

  const themeButton = container.querySelector('[data-theme="hydaelyn-dark"]') as HTMLButtonElement;
  themeButton.click();

  // Themes are applied to document.documentElement (<html>)
  expect(document.documentElement.classList.contains('theme-hydaelyn-dark')).toBe(true);
});
```

### Testing Event Emission

Verify components emit custom events:

```typescript
it('should emit custom event', () => {
  [component, container] = renderComponent(MyComponent);

  const eventHandler = vi.fn();
  container.addEventListener('my-event', eventHandler);

  component.triggerAction();

  expect(eventHandler).toHaveBeenCalledTimes(1);
  expect(eventHandler.mock.calls[0][0].detail.value).toBe('expected-value');
});
```

## Debugging Tests

### View Test Output

Tests log to console with descriptive messages:

```
✅ Theme changed to: hydaelyn-dark
✅ Dye database loaded: 136 dyes
```

### Use `.only` to Focus on Specific Tests

```typescript
it.only('should test this specific case', () => {
  // Only this test will run
});
```

### Use `.skip` to Temporarily Disable Tests

```typescript
it.skip('should test this later', () => {
  // This test will be skipped
});
```

### Inspect Component State

Components provide debug methods:

```typescript
component.debug(); // Logs component info to console
const state = component['getState'](); // Access component state
console.log(state);
```

## Troubleshooting

### Issue: Tests Fail with "Element not found"

**Problem**: Querying elements globally instead of within container

**Solution**: Always scope queries to the container:

```typescript
// ❌ Bad
const button = document.querySelector('#button');

// ✅ Good
const button = container.querySelector('#button');
```

### Issue: Async Tests Failing Intermittently

**Problem**: Not waiting for async operations to complete

**Solution**: Use `waitForComponent()` or `async/await`:

```typescript
it('should update after async change', async () => {
  [component, container] = renderComponent(MyComponent);

  someAsyncOperation();

  await waitForComponent(100); // Wait for operation

  // Now assert
});
```

### Issue: Theme/Storage Tests Failing

**Problem**: Using incorrect storage API or checking wrong DOM element

**Solution**: Use `appStorage` and check `document.documentElement`:

```typescript
// ✅ Correct storage API
const theme = appStorage.getItem<ThemeName>(STORAGE_KEYS.THEME);

// ✅ Correct theme location
expect(document.documentElement.classList.contains('theme-hydaelyn-dark')).toBe(true);
```

## Next Steps

### Pending Component Tests

The following components still need test coverage:

**UI Components** (✅ Complete - 100% coverage)
- [x] BaseComponent (39 tests)
- [x] ThemeSwitcher (29 tests)
- [x] DyeSelector (44 tests)
- [x] ToolsDropdown (33 tests)
- [x] MobileBottomNav (39 tests)
- [x] AppLayout (46 tests)

**Tool Components** (Pending)
- [ ] HarmonyGeneratorTool
- [ ] ColorMatcherTool
- [ ] AccessibilityCheckerTool
- [ ] DyeComparisonTool
- [ ] DyeMixerTool

### Priority

1. **UI Components** ✅ **COMPLETE** - All 6 UI components have comprehensive test coverage (230 tests)
2. **Tool Components** (Pending) - High complexity, requires extensive testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [@testing-library/dom](https://testing-library.com/docs/dom-testing-library/intro)
- [Component Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new component tests:

1. Follow the established file structure and naming conventions
2. Use test utilities from `test-utils.ts`
3. Aim for 80%+ coverage
4. Include tests for all major features, edge cases, and error scenarios
5. Run `npm run test:coverage` to verify coverage targets
6. Update this README with any new testing patterns or utilities

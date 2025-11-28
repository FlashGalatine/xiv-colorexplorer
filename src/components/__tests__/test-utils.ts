/**
 * XIV Dye Tools - Component Testing Utilities
 *
 * Provides helpers for testing BaseComponent and its subclasses
 *
 * @module components/__tests__/test-utils
 */

import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type { BaseComponent } from '../base-component';
import { vi } from 'vitest';

/**
 * Create a container element for testing components
 */
export function createTestContainer(id = 'test-container'): HTMLElement {
  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);
  return container;
}

/**
 * Clean up a test container
 */
export function cleanupTestContainer(container: HTMLElement): void {
  container.remove();
}

/**
 * Setup and render a component for testing
 * @returns Tuple of [component instance, container element]
 */
export function renderComponent<T extends BaseComponent>(
  ComponentClass: new (container: HTMLElement) => T,
  containerId = 'test-container'
): [T, HTMLElement] {
  const container = createTestContainer(containerId);
  const component = new ComponentClass(container);
  component.init();
  return [component, container];
}

/**
 * Setup component without initializing (for testing constructor)
 */
export function createComponent<T extends BaseComponent>(
  ComponentClass: new (container: HTMLElement) => T,
  containerId = 'test-container'
): [T, HTMLElement] {
  const container = createTestContainer(containerId);
  const component = new ComponentClass(container);
  return [component, container];
}

/**
 * Cleanup a component and its container
 */
export function cleanupComponent(component: BaseComponent, container: HTMLElement): void {
  component.destroy();
  cleanupTestContainer(container);
}

/**
 * Wait for component to finish async operations
 */
export async function waitForComponent(delay = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

/**
 * Setup mock localStorage
 */
export function setupMockLocalStorage(): MockLocalStorage {
  const mockStorage = new MockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });
  return mockStorage;
}

/**
 * Mock dye data for testing
 */
export const mockDyeData = [
  {
    itemID: 1,
    id: 1,
    name: 'Jet Black',
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    hsv: { h: 0, s: 0, v: 0 },
    category: 'Neutral',
    acquisition: 'Weaver',
    cost: 0,
  },
  {
    itemID: 2,
    id: 2,
    name: 'Snow White',
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 },
    hsv: { h: 0, s: 0, v: 100 },
    category: 'Neutral',
    acquisition: 'Weaver',
    cost: 0,
  },
  {
    itemID: 3,
    id: 3,
    name: 'Rose Pink',
    hex: '#FF69B4',
    rgb: { r: 255, g: 105, b: 180 },
    hsv: { h: 330, s: 59, v: 100 },
    category: 'Red',
    acquisition: 'Weaver',
    cost: 100,
  },
  {
    itemID: 4,
    id: 4,
    name: 'Sky Blue',
    hex: '#87CEEB',
    rgb: { r: 135, g: 206, b: 235 },
    hsv: { h: 197, s: 43, v: 92 },
    category: 'Blue',
    acquisition: 'Weaver',
    cost: 100,
  },
];

/**
 * Mock theme data for testing
 */
export const mockThemes = [
  { name: 'standard-light', palette: 'standard', isDark: false },
  { name: 'standard-dark', palette: 'standard', isDark: true },
  { name: 'hydaelyn-light', palette: 'hydaelyn', isDark: false },
];

/**
 * Query helpers (re-export from @testing-library/dom)
 */
export { screen, waitFor, within } from '@testing-library/dom';

/**
 * User interaction helpers (re-export from @testing-library/user-event)
 */
export { userEvent };

/**
 * Assertions for DOM elements
 */
export const expectElement = {
  toBeVisible(element: HTMLElement | null): void {
    expect(element).not.toBeNull();
    expect(element!.style.display).not.toBe('none');
  },

  toBeHidden(element: HTMLElement | null): void {
    if (element === null) {
      expect(element).toBeNull();
    } else {
      expect(element.style.display).toBe('none');
    }
  },

  toHaveClass(element: HTMLElement | null, className: string): void {
    expect(element).not.toBeNull();
    expect(element!.classList.contains(className)).toBe(true);
  },

  toNotHaveClass(element: HTMLElement | null, className: string): void {
    expect(element).not.toBeNull();
    expect(element!.classList.contains(className)).toBe(false);
  },

  toHaveText(element: HTMLElement | null, text: string): void {
    expect(element).not.toBeNull();
    expect(element!.textContent).toContain(text);
  },

  toHaveAttribute(element: HTMLElement | null, attr: string, value?: string): void {
    expect(element).not.toBeNull();
    if (value !== undefined) {
      expect(element!.getAttribute(attr)).toBe(value);
    } else {
      expect(element!.hasAttribute(attr)).toBe(true);
    }
  },
};

/**
 * Mock ResizeObserver in test environment
 */
export function setupResizeObserverMock(): void {
  class ResizeObserverMock {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(): void {
      // Immediately invoke once to simulate measurement
      this.callback([], this as unknown as ResizeObserver);
    }

    unobserve(): void {
      // noop
    }

    disconnect(): void {
      // noop
    }
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
}

/**
 * Mock canvas context utilities required by chart components
 */
export function setupCanvasMocks(): void {
  const mockContext = {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    // Properties
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D;

  vi.spyOn(window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);
  vi.spyOn(window.HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');
}

/**
 * Mock global fetch
 */
export function setupFetchMock(data: unknown = {}): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

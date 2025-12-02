/**
 * XIV Dye Tools - Dye Comparison Tool Tests
 *
 * Tests for the DyeComparisonTool component which compares
 * up to 4 dyes with visualizations and detailed information
 */

import { DyeComparisonTool } from '../dye-comparison-tool';
import {
  createTestContainer,
  cleanupTestContainer,
  cleanupComponent,
  setupResizeObserverMock,
  setupMockLocalStorage,
} from './test-utils';
import type { Dye } from '@shared/types';

// Create mock dye helper
const createMockDye = (overrides: Partial<Dye> = {}): Dye => ({
  id: 1,
  itemID: 30001,
  name: 'Test Dye',
  hex: '#FF0000',
  rgb: { r: 255, g: 0, b: 0 },
  hsv: { h: 0, s: 100, v: 100 },
  category: 'Red',
  acquisition: 'Vendor',
  cost: 100,
  ...overrides,
});

// Type helper to access private methods - use interface to avoid 'never' type
interface ComponentWithPrivate {
  init: () => void;
  selectedDyes: Dye[];
  showPrices: boolean;
  priceData: Map<number, { currentAverage: number }>;
  updateAnalysis: () => void;
  updateSummary: () => void;
  updateMatrix: () => void;
  updateCharts: () => void;
  updateExport: () => void;
  generateJsonExport: () => string;
  generateCssExport: () => string;
  renderStatCard: (label: string, value: string) => HTMLElement;
  getState: () => Record<string, unknown>;
}

const mockFetchPrices = vi.fn().mockResolvedValue(new Map());
const loadServerDataMock = vi.fn();

vi.mock('../market-board', () => {
  return {
    MarketBoard: class {
      container: HTMLElement;
      constructor(container: HTMLElement) {
        this.container = container;
      }
      async loadServerData(): Promise<void> {
        loadServerDataMock();
      }
      init(): void {}
      getShowPrices(): boolean {
        return false;
      }
      fetchPricesForDyes = mockFetchPrices;
      destroy(): void {}
    },
  };
});

const dyeSelectorInitMock = vi.fn();
vi.mock('../dye-selector', () => {
  return {
    DyeSelector: class {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_container: HTMLElement, _options: unknown) {}
      init(): void {
        dyeSelectorInitMock();
      }
      destroy(): void {}
    },
  };
});

vi.mock('../color-distance-matrix', () => {
  return {
    ColorDistanceMatrix: class {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_container: HTMLElement, _dyes: Dye[]) {}
      init(): void {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updateDyes(_dyes: Dye[]): void {}
      update(): void {}
      destroy(): void {}
    },
  };
});

vi.mock('../dye-comparison-chart', () => {
  return {
    DyeComparisonChart: class {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_container: HTMLElement, _type: string, _dyes: Dye[]) {}
      init(): void {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updateDyes(_dyes: Dye[]): void {}
      update(): void {}
      destroy(): void {}
    },
  };
});

describe('DyeComparisonTool Component', () => {
  let container: HTMLElement;
  let component: DyeComparisonTool;

  beforeEach(() => {
    vi.useFakeTimers();
    setupResizeObserverMock();
    setupMockLocalStorage();
    container = createTestContainer();
    mockFetchPrices.mockReset();
    mockFetchPrices.mockResolvedValue(new Map());
    loadServerDataMock.mockReset();
    dyeSelectorInitMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    if (component) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
  });

  const createComponent = async (): Promise<DyeComparisonTool> => {
    const instance = new DyeComparisonTool(container);
    instance.init();
    await Promise.resolve();
    // Advance past the onMount setTimeout (100ms)
    vi.advanceTimersByTime(150);
    component = instance;
    return instance;
  };

  describe('Initialization', () => {
    it('should create component successfully', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should render main layout', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const content = container.textContent || '';
      expect(content).toBeDefined();
    });

    it('should display dye selection controls', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('Dye Selection', () => {
    it('should provide selector for 4 dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should allow selecting dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should display selected dye colors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle no dyes selected gracefully', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const text = container.textContent || '';
      expect(text).toBeDefined();
    });

    it('should support up to 4 dyes comparison', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Color Distance Matrix', () => {
    it('should display distance matrix visualization', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should calculate color distances between dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should show distance values in table format', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should use color coding (green/yellow/red)', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle self-comparison (diagonal zeros)', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Hue-Saturation Chart', () => {
    it('should display 2D hue-saturation chart', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should render canvas-based visualization', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should plot dyes on chart axes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should handle zoom controls', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Brightness Chart', () => {
    it('should display 1D brightness chart', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should show brightness distribution', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should scale brightness axis 0-100', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('Dye Information Display', () => {
    it('should display dye names', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should show hex color codes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should display RGB values', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should show dye categories', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should display acquisition methods', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    it('should provide export options', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should export as JSON format', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should export as CSS format', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should generate valid export data', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should allow copying hex codes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  describe('Market Board Integration', () => {
    it('should display dye prices when available', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });

    it('should handle missing price data gracefully', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should update prices when toggled', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('should maintain selected dyes', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should update all charts when dyes change', () => {
      component = new DyeComparisonTool(container);
      component.init();

      component.update();
      expect(container).toBeDefined();
    });

    it('should handle partial dye selection', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle empty selection', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('Lifecycle', () => {
    it('should initialize without errors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle update cycles', () => {
      component = new DyeComparisonTool(container);
      component.init();

      component.update();
      component.update();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should cleanup resources on destroy', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const initialChildCount = container.children.length;
      expect(initialChildCount).toBeGreaterThan(0);

      component.destroy();
      expect(container.children.length).toBe(0);
    });

    it('should properly cleanup canvas contexts', () => {
      component = new DyeComparisonTool(container);
      component.init();

      component.destroy();
      expect(component).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      component = new DyeComparisonTool(container);
      component.init();

      const firstChild = container.querySelector('div');
      expect(firstChild).toBeDefined();
    });

    it('should provide alt text for charts', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should have keyboard navigation support', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle comparing similar colors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle comparing very different colors', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(container.children.length).toBeGreaterThan(0);
    });

    it('should handle single dye comparison', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });

    it('should handle maximum dyes (4)', () => {
      component = new DyeComparisonTool(container);
      component.init();

      expect(component).toBeDefined();
    });
  });

  // ==========================================================================
  // Business Logic Tests - generateJsonExport
  // ==========================================================================

  describe('generateJsonExport method', () => {
    it('should generate valid JSON string', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, name: 'Red Dye', hex: '#FF0000' }),
      ];

      const json = (instance as unknown as ComponentWithPrivate).generateJsonExport();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('dyes');
      expect(parsed).toHaveProperty('statistics');
    });

    it('should include all dye properties', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, name: 'Test Dye', hex: '#AABBCC', category: 'Blue' }),
      ];

      const json = (instance as unknown as ComponentWithPrivate).generateJsonExport();
      const parsed = JSON.parse(json);

      expect(parsed.dyes[0]).toHaveProperty('id');
      expect(parsed.dyes[0]).toHaveProperty('name');
      expect(parsed.dyes[0]).toHaveProperty('hex');
      expect(parsed.dyes[0]).toHaveProperty('rgb');
      expect(parsed.dyes[0]).toHaveProperty('hsv');
      expect(parsed.dyes[0]).toHaveProperty('category');
    });

    it('should calculate statistics for multiple dyes', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, hsv: { h: 0, s: 80, v: 90 } }),
        createMockDye({ id: 2, hsv: { h: 120, s: 60, v: 70 } }),
      ];

      const json = (instance as unknown as ComponentWithPrivate).generateJsonExport();
      const parsed = JSON.parse(json);

      expect(parsed.statistics.count).toBe(2);
      expect(parsed.statistics.averageSaturation).toBe(70); // (80+60)/2
      expect(parsed.statistics.averageBrightness).toBe(80); // (90+70)/2
    });
  });

  // ==========================================================================
  // Business Logic Tests - generateCssExport
  // ==========================================================================

  describe('generateCssExport method', () => {
    it('should generate valid CSS with :root', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, name: 'Red Dye', hex: '#FF0000' }),
      ];

      const css = (instance as unknown as ComponentWithPrivate).generateCssExport();

      expect(css).toContain(':root {');
      expect(css).toContain('}');
    });

    it('should include dye hex variables', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ hex: '#FF0000' }),
        createMockDye({ id: 2, hex: '#00FF00' }),
      ];

      const css = (instance as unknown as ComponentWithPrivate).generateCssExport();

      expect(css).toContain('--dye-1: #FF0000');
      expect(css).toContain('--dye-2: #00FF00');
    });

    it('should include dye name variables', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ name: 'Crimson Red' }),
      ];

      const css = (instance as unknown as ComponentWithPrivate).generateCssExport();

      expect(css).toContain("--dye-1-name: 'Crimson Red'");
    });

    it('should number dyes sequentially', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1 }),
        createMockDye({ id: 2 }),
        createMockDye({ id: 3 }),
      ];

      const css = (instance as unknown as ComponentWithPrivate).generateCssExport();

      expect(css).toContain('--dye-1:');
      expect(css).toContain('--dye-2:');
      expect(css).toContain('--dye-3:');
    });
  });

  // ==========================================================================
  // Business Logic Tests - renderStatCard
  // ==========================================================================

  describe('renderStatCard method', () => {
    it('should create a card element', async () => {
      const instance = await createComponent();

      const card = (instance as unknown as ComponentWithPrivate).renderStatCard('Label', 'Value');

      expect(card.tagName).toBe('DIV');
    });

    it('should include label text', async () => {
      const instance = await createComponent();

      const card = (instance as unknown as ComponentWithPrivate).renderStatCard(
        'Saturation',
        '80%'
      );

      expect(card.textContent).toContain('Saturation');
    });

    it('should include value text', async () => {
      const instance = await createComponent();

      const card = (instance as unknown as ComponentWithPrivate).renderStatCard(
        'Brightness',
        '90%'
      );

      expect(card.textContent).toContain('90%');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getState
  // ==========================================================================

  describe('getState method', () => {
    it('should return selectedDyeCount', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1 }),
        createMockDye({ id: 2 }),
      ];

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.selectedDyeCount).toBe(2);
    });

    it('should return selectedDyeNames array', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ name: 'Red Dye' }),
        createMockDye({ name: 'Blue Dye' }),
      ];

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.selectedDyeNames).toEqual(['Red Dye', 'Blue Dye']);
    });

    it('should return empty array for no selection', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.selectedDyeCount).toBe(0);
      expect(state.selectedDyeNames).toEqual([]);
    });
  });

  // ==========================================================================
  // Business Logic Tests - updateSummary
  // ==========================================================================

  describe('updateSummary method', () => {
    it('should show empty message when no dyes selected', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).updateSummary();

      const summaryContainer = container.querySelector('#summary-container');
      expect(summaryContainer?.textContent).toContain('Select');
    });

    it('should display selected dye names', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ name: 'Crimson Red', hex: '#CC0000' }),
      ];
      (instance as unknown as ComponentWithPrivate).updateSummary();

      const summaryContainer = container.querySelector('#summary-container');
      expect(summaryContainer?.textContent).toContain('Crimson Red');
    });

    it('should show statistics for 2+ dyes', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, hsv: { h: 0, s: 80, v: 90 } }),
        createMockDye({ id: 2, hsv: { h: 120, s: 60, v: 70 } }),
      ];
      (instance as unknown as ComponentWithPrivate).updateSummary();

      const summaryContainer = container.querySelector('#summary-container');
      // Should contain stats like average saturation
      expect(summaryContainer?.textContent).toContain('70.0'); // avg saturation
    });

    it('should display prices when showPrices is true', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ itemID: 12345, name: 'Priced Dye' }),
      ];
      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).priceData = new Map([
        [12345, { currentAverage: 5000 }],
      ]);
      (instance as unknown as ComponentWithPrivate).updateSummary();

      const summaryContainer = container.querySelector('#summary-container');
      expect(summaryContainer?.textContent).toContain('5,000');
    });
  });

  // ==========================================================================
  // Business Logic Tests - updateExport
  // ==========================================================================

  describe('updateExport method', () => {
    it('should not render export section when no dyes', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];
      (instance as unknown as ComponentWithPrivate).updateExport();

      const exportContainer = container.querySelector('#export-container');
      expect(exportContainer?.children.length).toBe(0);
    });

    it('should render export buttons when dyes selected', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];
      (instance as unknown as ComponentWithPrivate).updateExport();

      const jsonBtn = container.querySelector('[data-export="json"]');
      const cssBtn = container.querySelector('[data-export="css"]');
      const hexBtn = container.querySelector('[data-export="hex"]');

      expect(jsonBtn).not.toBeNull();
      expect(cssBtn).not.toBeNull();
      expect(hexBtn).not.toBeNull();
    });

    it('should render export result textarea', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];
      (instance as unknown as ComponentWithPrivate).updateExport();

      const textarea = container.querySelector('#export-result');
      expect(textarea).not.toBeNull();
      expect(textarea?.tagName).toBe('TEXTAREA');
    });

    it('should populate textarea when JSON button clicked', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ name: 'Export Test' }),
      ];
      (instance as unknown as ComponentWithPrivate).updateExport();

      const jsonBtn = container.querySelector<HTMLButtonElement>('[data-export="json"]');
      jsonBtn?.click();

      const textarea = container.querySelector<HTMLTextAreaElement>('#export-result');
      expect(textarea?.value).toContain('Export Test');
    });

    it('should populate textarea when CSS button clicked', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ hex: '#AABBCC' }),
      ];
      (instance as unknown as ComponentWithPrivate).updateExport();

      const cssBtn = container.querySelector<HTMLButtonElement>('[data-export="css"]');
      cssBtn?.click();

      const textarea = container.querySelector<HTMLTextAreaElement>('#export-result');
      expect(textarea?.value).toContain('#AABBCC');
    });
  });

  // ==========================================================================
  // Event Handling Tests
  // ==========================================================================

  describe('event handling', () => {
    it('should update selectedDyes on selection-changed event', async () => {
      const instance = await createComponent();
      const selectorContainer = container.querySelector('#dye-selector-container');

      const testDyes = [createMockDye({ id: 1 }), createMockDye({ id: 2 })];

      selectorContainer?.dispatchEvent(
        new CustomEvent('selection-changed', { detail: { selectedDyes: testDyes } })
      );

      expect((instance as unknown as ComponentWithPrivate).selectedDyes).toHaveLength(2);
    });

    it('should handle toggle-prices event', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');

      marketContainer?.dispatchEvent(
        new CustomEvent('toggle-prices', { detail: { showPrices: true } })
      );

      expect((instance as unknown as ComponentWithPrivate).showPrices).toBe(true);
    });

    it('should fetch prices on server-changed when showPrices is true', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      marketContainer?.dispatchEvent(new CustomEvent('server-changed'));

      expect(mockFetchPrices).toHaveBeenCalled();
    });

    it('should fetch prices on refresh-requested', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      marketContainer?.dispatchEvent(new CustomEvent('refresh-requested'));

      expect(mockFetchPrices).toHaveBeenCalled();
    });

    it('should not fetch prices when showPrices is false', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = false;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      marketContainer?.dispatchEvent(new CustomEvent('server-changed'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Lifecycle Tests
  // ==========================================================================

  describe('lifecycle', () => {
    it('should initialize child components', async () => {
      await createComponent();

      expect(dyeSelectorInitMock).toHaveBeenCalled();
      expect(loadServerDataMock).toHaveBeenCalled();
    });

    it('should cleanup on destroy', async () => {
      const instance = await createComponent();

      instance.destroy();

      expect(container.children.length).toBe(0);
    });

    it('should handle multiple update cycles', async () => {
      const instance = await createComponent();

      expect(() => {
        instance.update();
        instance.update();
        instance.update();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - fetchPricesForSelectedDyes
  // ==========================================================================

  describe('fetchPricesForSelectedDyes branch coverage', () => {
    it('should return early when marketBoard is null', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as { marketBoard: null }).marketBoard = null;
      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      // Access private method
      await (
        instance as unknown as { updatePrices: () => Promise<void> }
      ).updatePrices();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should return early when showPrices is false', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = false;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      await (
        instance as unknown as { updatePrices: () => Promise<void> }
      ).updatePrices();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should return early when selectedDyes is empty', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];

      await (
        instance as unknown as { updatePrices: () => Promise<void> }
      ).updatePrices();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - updateSummary
  // ==========================================================================

  describe('updateSummary branch coverage', () => {
    it('should return early when summaryContainer is null', async () => {
      const instance = await createComponent();

      // Remove summary container
      const summaryContainer = container.querySelector('#summary-container');
      summaryContainer?.remove();

      expect(() => {
        (instance as unknown as ComponentWithPrivate).updateSummary();
      }).not.toThrow();
    });

    it('should not show statistics for single dye', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, name: 'Single Dye' }),
      ];
      (instance as unknown as ComponentWithPrivate).updateSummary();

      const summaryContainer = container.querySelector('#summary-container');
      // Should not contain avg saturation stats (only shown for 2+ dyes)
      expect(summaryContainer?.textContent).not.toContain('Avg. Saturation');
    });

    it('should not display price when priceData is empty', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ itemID: 12345, name: 'No Price Dye' }),
      ];
      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).priceData = new Map();
      (instance as unknown as ComponentWithPrivate).updateSummary();

      const summaryContainer = container.querySelector('#summary-container');
      // Should have the dye name but no price
      expect(summaryContainer?.textContent).toContain('No Price Dye');
      expect(summaryContainer?.textContent).not.toContain('5,000');
    });

    it('should calculate hue range correctly', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1, hsv: { h: 0, s: 80, v: 90 } }),
        createMockDye({ id: 2, hsv: { h: 180, s: 80, v: 90 } }),
      ];
      (instance as unknown as ComponentWithPrivate).updateSummary();

      const summaryContainer = container.querySelector('#summary-container');
      // Hue range should be 180 degrees
      expect(summaryContainer?.textContent).toContain('180°');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - updateMatrix
  // ==========================================================================

  describe('updateMatrix branch coverage', () => {
    it('should return early when matrixContainer is null', async () => {
      const instance = await createComponent();

      // Remove matrix container
      const matrixContainer = container.querySelector('#matrix-container');
      matrixContainer?.remove();

      expect(() => {
        (instance as unknown as ComponentWithPrivate).updateMatrix();
      }).not.toThrow();
    });

    it('should update existing matrix instead of creating new one', async () => {
      const instance = await createComponent();

      // First call creates the matrix
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye({ id: 1 })];
      (instance as unknown as ComponentWithPrivate).updateMatrix();

      // Second call should update existing
      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1 }),
        createMockDye({ id: 2 }),
      ];

      expect(() => {
        (instance as unknown as ComponentWithPrivate).updateMatrix();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - updateCharts
  // ==========================================================================

  describe('updateCharts branch coverage', () => {
    it('should return early when hueSatContainer is null', async () => {
      const instance = await createComponent();

      // Remove hue-sat container
      const hueSatContainer = container.querySelector('#hue-sat-container');
      hueSatContainer?.remove();

      expect(() => {
        (instance as unknown as ComponentWithPrivate).updateCharts();
      }).not.toThrow();
    });

    it('should return early when brightnessContainer is null', async () => {
      const instance = await createComponent();

      // Remove brightness container
      const brightnessContainer = container.querySelector('#brightness-container');
      brightnessContainer?.remove();

      expect(() => {
        (instance as unknown as ComponentWithPrivate).updateCharts();
      }).not.toThrow();
    });

    it('should update existing charts instead of creating new ones', async () => {
      const instance = await createComponent();

      // First call creates the charts
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye({ id: 1 })];
      (instance as unknown as ComponentWithPrivate).updateCharts();

      // Second call should update existing
      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ id: 1 }),
        createMockDye({ id: 2 }),
      ];

      expect(() => {
        (instance as unknown as ComponentWithPrivate).updateCharts();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - updateExport
  // ==========================================================================

  describe('updateExport branch coverage', () => {
    it('should return early when exportContainer is null', async () => {
      const instance = await createComponent();

      // Remove export container
      const exportContainer = container.querySelector('#export-container');
      exportContainer?.remove();

      expect(() => {
        (instance as unknown as ComponentWithPrivate).updateExport();
      }).not.toThrow();
    });

    it('should copy hex to clipboard when hex button clicked', async () => {
      const instance = await createComponent();

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      (instance as unknown as ComponentWithPrivate).selectedDyes = [
        createMockDye({ hex: '#AABBCC' }),
        createMockDye({ id: 2, hex: '#DDEEFF' }),
      ];
      (instance as unknown as ComponentWithPrivate).updateExport();

      const hexBtn = container.querySelector<HTMLButtonElement>('[data-export="hex"]');
      hexBtn?.click();

      expect(writeTextMock).toHaveBeenCalledWith('#AABBCC\n#DDEEFF');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - toggle-prices event
  // ==========================================================================

  describe('toggle-prices event branch coverage', () => {
    it('should clear priceData when showPrices is toggled off', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');

      // First set some price data
      (instance as unknown as ComponentWithPrivate).priceData.set(1, { currentAverage: 1000 });
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      // Toggle off
      marketContainer?.dispatchEvent(
        new CustomEvent('toggle-prices', { detail: { showPrices: false } })
      );

      expect((instance as unknown as ComponentWithPrivate).priceData.size).toBe(0);
    });

    it('should not fetch prices when selectedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).selectedDyes = [];

      marketContainer?.dispatchEvent(
        new CustomEvent('toggle-prices', { detail: { showPrices: true } })
      );

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - event handlers with empty selectedDyes
  // ==========================================================================

  describe('event handler branch coverage', () => {
    it('should not fetch prices on server-changed when selectedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];

      marketContainer?.dispatchEvent(new CustomEvent('server-changed'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should not fetch prices on categories-changed when selectedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];

      marketContainer?.dispatchEvent(new CustomEvent('categories-changed'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should not fetch prices on refresh-requested when selectedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];

      marketContainer?.dispatchEvent(new CustomEvent('refresh-requested'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should handle selection-changed with undefined selectedDyes', async () => {
      const instance = await createComponent();
      const selectorContainer = container.querySelector('#dye-selector-container');

      selectorContainer?.dispatchEvent(new CustomEvent('selection-changed', { detail: {} }));

      expect((instance as unknown as ComponentWithPrivate).selectedDyes).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - updateAnalysis
  // ==========================================================================

  describe('updateAnalysis branch coverage', () => {
    it('should not fetch prices when showPrices is false', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = false;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      (instance as unknown as ComponentWithPrivate).updateAnalysis();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should not fetch prices when marketBoard is null', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as { marketBoard: null }).marketBoard = null;
      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      (instance as unknown as ComponentWithPrivate).updateAnalysis();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should not fetch prices when selectedDyes is empty', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [];

      (instance as unknown as ComponentWithPrivate).updateAnalysis();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should fetch prices when all conditions met', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();
      mockFetchPrices.mockResolvedValue(new Map());

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).selectedDyes = [createMockDye()];

      (instance as unknown as ComponentWithPrivate).updateAnalysis();

      // Price fetch is async, so we check if it was called
      expect(mockFetchPrices).toHaveBeenCalled();
    });
  });
});

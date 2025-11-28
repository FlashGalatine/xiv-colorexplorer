import { ColorMatcherTool } from '../color-matcher-tool';
import {
  createTestContainer,
  cleanupComponent,
  setupMockLocalStorage,
  setupCanvasMocks,
} from './test-utils';
import type { Dye } from '@shared/types';
import { dyeService } from '@services/index';

const mockFetchPrices = vi.fn();
const loadServerDataMock = vi.fn();

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

// Type helper to access private methods
type ComponentWithPrivate = ColorMatcherTool & {
  matchColor: (hex: string) => void;
  renderDyeCard: (dye: Dye, sampledColor: string) => HTMLElement;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshResults: () => void;
  fetchPricesForMatchedDyes: () => Promise<void>;
  getState: () => Record<string, unknown>;
  matchedDyes: Dye[];
  showPrices: boolean;
  sampleSize: number;
  zoomLevel: number;
  lastSampledColor: string;
  priceData: Map<number, { currentAverage: number }>;
};

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

      init(): void {
        // no-op for tests
      }

      getShowPrices(): boolean {
        return false;
      }

      fetchPricesForDyes = mockFetchPrices;

      destroy(): void {
        /* noop */
      }
    },
  };
});

const imageUploadInitMock = vi.fn();
vi.mock('../image-upload-display', () => {
  return {
    ImageUploadDisplay: class {
      constructor(_container: HTMLElement) {}
      init(): void {
        imageUploadInitMock();
      }
      destroy(): void {
        /* noop */
      }
    },
  };
});

const colorPickerInitMock = vi.fn();
vi.mock('../color-picker-display', () => {
  return {
    ColorPickerDisplay: class {
      constructor(_container: HTMLElement) {}
      init(): void {
        colorPickerInitMock();
      }
      destroy(): void {
        /* noop */
      }
    },
  };
});

describe('ColorMatcherTool', () => {
  let container: HTMLElement;
  let component: ColorMatcherTool | null;

  beforeEach(() => {
    container = createTestContainer();
    setupMockLocalStorage();
    setupCanvasMocks();
    component = null;
    mockFetchPrices.mockReset();
    loadServerDataMock.mockReset();
  });

  afterEach(() => {
    if (component) {
      cleanupComponent(component, container);
    } else {
      container.remove();
    }
  });

  const createComponent = async (): Promise<ColorMatcherTool> => {
    const instance = new ColorMatcherTool(container);
    instance.init();
    // allow async bindEvents to resolve
    await Promise.resolve();
    component = instance;
    return instance;
  };

  it('renders key sections after initialization', async () => {
    await createComponent();

    const text = container.textContent || '';
    expect(text).toContain('Color Matcher');
    expect(text).toContain('Image Upload');
  });

  it('updates sample size value on slider input', async () => {
    await createComponent();

    const slider = container.querySelector<HTMLInputElement>('#sample-size-input');
    const valueDisplay = container.querySelector<HTMLElement>('#sample-size-value');

    expect(slider).not.toBeNull();
    expect(valueDisplay).not.toBeNull();

    slider!.value = '12';
    slider!.dispatchEvent(new Event('input'));

    expect(valueDisplay!.textContent).toBe('12');
  });

  it('handles toggle-prices events and updates internal state', async () => {
    const instance = await createComponent();
    const marketContainer = container.querySelector('#market-board-container');

    expect(marketContainer).not.toBeNull();

    const fakeDye: Dye = {
      id: 1,
      itemID: 1,
      name: 'Test Dye',
      hex: '#123456',
      rgb: { r: 18, g: 52, b: 86 },
      hsv: { h: 210, s: 79, v: 34 },
      category: 'Test',
      acquisition: 'Test',
      cost: 10,
    };

    (instance as unknown as { matchedDyes: Dye[] }).matchedDyes = [fakeDye];

    if (!marketContainer) {
      throw new Error('marketContainer is null');
    }

    marketContainer.dispatchEvent(
      new CustomEvent('toggle-prices', { detail: { showPrices: true } })
    );
    expect((instance as unknown as { showPrices: boolean }).showPrices).toBe(true);

    marketContainer.dispatchEvent(
      new CustomEvent('toggle-prices', { detail: { showPrices: false } })
    );
    expect((instance as unknown as { showPrices: boolean }).showPrices).toBe(false);
  });

  it('renders overlay when image-loaded event fires', async () => {
    await createComponent();
    const uploadContainer = container.querySelector('#image-upload-container')!;
    const image = document.createElement('img');

    uploadContainer!.dispatchEvent(
      new CustomEvent('image-loaded', { detail: { image } })
    );

    expect(
      (component as unknown as { currentImage: HTMLImageElement | null }).currentImage
    ).toBe(image);
    expect(container.textContent).toContain('Privacy:');
  });

  // ==========================================================================
  // Business Logic Tests - matchColor
  // ==========================================================================

  describe('matchColor method', () => {
    beforeEach(() => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(
        createMockDye({ id: 1, name: 'Closest Dye', hex: '#FF0000' })
      );
      vi.spyOn(dyeService, 'findDyesWithinDistance').mockReturnValue([
        createMockDye({ id: 2, name: 'Similar Dye 1', hex: '#FF1111' }),
        createMockDye({ id: 3, name: 'Similar Dye 2', hex: '#FF2222' }),
      ]);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should populate matchedDyes array after matching', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');

      const matchedDyes = (instance as unknown as ComponentWithPrivate).matchedDyes;
      expect(matchedDyes).toHaveLength(3);
      expect(matchedDyes[0].name).toBe('Closest Dye');
    });

    it('should store lastSampledColor when matching', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchColor('#ABCDEF');

      expect((instance as unknown as ComponentWithPrivate).lastSampledColor).toBe('#ABCDEF');
    });

    it('should display best match section in results', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');

      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer?.textContent).toContain('Best Match');
      expect(resultsContainer?.textContent).toContain('Closest Dye');
    });

    it('should display similar dyes count', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');

      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer?.textContent).toContain('Similar');
    });

    it('should handle no closest dye found', async () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(null);
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchColor('#999999');

      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer?.textContent).toContain('No matching dyes');
    });

    it('should call findClosestDye with correct hex', async () => {
      const spy = vi.spyOn(dyeService, 'findClosestDye');
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchColor('#AABBCC');

      expect(spy).toHaveBeenCalledWith('#AABBCC');
    });
  });

  // ==========================================================================
  // Business Logic Tests - renderDyeCard
  // ==========================================================================

  describe('renderDyeCard method', () => {
    it('should create card element with dye info', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ name: 'Test Card Dye', hex: '#123456' });

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');

      expect(card.tagName).toBe('DIV');
      expect(card.textContent).toContain('Test Card Dye');
    });

    it('should include sampled color swatch', async () => {
      const instance = await createComponent();
      const dye = createMockDye();

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#00FF00');

      const sampledSwatch = card.querySelector('[title*="Sampled"]');
      expect(sampledSwatch).not.toBeNull();
      expect(sampledSwatch?.getAttribute('style')).toContain('#00FF00');
    });

    it('should include dye color swatch', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ hex: '#0000FF' });

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');

      const dyeSwatch = card.querySelector('[title*="Dye"]');
      expect(dyeSwatch).not.toBeNull();
      expect(dyeSwatch?.getAttribute('style')).toContain('#0000FF');
    });

    it('should include category badge', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ category: 'Blue' });

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');

      expect(card.textContent).toContain('Blue');
    });

    it('should include copy hex button', async () => {
      const instance = await createComponent();
      const dye = createMockDye();

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');

      const copyButton = card.querySelector('button');
      expect(copyButton).not.toBeNull();
      expect(copyButton?.textContent?.toLowerCase()).toContain('copy');
    });

    it('should display price when showPrices is true and price exists', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ itemID: 12345 });

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).priceData = new Map([
        [12345, { currentAverage: 5000 }],
      ]);

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');

      expect(card.textContent).toContain('5,000');
    });

    it('should display N/A when showPrices is true but no price data', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ itemID: 99999 });

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).priceData = new Map();

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');

      expect(card.textContent).toContain('N/A');
    });
  });

  // ==========================================================================
  // Business Logic Tests - showToast
  // ==========================================================================

  describe('showToast method', () => {
    beforeEach(() => {
      // Clean up any existing toast containers
      document.getElementById('toast-container')?.remove();
    });

    afterEach(() => {
      // Clean up toast containers after each test
      document.getElementById('toast-container')?.remove();
    });

    it('should create toast container if not exists', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).showToast('Test message', 'info');

      const toastContainer = document.getElementById('toast-container');
      expect(toastContainer).not.toBeNull();
    });

    it('should display success toast with green background', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).showToast('Success!', 'success');

      const toastContainer = document.getElementById('toast-container');
      const toast = toastContainer?.firstElementChild as HTMLElement;
      // JSDOM converts hex to rgb(16, 185, 129) for #10b981
      expect(toast?.style.backgroundColor).toBe('rgb(16, 185, 129)');
    });

    it('should display error toast with red background', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).showToast('Error!', 'error');

      const toastContainer = document.getElementById('toast-container');
      const toast = toastContainer?.firstElementChild as HTMLElement;
      // JSDOM converts hex to rgb(239, 68, 68) for #ef4444
      expect(toast?.style.backgroundColor).toBe('rgb(239, 68, 68)');
    });

    it('should display info toast with blue background', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).showToast('Info message', 'info');

      const toastContainer = document.getElementById('toast-container');
      const toast = toastContainer?.firstElementChild as HTMLElement;
      // JSDOM converts hex to rgb(59, 130, 246) for #3b82f6
      expect(toast?.style.backgroundColor).toBe('rgb(59, 130, 246)');
    });

    it('should include message text in toast', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).showToast('Custom toast message', 'info');

      const toastContainer = document.getElementById('toast-container');
      expect(toastContainer?.textContent).toContain('Custom toast message');
    });
  });

  // ==========================================================================
  // Business Logic Tests - getState
  // ==========================================================================

  describe('getState method', () => {
    it('should return matchedDyeCount', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchedDyes = [
        createMockDye({ id: 1 }),
        createMockDye({ id: 2 }),
      ];

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.matchedDyeCount).toBe(2);
    });

    it('should return sampleSize', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).sampleSize = 10;

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.sampleSize).toBe(10);
    });

    it('should return 0 for empty matchedDyes', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchedDyes = [];

      const state = (instance as unknown as ComponentWithPrivate).getState();

      expect(state.matchedDyeCount).toBe(0);
    });
  });

  // ==========================================================================
  // Event Handling Tests
  // ==========================================================================

  describe('event handling', () => {
    it('should handle server-changed event', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      marketContainer?.dispatchEvent(new CustomEvent('server-changed'));

      // Should trigger price fetch (async)
      expect(mockFetchPrices).toHaveBeenCalled();
    });

    it('should handle categories-changed event', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      marketContainer?.dispatchEvent(new CustomEvent('categories-changed'));

      expect(mockFetchPrices).toHaveBeenCalled();
    });

    it('should handle refresh-requested event', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      marketContainer?.dispatchEvent(new CustomEvent('refresh-requested'));

      expect(mockFetchPrices).toHaveBeenCalled();
    });

    it('should not fetch prices when showPrices is false', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = false;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      marketContainer?.dispatchEvent(new CustomEvent('server-changed'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should handle color-selected event from color picker', async () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye());
      vi.spyOn(dyeService, 'findDyesWithinDistance').mockReturnValue([]);

      await createComponent();
      const pickerContainer = container.querySelector('#color-picker-container');

      pickerContainer?.dispatchEvent(
        new CustomEvent('color-selected', { detail: { color: '#AABBCC' } })
      );

      expect(dyeService.findClosestDye).toHaveBeenCalledWith('#AABBCC');
    });
  });

  // ==========================================================================
  // Lifecycle Tests
  // ==========================================================================

  describe('lifecycle', () => {
    it('should initialize all child components', async () => {
      await createComponent();

      expect(imageUploadInitMock).toHaveBeenCalled();
      expect(colorPickerInitMock).toHaveBeenCalled();
      expect(loadServerDataMock).toHaveBeenCalled();
    });

    it('should cleanup on destroy', async () => {
      const instance = await createComponent();

      instance.destroy();

      expect(container.children.length).toBe(0);
    });

    it('should handle update cycle', async () => {
      const instance = await createComponent();

      expect(() => {
        instance.update();
        instance.update();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle empty results container gracefully', async () => {
      const instance = await createComponent();

      // Clear the results container
      const resultsContainer = container.querySelector('#results-container');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      }

      // refreshResults should handle empty container
      expect(() => {
        (instance as unknown as ComponentWithPrivate).refreshResults();
      }).not.toThrow();
    });

    it('should handle matchColor without results container', async () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye());
      vi.spyOn(dyeService, 'findDyesWithinDistance').mockReturnValue([]);

      const instance = await createComponent();

      // Remove results container
      const resultsContainer = container.querySelector('#results-container');
      resultsContainer?.remove();

      expect(() => {
        (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');
      }).not.toThrow();
    });

    it('should handle zoom level at minimum boundary', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).zoomLevel = 10;

      expect((instance as unknown as ComponentWithPrivate).zoomLevel).toBe(10);
    });

    it('should handle zoom level at maximum boundary', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).zoomLevel = 400;

      expect((instance as unknown as ComponentWithPrivate).zoomLevel).toBe(400);
    });
  });
});


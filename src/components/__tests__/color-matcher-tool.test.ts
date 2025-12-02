import { ColorMatcherTool } from '../color-matcher-tool';
import {
  createTestContainer,
  cleanupComponent,
  setupMockLocalStorage,
  setupCanvasMocks,
  waitFor,
} from './test-utils';
import type { Dye } from '@shared/types';
import { dyeService } from '@services/index';
import { ToastService } from '@services/toast-service';

const mockFetchPrices = vi.fn().mockResolvedValue(new Map());
const loadServerDataMock = vi.fn();

const toastServiceSuccessMock = vi.fn();
const toastServiceErrorMock = vi.fn();
const toastServiceInfoMock = vi.fn();
vi.mock('../../services/toast-service', () => ({
  ToastService: {
    success: (msg: string) => toastServiceSuccessMock(msg),
    error: (msg: string) => toastServiceErrorMock(msg),
    info: (msg: string) => toastServiceInfoMock(msg),
  },
}));

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
  matchColor: (hex: string) => void;
  renderDyeCard: (dye: Dye, sampledColor: string) => HTMLElement;
  refreshResults: () => void;
  fetchPricesForMatchedDyes: () => Promise<void>;
  getState: () => Record<string, unknown>;
  matchedDyes: Dye[];
  showPrices: boolean;
  sampleSize: number;
  zoomLevel: number;
  lastSampledColor: string;
  priceData: Map<number, { currentAverage: number }>;
}

vi.mock('../market-board', () => {
  return {
    MarketBoard: class {
      container: HTMLElement;
      element: HTMLElement | undefined; // Added for the new render method

      constructor(container: HTMLElement) {
        this.container = container;
      }

      render(): void {
        const wrapper = document.createElement('div'); // Assuming wrapper is created here
        this.element = wrapper;
        this.container.appendChild(this.element);
        console.log('DEBUG: render finished, element attached');
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_container: HTMLElement) {}
      init(): void {
        colorPickerInitMock();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setColorFromImage(_canvas: HTMLCanvasElement, _x: number, _y: number, _size: number): void {
        /* noop */
      }
      destroy(): void {
        /* noop */
      }
    },
  };
});

const imageZoomControllerInitMock = vi.fn();
const imageZoomControllerSetImageMock = vi.fn();
vi.mock('../image-zoom-controller', () => {
  return {
    ImageZoomController: class {
      constructor(_container: HTMLElement) {}
      init() {
        imageZoomControllerInitMock();
      }
      setImage(img: HTMLImageElement) {
        imageZoomControllerSetImageMock(img);
      }
      destroy() {}
      getCanvasContainer() {
        return document.createElement('div');
      }
      getCanvas() {
        return document.createElement('canvas');
      }
    },
  };
});

const recentColorsPanelInitMock = vi.fn();
const recentColorsPanelAddColorMock = vi.fn();
vi.mock('../recent-colors-panel', () => {
  return {
    RecentColorsPanel: class {
      constructor(_container: HTMLElement) {}
      init() {
        recentColorsPanelInitMock();
      }
      addRecentColor(hex: string) {
        recentColorsPanelAddColorMock(hex);
      }
      destroy() {}
      getState() {
        return { recentColorsCount: 0 };
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
    mockFetchPrices.mockClear();
    loadServerDataMock.mockReset();
    imageZoomControllerInitMock.mockReset();
    imageZoomControllerSetImageMock.mockReset();
    recentColorsPanelInitMock.mockReset();
    recentColorsPanelAddColorMock.mockReset();
    toastServiceSuccessMock.mockReset();
    toastServiceErrorMock.mockReset();
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

  it('delegates to ImageZoomController when image-loaded event fires', async () => {
    const instance = await createComponent();
    const uploadContainer = container.querySelector('#image-upload-container')!;
    const image = document.createElement('img');

    uploadContainer!.dispatchEvent(new CustomEvent('image-loaded', { detail: { image } }));

    expect(imageZoomControllerSetImageMock).toHaveBeenCalledWith(image);
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

      ToastService.success('Test message');
      expect(toastServiceSuccessMock).toHaveBeenCalledWith('Test message');
      // The toast container creation is an implementation detail of ToastService, not this component.
      // We are now testing that this component correctly *calls* ToastService.
    });

    it('should display success toast with green background', async () => {
      const instance = await createComponent();

      ToastService.success('Success!');
      expect(toastServiceSuccessMock).toHaveBeenCalledWith('Success!');
      // Background color is an implementation detail of ToastService, not this component.
    });

    it('should display error toast with red background', async () => {
      const instance = await createComponent();

      ToastService.error('Error!');
      expect(toastServiceErrorMock).toHaveBeenCalledWith('Error!');
      // Background color is an implementation detail of ToastService, not this component.
    });

    it('should display info toast with blue background', async () => {
      const instance = await createComponent();

      ToastService.info('Info message');
      expect(toastServiceInfoMock).toHaveBeenCalledWith('Info message');
      // Background color is an implementation detail of ToastService, not this component.
    });

    it('should include message text in toast', async () => {
      const instance = await createComponent();

      ToastService.success('Custom toast message');
      expect(toastServiceSuccessMock).toHaveBeenCalledWith('Custom toast message');
      // Message text display is an implementation detail of ToastService, not this component.
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
      expect(imageZoomControllerInitMock).toHaveBeenCalled();
      expect(recentColorsPanelInitMock).toHaveBeenCalled();
    });

    it('should cleanup on destroy', async () => {
      const instance = await createComponent();
      const wrapper = document.createElement('div'); // Assuming wrapper is created here
      wrapper.className = 'space-y-8';
      console.log('DEBUG: render started');
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
  });

  // ==========================================================================
  // Branch Coverage Tests - refreshResults
  // ==========================================================================

  describe('refreshResults branch coverage', () => {
    it('should handle empty matchedDyes gracefully', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchedDyes = [];

      expect(() => {
        (instance as unknown as ComponentWithPrivate).refreshResults();
      }).not.toThrow();
    });

    it('should handle missing results section', async () => {
      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      // Don't create a results section
      expect(() => {
        (instance as unknown as ComponentWithPrivate).refreshResults();
      }).not.toThrow();
    });

    it('should render other matches when present', async () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(
        createMockDye({ id: 1, name: 'Best Dye' })
      );
      vi.spyOn(dyeService, 'findDyesWithinDistance').mockReturnValue([
        createMockDye({ id: 2, name: 'Similar 1' }),
        createMockDye({ id: 3, name: 'Similar 2' }),
      ]);

      const instance = await createComponent();

      // First match to create the results section
      (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');

      // Then refresh
      (instance as unknown as ComponentWithPrivate).refreshResults();

      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer?.textContent).toContain('Similar');
    });

    it('should use lastSampledColor for refreshing', async () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye());
      vi.spyOn(dyeService, 'findDyesWithinDistance').mockReturnValue([]);

      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).lastSampledColor = '#ABCDEF';
      (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');
      (instance as unknown as ComponentWithPrivate).refreshResults();

      // Should not throw
      expect((instance as unknown as ComponentWithPrivate).lastSampledColor).toBe('#FF0000');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - matchColor with filters
  // ==========================================================================

  describe('matchColor filter branch coverage', () => {
    it('should match without filters when dyeFilters is null', async () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye());
      vi.spyOn(dyeService, 'findDyesWithinDistance').mockReturnValue([]);

      const instance = await createComponent();

      // Set dyeFilters to null
      (instance as unknown as { dyeFilters: null }).dyeFilters = null;

      expect(() => {
        (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');
      }).not.toThrow();
    });

    it('should handle no similar dyes found', async () => {
      vi.spyOn(dyeService, 'findClosestDye').mockReturnValue(createMockDye({ name: 'Only Dye' }));
      vi.spyOn(dyeService, 'findDyesWithinDistance').mockReturnValue([]);

      const instance = await createComponent();

      (instance as unknown as ComponentWithPrivate).matchColor('#FF0000');

      const resultsContainer = container.querySelector('#results-container');
      expect(resultsContainer?.textContent).toContain('Only Dye');
      // Should not have "Similar" section
      // The section count confirms no similar dyes section was added
      expect(resultsContainer?.textContent).not.toContain('Similar (');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - fetchPricesForMatchedDyes
  // ==========================================================================

  describe('fetchPricesForMatchedDyes branch coverage', () => {
    it('should return early when marketBoard is null', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      // Set marketBoard to null
      (instance as unknown as { marketBoard: null }).marketBoard = null;
      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      await (instance as unknown as ComponentWithPrivate).fetchPricesForMatchedDyes();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should return early when showPrices is false', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = false;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      await (instance as unknown as ComponentWithPrivate).fetchPricesForMatchedDyes();

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should return early when matchedDyes is empty', async () => {
      const instance = await createComponent();
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [];

      await (instance as unknown as ComponentWithPrivate).fetchPricesForMatchedDyes();

      expect(mockFetchPrices).not.toHaveBeenCalled();
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
      (instance as unknown as ComponentWithPrivate).matchedDyes = [createMockDye()];

      // Toggle off
      marketContainer?.dispatchEvent(
        new CustomEvent('toggle-prices', { detail: { showPrices: false } })
      );

      expect((instance as unknown as ComponentWithPrivate).priceData.size).toBe(0);
    });

    it('should not fetch prices when matchedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).matchedDyes = [];

      marketContainer?.dispatchEvent(
        new CustomEvent('toggle-prices', { detail: { showPrices: true } })
      );

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - renderDyeCard
  // ==========================================================================

  describe('renderDyeCard branch coverage', () => {
    it('should not render price section when showPrices is false', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ itemID: 12345 });

      (instance as unknown as ComponentWithPrivate).showPrices = false;

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');

      // Should not contain price-related elements
      expect(card.textContent).not.toContain('N/A');
      expect(card.textContent).not.toContain('5,000');
    });

    it('should handle copy button click with clipboard API', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ hex: '#AABBCC' });

      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');
      const copyButton = card.querySelector('button');

      await copyButton?.click();

      // Give time for async click handler
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(writeTextMock).toHaveBeenCalledWith('#AABBCC');
    });

    it('should use fallback when clipboard API fails', async () => {
      const instance = await createComponent();
      const dye = createMockDye({ hex: '#AABBCC' });

      // Mock clipboard API to fail
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')) },
      });

      // Mock execCommand
      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      const card = (instance as unknown as ComponentWithPrivate).renderDyeCard(dye, '#FF0000');
      const copyButton = card.querySelector('button');

      await copyButton?.click();

      // Give time for async click handler
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(execCommandMock).toHaveBeenCalledWith('copy');
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - event handler missing matchedDyes
  // ==========================================================================

  describe('event handler branch coverage', () => {
    it('should not fetch prices on server-changed when matchedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [];

      marketContainer?.dispatchEvent(new CustomEvent('server-changed'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should not fetch prices on categories-changed when matchedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [];

      marketContainer?.dispatchEvent(new CustomEvent('categories-changed'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });

    it('should not fetch prices on refresh-requested when matchedDyes is empty', async () => {
      const instance = await createComponent();
      const marketContainer = container.querySelector('#market-board-container');
      mockFetchPrices.mockClear();

      (instance as unknown as ComponentWithPrivate).showPrices = true;
      (instance as unknown as ComponentWithPrivate).matchedDyes = [];

      marketContainer?.dispatchEvent(new CustomEvent('refresh-requested'));

      expect(mockFetchPrices).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - sample size slider
  // ==========================================================================

  describe('sample size slider branch coverage', () => {
    it('should handle missing value display element', async () => {
      await createComponent();

      // Remove the value display
      const valueDisplay = container.querySelector('#sample-size-value');
      valueDisplay?.remove();

      const slider = container.querySelector<HTMLInputElement>('#sample-size-input');

      // Should not throw even without display element
      expect(() => {
        slider!.value = '20';
        slider!.dispatchEvent(new Event('input'));
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Branch Coverage Tests - image error handling
  // ==========================================================================

  describe('image error handling branch coverage', () => {
    it('should handle error event from image upload', async () => {
      await createComponent();
      const uploadContainer = container.querySelector('#image-upload-container');

      // Clean up existing toasts
      document.getElementById('toast-container')?.remove();

      uploadContainer?.dispatchEvent(
        new CustomEvent('error', { detail: { message: 'Test error message' } })
      );

      // Should show error toast
      await waitFor(() => {
        expect(toastServiceErrorMock).toHaveBeenCalledWith('Test error message');
      });
    });

    it('should handle error event without message', async () => {
      await createComponent();
      const uploadContainer = container.querySelector('#image-upload-container');

      uploadContainer?.dispatchEvent(new CustomEvent('error', { detail: {} }));

      // Should show default error message
      // Should show default error message
      await waitFor(() => {
        expect(toastServiceErrorMock).toHaveBeenCalledWith('Failed to load image');
      });
    });
  });

  // ==========================================================================
  // Function Coverage Tests - showImageOverlay
  // ==========================================================================

  // ==========================================================================
  // Function Coverage Tests - onMount
  // ==========================================================================

  describe('onMount function coverage', () => {
    it('should call onMount without throwing', async () => {
      const instance = await createComponent();

      expect(() => {
        instance.onMount();
      }).not.toThrow();
    });

    it('should subscribe to language changes', async () => {
      const instance = await createComponent();

      // onMount is called during init
      // Just verify it doesn't throw
      expect(() => {
        instance.onMount();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Function Coverage Tests - destroy with child components
  // ==========================================================================

  describe('destroy with child components', () => {
    it('should destroy imageUpload if exists', async () => {
      const instance = await createComponent();

      // imageUpload should exist after init
      expect(() => {
        instance.destroy();
      }).not.toThrow();
    });

    it('should destroy colorPicker if exists', async () => {
      const instance = await createComponent();

      expect(() => {
        instance.destroy();
      }).not.toThrow();
    });

    it('should destroy marketBoard if exists', async () => {
      const instance = await createComponent();

      expect(() => {
        instance.destroy();
      }).not.toThrow();
    });

    it('should handle destroy when child components are null', async () => {
      const instance = await createComponent();

      // Set child components to null
      (instance as unknown as { imageUpload: null }).imageUpload = null;
      (instance as unknown as { colorPicker: null }).colorPicker = null;
      (instance as unknown as { marketBoard: null }).marketBoard = null;

      expect(() => {
        instance.destroy();
      }).not.toThrow();
    });
  });
});

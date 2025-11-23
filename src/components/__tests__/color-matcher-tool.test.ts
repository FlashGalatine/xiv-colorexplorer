import { ColorMatcherTool } from '../color-matcher-tool';
import {
  createTestContainer,
  cleanupComponent,
  setupMockLocalStorage,
  setupCanvasMocks,
} from './test-utils';
import type { Dye } from '@shared/types';

const mockFetchPrices = vi.fn();
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
});


import { DyeSearchBox, type DyeSearchBoxOptions } from '../dye-search-box';
import {
  createTestContainer,
  cleanupTestContainer,
  renderComponent,
  createComponent,
  cleanupComponent,
} from './test-utils';

// Mock shared utils
vi.mock('@shared/utils', () => ({
  clearContainer: vi.fn((container: HTMLElement) => {
    container.innerHTML = '';
  }),
}));

// Mock logger
vi.mock('@shared/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ErrorHandler
vi.mock('@shared/error-handler', () => ({
  ErrorHandler: {
    log: vi.fn(),
  },
}));

// Mock DyeService
vi.mock('@services/index', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services/index')>();
  return {
    ...actual,
    DyeService: {
      getInstance: vi.fn(() => ({
        getCategories: vi.fn(() => [
          'Neutral',
          'Red',
          'Blue',
          'Green',
          'Yellow',
          'Purple',
          'Brown',
          'Grey',
        ]),
      })),
    },
    LanguageService: {
      t: vi.fn((key: string) => key),
      getCategory: vi.fn((cat: string) => cat),
      initialize: vi.fn(),
    },
  };
});

describe('DyeSearchBox', () => {
  let container: HTMLElement;
  let component: DyeSearchBox;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      [component, container] = renderComponent(DyeSearchBox);

      const options = component['options'];
      expect(options.showCategories).toBe(true);
      expect(options.excludeFacewear).toBe(true);
      expect(options.initialSort).toBe('alphabetical');
    });

    it('should accept custom options', () => {
      const options: DyeSearchBoxOptions = {
        showCategories: false,
        excludeFacewear: false,
        initialSort: 'hue',
        initialSearch: 'test',
        initialCategory: 'Reds',
      };

      [component, container] = createComponent(DyeSearchBox, 'test-container');
      component = new DyeSearchBox(container, options);
      component.init();

      expect(component.getSearchQuery()).toBe('test');
      expect(component.getSortOption()).toBe('hue');
      expect(component.getCategory()).toBe('Reds');
    });
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      [component, container] = renderComponent(DyeSearchBox);
      const input = container.querySelector('input[type="text"]');
      expect(input).not.toBeNull();
    });

    it('should render sort dropdown', () => {
      [component, container] = renderComponent(DyeSearchBox);
      const select = container.querySelector('select');
      expect(select).not.toBeNull();
      expect(select?.options.length).toBe(6);
    });

    it('should render categories', () => {
      [component, container] = renderComponent(DyeSearchBox);
      const categoryBtns = container.querySelectorAll('button[data-category]');
      // All categories + 'all' button
      // Mocked categories: 8. 'all': 1. Total: 9.
      expect(categoryBtns.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('should emit search-changed on input', () => {
      [component, container] = renderComponent(DyeSearchBox);
      const spy = vi.fn();
      container.addEventListener('search-changed', (e: Event) => {
        const customEvent = e as CustomEvent;
        spy(customEvent.detail);
      });

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).not.toBeNull();
      input.value = 'new search';
      input.dispatchEvent(new Event('input'));

      expect(spy).toHaveBeenCalledWith('new search');
      expect(component.getSearchQuery()).toBe('new search');
    });

    it('should emit clear-all on clear button click', () => {
      [component, container] = renderComponent(DyeSearchBox);
      const spy = vi.fn();
      container.addEventListener('clear-all', spy);

      // Set some value first
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).not.toBeNull();
      input.value = 'test';
      component['searchQuery'] = 'test';

      const clearBtn = container.querySelector('#dye-selector-clear-btn') as HTMLButtonElement;
      expect(clearBtn).not.toBeNull();
      clearBtn.click();

      expect(spy).toHaveBeenCalled();
      expect(input.value).toBe('');
      expect(component.getSearchQuery()).toBe('');
    });
  });
});

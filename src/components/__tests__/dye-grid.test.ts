import { DyeGrid, type DyeGridOptions } from '../dye-grid';
import { Dye } from '@shared/types';
import {
  createTestContainer,
  cleanupTestContainer,
  renderComponent,
  createComponent,
  cleanupComponent,
  expectElement,
  waitForComponent,
  setupFetchMock,
} from './test-utils';

// Mock shared utils
vi.mock('@shared/utils', () => ({
  clearContainer: vi.fn((container: HTMLElement) => {
    container.innerHTML = '';
  }),
}));

// Mock empty state
vi.mock('../empty-state', () => ({
  getEmptyStateHTML: vi.fn(() => '<div class="flex flex-col">Empty State</div>'),
}));

// Mock icons
vi.mock('@shared/empty-state-icons', () => ({
  ICON_SEARCH: '<svg>search</svg>',
  ICON_PALETTE: '<svg>palette</svg>',
}));

describe('DyeGrid', () => {
  let container: HTMLElement;
  let component: DyeGrid;

  const mockDyes: Dye[] = [
    { id: 1, name: 'Snow White', hex: '#FFFFFF', category: 'Neutrals', itemID: 123 },
    { id: 2, name: 'Soot Black', hex: '#000000', category: 'Neutrals', itemID: 124 },
    { id: 3, name: 'Rose Pink', hex: '#FF0000', category: 'Reds', itemID: 125 },
  ];

  beforeEach(() => {
    setupFetchMock({});
    container = createTestContainer();
    // Mock scrollIntoView
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    if (component && container) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      [component, container] = renderComponent(DyeGrid);

      const options = component['options'];
      expect(options.allowMultiple).toBe(true);
      expect(options.allowDuplicates).toBe(false);
      expect(options.maxSelections).toBe(4);
      expect(options.showCategories).toBe(true);
    });

    it('should accept custom options', () => {
      const options: DyeGridOptions = {
        allowMultiple: false,
        allowDuplicates: true,
        maxSelections: 1,
        showCategories: false,
      };

      [component, container] = createComponent(DyeGrid, 'test-container');
      component = new DyeGrid(container, options);
      component.init();

      const compOptions = component['options'];
      expect(compOptions.allowMultiple).toBe(false);
      expect(compOptions.allowDuplicates).toBe(true);
      expect(compOptions.maxSelections).toBe(1);
      expect(compOptions.showCategories).toBe(false);
    });
  });

  describe('Rendering', () => {
    it('should render dye buttons', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const buttons = container.querySelectorAll('.dye-select-btn');
      expect(buttons.length).toBe(3);
    });

    it('should render dye information correctly', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const firstBtn = container.querySelector('.dye-select-btn');
      expect(firstBtn).not.toBeNull();

      const name = firstBtn?.querySelector('.text-sm')?.textContent;
      const hex = firstBtn?.querySelector('.text-xs.font-mono')?.textContent;

      expect(name).toBeTruthy();
      expect(hex).toBe('#FFFFFF');
    });

    it('should show category when showCategories is true', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const firstBtn = container.querySelector('.dye-select-btn');
      const category = firstBtn?.querySelectorAll('.text-xs')[1]?.textContent;
      expect(category).toBeTruthy();
    });

    it('should not show category when showCategories is false', () => {
      const options: DyeGridOptions = { showCategories: false };
      [component, container] = createComponent(DyeGrid, 'test-container');
      component = new DyeGrid(container, options);
      component.init();
      component.setDyes(mockDyes);

      const firstBtn = container.querySelector('.dye-select-btn');
      // Should only have hex code text-xs div, not category
      const textXsDivs = firstBtn?.querySelectorAll('.text-xs');
      expect(textXsDivs?.length).toBe(1);
    });
  });

  describe('Empty States', () => {
    it('should render search empty state', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes([], { type: 'search', query: 'xyz' });

      // The mock returns <div class="flex flex-col">Empty State</div>
      const emptyState = container.querySelector('.flex.flex-col');
      expect(emptyState).not.toBeNull();
      expect(emptyState?.textContent).toContain('Empty State');
    });

    it('should render category empty state', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes([], { type: 'category' });

      const emptyState = container.querySelector('.flex.flex-col');
      expect(emptyState).not.toBeNull();
      expect(emptyState?.textContent).toContain('Empty State');
    });
  });

  describe('Interactions', () => {
    it('should emit dye-selected event on click', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const spy = vi.fn();
      container.addEventListener('dye-selected', (e: any) => spy(e.detail));

      const firstBtn = container.querySelector('.dye-select-btn') as HTMLElement;
      firstBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(spy).toHaveBeenCalledWith(mockDyes[0]);
    });

    it('should update selection visuals', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component.setSelectedDyes([mockDyes[0]]);

      const buttons = container.querySelectorAll('.dye-select-btn');
      expect(buttons[0].getAttribute('aria-selected')).toBe('true');
      expect(buttons[1].getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow keys', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      // Mock grid columns to 1 for predictable navigation
      // And mock updateGridColumns to prevent it from resetting gridColumns
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;

      // Press ArrowDown
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

      expect(component['focusedIndex']).toBe(0);

      // Press ArrowDown again
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(component['focusedIndex']).toBe(1);
    });

    it('should select with Enter key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const spy = vi.fn();
      container.addEventListener('dye-selected', (e: any) => spy(e.detail));

      // Set focus manually
      component['setFocusedIndex'](0);

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(spy).toHaveBeenCalledWith(mockDyes[0]);
    });
  });
});

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

    it('should handle ArrowRight key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 0;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      expect(component['focusedIndex']).toBe(1);
    });

    it('should handle ArrowLeft key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 2;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

      expect(component['focusedIndex']).toBe(1);
    });

    it('should handle ArrowUp key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 2;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

      expect(component['focusedIndex']).toBe(1);
    });

    it('should handle Home key to go to first item', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 2;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

      expect(component['focusedIndex']).toBe(0);
    });

    it('should handle End key to go to last item', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 0;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

      expect(component['focusedIndex']).toBe(2); // Last item index
    });

    it('should handle PageDown key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 0;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));

      // PageDown moves gridColumns * 3 = 3 rows, clamped to last item
      expect(component['focusedIndex']).toBe(2);
    });

    it('should handle PageUp key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 2;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));

      // PageUp moves gridColumns * 3 = 3 rows up, clamped to first item
      expect(component['focusedIndex']).toBe(0);
    });

    it('should select with Space key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const spy = vi.fn();
      container.addEventListener('dye-selected', (e: any) => spy(e.detail));

      // Set focus manually
      component['setFocusedIndex'](1);

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

      expect(spy).toHaveBeenCalledWith(mockDyes[1]);
    });

    it('should emit escape-pressed on Escape key', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const spy = vi.fn();
      container.addEventListener('escape-pressed', () => spy());

      component['focusedIndex'] = 0;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(spy).toHaveBeenCalled();
    });

    it('should not change focus for unrecognized keys', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 1;

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

      // Should remain at the same index
      expect(component['focusedIndex']).toBe(1);
    });

    it('should clamp ArrowRight at the end of the list', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 2; // At last item

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      expect(component['focusedIndex']).toBe(2); // Should stay at last item
    });

    it('should clamp ArrowLeft at the beginning of the list', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['gridColumns'] = 1;
      component['updateGridColumns'] = vi.fn();
      component['focusedIndex'] = 0; // At first item

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

      expect(component['focusedIndex']).toBe(0); // Should stay at first item
    });

    it('should not select with Enter when focusedIndex is -1', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const spy = vi.fn();
      container.addEventListener('dye-selected', (e: any) => spy(e.detail));

      component['focusedIndex'] = -1;
      component['updateGridColumns'] = vi.fn();

      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      // Should not emit because focusedIndex is out of bounds
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit when pressing Enter with no dyes', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes([]);

      const spy = vi.fn();
      container.addEventListener('dye-selected', (e: any) => spy(e.detail));

      component['focusedIndex'] = 0;

      // No grid to dispatch from, so calling handleKeydown directly
      component['handleKeydown'](new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Grid Columns Calculation', () => {
    it('should calculate grid columns from CSS when available', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      // Mock getComputedStyle to return grid template columns
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        gridTemplateColumns: '100px 100px 100px 100px',
      });

      component['updateGridColumns']();

      expect(component['gridColumns']).toBe(4);

      window.getComputedStyle = originalGetComputedStyle;
    });

    it('should fallback to window width when gridTemplateColumns is none', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        gridTemplateColumns: 'none',
      });

      // Mock window.innerWidth to 1024 (lg breakpoint)
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      component['updateGridColumns']();
      expect(component['gridColumns']).toBe(4);

      // Mock window.innerWidth to 768 (md breakpoint)
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      component['updateGridColumns']();
      expect(component['gridColumns']).toBe(3);

      // Mock window.innerWidth to 640 (sm breakpoint)
      Object.defineProperty(window, 'innerWidth', { value: 640, writable: true });
      component['updateGridColumns']();
      expect(component['gridColumns']).toBe(2);

      // Mock window.innerWidth to 500 (below sm)
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      component['updateGridColumns']();
      expect(component['gridColumns']).toBe(1);

      window.getComputedStyle = originalGetComputedStyle;
    });

    it('should return early when grid container not found', () => {
      [component, container] = renderComponent(DyeGrid);
      // Don't set dyes, so no grid exists - component should not throw
      expect(() => {
        component['updateGridColumns']();
      }).not.toThrow();
    });
  });

  describe('setFocusedIndex', () => {
    it('should update tabindex and focus the new button', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      // First set focus to index 0
      component['setFocusedIndex'](0);
      const buttons = container.querySelectorAll('.dye-select-btn');
      expect(buttons[0].getAttribute('tabindex')).toBe('0');

      // Now set focus to index 1
      component['setFocusedIndex'](1);
      expect(buttons[0].getAttribute('tabindex')).toBe('-1');
      expect(buttons[1].getAttribute('tabindex')).toBe('0');
    });

    it('should not update if index is out of bounds (negative)', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['focusedIndex'] = 1;

      component['setFocusedIndex'](-1);

      // Should remain at original index
      expect(component['focusedIndex']).toBe(1);
    });

    it('should not update if index is out of bounds (too large)', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);
      component['focusedIndex'] = 1;

      component['setFocusedIndex'](10);

      // Should remain at original index
      expect(component['focusedIndex']).toBe(1);
    });

    it('should call scrollIntoView on the focused button', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
      component['setFocusedIndex'](1);

      expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
    });
  });

  describe('Click event through event delegation', () => {
    it('should handle click on nested element within button', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const spy = vi.fn();
      container.addEventListener('dye-selected', (e: any) => spy(e.detail));

      // Click on a nested element (e.g., the hex code div)
      const nestedDiv = container.querySelector('.dye-select-btn .font-mono') as HTMLElement;
      nestedDiv.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(spy).toHaveBeenCalledWith(mockDyes[0]);
    });

    it('should not emit if clicking outside a button', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes(mockDyes);

      const spy = vi.fn();
      container.addEventListener('dye-selected', (e: any) => spy(e.detail));

      // Click on the grid wrapper itself, not a button
      const grid = container.querySelector('div[role="grid"]') as HTMLElement;
      grid.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      // Spy should not be called since click is not on a button
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('bindEvents edge cases', () => {
    it('should handle bindEvents when element is null', () => {
      [component, container] = createComponent(DyeGrid, 'test-container');
      component = new DyeGrid(container);
      // Don't call init() so element is null

      // bindEvents should return early without error
      expect(() => component['bindEvents']()).not.toThrow();
    });
  });

  describe('handleKeydown with no buttons', () => {
    it('should return early if there are no dye buttons', () => {
      [component, container] = renderComponent(DyeGrid);
      component.setDyes([]);

      // Manually call handleKeydown - should not throw
      expect(() => {
        component['handleKeydown'](new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      }).not.toThrow();
    });
  });
});

/**
 * XIV Dye Tools - DyeSelector Component Tests
 *
 * Tests for dye selection, filtering, searching, and multi-selection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DyeSelector, type DyeSelectorOptions } from '../dye-selector';
import { DyeService } from '@services/dye-service';
import type { Dye } from '@shared/types';
import {
  createTestContainer,
  cleanupTestContainer,
  renderComponent,
  createComponent,
  cleanupComponent,
  expectElement,
  waitForComponent,
} from './test-utils';

describe('DyeSelector', () => {
  let container: HTMLElement;
  let component: DyeSelector;

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

  // ==========================================================================
  // Initialization Tests
  // ==========================================================================

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      [component, container] = renderComponent(DyeSelector);

      const state = component['options'];
      expect(state.maxSelections).toBe(4);
      expect(state.allowMultiple).toBe(true);
      expect(state.allowDuplicates).toBe(false);
      expect(state.showCategories).toBe(true);
      expect(state.excludeFacewear).toBe(true);
    });

    it('should accept custom options', () => {
      const options: DyeSelectorOptions = {
        maxSelections: 2,
        allowMultiple: false,
        showCategories: false,
        excludeFacewear: false,
      };

      [component, container] = createComponent(DyeSelector, 'test-container');
      component = new DyeSelector(container, options);
      component.init();

      const state = component['options'];
      expect(state.maxSelections).toBe(2);
      expect(state.allowMultiple).toBe(false);
      expect(state.showCategories).toBe(false);
      expect(state.excludeFacewear).toBe(false);
    });

    it('should initialize with empty selection', () => {
      [component, container] = renderComponent(DyeSelector);

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(0);
    });
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('should render search input', () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]');
      expect(searchInput).not.toBeNull();
      expect(searchInput?.getAttribute('placeholder')).toContain('Search');
    });

    it('should render clear button', () => {
      [component, container] = renderComponent(DyeSelector);

      const clearBtn = container.querySelector('#dye-selector-clear-btn');
      expect(clearBtn).not.toBeNull();
      expect(clearBtn?.textContent).toBe('Clear');
    });

    it('should render category buttons when showCategories is true', () => {
      [component, container] = renderComponent(DyeSelector);

      const categoryButtons = container.querySelectorAll('[data-category]');
      expect(categoryButtons.length).toBeGreaterThan(0);
    });

    it('should not render category buttons when showCategories is false', () => {
      const options: DyeSelectorOptions = { showCategories: false };
      component = new DyeSelector(container, options);
      component.init();

      const categoryButtons = container.querySelectorAll('[data-category]');
      expect(categoryButtons.length).toBe(0);
    });

    it('should render dye cards', () => {
      [component, container] = renderComponent(DyeSelector);

      const dyeCards = container.querySelectorAll('.dye-select-btn');
      expect(dyeCards.length).toBeGreaterThan(0);
    });

    it('should render selected dyes counter when allowMultiple is true', () => {
      [component, container] = renderComponent(DyeSelector);

      const selectedLabel = container.querySelector('#selected-dyes-label');
      expect(selectedLabel).not.toBeNull();
      expect(selectedLabel?.textContent).toContain('Selected: 0/4');
    });

    it('should exclude Facewear category by default', () => {
      [component, container] = renderComponent(DyeSelector);

      const categoryButtons = container.querySelectorAll('[data-category]');
      const facewearBtn = Array.from(categoryButtons).find(
        (btn) => btn.getAttribute('data-category') === 'Facewear'
      );

      expect(facewearBtn).toBeUndefined();
    });

    it('should highlight Neutral category by default', () => {
      [component, container] = renderComponent(DyeSelector);

      const neutralBtn = container.querySelector('[data-category="Neutral"]');
      expectElement.toHaveClass(neutralBtn as HTMLElement, 'bg-blue-500');
    });
  });

  // ==========================================================================
  // Search Functionality Tests
  // ==========================================================================

  describe('Search Functionality', () => {
    it('should filter dyes by search query', async () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;

      // Search for "Black"
      searchInput.value = 'Black';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      const dyeCards = container.querySelectorAll('.dye-select-btn');
      const dyeNames = Array.from(dyeCards).map(
        (card) => card.querySelector('.text-sm.font-semibold')?.textContent
      );

      // All visible dyes should contain "Black" in the name
      dyeNames.forEach((name) => {
        expect(name?.toLowerCase()).toContain('black');
      });
    });

    it('should be case-insensitive', async () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;

      searchInput.value = 'WHITE';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      const dyeCards = container.querySelectorAll('.dye-select-btn');
      expect(dyeCards.length).toBeGreaterThan(0);
    });

    it('should update results as user types', async () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;

      // Type "Jet"
      searchInput.value = 'Jet';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      const firstResultCount = container.querySelectorAll('.dye-select-btn').length;

      // Type "Jet Black"
      searchInput.value = 'Jet Black';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      const secondResultCount = container.querySelectorAll('.dye-select-btn').length;

      // More specific search should yield fewer or equal results
      expect(secondResultCount).toBeLessThanOrEqual(firstResultCount);
    });

    it('should preserve search input value during updates', async () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;

      searchInput.value = 'Rose';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      // Trigger an update by selecting a dye
      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      await waitForComponent(50);

      // Search value should be preserved
      expect(searchInput.value).toBe('Rose');
    });
  });

  // ==========================================================================
  // Category Filtering Tests
  // ==========================================================================

  describe('Category Filtering', () => {
    it('should filter dyes by category', async () => {
      [component, container] = renderComponent(DyeSelector);

      const redsBtn = container.querySelector('[data-category="Reds"]') as HTMLButtonElement;
      redsBtn?.click();

      // Wait for component to finish updating
      await waitForComponent(100);

      // Component calls update() synchronously after category click
      const dyeCards = container.querySelectorAll('.dye-select-btn');
      const categories = Array.from(dyeCards).map(
        (card) => card.querySelector('.text-xs.text-gray-500')?.textContent
      );

      // All visible dyes should be in Reds category
      if (categories.length > 0) {
        categories.forEach((cat) => {
          expect(cat).toBe('Reds');
        });
      } else {
        // If no Reds dyes found, verify we have at least some dyes before the filter
        const allDyes = DyeService.getInstance().getAllDyes();
        const redDyes = allDyes.filter((d) => d.category === 'Reds');
        expect(redDyes.length).toBeGreaterThan(0);
      }
    });

    it('should show all dyes when "All" is selected', async () => {
      [component, container] = renderComponent(DyeSelector);

      // First filter to a specific category
      const redsBtn = container.querySelector('[data-category="Reds"]') as HTMLButtonElement;
      redsBtn?.click();

      await waitForComponent(50);

      const redsCount = container.querySelectorAll('.dye-select-btn').length;

      // Now click "All"
      const allBtn = container.querySelector('[data-category="all"]') as HTMLButtonElement;
      allBtn?.click();

      await waitForComponent(50);

      const allCount = container.querySelectorAll('.dye-select-btn').length;

      expect(allCount).toBeGreaterThan(redsCount);
    });

    it('should highlight active category button', async () => {
      [component, container] = renderComponent(DyeSelector);

      const bluesBtn = container.querySelector('[data-category="Blues"]') as HTMLButtonElement;
      bluesBtn?.click();

      await waitForComponent(50);

      // Re-query button after component update
      const updatedBluesBtn = container.querySelector(
        '[data-category="Blues"]'
      ) as HTMLButtonElement;
      expectElement.toHaveClass(updatedBluesBtn, 'bg-blue-500');
      expectElement.toHaveClass(updatedBluesBtn, 'text-white');
    });

    it('should remove highlight from previously active category', async () => {
      [component, container] = renderComponent(DyeSelector);

      const neutralBtn = container.querySelector('[data-category="Neutral"]') as HTMLButtonElement;
      const redsBtn = container.querySelector('[data-category="Reds"]') as HTMLButtonElement;

      // Neutral is highlighted by default
      expectElement.toHaveClass(neutralBtn, 'bg-blue-500');

      // Click Reds
      redsBtn?.click();

      await waitForComponent(50);

      // Re-query buttons after component update
      const updatedNeutralBtn = container.querySelector(
        '[data-category="Neutral"]'
      ) as HTMLButtonElement;
      const updatedRedsBtn = container.querySelector('[data-category="Reds"]') as HTMLButtonElement;

      // Neutral should no longer be highlighted
      expectElement.toNotHaveClass(updatedNeutralBtn, 'bg-blue-500');
      expectElement.toHaveClass(updatedRedsBtn, 'bg-blue-500');
    });
  });

  // ==========================================================================
  // Dye Selection Tests
  // ==========================================================================

  describe('Dye Selection', () => {
    it('should select a dye when clicked', () => {
      [component, container] = renderComponent(DyeSelector);

      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(1);
    });

    it('should emit selection-changed event when dye is selected', () => {
      [component, container] = renderComponent(DyeSelector);

      const eventHandler = vi.fn();
      container.addEventListener('selection-changed', eventHandler);

      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    it('should respect maxSelections limit', () => {
      const options: DyeSelectorOptions = { maxSelections: 2 };
      component = new DyeSelector(container, options);
      component.init();

      // Get all available dyes
      const allDyes = DyeService.getInstance().getAllDyes();
      const dyeIds = allDyes.slice(0, 3).map((d) => d.id);

      // Try to select 3 different dyes by ID
      dyeIds.forEach((id) => {
        const dyeCard = container.querySelector(`[data-dye-id="${id}"]`) as HTMLButtonElement;
        dyeCard?.click();
      });

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(2); // Should stop at 2
    });

    it('should toggle selection when clicking same dye twice (no duplicates)', () => {
      [component, container] = renderComponent(DyeSelector);

      // Get first dye's ID
      const firstCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      const dyeId = firstCard?.getAttribute('data-dye-id');

      // Click once
      const dyeCard1 = container.querySelector(`[data-dye-id="${dyeId}"]`) as HTMLButtonElement;
      dyeCard1?.click();
      expect(component.getSelectedDyes().length).toBe(1);

      // Click again - re-query after component update
      const dyeCard2 = container.querySelector(`[data-dye-id="${dyeId}"]`) as HTMLButtonElement;
      dyeCard2?.click();
      expect(component.getSelectedDyes().length).toBe(0);
    });

    it('should allow duplicates when allowDuplicates is true', () => {
      const options: DyeSelectorOptions = { allowDuplicates: true, maxSelections: 4 };
      component = new DyeSelector(container, options);
      component.init();

      // Get first dye's ID
      const firstCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      const dyeId = firstCard?.getAttribute('data-dye-id');

      // Click same dye twice - use specific selector for dye buttons, not remove buttons
      const dyeCard1 = container.querySelector(
        `.dye-select-btn[data-dye-id="${dyeId}"]`
      ) as HTMLButtonElement;
      dyeCard1?.click();

      expect(component.getSelectedDyes().length).toBe(1); // First click should add one

      // Re-query specifically for the dye grid button (not the remove button in selected list)
      const dyeCard2 = container.querySelector(
        `.dye-select-btn[data-dye-id="${dyeId}"]`
      ) as HTMLButtonElement;
      dyeCard2?.click();

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(2);
    });

    it('should only allow single selection when allowMultiple is false', () => {
      const options: DyeSelectorOptions = { allowMultiple: false };
      component = new DyeSelector(container, options);
      component.init();

      const dyeCards = container.querySelectorAll(
        '.dye-select-btn'
      ) as NodeListOf<HTMLButtonElement>;

      // Click two different dyes
      dyeCards[0]?.click();
      dyeCards[1]?.click();

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(1); // Only last selection should remain
    });

    it('should update selected dyes counter', () => {
      [component, container] = renderComponent(DyeSelector);

      const selectedLabel = container.querySelector('#selected-dyes-label');
      expect(selectedLabel?.textContent).toContain('0/4');

      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      expect(selectedLabel?.textContent).toContain('1/4');
    });

    it('should display selected dye tags', () => {
      [component, container] = renderComponent(DyeSelector);

      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      const selectedList = container.querySelector('#selected-dyes-list');
      const dyeTags = selectedList?.children;

      expect(dyeTags?.length).toBe(1);
    });
  });

  // ==========================================================================
  // Clear Functionality Tests
  // ==========================================================================

  describe('Clear Functionality', () => {
    it('should clear all selections when clear button is clicked', () => {
      [component, container] = renderComponent(DyeSelector);

      // Get dye IDs
      const allDyes = DyeService.getInstance().getAllDyes();
      const dyeIds = allDyes.slice(0, 2).map((d) => d.id);

      // Select two dyes by ID - re-query each time
      dyeIds.forEach((id) => {
        const dyeCard = container.querySelector(`[data-dye-id="${id}"]`) as HTMLButtonElement;
        dyeCard?.click();
      });

      expect(component.getSelectedDyes().length).toBe(2);

      // Click clear button
      const clearBtn = container.querySelector('#dye-selector-clear-btn') as HTMLButtonElement;
      clearBtn?.click();

      expect(component.getSelectedDyes().length).toBe(0);
    });

    it('should emit selection-changed event when cleared', () => {
      [component, container] = renderComponent(DyeSelector);

      const eventHandler = vi.fn();
      container.addEventListener('selection-changed', eventHandler);

      // Select a dye
      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      eventHandler.mockClear();

      // Clear
      const clearBtn = container.querySelector('#dye-selector-clear-btn') as HTMLButtonElement;
      clearBtn?.click();

      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler.mock.calls[0][0].detail.selectedDyes.length).toBe(0);
    });
  });

  // ==========================================================================
  // Remove Dye Tests
  // ==========================================================================

  describe('Remove Dye', () => {
    it('should remove individual dyes from selection', async () => {
      [component, container] = renderComponent(DyeSelector);

      // Get dye IDs
      const allDyes = DyeService.getInstance().getAllDyes();
      const dyeIds = allDyes.slice(0, 2).map((d) => d.id);

      // Select two dyes by ID - re-query each time
      dyeIds.forEach((id) => {
        const dyeCard = container.querySelector(`[data-dye-id="${id}"]`) as HTMLButtonElement;
        dyeCard?.click();
      });

      await waitForComponent(50);

      expect(component.getSelectedDyes().length).toBe(2);

      // Click remove button on first dye
      const removeBtn = container.querySelector('.dye-remove-btn') as HTMLButtonElement;
      removeBtn?.click();

      await waitForComponent(50);

      expect(component.getSelectedDyes().length).toBe(1);
    });

    it('should emit selection-changed event when dye is removed', async () => {
      [component, container] = renderComponent(DyeSelector);

      const eventHandler = vi.fn();
      container.addEventListener('selection-changed', eventHandler);

      // Select a dye
      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      await waitForComponent(50);

      eventHandler.mockClear();

      // Remove the dye
      const removeBtn = container.querySelector('.dye-remove-btn') as HTMLButtonElement;
      removeBtn?.click();

      expect(eventHandler).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Combined Filtering Tests
  // ==========================================================================

  describe('Combined Filtering', () => {
    it('should combine search and category filtering', async () => {
      [component, container] = renderComponent(DyeSelector);

      // Select Reds category
      const redsBtn = container.querySelector('[data-category="Reds"]') as HTMLButtonElement;
      redsBtn?.click();

      await waitForComponent(50);

      // Search for "Rose"
      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
      searchInput.value = 'Rose';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      const dyeCards = container.querySelectorAll('.dye-select-btn');
      const dyeNames = Array.from(dyeCards).map(
        (card) => card.querySelector('.text-sm.font-semibold')?.textContent
      );

      // All visible dyes should be Reds AND contain "Rose"
      dyeNames.forEach((name) => {
        expect(name?.toLowerCase()).toContain('rose');
      });

      const categories = Array.from(dyeCards).map(
        (card) => card.querySelector('.text-xs.text-gray-500')?.textContent
      );

      categories.forEach((cat) => {
        expect(cat).toBe('Reds');
      });
    });
  });

  // ==========================================================================
  // State Management Tests
  // ==========================================================================

  describe('State Management', () => {
    it('should get component state', () => {
      [component, container] = renderComponent(DyeSelector);

      const state = component['getState']();

      expect(state).toHaveProperty('selectedDyes');
      expect(state).toHaveProperty('searchQuery');
      expect(state).toHaveProperty('currentCategory');
    });

    it('should set component state', () => {
      [component, container] = renderComponent(DyeSelector);

      const dyeService = DyeService.getInstance();
      const testDye = dyeService.getAllDyes()[0];

      component['setState']({
        selectedDyes: [testDye],
        searchQuery: 'test',
        currentCategory: 'Red',
      });

      const state = component['getState']();
      expect(state.selectedDyes).toEqual([testDye]);
      expect(state.searchQuery).toBe('test');
      expect(state.currentCategory).toBe('Red');
    });

    it('should get selected dyes', () => {
      [component, container] = renderComponent(DyeSelector);

      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      const selectedDyes = component.getSelectedDyes();
      expect(Array.isArray(selectedDyes)).toBe(true);
      expect(selectedDyes.length).toBe(1);
    });

    it('should set selected dyes programmatically', () => {
      [component, container] = renderComponent(DyeSelector);

      const dyeService = DyeService.getInstance();
      const testDyes = dyeService.getAllDyes().slice(0, 2);

      component.setSelectedDyes(testDyes);

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(2);
    });

    it('should enforce maxSelections when setting dyes', () => {
      const options: DyeSelectorOptions = { maxSelections: 2 };
      component = new DyeSelector(container, options);
      component.init();

      const dyeService = DyeService.getInstance();
      const testDyes = dyeService.getAllDyes().slice(0, 5);

      component.setSelectedDyes(testDyes);

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(2); // Should cap at maxSelections
    });
  });

  // ==========================================================================
  // Lifecycle Tests
  // ==========================================================================

  describe('Lifecycle', () => {
    it('should clean up event listeners on destroy', () => {
      [component, container] = renderComponent(DyeSelector);

      const listenerCount = component['listeners'].size;
      expect(listenerCount).toBeGreaterThan(0);

      component.destroy();

      expect(component['listeners'].size).toBe(0);
    });

    it('should maintain functionality after update', async () => {
      [component, container] = renderComponent(DyeSelector);

      // Select a dye
      const dyeCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      dyeCard?.click();

      await waitForComponent(50);

      // Search should still work after selection triggered update
      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
      searchInput.value = 'Black';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      const dyeCards = container.querySelectorAll('.dye-select-btn');
      expect(dyeCards.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]');
      expect(searchInput?.getAttribute('aria-label')).toBe('Search dyes');

      const clearBtn = container.querySelector('#dye-selector-clear-btn');
      expect(clearBtn?.getAttribute('aria-label')).toBe('Clear all selections');
    });

    it('should have keyboard-accessible buttons', () => {
      [component, container] = renderComponent(DyeSelector);

      const dyeCards = container.querySelectorAll(
        '.dye-select-btn'
      ) as NodeListOf<HTMLButtonElement>;

      dyeCards.forEach((card) => {
        expect(card.tagName).toBe('BUTTON');
        expect(card.getAttribute('type')).toBe('button');
      });
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty search results gracefully', async () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
      searchInput.value = 'NONEXISTENT_DYE_123456';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(50);

      const dyeCards = container.querySelectorAll('.dye-select-btn');
      expect(dyeCards.length).toBe(0);
    });

    it('should handle rapid selection/deselection', () => {
      [component, container] = renderComponent(DyeSelector);

      // Get first dye's ID
      const firstCard = container.querySelector('.dye-select-btn') as HTMLButtonElement;
      const dyeId = firstCard?.getAttribute('data-dye-id');

      // Rapidly click same dye - re-query each time
      for (let i = 0; i < 10; i++) {
        const dyeCard = container.querySelector(`[data-dye-id="${dyeId}"]`) as HTMLButtonElement;
        dyeCard?.click();
      }

      const selectedDyes = component.getSelectedDyes();
      expect(selectedDyes.length).toBe(0); // Should end with 0 (even number of clicks)
    });

    it('should handle search input trimming', async () => {
      [component, container] = renderComponent(DyeSelector);

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;

      // Search with leading/trailing spaces
      searchInput.value = '   Black   ';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForComponent(100);

      const dyeCards = container.querySelectorAll('.dye-select-btn');
      const dyeNames = Array.from(dyeCards).map(
        (card) => card.querySelector('.text-sm.font-semibold')?.textContent
      );

      expect(dyeCards.length).toBeGreaterThan(0);
    });
  });
});

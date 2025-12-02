/**
 * XIV Dye Tools v2.0.0 - Dye Selector Component
 *
 * Phase 12: Architecture Refactor
 * UI component for selecting and filtering dyes from the database
 *
 * @module components/dye-selector
 */

import { BaseComponent } from './base-component';
import { DyeService, LanguageService } from '@services/index';
import type { Dye } from '@shared/types';
import { logger } from '@shared/logger';
import { clearContainer } from '@shared/utils';
import { DyeSearchBox, SortOption } from './dye-search-box';
import { DyeGrid } from './dye-grid';

/**
 * Options for dye selector initialization
 */
export interface DyeSelectorOptions {
  maxSelections?: number;
  allowMultiple?: boolean;
  allowDuplicates?: boolean;
  showCategories?: boolean;
  showPrices?: boolean;
  excludeFacewear?: boolean;
}

/**
 * Dye selector component - allows users to browse and select dyes
 * Supports filtering by category and searching by name
 */
export class DyeSelector extends BaseComponent {
  private selectedDyes: Dye[] = [];
  private filteredDyes: Dye[] = [];
  private currentCategory: string | null = 'Neutral';
  private searchQuery: string = '';
  private sortOption: SortOption = 'alphabetical';
  private options: DyeSelectorOptions;
  private allowDuplicates: boolean = false;

  // Sub-components
  private searchBox: DyeSearchBox | null = null;
  private dyeGrid: DyeGrid | null = null;

  constructor(container: HTMLElement, options: DyeSelectorOptions = {}) {
    super(container);
    this.options = {
      maxSelections: options.maxSelections ?? 4,
      allowMultiple: options.allowMultiple ?? true,
      allowDuplicates: options.allowDuplicates ?? false,
      showCategories: options.showCategories ?? true,
      showPrices: options.showPrices ?? false,
      excludeFacewear: options.excludeFacewear ?? true,
    };
    this.allowDuplicates = this.options.allowDuplicates ?? false;
  }

  /**
   * Render the dye selector component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-4',
    });

    // 1. Search Box Container
    const searchBoxContainer = this.createElement('div');
    wrapper.appendChild(searchBoxContainer);

    this.searchBox = new DyeSearchBox(searchBoxContainer, {
      showCategories: this.options.showCategories,
      excludeFacewear: this.options.excludeFacewear,
      initialSort: this.sortOption,
      initialCategory: this.currentCategory,
      initialSearch: this.searchQuery
    });
    this.searchBox.init();

    // 2. Selected Dyes Display
    if (this.options.allowMultiple) {
      const selectedContainer = this.createElement('div', {
        id: 'selected-dyes-container',
        className: 'p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700',
        attributes: { style: this.selectedDyes.length > 0 ? '' : 'display: none;' }
      });
      selectedContainer.style.display = ''; // Reset style

      const selectedLabel = this.createElement('div', {
        id: 'selected-dyes-label',
        className: 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
      });
      selectedContainer.appendChild(selectedLabel);

      const selectedList = this.createElement('div', {
        id: 'selected-dyes-list',
        className: 'flex flex-wrap gap-2',
      });
      selectedContainer.appendChild(selectedList);

      wrapper.appendChild(selectedContainer);
    }

    // 3. Dye Grid Container
    const gridContainer = this.createElement('div', { id: 'dye-grid-container' });
    wrapper.appendChild(gridContainer);

    this.dyeGrid = new DyeGrid(gridContainer, {
      allowMultiple: this.options.allowMultiple,
      allowDuplicates: this.allowDuplicates,
      maxSelections: this.options.maxSelections,
      showCategories: this.options.showCategories
    });
    this.dyeGrid.init();

    clearContainer(this.container);
    this.element = wrapper;
    this.container.appendChild(this.element);

    this.bindEvents();
    this.update();
  }

  bindEvents(): void {
    // Listen for events from DyeGrid
    // We listen on gridContainer directly to ensure we catch the event
    const gridContainer = this.element.querySelector('#dye-grid-container');
    console.error('DyeSelector bindEvents gridContainer:', gridContainer);

    if (gridContainer) {
      this.on(gridContainer as HTMLElement, 'dye-selected', (e) => {
        console.error('DyeSelector received dye-selected');
        const event = e as CustomEvent<Dye>;
        e.stopPropagation(); // Stop propagation to avoid double handling if bubbling works
        this.handleDyeSelection(event.detail);
      });
    } else {
      console.error('DyeSelector: gridContainer not found for dye-selected event listener.');
    }

    // Listen for events from DyeSearchBox (bubbled)
    this.onCustom('search-changed', (e) => {
      this.searchQuery = e.detail as string;
      this.updateGrid();
    });

    this.onCustom('sort-changed', (e) => {
      this.sortOption = e.detail as SortOption;
      this.updateGrid();
    });

    this.onCustom('category-changed', (e) => {
      this.currentCategory = e.detail as string | null;
      this.updateGrid();
    });

    this.onCustom('clear-all', () => {
      this.selectedDyes = [];
      this.searchQuery = '';
      this.update();
      this.emit('selection-changed', { selectedDyes: this.selectedDyes });
    });


    this.onCustom('escape-pressed', () => {
      if (this.selectedDyes.length > 0) {
        this.selectedDyes = [];
        this.update();
        this.emit('selection-changed', { selectedDyes: this.selectedDyes });
      } else {
        (document.activeElement as HTMLElement)?.blur();
      }
    });

    // Global keyboard shortcut
    this.on(document, 'keydown', this.handleGlobalKeydown);
  }

  private handleDyeSelection(dye: Dye): void {
    console.log('handleDyeSelection', dye.name);
    if (this.options.allowMultiple) {
      if (this.allowDuplicates) {
        if (this.selectedDyes.length < (this.options.maxSelections ?? 4)) {
          this.selectedDyes.push(dye);
        }
      } else {
        const index = this.selectedDyes.findIndex(d => d.id === dye.id);
        if (index >= 0) {
          this.selectedDyes.splice(index, 1);
        } else if (this.selectedDyes.length < (this.options.maxSelections ?? 4)) {
          this.selectedDyes.push(dye);
        }
      }
    } else {
      this.selectedDyes = [dye];
    }

    this.updateSelectedList();
    this.dyeGrid?.setSelectedDyes(this.selectedDyes);
    this.emit('selection-changed', { selectedDyes: this.selectedDyes });
  }

  private handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === '/' || (event.ctrlKey && event.key === 'f')) {
      if (document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        this.searchBox?.focusSearch();
      }
    }
  }

  override update(): void {
    if (!this.isInitialized) return;

    // Update Selected Dyes List
    this.updateSelectedList();

    // Update Grid
    this.updateGrid();
  }

  private updateSelectedList(): void {
    if (!this.options.allowMultiple) return;

    const selectedLabel = this.container.querySelector<HTMLElement>('#selected-dyes-label');
    const selectedList = this.container.querySelector<HTMLElement>('#selected-dyes-list');

    if (selectedLabel) {
      selectedLabel.textContent = LanguageService.tInterpolate('dyeSelector.selected', {
        current: String(this.selectedDyes.length),
        max: String(this.options.maxSelections),
      });
    }

    if (selectedList) {
      clearContainer(selectedList);

      this.selectedDyes.forEach(dye => {
        const dyeTag = this.createElement('div', {
          className: 'inline-flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm',
        });

        const dyeColor = this.createElement('div', {
          className: 'w-3 h-3 rounded-full border border-gray-400',
          attributes: { style: `background-color: ${dye.hex}` },
        });

        const dyeName = this.createElement('span', {
          textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
          className: 'text-gray-900 dark:text-white',
        });

        const removeBtn = this.createElement('button', {
          textContent: '✕',
          className: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dye-remove-btn',
          attributes: {
            'data-dye-id': String(dye.id),
            type: 'button',
          },
        });

        this.on(removeBtn, 'click', (e) => {
          e.preventDefault();
          this.selectedDyes = this.selectedDyes.filter(d => d.id !== dye.id);
          this.update();
          this.emit('selection-changed', { selectedDyes: this.selectedDyes });
        });

        dyeTag.appendChild(dyeColor);
        dyeTag.appendChild(dyeName);
        dyeTag.appendChild(removeBtn);
        selectedList.appendChild(dyeTag);
      });
    }
  }

  private updateGrid(): void {
    if (!this.dyeGrid) return;

    this.filteredDyes = this.getFilteredDyes();

    this.dyeGrid.setDyes(this.filteredDyes, {
      type: this.searchQuery.trim() ? 'search' : 'category',
      query: this.searchQuery
    });
    this.dyeGrid.setSelectedDyes(this.selectedDyes);
  }

  private getFilteredDyes(): Dye[] {
    const dyeService = DyeService.getInstance();
    let dyes = dyeService.getAllDyes();

    // console.log('getFilteredDyes', { query: this.searchQuery, totalDyes: dyes.length });

    if (this.options.excludeFacewear) {
      dyes = dyes.filter((d) => d.category !== 'Facewear');
    }

    if (this.currentCategory) {
      dyes = dyes.filter((d) => d.category === this.currentCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      dyes = dyes.filter((d) => d.name.toLowerCase().includes(query));
    }

    dyes.sort((a, b) => this.compareDyes(a, b, this.sortOption));

    return dyes;
  }

  private compareDyes(a: Dye, b: Dye, sortOption: SortOption): number {
    switch (sortOption) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'brightness-asc':
        return a.hsv.v - b.hsv.v;
      case 'brightness-desc':
        return b.hsv.v - a.hsv.v;
      case 'hue': {
        const hueDiff = a.hsv.h - b.hsv.h;
        if (Math.abs(hueDiff) > 1) return hueDiff;
        const satDiff = b.hsv.s - a.hsv.s;
        if (Math.abs(satDiff) > 1) return satDiff;
        return b.hsv.v - a.hsv.v;
      }
      case 'saturation': {
        const saturationDiff = a.hsv.s - b.hsv.s;
        if (Math.abs(saturationDiff) > 1) return saturationDiff;
        return a.hsv.v - b.hsv.v;
      }
      case 'category': {
        const categoryDiff = a.category.localeCompare(b.category);
        if (categoryDiff !== 0) return categoryDiff;
        return a.name.localeCompare(b.name);
      }
      default:
        return a.name.localeCompare(b.name);
    }
  }

  onMount(): void {
    LanguageService.subscribe(() => {
      this.update();
    });
  }

  getSelectedDyes(): Dye[] {
    return [...this.selectedDyes];
  }

  setSelectedDyes(dyes: Dye[]): void {
    this.selectedDyes = dyes.slice(0, this.options.maxSelections ?? 4);
    this.update();
  }

  protected getState(): Record<string, unknown> {
    return {
      selectedDyes: this.selectedDyes,
      searchQuery: this.searchQuery,
      currentCategory: this.currentCategory,
      sortOption: this.sortOption,
    };
  }

  protected setState(newState: Record<string, unknown>): void {
    if (Array.isArray(newState.selectedDyes)) {
      this.selectedDyes = newState.selectedDyes;
    }
    if (typeof newState.searchQuery === 'string') {
      this.searchQuery = newState.searchQuery;
    }
    if (newState.currentCategory === null || typeof newState.currentCategory === 'string') {
      this.currentCategory = newState.currentCategory;
    }
    if (typeof newState.sortOption === 'string') {
      this.sortOption = newState.sortOption as SortOption;
    }
  }
}

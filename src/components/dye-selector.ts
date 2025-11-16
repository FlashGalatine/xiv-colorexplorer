/**
 * XIV Dye Tools v2.0.0 - Dye Selector Component
 *
 * Phase 12: Architecture Refactor
 * UI component for selecting and filtering dyes from the database
 *
 * @module components/dye-selector
 */

import { BaseComponent } from './base-component';
import { DyeService } from '@services/index';
import type { Dye } from '@shared/types';

/**
 * Options for dye selector initialization
 */
export interface DyeSelectorOptions {
  maxSelections?: number;
  allowMultiple?: boolean;
  showCategories?: boolean;
  showPrices?: boolean;
}

/**
 * Dye selector component - allows users to browse and select dyes
 * Supports filtering by category and searching by name
 */
export class DyeSelector extends BaseComponent {
  private selectedDyes: Dye[] = [];
  private filteredDyes: Dye[] = [];
  private currentCategory: string | null = null;
  private searchQuery: string = '';
  private options: DyeSelectorOptions;

  constructor(container: HTMLElement, options: DyeSelectorOptions = {}) {
    super(container);
    this.options = {
      maxSelections: options.maxSelections ?? 4,
      allowMultiple: options.allowMultiple ?? true,
      showCategories: options.showCategories ?? true,
      showPrices: options.showPrices ?? false,
    };
  }

  /**
   * Render the dye selector component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-4',
    });

    // Search input
    const searchContainer = this.createElement('div', {
      className: 'flex gap-2',
    });

    const searchInput = this.createElement('input', {
      attributes: {
        type: 'text',
        placeholder: 'Search dyes by name...',
        'aria-label': 'Search dyes',
      },
      className:
        'flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
    });

    const clearBtn = this.createElement('button', {
      textContent: 'Clear',
      className:
        'px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors',
      attributes: {
        'aria-label': 'Clear all selections',
      },
    });

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearBtn);
    wrapper.appendChild(searchContainer);

    // Category filter (if enabled)
    if (this.options.showCategories) {
      const categoryContainer = this.createElement('div', {
        className: 'flex flex-wrap gap-2',
      });

      const allBtn = this.createElement('button', {
        textContent: 'All',
        className: 'px-3 py-1 rounded-full text-sm font-medium transition-colors',
        attributes: {
          'data-category': 'all',
        },
      });
      allBtn.classList.add('bg-blue-500', 'text-white');
      categoryContainer.appendChild(allBtn);

      const categories = DyeService.getInstance().getCategories();
      for (const category of categories) {
        const categoryBtn = this.createElement('button', {
          textContent: category,
          className:
            'px-3 py-1 rounded-full text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          attributes: {
            'data-category': category,
          },
        });
        categoryContainer.appendChild(categoryBtn);
      }

      wrapper.appendChild(categoryContainer);
    }

    // Selected dyes display
    if (this.options.allowMultiple) {
      const selectedContainer = this.createElement('div', {
        className:
          'p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700',
      });

      const selectedLabel = this.createElement('div', {
        textContent: `Selected: ${this.selectedDyes.length}/${this.options.maxSelections}`,
        className: 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
      });
      selectedContainer.appendChild(selectedLabel);

      const selectedList = this.createElement('div', {
        id: 'selected-dyes-list',
        className: 'flex flex-wrap gap-2',
      });

      for (const dye of this.selectedDyes) {
        const dyeTag = this.createElement('div', {
          className:
            'inline-flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm',
        });

        const dyeColor = this.createElement('div', {
          className: 'w-3 h-3 rounded-full border border-gray-400',
          attributes: {
            style: `background-color: ${dye.hex}`,
          },
        });

        const dyeName = this.createElement('span', {
          textContent: dye.name,
          className: 'text-gray-900 dark:text-white',
        });

        const removeBtn = this.createElement('button', {
          textContent: '✕',
          className:
            'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dye-remove-btn',
          attributes: {
            'data-dye-id': String(dye.id),
            type: 'button',
          },
        });

        dyeTag.appendChild(dyeColor);
        dyeTag.appendChild(dyeName);
        dyeTag.appendChild(removeBtn);
        selectedList.appendChild(dyeTag);
      }

      selectedContainer.appendChild(selectedList);
      wrapper.appendChild(selectedContainer);
    }

    // Dye list
    const dyeListContainer = this.createElement('div', {
      className:
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto',
    });

    this.filteredDyes = this.getFilteredDyes();

    for (const dye of this.filteredDyes) {
      const dyeCard = this.createElement('button', {
        className:
          'dye-select-btn p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left',
        attributes: {
          'data-dye-id': String(dye.id),
          type: 'button',
        },
      });

      const dyeCardContent = this.createElement('div', {
        className: 'space-y-1',
      });

      const colorDiv = this.createElement('div', {
        className: 'w-full h-12 rounded border border-gray-300 dark:border-gray-600',
        attributes: {
          style: `background-color: ${dye.hex}`,
        },
      });

      const nameDiv = this.createElement('div', {
        textContent: dye.name,
        className: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
      });

      const hexDiv = this.createElement('div', {
        textContent: dye.hex,
        className: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
      });

      const categoryDiv = this.createElement('div', {
        textContent: dye.category,
        className: 'text-xs text-gray-500 dark:text-gray-500',
      });

      dyeCardContent.appendChild(colorDiv);
      dyeCardContent.appendChild(nameDiv);
      dyeCardContent.appendChild(hexDiv);
      if (this.options.showCategories) {
        dyeCardContent.appendChild(categoryDiv);
      }

      dyeCard.appendChild(dyeCardContent);
      dyeListContainer.appendChild(dyeCard);
    }

    wrapper.appendChild(dyeListContainer);

    // Clear existing content and add new
    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const searchInput = this.querySelector<HTMLInputElement>('input[type="text"]');
    // Find clear button by nth-of-type or by searching for the button after search input
    const clearBtn = this.querySelector<HTMLButtonElement>('button:nth-of-type(2)');
    const categoryButtons = this.querySelectorAll<HTMLButtonElement>('[data-category]');
    const dyeButtons = this.querySelectorAll<HTMLButtonElement>('.dye-select-btn');

    console.info(
      `🎨 DyeSelector bindEvents: Found ${categoryButtons.length} categories, ${dyeButtons.length} dyes`
    );

    // Search functionality
    if (searchInput) {
      this.on(searchInput, 'input', () => {
        this.searchQuery = searchInput.value;
        this.update();
      });
    }

    // Clear selections
    if (clearBtn) {
      this.on(clearBtn, 'click', () => {
        this.selectedDyes = [];
        this.update();
        this.emit('selection-changed', { selectedDyes: this.selectedDyes });
      });
    }

    // Category filtering
    for (const catBtn of categoryButtons) {
      this.on(catBtn, 'click', () => {
        const category = catBtn.getAttribute('data-category');
        this.currentCategory = category === 'all' ? null : category;

        // Update button states
        categoryButtons.forEach((btn) => {
          btn.classList.remove('bg-blue-500', 'text-white');
          btn.classList.add(
            'border',
            'border-gray-300',
            'dark:border-gray-600',
            'text-gray-700',
            'dark:text-gray-300',
            'hover:bg-gray-100',
            'dark:hover:bg-gray-700'
          );
        });

        catBtn.classList.remove(
          'border',
          'border-gray-300',
          'dark:border-gray-600',
          'text-gray-700',
          'dark:text-gray-300',
          'hover:bg-gray-100',
          'dark:hover:bg-gray-700'
        );
        catBtn.classList.add('bg-blue-500', 'text-white');

        this.update();
      });
    }

    // Dye selection
    console.info(`🎨 DyeSelector: Attaching click handlers to ${dyeButtons.length} dye buttons`);
    for (const dyeBtn of dyeButtons) {
      this.on(dyeBtn, 'click', () => {
        const dyeId = parseInt(dyeBtn.getAttribute('data-dye-id') || '0', 10);
        const dye = DyeService.getInstance().getDyeById(dyeId);

        console.info(
          `🎨 DyeSelector: Clicked dye ID ${dyeId}, found dye: ${dye?.name || 'NOT FOUND'}`
        );

        if (!dye) return;

        if (this.options.allowMultiple) {
          // Toggle selection
          const index = this.selectedDyes.findIndex((d) => d.id === dyeId);
          if (index >= 0) {
            this.selectedDyes.splice(index, 1);
            console.info(`🎨 DyeSelector: Deselected ${dye.name}`);
          } else if (this.selectedDyes.length < (this.options.maxSelections ?? 4)) {
            this.selectedDyes.push(dye);
            console.info(`🎨 DyeSelector: Selected ${dye.name}`);
          }
        } else {
          // Single selection
          this.selectedDyes = [dye];
          console.info(`🎨 DyeSelector: Selected ${dye.name} (single)`);
        }

        this.update();
        this.emit('selection-changed', { selectedDyes: this.selectedDyes });
      });
    }

    // Remove selected dye buttons
    const removeButtons = this.querySelectorAll<HTMLButtonElement>('.dye-remove-btn');
    for (const removeBtn of removeButtons) {
      this.on(removeBtn, 'click', (event) => {
        event.preventDefault();
        const dyeId = parseInt(removeBtn.getAttribute('data-dye-id') || '0', 10);
        this.selectedDyes = this.selectedDyes.filter((d) => d.id !== dyeId);
        this.update();
        this.emit('selection-changed', { selectedDyes: this.selectedDyes });
      });
    }
  }

  /**
   * Get filtered and searched dyes
   */
  private getFilteredDyes(): Dye[] {
    const dyeService = DyeService.getInstance();
    let dyes = dyeService.getAllDyes();

    // Filter by category
    if (this.currentCategory) {
      dyes = dyes.filter((d) => d.category === this.currentCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      dyes = dyes.filter((d) => d.name.toLowerCase().includes(query));
    }

    return dyes;
  }

  /**
   * Get selected dyes
   */
  getSelectedDyes(): Dye[] {
    return [...this.selectedDyes];
  }

  /**
   * Set selected dyes
   */
  setSelectedDyes(dyes: Dye[]): void {
    this.selectedDyes = dyes.slice(0, this.options.maxSelections ?? 4);
    this.update();
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      selectedDyes: this.selectedDyes,
      searchQuery: this.searchQuery,
      currentCategory: this.currentCategory,
    };
  }

  /**
   * Set component state
   */
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
  }
}

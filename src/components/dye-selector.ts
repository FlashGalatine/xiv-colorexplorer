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
  private options: DyeSelectorOptions;
  private allowDuplicates: boolean = false;

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

    // Search input
    const searchContainer = this.createElement('div', {
      className: 'flex flex-col sm:flex-row gap-2',
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
        'px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto',
      attributes: {
        id: 'dye-selector-clear-btn',
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
        className:
          'px-3 py-1 rounded-full text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        attributes: {
          'data-category': 'all',
        },
      });
      categoryContainer.appendChild(allBtn);

      let categories = DyeService.getInstance().getCategories();

      // Exclude Facewear from category list if option is enabled
      if (this.options.excludeFacewear) {
        categories = categories.filter((cat) => cat !== 'Facewear');
      }

      for (const category of categories) {
        const categoryBtn = this.createElement('button', {
          textContent: category,
          className:
            'px-3 py-1 rounded-full text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          attributes: {
            'data-category': category,
          },
        });

        // Highlight Neutral category by default
        if (category === 'Neutral') {
          categoryBtn.classList.add('bg-blue-500', 'text-white');
          categoryBtn.classList.remove(
            'border-gray-300',
            'dark:border-gray-600',
            'text-gray-700',
            'dark:text-gray-300',
            'hover:bg-gray-100',
            'dark:hover:bg-gray-700'
          );
        }

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
        id: 'selected-dyes-label',
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

      // Verify attribute was set
      const verifyId = dyeCard.getAttribute('data-dye-id');
      if (verifyId !== String(dye.id)) {
        console.warn(
          `🎨 DyeSelector: Failed to set data-dye-id for ${dye.name}. Expected: ${dye.id}, Got: ${verifyId}`
        );
      }

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
    // Find clear button by ID (fixed: was incorrectly using nth-of-type which selected category buttons instead)
    const clearBtn = this.querySelector<HTMLButtonElement>('#dye-selector-clear-btn');
    const categoryButtons = this.querySelectorAll<HTMLButtonElement>('[data-category]');

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

    // Dye selection - use event delegation on container
    const dyeListContainer = this.querySelector<HTMLElement>('div.grid');

    if (dyeListContainer) {
      // Use event delegation to handle dye button clicks
      this.on(dyeListContainer, 'click', (event: Event) => {
        const mouseEvent = event as MouseEvent;
        let target = mouseEvent.target as HTMLElement | null;

        // Traverse up the DOM tree to find a dye-select-btn
        while (target && !target.classList.contains('dye-select-btn')) {
          target = target.parentElement;
        }

        if (!target || !target.classList.contains('dye-select-btn')) {
          return;
        }

        const dyeIdAttr = target.getAttribute('data-dye-id');
        const dyeId = parseInt(dyeIdAttr || '0', 10);
        const dye = DyeService.getInstance().getDyeById(dyeId);

        if (!dye) return;

        if (this.options.allowMultiple) {
          if (this.allowDuplicates) {
            // Allow duplicates - just push if under limit
            if (this.selectedDyes.length < (this.options.maxSelections ?? 4)) {
              this.selectedDyes.push(dye);
            }
          } else {
            // Toggle selection (prevent duplicates)
            const index = this.selectedDyes.findIndex((d) => d.id === dyeId);
            if (index >= 0) {
              this.selectedDyes.splice(index, 1);
            } else if (this.selectedDyes.length < (this.options.maxSelections ?? 4)) {
              this.selectedDyes.push(dye);
            }
          }
        } else {
          // Single selection
          this.selectedDyes = [dye];
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
   * Smart update that only re-renders the dye list without losing focus/input
   */
  override update(): void {
    if (!this.isInitialized) {
      console.warn('Component not initialized');
      return;
    }

    try {
      // Preserve search input state
      const searchInput = this.querySelector<HTMLInputElement>('input[type="text"]');
      const searchValue = searchInput?.value ?? '';
      const isSearchFocused = searchInput === document.activeElement;

      // Update selected dyes display only
      const selectedList = this.querySelector<HTMLElement>('#selected-dyes-list');
      if (selectedList && this.options.allowMultiple) {
        // Update the counter label
        const selectedLabel = this.querySelector<HTMLElement>('#selected-dyes-label');
        if (selectedLabel) {
          selectedLabel.textContent = `Selected: ${this.selectedDyes.length}/${this.options.maxSelections}`;
        }

        selectedList.innerHTML = '';

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

        // Re-bind remove button events
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

      // Update dye list grid
      const dyeListContainer = this.querySelector<HTMLElement>('div.grid');
      if (dyeListContainer) {
        dyeListContainer.innerHTML = '';

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
        // NOTE: Event delegation for dye selection is set up in bindEvents()
        // Do NOT re-bind here as it causes exponential event stacking
      }

      // Update category button states (visual highlight for active category)
      const categoryButtons = this.querySelectorAll<HTMLButtonElement>('[data-category]');
      for (const btn of categoryButtons) {
        const btnCategory = btn.getAttribute('data-category');
        const isActive =
          (btnCategory === 'all' && this.currentCategory === null) ||
          (btnCategory !== 'all' && btnCategory === this.currentCategory);

        if (isActive) {
          btn.classList.remove(
            'border',
            'border-gray-300',
            'dark:border-gray-600',
            'text-gray-700',
            'dark:text-gray-300',
            'hover:bg-gray-100',
            'dark:hover:bg-gray-700'
          );
          btn.classList.add('bg-blue-500', 'text-white');
        } else {
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
        }
      }

      // Restore search input value and focus
      if (searchInput && searchValue !== '') {
        searchInput.value = searchValue;
      }
      if (isSearchFocused && searchInput) {
        searchInput.focus();
      }

      this.onUpdate?.();
    } catch (error) {
      console.error('Error updating DyeSelector:', error);
    }
  }

  /**
   * Get filtered and searched dyes
   */
  private getFilteredDyes(): Dye[] {
    const dyeService = DyeService.getInstance();
    let dyes = dyeService.getAllDyes();

    // Exclude Facewear by default
    if (this.options.excludeFacewear) {
      dyes = dyes.filter((d) => d.category !== 'Facewear');
    }

    // Filter by category
    if (this.currentCategory) {
      dyes = dyes.filter((d) => d.category === this.currentCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase(); // Trim before filtering
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

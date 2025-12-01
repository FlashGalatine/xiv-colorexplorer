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
import { getEmptyStateHTML } from './empty-state';
import { ICON_SEARCH, ICON_PALETTE } from '@shared/empty-state-icons';

/**
 * Sort options for dye list
 */
type SortOption = 'alphabetical' | 'brightness-asc' | 'brightness-desc' | 'hue' | 'saturation' | 'category';

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
  /** Index of focused dye card for keyboard navigation (-1 = none) */
  private focusedIndex: number = -1;
  /** Number of columns in the grid (for keyboard navigation) */
  private gridColumns: number = 4;

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
        placeholder: LanguageService.t('dyeSelector.searchPlaceholder'),
        'aria-label': LanguageService.t('dyeSelector.searchAriaLabel'),
      },
      className:
        'flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
    });

    const clearBtn = this.createElement('button', {
      textContent: LanguageService.t('common.clear'),
      className:
        'px-4 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto',
      attributes: {
        id: 'dye-selector-clear-btn',
        'aria-label': LanguageService.t('dyeSelector.clearAriaLabel'),
        style: 'background-color: var(--theme-background-secondary); color: var(--theme-text);',
      },
    });

    // Add hover effect with brightness filter
    clearBtn.addEventListener('mouseenter', () => {
      clearBtn.style.filter = 'brightness(0.9)';
    });
    clearBtn.addEventListener('mouseleave', () => {
      clearBtn.style.filter = '';
    });
    clearBtn.addEventListener('mousedown', () => {
      clearBtn.style.filter = 'brightness(0.8)';
    });
    clearBtn.addEventListener('mouseup', () => {
      clearBtn.style.filter = 'brightness(0.9)';
    });

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearBtn);
    wrapper.appendChild(searchContainer);

    // Sort dropdown
    const sortContainer = this.createElement('div', {
      className: 'flex items-center gap-2',
    });

    const sortLabel = this.createElement('label', {
      textContent: LanguageService.t('dyeSelector.sortBy'),
      className: 'text-sm font-medium text-gray-700 dark:text-gray-300',
      attributes: {
        for: 'dye-selector-sort',
      },
    });

    const sortSelect = this.createElement('select', {
      attributes: {
        id: 'dye-selector-sort',
        'aria-label': LanguageService.t('dyeSelector.sortAriaLabel'),
      },
      className:
        'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm',
    });

    const sortOptions: Array<{ value: SortOption; label: string }> = [
      { value: 'alphabetical', label: LanguageService.t('dyeSelector.sortAlphabetical') },
      { value: 'brightness-asc', label: LanguageService.t('dyeSelector.sortBrightnessAsc') },
      { value: 'brightness-desc', label: LanguageService.t('dyeSelector.sortBrightnessDesc') },
      { value: 'hue', label: LanguageService.t('dyeSelector.sortHue') },
      { value: 'saturation', label: LanguageService.t('dyeSelector.sortSaturation') },
      { value: 'category', label: LanguageService.t('dyeSelector.sortCategory') },
    ];

    for (const option of sortOptions) {
      const optionElement = this.createElement('option', {
        textContent: option.label,
        attributes: {
          value: option.value,
        },
      });
      if (option.value === this.sortOption) {
        optionElement.setAttribute('selected', 'selected');
      }
      sortSelect.appendChild(optionElement);
    }

    sortContainer.appendChild(sortLabel);
    sortContainer.appendChild(sortSelect);
    wrapper.appendChild(sortContainer);

    // Category filter (if enabled)
    if (this.options.showCategories) {
      const categoryContainer = this.createElement('div', {
        className: 'flex flex-wrap gap-2',
      });

      const allBtn = this.createElement('button', {
        textContent: LanguageService.t('dyeSelector.allCategories'),
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
          textContent: LanguageService.getCategory(category),
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
        textContent: LanguageService.tInterpolate('dyeSelector.selected', {
          current: String(this.selectedDyes.length),
          max: String(this.options.maxSelections),
        }),
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
          textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
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

    // Dye list with ARIA grid role for keyboard navigation
    const dyeListContainer = this.createElement('div', {
      className:
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto',
      attributes: {
        role: 'grid',
        'aria-label': LanguageService.t('dyeSelector.gridAriaLabel') || 'Dye color selection',
      },
    });

    this.filteredDyes = this.getFilteredDyes();

    // Show empty state if no dyes match
    if (this.filteredDyes.length === 0) {
      const emptyHtml = this.searchQuery.trim()
        ? getEmptyStateHTML({
            icon: ICON_SEARCH,
            title: LanguageService.tInterpolate('dyeSelector.noResults', { query: this.searchQuery }) ||
              `No dyes match "${this.searchQuery}"`,
            description: LanguageService.t('dyeSelector.noResultsHint') ||
              'Try checking your spelling or search for a category like "purple".',
          })
        : getEmptyStateHTML({
            icon: ICON_PALETTE,
            title: LanguageService.t('dyeSelector.noDyesInCategory') || 'No dyes in this category',
            description: LanguageService.t('dyeSelector.tryCategoryHint') || 'Try selecting a different category.',
          });

      dyeListContainer.innerHTML = emptyHtml;
      wrapper.appendChild(dyeListContainer);

      // Clear existing content and add new
      clearContainer(this.container);
      this.element = wrapper;
      this.container.appendChild(this.element);
      return;
    }

    // Reset focused index if out of bounds
    if (this.focusedIndex >= this.filteredDyes.length) {
      this.focusedIndex = this.filteredDyes.length - 1;
    }

    for (let i = 0; i < this.filteredDyes.length; i++) {
      const dye = this.filteredDyes[i];
      // Roving tabindex: only the focused item is tabbable
      const isFocused = i === this.focusedIndex || (this.focusedIndex === -1 && i === 0);

      const dyeCard = this.createElement('button', {
        className:
          'dye-select-btn p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        attributes: {
          'data-dye-id': String(dye.id),
          'data-dye-index': String(i),
          type: 'button',
          role: 'gridcell',
          tabindex: isFocused ? '0' : '-1',
          'aria-selected': this.selectedDyes.some((d) => d.id === dye.id) ? 'true' : 'false',
        },
      });

      // Verify attribute was set
      const verifyId = dyeCard.getAttribute('data-dye-id');
      if (verifyId !== String(dye.id)) {
        logger.warn(
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
        textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
        className: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
      });

      const hexDiv = this.createElement('div', {
        textContent: dye.hex,
        className: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
      });

      const categoryDiv = this.createElement('div', {
        textContent: LanguageService.getCategory(dye.category),
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
    clearContainer(this.container);
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

    // Sort functionality
    const sortSelect = this.querySelector<HTMLSelectElement>('#dye-selector-sort');
    if (sortSelect) {
      this.on(sortSelect, 'change', () => {
        this.sortOption = sortSelect.value as SortOption;
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
      // Keyboard navigation for dye grid
      this.on(dyeListContainer, 'keydown', this.handleGridKeydown);

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

    // Keyboard shortcut: "/" or Ctrl+F to focus search
    this.on(document, 'keydown', this.handleGlobalKeydown);
  }

  /**
   * Handle keyboard navigation for the dye grid
   */
  private handleGridKeydown(event: KeyboardEvent): void {
    const dyeButtons = this.querySelectorAll<HTMLButtonElement>('.dye-select-btn');
    if (dyeButtons.length === 0) return;

    // Calculate grid columns based on visible layout
    this.updateGridColumns();

    const key = event.key;
    let newIndex = this.focusedIndex;

    switch (key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = Math.min(this.focusedIndex + 1, this.filteredDyes.length - 1);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        newIndex = Math.max(this.focusedIndex - 1, 0);
        break;

      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(this.focusedIndex + this.gridColumns, this.filteredDyes.length - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(this.focusedIndex - this.gridColumns, 0);
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = this.filteredDyes.length - 1;
        break;

      case 'PageDown':
        event.preventDefault();
        // Move down by one "page" (multiple rows)
        newIndex = Math.min(this.focusedIndex + this.gridColumns * 3, this.filteredDyes.length - 1);
        break;

      case 'PageUp':
        event.preventDefault();
        // Move up by one "page" (multiple rows)
        newIndex = Math.max(this.focusedIndex - this.gridColumns * 3, 0);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        // Select the currently focused dye
        this.selectDyeAtIndex(this.focusedIndex);
        return;

      case 'Escape':
        event.preventDefault();
        // Clear selection or blur
        if (this.selectedDyes.length > 0) {
          this.selectedDyes = [];
          this.update();
          this.emit('selection-changed', { selectedDyes: this.selectedDyes });
        } else {
          // Blur the grid
          (document.activeElement as HTMLElement)?.blur();
        }
        return;

      default:
        return;
    }

    // Update focus if index changed
    if (newIndex !== this.focusedIndex) {
      this.setFocusedIndex(newIndex);
    }
  }

  /**
   * Handle global keyboard shortcuts (search focus)
   */
  private handleGlobalKeydown(event: KeyboardEvent): void {
    // "/" or Ctrl+F to focus search
    if (event.key === '/' || (event.ctrlKey && event.key === 'f')) {
      // Only handle if not already in an input
      if (document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        const searchInput = this.querySelector<HTMLInputElement>('input[type="text"]');
        searchInput?.focus();
      }
    }
  }

  /**
   * Update grid columns based on viewport width
   */
  private updateGridColumns(): void {
    const gridContainer = this.querySelector<HTMLElement>('div.grid');
    if (!gridContainer) return;

    // Get computed grid columns from the element's style
    const computedStyle = window.getComputedStyle(gridContainer);
    const gridTemplateColumns = computedStyle.gridTemplateColumns;

    // Count the number of columns from the grid template
    if (gridTemplateColumns && gridTemplateColumns !== 'none') {
      const columns = gridTemplateColumns.split(' ').length;
      this.gridColumns = columns;
    } else {
      // Fallback based on common breakpoints
      const width = window.innerWidth;
      if (width >= 1024) this.gridColumns = 4;      // lg
      else if (width >= 768) this.gridColumns = 3;  // md
      else if (width >= 640) this.gridColumns = 2;  // sm
      else this.gridColumns = 1;                     // mobile
    }
  }

  /**
   * Set the focused index and update tabindex/focus
   */
  private setFocusedIndex(index: number): void {
    const dyeButtons = this.querySelectorAll<HTMLButtonElement>('.dye-select-btn');
    if (index < 0 || index >= dyeButtons.length) return;

    // Update previous focused button
    if (this.focusedIndex >= 0 && this.focusedIndex < dyeButtons.length) {
      dyeButtons[this.focusedIndex].setAttribute('tabindex', '-1');
    }

    // Update new focused button
    this.focusedIndex = index;
    const newFocusedBtn = dyeButtons[this.focusedIndex];
    newFocusedBtn.setAttribute('tabindex', '0');
    newFocusedBtn.focus();

    // Scroll into view if needed
    newFocusedBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /**
   * Select the dye at the given index
   */
  private selectDyeAtIndex(index: number): void {
    if (index < 0 || index >= this.filteredDyes.length) return;

    const dye = this.filteredDyes[index];
    if (!dye) return;

    if (this.options.allowMultiple) {
      if (this.allowDuplicates) {
        if (this.selectedDyes.length < (this.options.maxSelections ?? 4)) {
          this.selectedDyes.push(dye);
        }
      } else {
        // Toggle selection
        const existingIndex = this.selectedDyes.findIndex((d) => d.id === dye.id);
        if (existingIndex >= 0) {
          this.selectedDyes.splice(existingIndex, 1);
        } else if (this.selectedDyes.length < (this.options.maxSelections ?? 4)) {
          this.selectedDyes.push(dye);
        }
      }
    } else {
      this.selectedDyes = [dye];
    }

    this.update();
    this.emit('selection-changed', { selectedDyes: this.selectedDyes });

    // Restore focus after update
    requestAnimationFrame(() => {
      this.setFocusedIndex(index);
    });
  }

  /**
   * Smart update that only re-renders the dye list without losing focus/input
   */
  override update(): void {
    if (!this.isInitialized) {
      logger.warn('Component not initialized');
      return;
    }

    try {
      // Preserve search input state
      const searchInput = this.querySelector<HTMLInputElement>('input[type="text"]');
      const searchValue = searchInput?.value ?? '';
      const isSearchFocused = searchInput === document.activeElement;

      // Preserve sort selection state
      const sortSelect = this.querySelector<HTMLSelectElement>('#dye-selector-sort');
      const sortValue = sortSelect?.value ?? 'alphabetical';

      // Update selected dyes display only
      const selectedList = this.querySelector<HTMLElement>('#selected-dyes-list');
      if (selectedList && this.options.allowMultiple) {
        // Update the counter label
        const selectedLabel = this.querySelector<HTMLElement>('#selected-dyes-label');
        if (selectedLabel) {
          selectedLabel.textContent = LanguageService.tInterpolate('dyeSelector.selected', {
            current: String(this.selectedDyes.length),
            max: String(this.options.maxSelections),
          });
        }

        clearContainer(selectedList);

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
            textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
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
        clearContainer(dyeListContainer);

        this.filteredDyes = this.getFilteredDyes();

        // Show empty state if no dyes match
        if (this.filteredDyes.length === 0) {
          const emptyHtml = this.searchQuery.trim()
            ? getEmptyStateHTML({
                icon: ICON_SEARCH,
                title: LanguageService.tInterpolate('dyeSelector.noResults', { query: this.searchQuery }) ||
                  `No dyes match "${this.searchQuery}"`,
                description: LanguageService.t('dyeSelector.noResultsHint') ||
                  'Try checking your spelling or search for a category like "purple".',
              })
            : getEmptyStateHTML({
                icon: ICON_PALETTE,
                title: LanguageService.t('dyeSelector.noDyesInCategory') || 'No dyes in this category',
                description: LanguageService.t('dyeSelector.tryCategoryHint') || 'Try selecting a different category.',
              });

          dyeListContainer.innerHTML = emptyHtml;
        } else {
          // Reset focused index if out of bounds
          if (this.focusedIndex >= this.filteredDyes.length) {
            this.focusedIndex = this.filteredDyes.length - 1;
          }

          for (let i = 0; i < this.filteredDyes.length; i++) {
            const dye = this.filteredDyes[i];
            // Roving tabindex: only the focused item is tabbable
            const isFocused = i === this.focusedIndex || (this.focusedIndex === -1 && i === 0);

            const dyeCard = this.createElement('button', {
              className:
                'dye-select-btn p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              attributes: {
                'data-dye-id': String(dye.id),
                'data-dye-index': String(i),
                type: 'button',
                role: 'gridcell',
                tabindex: isFocused ? '0' : '-1',
                'aria-selected': this.selectedDyes.some((d) => d.id === dye.id) ? 'true' : 'false',
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
              textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
              className: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
            });

            const hexDiv = this.createElement('div', {
              textContent: dye.hex,
              className: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
            });

            const categoryDiv = this.createElement('div', {
              textContent: LanguageService.getCategory(dye.category),
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

      // Restore sort selection
      if (sortSelect && sortValue !== this.sortOption) {
        sortSelect.value = this.sortOption;
      }

      this.onUpdate?.();
    } catch (error) {
      logger.error('Error updating DyeSelector:', error);
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

    // Apply sorting based on selected option
    dyes.sort((a, b) => this.compareDyes(a, b, this.sortOption));

    return dyes;
  }

  /**
   * Compare two dyes based on sort option
   */
  private compareDyes(a: Dye, b: Dye, sortOption: SortOption): number {
    switch (sortOption) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);

      case 'brightness-asc':
        // Dark to Light (ascending brightness)
        return a.hsv.v - b.hsv.v;

      case 'brightness-desc':
        // Light to Dark (descending brightness)
        return b.hsv.v - a.hsv.v;

      case 'hue':
        // Sort by hue (color wheel order)
        // If hues are similar, sort by saturation, then brightness
        const hueDiff = a.hsv.h - b.hsv.h;
        if (Math.abs(hueDiff) > 1) {
          return hueDiff;
        }
        // If hues are very close, sort by saturation then brightness
        const satDiff = b.hsv.s - a.hsv.s; // Higher saturation first
        if (Math.abs(satDiff) > 1) {
          return satDiff;
        }
        return b.hsv.v - a.hsv.v; // Then by brightness

      case 'saturation':
        // Muted to Vivid (ascending saturation)
        // If saturation is similar, sort by brightness
        const saturationDiff = a.hsv.s - b.hsv.s;
        if (Math.abs(saturationDiff) > 1) {
          return saturationDiff;
        }
        return a.hsv.v - b.hsv.v;

      case 'category':
        // Sort by category first, then alphabetically within category
        const categoryDiff = a.category.localeCompare(b.category);
        if (categoryDiff !== 0) {
          return categoryDiff;
        }
        return a.name.localeCompare(b.name);

      default:
        return a.name.localeCompare(b.name);
    }
  }

  /**
   * Initialize the component
   */
  onMount(): void {
    // Subscribe to language changes to update localized text
    LanguageService.subscribe(() => {
      this.update();
    });
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
      sortOption: this.sortOption,
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
    if (typeof newState.sortOption === 'string') {
      this.sortOption = newState.sortOption as SortOption;
    }
  }
}

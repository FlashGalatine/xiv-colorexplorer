/**
 * XIV Dye Tools v2.0.0 - Dye Filters Component
 *
 * Reusable component for Advanced Dye Filters with collapsible UI
 * Can be used across multiple tools (Harmony Explorer, Color Matcher, Dye Mixer)
 *
 * @module components/dye-filters
 */

import { BaseComponent } from './base-component';
import { appStorage } from '@services/storage-service';
import { EXPENSIVE_DYE_IDS } from '@shared/constants';
import type { Dye } from '@shared/types';

/**
 * Dye filter configuration
 */
export interface DyeFilterConfig {
  excludeMetallic: boolean;
  excludePastel: boolean;
  excludeExpensive: boolean;
  excludeDark: boolean;
  excludeCosmic: boolean;
}

/**
 * Options for DyeFilters component
 */
export interface DyeFiltersOptions {
  /**
   * Storage key prefix for persisting filter state
   * Default: 'harmony' (results in 'xivdyetools_harmony_filters')
   */
  storageKeyPrefix?: string;
  /**
   * Callback when filters change
   */
  onFilterChange?: (filters: DyeFilterConfig) => void;
}

/**
 * Dye Filters Component
 * Provides collapsible UI for excluding dyes by type
 */
export class DyeFilters extends BaseComponent {
  private filters: DyeFilterConfig = {
    excludeMetallic: false,
    excludePastel: false,
    excludeExpensive: false,
    excludeDark: false,
    excludeCosmic: false,
  };
  private filterCheckboxes: Map<string, HTMLInputElement> = new Map();
  private filtersExpanded: boolean = false;
  private filterToggleButton: HTMLElement | null = null;
  private filterCheckboxesContainer: HTMLElement | null = null;
  private storageKey: string;
  private storageKeyExpanded: string;
  private onFilterChange?: (filters: DyeFilterConfig) => void;

  constructor(container: HTMLElement, options: DyeFiltersOptions = {}) {
    super(container);
    const prefix = options.storageKeyPrefix || 'harmony';
    this.storageKey = `xivdyetools_${prefix}_filters`;
    this.storageKeyExpanded = `xivdyetools_${prefix}_filters_expanded`;
    this.onFilterChange = options.onFilterChange;
  }

  /**
   * Render the dye filters component
   */
  render(): HTMLElement {
    // Dye Filters section with collapsible header
    const filtersSection = this.createElement('div', {
      className: 'space-y-3',
    });

    // Collapsible header with toggle button
    const filtersHeader = this.createElement('button', {
      attributes: {
        type: 'button',
      },
      className:
        'w-full flex items-center justify-between p-2 -m-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors',
    });

    const filtersLabel = this.createElement('label', {
      textContent: 'Advanced Dye Filters',
      className: 'text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer',
    });

    const toggleChevron = this.createElement('span', {
      textContent: '▼',
      className: 'text-gray-400 dark:text-gray-500 text-xs transition-transform',
      attributes: {
        id: `${this.container.id || 'filters'}-toggle-chevron`,
      },
    });

    filtersHeader.appendChild(filtersLabel);
    filtersHeader.appendChild(toggleChevron);
    filtersSection.appendChild(filtersHeader);

    // Store toggle button reference
    this.filterToggleButton = filtersHeader;

    // Filter checkboxes container (collapsible)
    const checkboxesContainer = this.createElement('div', {
      className: 'space-y-2 max-h-96 overflow-hidden transition-all duration-300 ease-in-out',
      attributes: {
        id: `${this.container.id || 'filters'}-checkboxes-container`,
      },
    });

    // Store reference to checkboxes container
    this.filterCheckboxesContainer = checkboxesContainer;

    // Filter checkboxes
    const filterOptions = [
      {
        key: 'excludeMetallic',
        label: 'Exclude Metallic Dyes',
        description: 'Hide dyes with "Metallic" in the name',
      },
      {
        key: 'excludePastel',
        label: 'Exclude Pastel Dyes',
        description: 'Hide dyes with "Pastel" in the name',
      },
      {
        key: 'excludeDark',
        label: 'Exclude Dark Dyes',
        description: 'Hide dyes that begin with "Dark"',
      },
      {
        key: 'excludeCosmic',
        label: 'Exclude Cosmic Dyes',
        description: 'Hide dyes from Cosmic Exploration & Cosmic Fortunes',
      },
      {
        key: 'excludeExpensive',
        label: 'Exclude Expensive Dyes',
        description: 'Hide Jet Black & Pure White',
      },
    ];

    for (const option of filterOptions) {
      const checkboxDiv = this.createElement('div', {
        className: 'flex items-start gap-3',
      });

      const checkboxId = `${this.container.id || 'filters'}-${option.key}`;
      const checkbox = this.createElement('input', {
        attributes: {
          type: 'checkbox',
          id: checkboxId,
        },
        className:
          'mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer',
      });

      const labelElement = this.createElement('label', {
        attributes: {
          for: checkboxId,
        },
        className: 'cursor-pointer flex-1',
      });

      const labelText = this.createElement('div', {
        textContent: option.label,
        className: 'text-sm font-medium text-gray-700 dark:text-gray-300',
      });

      const descText = this.createElement('div', {
        textContent: option.description,
        className: 'text-xs text-gray-500 dark:text-gray-400',
      });

      labelElement.appendChild(labelText);
      labelElement.appendChild(descText);

      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(labelElement);
      checkboxesContainer.appendChild(checkboxDiv);

      // Store checkbox reference
      this.filterCheckboxes.set(option.key, checkbox);
    }

    filtersSection.appendChild(checkboxesContainer);
    this.element = filtersSection;

    return this.element;
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    // Bind toggle button
    if (this.filterToggleButton) {
      this.on(this.filterToggleButton, 'click', () => {
        this.toggleFilters();
      });
    }

    // Bind checkbox change events
    for (const [_key, checkbox] of this.filterCheckboxes) {
      this.on(checkbox, 'change', () => {
        this.updateFilterState();
      });
    }
  }

  /**
   * Initialize the component
   */
  onMount(): void {
    // Load saved filter state
    this.loadFilterState();
    this.loadFiltersExpandedState();
  }

  /**
   * Load filter state from localStorage
   */
  private loadFilterState(): void {
    const saved = appStorage.getItem<DyeFilterConfig>(this.storageKey, this.filters) ?? this.filters;
    this.filters = saved;

    // Update checkboxes to reflect saved state
    for (const [filterKey, checkbox] of this.filterCheckboxes) {
      const filterValue = this.filters[filterKey as keyof DyeFilterConfig] ?? false;
      checkbox.checked = filterValue;
    }
  }

  /**
   * Update filter state from checkboxes and save to localStorage
   */
  private updateFilterState(): void {
    for (const [filterKey, checkbox] of this.filterCheckboxes) {
      this.filters[filterKey as keyof DyeFilterConfig] = checkbox.checked;
    }
    appStorage.setItem(this.storageKey, this.filters);

    // Notify parent component
    if (this.onFilterChange) {
      this.onFilterChange(this.filters);
    }

    // Dispatch custom event for other components
    this.container.dispatchEvent(
      new CustomEvent('dye-filters-changed', {
        detail: { filters: this.filters },
        bubbles: true,
      })
    );
  }

  /**
   * Load filters expanded state from localStorage
   */
  private loadFiltersExpandedState(): void {
    this.filtersExpanded = appStorage.getItem<boolean>(this.storageKeyExpanded, false) ?? false;
    this.updateFiltersUI();
  }

  /**
   * Toggle filters expanded/collapsed state
   */
  private toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
    this.updateFiltersUI();

    // Save state to localStorage
    appStorage.setItem(this.storageKeyExpanded, this.filtersExpanded);
  }

  /**
   * Update filters UI based on expanded state
   */
  private updateFiltersUI(): void {
    const checkboxesContainer = this.filterCheckboxesContainer;
    const chevronId = `${this.container.id || 'filters'}-toggle-chevron`;
    const chevron = document.getElementById(chevronId);

    if (!checkboxesContainer || !chevron) return;

    // Set transition properties
    checkboxesContainer.style.transition =
      'max-height 300ms ease-in-out, opacity 300ms ease-in-out, margin-top 300ms ease-in-out';
    chevron.style.transition = 'transform 300ms ease-in-out';

    if (this.filtersExpanded) {
      // Show checkboxes
      checkboxesContainer.style.maxHeight = '500px';
      checkboxesContainer.style.opacity = '1';
      checkboxesContainer.style.marginTop = '0.75rem';

      // Rotate chevron down
      chevron.style.transform = 'rotate(0deg)';
    } else {
      // Hide checkboxes
      checkboxesContainer.style.maxHeight = '0px';
      checkboxesContainer.style.opacity = '0';
      checkboxesContainer.style.marginTop = '0';

      // Rotate chevron up
      chevron.style.transform = 'rotate(-90deg)';
    }
  }

  /**
   * Check if a dye should be excluded based on current filter settings
   */
  isDyeExcluded(dye: Dye): boolean {
    // Exclude Metallic dyes
    if (this.filters.excludeMetallic && dye.name.includes('Metallic')) {
      return true;
    }

    // Exclude Pastel dyes
    if (this.filters.excludePastel && dye.name.includes('Pastel')) {
      return true;
    }

    // Exclude Dark dyes (begin with "Dark")
    if (this.filters.excludeDark && dye.name.toLowerCase().startsWith('dark')) {
      return true;
    }

    // Exclude Cosmic dyes (Cosmic Exploration or Cosmic Fortunes)
    if (
      this.filters.excludeCosmic &&
      (dye.acquisition === 'Cosmic Exploration' || dye.acquisition === 'Cosmic Fortunes')
    ) {
      return true;
    }

    // Exclude Jet Black and Pure White
    if (this.filters.excludeExpensive && EXPENSIVE_DYE_IDS.includes(dye.itemID)) {
      return true;
    }

    return false;
  }

  /**
   * Get current filter configuration
   */
  getFilters(): DyeFilterConfig {
    return { ...this.filters };
  }

  /**
   * Set filter configuration programmatically
   */
  setFilters(filters: Partial<DyeFilterConfig>): void {
    this.filters = { ...this.filters, ...filters };
    this.updateFilterState();

    // Update checkboxes
    for (const [filterKey, checkbox] of this.filterCheckboxes) {
      const filterValue = this.filters[filterKey as keyof DyeFilterConfig] ?? false;
      checkbox.checked = filterValue;
    }
  }

  /**
   * Filter an array of dyes, removing excluded ones
   */
  filterDyes<T extends Dye>(dyes: T[]): T[] {
    return dyes.filter((dye) => !this.isDyeExcluded(dye));
  }
}


/**
 * XIV Dye Tools v2.0.0 - Market Board Component
 *
 * Phase 12: Architecture Refactor
 * UI component for displaying market prices from Universalis API
 *
 * @module components/market-board
 */

import { BaseComponent } from './base-component';
import { APIService } from '@services/api-service';
import { appStorage } from '@services/storage-service';
import { PRICE_CATEGORIES } from '@shared/constants';
import type { Dye, PriceData, DataCenter, World } from '@shared/types';

/**
 * Price category filter settings
 */
interface PriceCategorySettings {
  baseDyes: boolean;
  craftDyes: boolean;
  alliedSocietyDyes: boolean;
  cosmicDyes: boolean;
  specialDyes: boolean;
}

/**
 * Market Board component - displays FFXIV market prices for dyes
 * Integrates with Universalis API to show current market board data
 */
export class MarketBoard extends BaseComponent {
  private apiService: APIService;
  private dataCenters: DataCenter[] = [];
  private worlds: World[] = [];
  private selectedServer: string = 'Crystal'; // Default data center
  private showPrices: boolean = true;
  private priceCategories: PriceCategorySettings;
  private isRefreshing: boolean = false;

  constructor(container: HTMLElement) {
    super(container);
    this.apiService = APIService.getInstance();

    // Load saved settings from localStorage
    this.showPrices = appStorage.getItem('market_board_show_prices', true) ?? true;
    this.selectedServer = appStorage.getItem('market_board_server', 'Crystal') ?? 'Crystal';
    this.priceCategories = appStorage.getItem('market_board_categories', {
      baseDyes: PRICE_CATEGORIES.baseDyes.default,
      craftDyes: PRICE_CATEGORIES.craftDyes.default,
      alliedSocietyDyes: PRICE_CATEGORIES.alliedSocietyDyes.default,
      cosmicDyes: PRICE_CATEGORIES.cosmicDyes.default,
      specialDyes: PRICE_CATEGORIES.specialDyes.default,
    }) ?? {
      baseDyes: PRICE_CATEGORIES.baseDyes.default,
      craftDyes: PRICE_CATEGORIES.craftDyes.default,
      alliedSocietyDyes: PRICE_CATEGORIES.alliedSocietyDyes.default,
      cosmicDyes: PRICE_CATEGORIES.cosmicDyes.default,
      specialDyes: PRICE_CATEGORIES.specialDyes.default,
    };
  }

  /**
   * Load data centers and worlds from JSON files
   */
  async loadServerData(): Promise<void> {
    try {
      // Fetch JSON files from public directory (served from root by Vite)
      const [dcResponse, worldsResponse] = await Promise.all([
        fetch('/json/data-centers.json'),
        fetch('/json/worlds.json'),
      ]);

      if (!dcResponse.ok || !worldsResponse.ok) {
        throw new Error(
          `Failed to load server data: ${dcResponse.status}, ${worldsResponse.status}`
        );
      }

      this.dataCenters = await dcResponse.json();
      this.worlds = await worldsResponse.json();

      console.log('✓ Loaded data centers:', this.dataCenters.length);
      console.log('✓ Loaded worlds:', this.worlds.length);

      // Re-populate server dropdown after data loads
      const serverSelect = this.querySelector<HTMLSelectElement>('#mb-server-select');
      if (serverSelect) {
        this.populateServerDropdown(serverSelect);
      }
    } catch (error) {
      console.error('Error loading server data:', error);
      // Use fallback empty arrays - component will still render but server selection disabled
      this.dataCenters = [];
      this.worlds = [];
    }
  }

  /**
   * Render the market board component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-4',
    });

    // Title
    const title = this.createElement('h3', {
      textContent: 'Market Board',
      className: 'text-sm font-semibold text-gray-900 dark:text-white mb-3',
    });
    wrapper.appendChild(title);

    const content = this.createElement('div', {
      className: 'space-y-4',
    });

    // Server Selection Dropdown
    const serverSection = this.createElement('div', {});

    const serverLabel = this.createElement('label', {
      textContent: 'Server:',
      className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
      attributes: {
        for: 'mb-server-select',
      },
    });
    serverSection.appendChild(serverLabel);

    const serverSelect = this.createElement('select', {
      className:
        'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition text-sm',
      attributes: {
        id: 'mb-server-select',
        style: 'transition: all 0.2s;',
      },
    }) as HTMLSelectElement;

    // Add focus styling with theme colors
    serverSelect.addEventListener('focus', () => {
      serverSelect.style.borderColor = 'var(--theme-primary)';
    });
    serverSelect.addEventListener('blur', () => {
      serverSelect.style.borderColor = '';
    });

    // Populate server dropdown
    this.populateServerDropdown(serverSelect);
    serverSection.appendChild(serverSelect);
    content.appendChild(serverSection);

    // Price Settings Panel
    const pricePanel = this.createElement('div', {
      className:
        'bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700',
    });

    // Show Prices Toggle
    const toggleRow = this.createElement('div', {
      className: 'flex justify-between items-center mb-3',
    });

    const toggleLabel = this.createElement('label', {
      textContent: 'Show Prices',
      className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
    });
    toggleRow.appendChild(toggleLabel);

    const toggleWrapper = this.createElement('label', {
      className: 'relative inline-flex items-center cursor-pointer',
    });

    const toggleInput = this.createElement('input', {
      className: 'sr-only peer',
      attributes: {
        type: 'checkbox',
        id: 'show-mb-prices-toggle',
        ...(this.showPrices ? { checked: 'true' } : {}),
      },
    }) as HTMLInputElement;
    toggleWrapper.appendChild(toggleInput);

    const toggleBg = this.createElement('div', {
      className:
        "w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600",
      attributes: {
        style: 'box-shadow: 0 0 0 0 transparent; transition: box-shadow 0.2s;',
      },
    });

    // Apply theme-aware styling via inline styles for toggle background
    toggleInput.addEventListener('change', () => {
      if (toggleInput.checked) {
        toggleBg.style.backgroundColor = 'var(--theme-primary)';
      } else {
        toggleBg.style.backgroundColor = '';
      }
    });

    // Set initial state
    if (this.showPrices) {
      toggleBg.style.backgroundColor = 'var(--theme-primary)';
    }
    toggleWrapper.appendChild(toggleBg);

    toggleRow.appendChild(toggleWrapper);
    pricePanel.appendChild(toggleRow);

    // Price Category Checkboxes
    const priceSettings = this.createElement('div', {
      className: `space-y-2 ${this.showPrices ? '' : 'hidden'}`,
      attributes: {
        id: 'mb-price-settings',
      },
    });

    const categoryCheckboxes = this.createElement('div', {
      className: 'text-xs space-y-2',
    });

    // Add each price category checkbox
    const categories = [
      { id: 'baseDyes', label: 'Base Dyes', key: 'baseDyes' as keyof PriceCategorySettings },
      { id: 'craftDyes', label: 'Craft Dyes', key: 'craftDyes' as keyof PriceCategorySettings },
      {
        id: 'alliedSocietyDyes',
        label: 'Allied Society Dyes',
        key: 'alliedSocietyDyes' as keyof PriceCategorySettings,
      },
      { id: 'cosmicDyes', label: 'Cosmic Dyes', key: 'cosmicDyes' as keyof PriceCategorySettings },
      {
        id: 'specialDyes',
        label: 'Special Dyes',
        key: 'specialDyes' as keyof PriceCategorySettings,
      },
    ];

    for (const category of categories) {
      const checkboxRow = this.createElement('div', {
        className: 'flex items-center',
      });

      const checkbox = this.createElement('input', {
        className:
          'h-3 w-3 border-gray-300 dark:border-gray-600 rounded mb-price-checkbox focus:ring-2',
        attributes: {
          type: 'checkbox',
          id: `mb-price-${category.id}`,
          'data-category': category.key,
          style: 'accent-color: var(--theme-primary);',
          ...(this.priceCategories[category.key] ? { checked: 'true' } : {}),
        },
      });
      checkboxRow.appendChild(checkbox);

      const checkboxLabel = this.createElement('label', {
        textContent: category.label,
        className: 'ml-2 text-gray-600 dark:text-gray-400',
        attributes: {
          for: `mb-price-${category.id}`,
        },
      });
      checkboxRow.appendChild(checkboxLabel);

      categoryCheckboxes.appendChild(checkboxRow);
    }

    priceSettings.appendChild(categoryCheckboxes);

    // Refresh Button
    const refreshBtn = this.createElement('button', {
      textContent: 'Refresh Prices',
      className:
        'w-full px-3 py-2 text-xs disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition font-medium mt-3',
      attributes: {
        id: 'mb-refresh-btn',
        style: 'background-color: var(--theme-primary);',
      },
    });

    // Add hover effect
    refreshBtn.addEventListener('mouseenter', () => {
      if (!refreshBtn.disabled) {
        refreshBtn.style.opacity = '0.9';
      }
    });
    refreshBtn.addEventListener('mouseleave', () => {
      refreshBtn.style.opacity = '1';
    });
    priceSettings.appendChild(refreshBtn);

    // Status Message
    const statusMsg = this.createElement('div', {
      className: 'mt-2 text-xs text-gray-500 dark:text-gray-400 text-center',
      attributes: {
        id: 'mb-price-status',
      },
    });
    priceSettings.appendChild(statusMsg);

    pricePanel.appendChild(priceSettings);
    content.appendChild(pricePanel);

    wrapper.appendChild(content);

    // Clear existing content and add new
    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Populate server dropdown with data centers and worlds
   */
  private populateServerDropdown(selectElement: HTMLSelectElement): void {
    // Sort data centers alphabetically
    const sortedDataCenters = [...this.dataCenters].sort((a, b) => a.name.localeCompare(b.name));

    // For each data center, add the DC as an option and its worlds as sub-options
    for (const dc of sortedDataCenters) {
      // Create optgroup for this data center
      const optgroup = document.createElement('optgroup');
      optgroup.label = `${dc.name} (${dc.region})`;

      // Add the data center itself as an option
      const dcOption = document.createElement('option');
      dcOption.value = dc.name;
      dcOption.textContent = `${dc.name} - All Worlds`;
      if (dc.name === this.selectedServer) {
        dcOption.selected = true;
      }
      optgroup.appendChild(dcOption);

      // Get worlds for this data center and sort alphabetically
      const dcWorlds = this.worlds
        .filter((w) => dc.worlds.includes(w.id))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Add each world as an option
      for (const world of dcWorlds) {
        const worldOption = document.createElement('option');
        worldOption.value = world.name;
        worldOption.textContent = `  ${world.name}`;
        if (world.name === this.selectedServer) {
          worldOption.selected = true;
        }
        optgroup.appendChild(worldOption);
      }

      selectElement.appendChild(optgroup);
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    // Server selection change
    const serverSelect = this.querySelector<HTMLSelectElement>('#mb-server-select');
    if (serverSelect) {
      this.on(serverSelect, 'change', () => {
        this.selectedServer = serverSelect.value;
        appStorage.setItem('market_board_server', this.selectedServer);
        this.emit('server-changed', { server: this.selectedServer });
      });
    }

    // Show prices toggle
    const toggleInput = this.querySelector<HTMLInputElement>('#show-mb-prices-toggle');
    if (toggleInput) {
      this.on(toggleInput, 'change', () => {
        this.showPrices = toggleInput.checked;
        appStorage.setItem('market_board_show_prices', this.showPrices);

        // Show/hide price settings
        const priceSettings = this.querySelector('#mb-price-settings');
        if (priceSettings) {
          priceSettings.classList.toggle('hidden', !this.showPrices);
        }

        this.emit('toggle-prices', { showPrices: this.showPrices });
      });
    }

    // Price category checkboxes
    const checkboxes = this.querySelectorAll<HTMLInputElement>('.mb-price-checkbox');
    for (const checkbox of checkboxes) {
      this.on(checkbox, 'change', () => {
        const category = checkbox.getAttribute('data-category') as keyof PriceCategorySettings;
        if (category) {
          this.priceCategories[category] = checkbox.checked;
          appStorage.setItem('market_board_categories', this.priceCategories);
          this.emit('categories-changed', { categories: this.priceCategories });
        }
      });
    }

    // Refresh button
    const refreshBtn = this.querySelector<HTMLButtonElement>('#mb-refresh-btn');
    if (refreshBtn) {
      this.on(refreshBtn, 'click', async () => {
        await this.refreshPrices();
      });
    }
  }

  /**
   * Refresh market prices (clears cache and fetches new data)
   */
  async refreshPrices(): Promise<void> {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    const statusMsg = this.querySelector('#mb-price-status');
    const refreshBtn = this.querySelector<HTMLButtonElement>('#mb-refresh-btn');

    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Refreshing...';
    }

    if (statusMsg) {
      statusMsg.textContent = 'Clearing cache and fetching new prices...';
    }

    try {
      // Clear the price cache
      this.apiService.clearCache();

      // Emit event so parent component can re-fetch prices
      this.emit('refresh-requested', {});

      if (statusMsg) {
        statusMsg.textContent = 'Prices refreshed successfully!';
        setTimeout(() => {
          statusMsg.textContent = '';
        }, 3000);
      }
    } catch (error) {
      console.error('Error refreshing prices:', error);
      if (statusMsg) {
        statusMsg.textContent = 'Error refreshing prices. Please try again.';
      }
    } finally {
      this.isRefreshing = false;
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh Prices';
      }
    }
  }

  /**
   * Check if a dye should have its price fetched based on current filter settings
   */
  shouldFetchPrice(dye: Dye): boolean {
    if (!dye || !dye.itemID) return false;

    // Check Special category (uses category field instead of acquisition)
    if (this.priceCategories.specialDyes && dye.category === 'Special') {
      return true;
    }

    // Validate acquisition exists for other checks
    if (!dye.acquisition) return false;

    // Check Base Dyes
    if (
      this.priceCategories.baseDyes &&
      (PRICE_CATEGORIES.baseDyes.acquisitions as readonly string[]).includes(dye.acquisition)
    ) {
      return true;
    }

    // Check Craft Dyes
    if (
      this.priceCategories.craftDyes &&
      (PRICE_CATEGORIES.craftDyes.acquisitions as readonly string[]).includes(dye.acquisition)
    ) {
      return true;
    }

    // Check Allied Society Dyes
    if (
      this.priceCategories.alliedSocietyDyes &&
      (PRICE_CATEGORIES.alliedSocietyDyes.acquisitions as readonly string[]).includes(
        dye.acquisition
      )
    ) {
      return true;
    }

    // Check Cosmic Dyes
    if (
      this.priceCategories.cosmicDyes &&
      (PRICE_CATEGORIES.cosmicDyes.acquisitions as readonly string[]).includes(dye.acquisition)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Fetch price for a dye using current server settings
   */
  async fetchPrice(dye: Dye): Promise<PriceData | null> {
    if (!this.showPrices || !this.shouldFetchPrice(dye)) {
      return null;
    }

    try {
      return await this.apiService.getPriceData(dye.itemID, undefined, this.selectedServer);
    } catch (error) {
      console.error(`Failed to fetch price for ${dye.name}:`, error);
      return null;
    }
  }

  /**
   * Fetch prices for multiple dyes
   */
  async fetchPricesForDyes(dyes: Dye[]): Promise<Map<number, PriceData>> {
    const results = new Map<number, PriceData>();

    for (const dye of dyes) {
      const price = await this.fetchPrice(dye);
      if (price) {
        results.set(dye.itemID, price);
      }
    }

    return results;
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number): string {
    return APIService.formatPrice(price);
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      selectedServer: this.selectedServer,
      showPrices: this.showPrices,
      priceCategories: this.priceCategories,
    };
  }

  /**
   * Set component state
   */
  protected setState(newState: Record<string, unknown>): void {
    if (typeof newState.selectedServer === 'string') {
      this.selectedServer = newState.selectedServer;
    }
    if (typeof newState.showPrices === 'boolean') {
      this.showPrices = newState.showPrices;
    }
    if (typeof newState.priceCategories === 'object' && newState.priceCategories !== null) {
      this.priceCategories = newState.priceCategories as PriceCategorySettings;
    }
  }

  /**
   * Get selected server
   */
  getSelectedServer(): string {
    return this.selectedServer;
  }

  /**
   * Get show prices setting
   */
  getShowPrices(): boolean {
    return this.showPrices;
  }

  /**
   * Get price category settings
   */
  getPriceCategories(): PriceCategorySettings {
    return { ...this.priceCategories };
  }
}

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
      const [dcResponse, worldsResponse] = await Promise.all([
        fetch('/assets/json/data-centers.json'),
        fetch('/assets/json/worlds.json'),
      ]);

      if (!dcResponse.ok || !worldsResponse.ok) {
        throw new Error('Failed to load server data');
      }

      this.dataCenters = await dcResponse.json();
      this.worlds = await worldsResponse.json();
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
        'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm',
      attributes: {
        id: 'mb-server-select',
      },
    }) as HTMLSelectElement;

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
        "w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600",
    });
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
          'h-3 w-3 text-blue-600 border-gray-300 dark:border-gray-600 rounded mb-price-checkbox',
        attributes: {
          type: 'checkbox',
          id: `mb-price-${category.id}`,
          'data-category': category.key,
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
        'w-full px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition font-medium mt-3',
      attributes: {
        id: 'mb-refresh-btn',
      },
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
    // Add data center options
    for (const dc of this.dataCenters) {
      const option = document.createElement('option');
      option.value = dc.name;
      option.textContent = `${dc.name} (${dc.region})`;
      if (dc.name === this.selectedServer) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    }

    // Optionally add individual world options (commented out for now - most users prefer data center)
    // const separator = document.createElement('option');
    // separator.disabled = true;
    // separator.textContent = '──────────';
    // selectElement.appendChild(separator);
    //
    // for (const world of this.worlds) {
    //   const option = document.createElement('option');
    //   option.value = String(world.id);
    //   option.textContent = world.name;
    //   selectElement.appendChild(option);
    // }
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
      (PRICE_CATEGORIES.alliedSocietyDyes.acquisitions as readonly string[]).includes(dye.acquisition)
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

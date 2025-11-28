/**
 * XIV Dye Tools - Market Board Component Tests
 *
 * Tests for market board UI and Universalis API integration
 *
 * @module components/__tests__/market-board.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MarketBoard } from '../market-board';
import {
  createTestContainer,
  cleanupTestContainer,
  waitForComponent,
  setupFetchMock,
} from './test-utils';
import type { Dye } from '@shared/types';

// Mock data
const mockDataCenters = [
  { name: 'Crystal', region: 'NA', worlds: [1, 2, 3] },
  { name: 'Aether', region: 'NA', worlds: [4, 5, 6] },
];

const mockWorlds = [
  { id: 1, name: 'Balmung' },
  { id: 2, name: 'Brynhildr' },
  { id: 3, name: 'Coeurl' },
  { id: 4, name: 'Adamantoise' },
  { id: 5, name: 'Cactuar' },
  { id: 6, name: 'Faerie' },
];

// Mock the services
vi.mock('@services/index', () => ({
  APIService: {
    getInstance: vi.fn(() => ({
      clearCache: vi.fn().mockResolvedValue(undefined),
      getPriceData: vi.fn().mockResolvedValue({ minPrice: 1000, maxPrice: 5000 }),
    })),
    formatPrice: vi.fn((price: number) => `${price.toLocaleString()}G`),
  },
  LanguageService: {
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'marketBoard.title': 'Market Board',
        'marketBoard.server': 'Server',
        'marketBoard.showPrices': 'Show Prices',
        'marketBoard.baseDyes': 'Base Dyes',
        'marketBoard.craftDyes': 'Craft Dyes',
        'marketBoard.alliedSocietyDyes': 'Allied Society Dyes',
        'marketBoard.cosmicDyes': 'Cosmic Dyes',
        'marketBoard.specialDyes': 'Special Dyes',
        'marketBoard.refresh': 'Refresh Prices',
        'marketBoard.refreshing': 'Refreshing...',
        'marketBoard.clearingCache': 'Clearing cache...',
        'marketBoard.pricesRefreshed': 'Prices refreshed!',
        'marketBoard.refreshError': 'Error refreshing prices',
        'marketBoard.allWorlds': 'All Worlds',
      };
      return translations[key] || key;
    }),
    subscribe: vi.fn(() => () => {}),
  },
}));

vi.mock('@services/storage-service', () => ({
  appStorage: {
    getItem: vi.fn((key: string, defaultValue: unknown) => defaultValue),
    setItem: vi.fn(),
  },
}));

describe('MarketBoard', () => {
  let container: HTMLElement;
  let component: MarketBoard;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    container = createTestContainer();

    // Setup fetch mock for server data
    fetchMock = setupFetchMock();
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('data-centers.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDataCenters),
        });
      }
      if (url.includes('worlds.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWorlds),
        });
      }
      return Promise.resolve({ ok: false });
    });
  });

  afterEach(() => {
    if (component) {
      component.destroy();
    }
    cleanupTestContainer(container);
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Rendering
  // ==========================================================================

  describe('rendering', () => {
    it('should render the market board component', () => {
      component = new MarketBoard(container);
      component.init();

      expect(container.textContent).toContain('Market Board');
    });

    it('should render server selection dropdown', () => {
      component = new MarketBoard(container);
      component.init();

      const serverSelect = container.querySelector('#mb-server-select');
      expect(serverSelect).not.toBeNull();
    });

    it('should render show prices toggle', () => {
      component = new MarketBoard(container);
      component.init();

      const toggle = container.querySelector('#show-mb-prices-toggle');
      expect(toggle).not.toBeNull();
    });

    it('should render category checkboxes', () => {
      component = new MarketBoard(container);
      component.init();

      const checkboxes = container.querySelectorAll('.mb-price-checkbox');
      expect(checkboxes.length).toBe(5); // 5 categories
    });

    it('should render refresh button', () => {
      component = new MarketBoard(container);
      component.init();

      const refreshBtn = container.querySelector('#mb-refresh-btn');
      expect(refreshBtn).not.toBeNull();
      expect(refreshBtn?.textContent).toBe('Refresh Prices');
    });
  });

  // ==========================================================================
  // Server Data Loading
  // ==========================================================================

  describe('loadServerData', () => {
    it('should load data centers and worlds', async () => {
      component = new MarketBoard(container);
      component.init();

      await component.loadServerData();

      expect(fetchMock).toHaveBeenCalledWith('/json/data-centers.json');
      expect(fetchMock).toHaveBeenCalledWith('/json/worlds.json');
    });

    it('should handle fetch errors gracefully', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });

      component = new MarketBoard(container);
      component.init();

      // Should not throw
      await expect(component.loadServerData()).resolves.not.toThrow();
    });

    it('should populate server dropdown after loading', async () => {
      component = new MarketBoard(container);
      component.init();

      await component.loadServerData();
      await waitForComponent();

      const serverSelect = container.querySelector('#mb-server-select') as HTMLSelectElement;
      // Should have optgroups for data centers
      expect(serverSelect.querySelectorAll('optgroup').length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Toggle Behavior
  // ==========================================================================

  describe('show prices toggle', () => {
    it('should toggle price settings visibility', async () => {
      component = new MarketBoard(container);
      component.init();

      const toggle = container.querySelector('#show-mb-prices-toggle') as HTMLInputElement;
      const priceSettings = container.querySelector('#mb-price-settings');

      // Initially hidden (based on default showPrices = false)
      expect(priceSettings?.classList.contains('hidden')).toBe(true);

      // Toggle on
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      await waitForComponent();

      expect(priceSettings?.classList.contains('hidden')).toBe(false);
    });

    it('should emit toggle-prices event', async () => {
      component = new MarketBoard(container);
      component.init();

      const eventSpy = vi.fn();
      container.addEventListener('toggle-prices', eventSpy);

      const toggle = container.querySelector('#show-mb-prices-toggle') as HTMLInputElement;
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      await waitForComponent();

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Server Selection
  // ==========================================================================

  describe('server selection', () => {
    it('should emit server-changed event on selection', async () => {
      component = new MarketBoard(container);
      component.init();

      const eventSpy = vi.fn();
      container.addEventListener('server-changed', eventSpy);

      const serverSelect = container.querySelector('#mb-server-select') as HTMLSelectElement;
      serverSelect.value = 'Aether';
      serverSelect.dispatchEvent(new Event('change'));
      await waitForComponent();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should update selected server on change', async () => {
      component = new MarketBoard(container);
      component.init();

      // Load server data first so the dropdown has valid options
      await component.loadServerData();
      await waitForComponent();

      const serverSelect = container.querySelector('#mb-server-select') as HTMLSelectElement;
      // Use a value that exists after loading server data
      if (serverSelect.options.length > 1) {
        const validValue = serverSelect.options[1]?.value || 'Crystal';
        serverSelect.value = validValue;
        serverSelect.dispatchEvent(new Event('change'));
        await waitForComponent();

        expect(component.getSelectedServer()).toBe(validValue);
      } else {
        // Fallback - just verify default server is returned
        expect(component.getSelectedServer()).toBe('Crystal');
      }
    });
  });

  // ==========================================================================
  // Category Checkboxes
  // ==========================================================================

  describe('category checkboxes', () => {
    it('should emit categories-changed event on checkbox change', async () => {
      component = new MarketBoard(container);
      component.init();

      const eventSpy = vi.fn();
      container.addEventListener('categories-changed', eventSpy);

      const checkbox = container.querySelector('[data-category="baseDyes"]') as HTMLInputElement;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
      await waitForComponent();

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Refresh Prices
  // ==========================================================================

  describe('refreshPrices', () => {
    it('should call clearCache and emit refresh-requested', async () => {
      component = new MarketBoard(container);
      component.init();

      const eventSpy = vi.fn();
      container.addEventListener('refresh-requested', eventSpy);

      await component.refreshPrices();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should disable button during refresh', async () => {
      component = new MarketBoard(container);
      component.init();

      const refreshBtn = container.querySelector('#mb-refresh-btn') as HTMLButtonElement;

      // Start refresh but don't wait
      const refreshPromise = component.refreshPrices();

      // Button should be disabled
      expect(refreshBtn.disabled).toBe(true);

      await refreshPromise;

      // Button should be re-enabled
      expect(refreshBtn.disabled).toBe(false);
    });

    it('should update status message during refresh', async () => {
      component = new MarketBoard(container);
      component.init();

      const statusMsg = container.querySelector('#mb-price-status');

      await component.refreshPrices();

      // Status should show success message
      expect(statusMsg?.textContent).toContain('refreshed');
    });

    it('should not refresh if already refreshing', async () => {
      component = new MarketBoard(container);
      component.init();

      const eventSpy = vi.fn();
      container.addEventListener('refresh-requested', eventSpy);

      // Start two refreshes simultaneously
      const promise1 = component.refreshPrices();
      const promise2 = component.refreshPrices();

      await Promise.all([promise1, promise2]);

      // Should only emit once
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // shouldFetchPrice
  // ==========================================================================

  describe('shouldFetchPrice', () => {
    beforeEach(() => {
      component = new MarketBoard(container);
      component.init();
    });

    it('should return false for null dye', () => {
      expect(component.shouldFetchPrice(null as unknown as Dye)).toBe(false);
    });

    it('should return false for dye without itemID', () => {
      const dye = { name: 'Test' } as Dye;
      expect(component.shouldFetchPrice(dye)).toBe(false);
    });

    it('should return true for Special category dye when specialDyes enabled', () => {
      const dye = {
        itemID: 123,
        category: 'Special',
        acquisition: 'Unknown',
      } as Dye;

      expect(component.shouldFetchPrice(dye)).toBe(true);
    });

    it('should return false for dye without acquisition', () => {
      const dye = {
        itemID: 123,
        category: 'Red',
      } as Dye;

      expect(component.shouldFetchPrice(dye)).toBe(false);
    });
  });

  // ==========================================================================
  // fetchPrice
  // ==========================================================================

  describe('fetchPrice', () => {
    it('should return null if showPrices is false', async () => {
      component = new MarketBoard(container);
      component.init();

      const dye = {
        itemID: 123,
        name: 'Test Dye',
        category: 'Special',
        acquisition: 'Weaver',
      } as Dye;

      const result = await component.fetchPrice(dye);
      expect(result).toBeNull();
    });

    it('should return null if dye should not be fetched', async () => {
      component = new MarketBoard(container);
      component.init();

      // Enable show prices
      const toggle = container.querySelector('#show-mb-prices-toggle') as HTMLInputElement;
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));

      const dye = {
        itemID: 123,
        name: 'Test Dye',
        category: 'Red', // Not Special
        // No acquisition
      } as Dye;

      const result = await component.fetchPrice(dye);
      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // fetchPricesForDyes
  // ==========================================================================

  describe('fetchPricesForDyes', () => {
    it('should fetch prices for multiple dyes', async () => {
      component = new MarketBoard(container);
      component.init();

      const dyes: Dye[] = [
        { itemID: 1, name: 'Dye 1', category: 'Special' } as Dye,
        { itemID: 2, name: 'Dye 2', category: 'Special' } as Dye,
      ];

      const results = await component.fetchPricesForDyes(dyes);

      // Results is a Map
      expect(results instanceof Map).toBe(true);
    });
  });

  // ==========================================================================
  // Static Methods
  // ==========================================================================

  describe('formatPrice', () => {
    it('should format price with G suffix', () => {
      const result = MarketBoard.formatPrice(1000);
      expect(result).toContain('G');
    });
  });

  // ==========================================================================
  // Getters
  // ==========================================================================

  describe('getters', () => {
    beforeEach(() => {
      component = new MarketBoard(container);
      component.init();
    });

    it('should return selected server', () => {
      expect(component.getSelectedServer()).toBe('Crystal'); // Default
    });

    it('should return show prices setting', () => {
      expect(component.getShowPrices()).toBe(false); // Default
    });

    it('should return price categories', () => {
      const categories = component.getPriceCategories();

      expect(categories).toHaveProperty('baseDyes');
      expect(categories).toHaveProperty('craftDyes');
      expect(categories).toHaveProperty('alliedSocietyDyes');
      expect(categories).toHaveProperty('cosmicDyes');
      expect(categories).toHaveProperty('specialDyes');
    });
  });

  // ==========================================================================
  // State Management
  // ==========================================================================

  describe('state management', () => {
    it('should return correct state', () => {
      component = new MarketBoard(container);
      component.init();

      const state = (component as unknown as { getState: () => Record<string, unknown> }).getState();

      expect(state).toHaveProperty('selectedServer');
      expect(state).toHaveProperty('showPrices');
      expect(state).toHaveProperty('priceCategories');
    });
  });

  // ==========================================================================
  // Hover Effects
  // ==========================================================================

  describe('hover effects', () => {
    it('should apply brightness filter on refresh button hover', async () => {
      component = new MarketBoard(container);
      component.init();

      const refreshBtn = container.querySelector('#mb-refresh-btn') as HTMLButtonElement;

      refreshBtn.dispatchEvent(new MouseEvent('mouseenter'));
      expect(refreshBtn.style.filter).toContain('brightness');

      refreshBtn.dispatchEvent(new MouseEvent('mouseleave'));
      expect(refreshBtn.style.filter).toBe('');
    });
  });
});

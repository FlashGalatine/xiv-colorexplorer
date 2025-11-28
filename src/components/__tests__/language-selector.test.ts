/**
 * XIV Dye Tools - Language Selector Component Tests
 *
 * Tests for the language selector UI component
 *
 * @module components/__tests__/language-selector.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LanguageSelector } from '../language-selector';
import {
  createTestContainer,
  cleanupTestContainer,
  waitForComponent,
} from './test-utils';
import { LOCALE_DISPLAY_INFO } from '@shared/constants';

// Mock the services
vi.mock('@services/index', () => ({
  ThemeService: {
    getCurrentTheme: vi.fn(() => 'standard-light'),
    getTheme: vi.fn(() => ({
      name: 'standard-light',
      palette: {
        primary: '#6366f1',
        background: '#ffffff',
      },
    })),
    subscribe: vi.fn(() => () => {}),
  },
  LanguageService: {
    getCurrentLocale: vi.fn(() => 'en'),
    setLocale: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(() => () => {}),
  },
  ColorService: {
    getOptimalTextColor: vi.fn(() => '#000000'),
  },
}));

describe('LanguageSelector', () => {
  let container: HTMLElement;
  let component: LanguageSelector;

  beforeEach(async () => {
    vi.clearAllMocks();
    container = createTestContainer();
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
    it('should render the language selector button', () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn');
      expect(button).not.toBeNull();
      expect(button?.getAttribute('aria-label')).toBe('Change language');
    });

    it('should render dropdown menu (hidden by default)', () => {
      component = new LanguageSelector(container);
      component.init();

      const dropdown = container.querySelector('#language-dropdown');
      expect(dropdown).not.toBeNull();
      expect(dropdown?.classList.contains('hidden')).toBe(true);
    });

    it('should render all available locales in dropdown', () => {
      component = new LanguageSelector(container);
      component.init();

      const localeButtons = container.querySelectorAll('[data-locale]');
      expect(localeButtons.length).toBe(LOCALE_DISPLAY_INFO.length);
    });

    it('should display flag and language name in button', () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn');
      expect(button?.innerHTML).toContain('🇬🇧'); // English flag (UK)
    });

    it('should mark current locale as selected', () => {
      component = new LanguageSelector(container);
      component.init();

      const currentLocaleButton = container.querySelector('[data-locale="en"]');
      expect(currentLocaleButton?.classList.contains('font-semibold')).toBe(true);
    });
  });

  // ==========================================================================
  // Dropdown Behavior
  // ==========================================================================

  describe('dropdown behavior', () => {
    it('should toggle dropdown on button click', async () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#language-dropdown');

      // Initially hidden
      expect(dropdown?.classList.contains('hidden')).toBe(true);

      // Click to open
      button.click();
      await waitForComponent();

      expect(dropdown?.classList.contains('hidden')).toBe(false);
      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('should close dropdown when clicking outside', async () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#language-dropdown');

      // Open dropdown
      button.click();
      await waitForComponent();
      expect(dropdown?.classList.contains('hidden')).toBe(false);

      // Click outside
      document.body.click();
      await waitForComponent();

      expect(dropdown?.classList.contains('hidden')).toBe(true);
    });

    it('should close dropdown on Escape key', async () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#language-dropdown');

      // Open dropdown
      button.click();
      await waitForComponent();
      expect(dropdown?.classList.contains('hidden')).toBe(false);

      // Press Escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await waitForComponent();

      expect(dropdown?.classList.contains('hidden')).toBe(true);
    });

    it('should close when other dropdowns request close', async () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#language-dropdown');

      // Open dropdown
      button.click();
      await waitForComponent();
      expect(dropdown?.classList.contains('hidden')).toBe(false);

      // Dispatch close event from another dropdown
      document.dispatchEvent(
        new CustomEvent('close-other-dropdowns', { detail: { source: 'tools' } })
      );
      await waitForComponent();

      expect(dropdown?.classList.contains('hidden')).toBe(true);
    });

    it('should dispatch close event for other dropdowns when opening', async () => {
      component = new LanguageSelector(container);
      component.init();

      const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      button.click();
      await waitForComponent();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'close-other-dropdowns',
        })
      );
    });
  });

  // ==========================================================================
  // Language Selection
  // ==========================================================================

  describe('language selection', () => {
    it('should change language when locale button clicked', async () => {
      const { LanguageService } = await import('@services/index');
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      button.click();
      await waitForComponent();

      const jaButton = container.querySelector('[data-locale="ja"]') as HTMLButtonElement;
      jaButton.click();
      await waitForComponent();

      expect(LanguageService.setLocale).toHaveBeenCalledWith('ja');
    });

    it('should emit language-changed event on selection', async () => {
      component = new LanguageSelector(container);
      component.init();

      const eventSpy = vi.fn();
      container.addEventListener('language-changed', eventSpy);

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      button.click();
      await waitForComponent();

      const deButton = container.querySelector('[data-locale="de"]') as HTMLButtonElement;
      deButton.click();
      await waitForComponent();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should close dropdown after language selection', async () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#language-dropdown');

      button.click();
      await waitForComponent();
      expect(dropdown?.classList.contains('hidden')).toBe(false);

      const frButton = container.querySelector('[data-locale="fr"]') as HTMLButtonElement;
      frButton.click();
      await waitForComponent();

      expect(dropdown?.classList.contains('hidden')).toBe(true);
    });

    it('should close dropdown when same language selected', async () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;
      const dropdown = container.querySelector('#language-dropdown');

      button.click();
      await waitForComponent();

      const enButton = container.querySelector('[data-locale="en"]') as HTMLButtonElement;
      enButton.click();
      await waitForComponent();

      expect(dropdown?.classList.contains('hidden')).toBe(true);
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn');
      expect(button?.getAttribute('aria-label')).toBe('Change language');
      expect(button?.getAttribute('aria-haspopup')).toBe('true');
      expect(button?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should update aria-expanded when dropdown opens/closes', async () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;

      expect(button.getAttribute('aria-expanded')).toBe('false');

      button.click();
      await waitForComponent();
      expect(button.getAttribute('aria-expanded')).toBe('true');

      button.click();
      await waitForComponent();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });
  });

  // ==========================================================================
  // State Management
  // ==========================================================================

  describe('state management', () => {
    it('should return correct state via getState', () => {
      component = new LanguageSelector(container);
      component.init();

      const state = (component as unknown as { getState: () => Record<string, unknown> }).getState();

      expect(state).toHaveProperty('currentLocale');
      expect(state).toHaveProperty('isDropdownOpen');
      expect(state.currentLocale).toBe('en');
      expect(state.isDropdownOpen).toBe(false);
    });
  });

  // ==========================================================================
  // Hover Effects
  // ==========================================================================

  describe('hover effects', () => {
    it('should apply hover style on button mouseenter', () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;

      button.dispatchEvent(new MouseEvent('mouseenter'));

      expect(button.style.backgroundColor).not.toBe('');
    });

    it('should remove hover style on button mouseleave', () => {
      component = new LanguageSelector(container);
      component.init();

      const button = container.querySelector('#language-selector-btn') as HTMLButtonElement;

      button.dispatchEvent(new MouseEvent('mouseenter'));
      button.dispatchEvent(new MouseEvent('mouseleave'));

      expect(button.style.backgroundColor).toBe('transparent');
    });
  });

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      component = new LanguageSelector(container);
      component.init();

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      component.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});

/**
 * XIV Dye Tools v2.0.0 - Theme Switcher Component
 *
 * Phase 12: Architecture Refactor
 * UI component for theme selection and management
 *
 * @module components/theme-switcher
 */

import { BaseComponent } from './base-component';
import { ThemeService } from '@services/index';
import type { ThemeName } from '@shared/types';

/**
 * Theme switcher component - allows users to select from 10 available themes
 * Manages theme persistence via ThemeService
 */
export class ThemeSwitcher extends BaseComponent {
  private currentTheme: ThemeName = 'standard-light';
  private isDropdownOpen: boolean = false;

  /**
   * Render the theme switcher component
   */
  render(): void {
    // Create button to toggle dropdown
    const button = this.createElement('button', {
      id: 'theme-switcher-btn',
      className:
        'p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
      attributes: {
        'aria-label': 'Toggle theme switcher',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
      },
    });

    // Add theme icon
    button.innerHTML = '🎨 Theme';

    // Create dropdown menu container
    const dropdown = this.createElement('div', {
      id: 'theme-dropdown',
      className:
        'hidden absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-48',
    });

    // Get all available themes and create buttons
    const themes = ThemeService.getAllThemes();
    const themeList = this.createElement('div', {
      className: 'flex flex-col p-2',
    });

    for (const theme of themes) {
      const themeBtn = this.createElement('button', {
        className:
          'px-4 py-2 text-left text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2',
        attributes: {
          'data-theme': theme.name,
        },
      });

      // Add color swatch
      const swatch = this.createElement('div', {
        className: 'w-4 h-4 rounded border border-gray-300',
        attributes: {
          style: `background-color: ${theme.palette.primary}`,
        },
      });

      themeBtn.appendChild(swatch);

      // Format theme name for display (e.g., "standard-light" → "Standard Light")
      const displayName = theme.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      themeBtn.appendChild(this.createElement('span', { textContent: displayName }));

      // Mark current theme
      if (theme.name === this.currentTheme) {
        themeBtn.classList.add('font-semibold', 'bg-gray-100', 'dark:bg-gray-700');
      }

      themeList.appendChild(themeBtn);
    }

    dropdown.appendChild(themeList);

    // Create wrapper container
    const container = this.createElement('div', {
      className: 'relative',
    });

    container.appendChild(button);
    container.appendChild(dropdown);

    // Clear existing content and add new
    this.container.innerHTML = '';
    this.element = container;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners for theme selection and dropdown toggle
   */
  bindEvents(): void {
    const button = this.querySelector<HTMLButtonElement>('#theme-switcher-btn');
    const dropdown = this.querySelector<HTMLDivElement>('#theme-dropdown');

    if (!button || !dropdown) return;

    // Toggle dropdown visibility
    this.on(button, 'click', (event) => {
      event.stopPropagation(); // Prevent immediate closing from document listener
      this.toggleDropdown(button, dropdown);
    });

    // Handle theme selection
    const themeButtons = this.querySelectorAll<HTMLButtonElement>('[data-theme]');
    for (const themeBtn of themeButtons) {
      this.on(themeBtn, 'click', (event) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent bubbling to document listener
        const themeId = themeBtn.getAttribute('data-theme') as ThemeName;

        if (themeId) {
          // Update current theme
          this.currentTheme = themeId;

          // Apply theme via service
          ThemeService.setTheme(themeId);

          // Close dropdown
          this.closeDropdown(button, dropdown);

          // Update visual state
          this.update();

          // Emit change event for other components
          this.emit('theme-changed', { theme: themeId });
        }
      });
    }

    // Close dropdown when clicking outside
    this.on(document, 'click', (event) => {
      const target = event.target as HTMLElement;
      if (!this.element?.contains(target) && this.isDropdownOpen) {
        this.closeDropdown(button, dropdown);
      }
    });

    // Close dropdown on ESC key
    this.on(document, 'keydown', (event) => {
      if (event.key === 'Escape' && this.isDropdownOpen) {
        this.closeDropdown(button, dropdown);
        button.focus(); // Return focus to button for accessibility
      }
    });
  }

  /**
   * Toggle dropdown open/closed state
   */
  private toggleDropdown(button: HTMLButtonElement, dropdown: HTMLDivElement): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    dropdown.classList.toggle('hidden', !this.isDropdownOpen);
    button.setAttribute('aria-expanded', String(this.isDropdownOpen));
  }

  /**
   * Close the dropdown menu
   */
  private closeDropdown(button: HTMLButtonElement, dropdown: HTMLDivElement): void {
    this.isDropdownOpen = false;
    dropdown.classList.add('hidden');
    button.setAttribute('aria-expanded', 'false');
  }

  /**
   * Initialize with current theme from service
   */
  onMount(): void {
    this.currentTheme = ThemeService.getCurrentTheme();

    // Subscribe to theme changes
    ThemeService.subscribe((theme) => {
      this.currentTheme = theme;
      this.update();
    });
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      currentTheme: this.currentTheme,
      isDropdownOpen: this.isDropdownOpen,
    };
  }

  /**
   * Set component state
   */
  protected setState(newState: Record<string, unknown>): void {
    if (typeof newState.currentTheme === 'string') {
      this.currentTheme = newState.currentTheme as ThemeName;
    }
    if (typeof newState.isDropdownOpen === 'boolean') {
      this.isDropdownOpen = newState.isDropdownOpen;
    }
  }
}

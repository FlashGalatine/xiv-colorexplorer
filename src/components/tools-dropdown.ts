/**
 * XIV Dye Tools v2.0.0 - Tools Dropdown Component
 *
 * Phase 12.8: Bug Fixes
 * Provides desktop dropdown navigation for switching between tools
 *
 * @module components/tools-dropdown
 */

import { BaseComponent } from './base-component';

/**
 * Tool definition for dropdown
 */
export interface ToolDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

/**
 * Tools Dropdown Component
 * Displays a dropdown menu with all available tools on desktop
 * Hidden on mobile (≤768px), visible on desktop (>768px)
 */
export class ToolsDropdown extends BaseComponent {
  private tools: ToolDef[] = [];
  private isDropdownOpen: boolean = false;

  constructor(container: HTMLElement, tools: ToolDef[]) {
    super(container);
    this.tools = tools;
  }

  /**
   * Render the tools dropdown component
   */
  render(): void {
    // Create button to toggle dropdown
    const button = this.createElement('button', {
      id: 'tools-dropdown-btn',
      className:
        'p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ' +
        'hidden md:inline-flex items-center gap-2',
      attributes: {
        'aria-label': 'Toggle tools menu',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
      },
    });

    button.innerHTML = '🛠️ Tools';

    // Create dropdown menu container
    const dropdown = this.createElement('div', {
      id: 'tools-dropdown-menu',
      className:
        'hidden absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-56',
    });

    // Create tools list
    const toolsList = this.createElement('div', {
      className: 'flex flex-col p-2',
    });

    // Add tool buttons
    for (const tool of this.tools) {
      const toolBtn = this.createElement('button', {
        className:
          'px-4 py-3 text-left text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3',
        attributes: {
          'data-tool-id': tool.id,
          'title': tool.description,
        },
      });

      // Tool icon
      const icon = this.createElement('span', {
        className: 'text-lg',
        textContent: tool.icon,
      });

      // Tool info container
      const infoContainer = this.createElement('div', {
        className: 'flex-1',
      });

      // Tool name
      const nameElement = this.createElement('div', {
        className: 'font-medium text-gray-900 dark:text-white',
        textContent: tool.name,
      });

      // Tool description
      const descElement = this.createElement('div', {
        className: 'text-xs text-gray-500 dark:text-gray-400',
        textContent: tool.description,
      });

      infoContainer.appendChild(nameElement);
      infoContainer.appendChild(descElement);

      toolBtn.appendChild(icon);
      toolBtn.appendChild(infoContainer);
      toolsList.appendChild(toolBtn);
    }

    dropdown.appendChild(toolsList);

    // Create wrapper container for positioning
    const wrapper = this.createElement('div', {
      className: 'relative',
    });

    wrapper.appendChild(button);
    wrapper.appendChild(dropdown);

    // Clear and render
    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const button = this.querySelector<HTMLButtonElement>('#tools-dropdown-btn');
    const dropdown = this.querySelector<HTMLElement>('#tools-dropdown-menu');

    if (!button || !dropdown) return;

    // Toggle dropdown on button click
    this.on(button, 'click', (e: Event) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Handle tool selection
    const toolButtons = this.querySelectorAll<HTMLButtonElement>('[data-tool-id]');
    toolButtons.forEach((btn) => {
      this.on(btn, 'click', (e: Event) => {
        const toolId = btn.getAttribute('data-tool-id');
        if (toolId) {
          e.stopPropagation();
          this.closeDropdown();
          // Dispatch custom event for parent to listen
          this.container.dispatchEvent(
            new CustomEvent('tool-selected', {
              detail: { toolId },
              bubbles: true,
              composed: true,
            })
          );
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e: Event) => {
      if (this.isDropdownOpen) {
        const target = e.target as HTMLElement;
        if (!this.element?.contains(target)) {
          this.closeDropdown();
        }
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isDropdownOpen) {
        this.closeDropdown();
      }
    });
  }

  /**
   * Toggle dropdown visibility
   */
  private toggleDropdown(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open dropdown
   */
  private openDropdown(): void {
    const dropdown = this.querySelector<HTMLElement>('#tools-dropdown-menu');
    const button = this.querySelector<HTMLButtonElement>('#tools-dropdown-btn');

    if (dropdown && button) {
      dropdown.classList.remove('hidden');
      button.setAttribute('aria-expanded', 'true');
      this.isDropdownOpen = true;
    }
  }

  /**
   * Close dropdown
   */
  private closeDropdown(): void {
    const dropdown = this.querySelector<HTMLElement>('#tools-dropdown-menu');
    const button = this.querySelector<HTMLButtonElement>('#tools-dropdown-btn');

    if (dropdown && button) {
      dropdown.classList.add('hidden');
      button.setAttribute('aria-expanded', 'false');
      this.isDropdownOpen = false;
    }
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      isOpen: this.isDropdownOpen,
      toolCount: this.tools.length,
    };
  }
}

/**
 * XIV Dye Tools v2.2.0 - Dye Action Dropdown Component
 *
 * Quick-action dropdown menu for dye items
 * Options: Add to Comparison, Add to Mixer, Copy to Clipboard
 *
 * @module components/dye-action-dropdown
 */

import type { Dye } from '@shared/types';
import { LanguageService } from '@services/index';
import { ToastService } from '@services/toast-service';

// ============================================================================
// Action Types
// ============================================================================

export type DyeAction = 'comparison' | 'mixer' | 'copy';

export interface DyeActionCallback {
  (action: DyeAction, dye: Dye): void;
}

// ============================================================================
// Dye Action Dropdown Component
// ============================================================================

/**
 * Creates a dropdown button with quick actions for a dye
 */
export function createDyeActionDropdown(dye: Dye, onAction?: DyeActionCallback): HTMLElement {
  const container = document.createElement('div');
  container.className = 'dye-action-dropdown relative';

  // Dropdown button
  const button = document.createElement('button');
  button.type = 'button';
  button.className =
    'flex items-center justify-center w-8 h-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors';
  button.style.color = 'var(--theme-text-muted)';
  button.addEventListener('mouseenter', () => {
    button.style.color = 'var(--theme-text)';
    button.style.backgroundColor = 'var(--theme-card-hover)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.color = 'var(--theme-text-muted)';
    button.style.backgroundColor = '';
  });
  button.setAttribute('aria-label', LanguageService.t('harmony.actions') || 'Actions');
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');

  // Three dots icon
  button.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
    </svg>
  `;

  // Dropdown menu
  const menu = document.createElement('div');
  menu.className =
    'absolute right-0 top-full mt-1 z-50 min-w-[160px] py-1 rounded-lg shadow-lg opacity-0 invisible transform scale-95 origin-top-right transition-all duration-150';
  menu.style.backgroundColor = 'var(--theme-card-background)';
  menu.style.borderWidth = '1px';
  menu.style.borderStyle = 'solid';
  menu.style.borderColor = 'var(--theme-border)';
  menu.setAttribute('role', 'menu');
  // Use inert for better accessibility - prevents focus while hidden
  menu.setAttribute('inert', '');

  // Menu items
  const actions: Array<{
    action: DyeAction;
    icon: string;
    labelKey: string;
    defaultLabel: string;
  }> = [
    {
      action: 'comparison',
      icon: '⚖️',
      labelKey: 'harmony.addToComparison',
      defaultLabel: 'Add to Comparison',
    },
    {
      action: 'mixer',
      icon: '🌈',
      labelKey: 'harmony.addToMixer',
      defaultLabel: 'Add to Mixer',
    },
    {
      action: 'copy',
      icon: '📋',
      labelKey: 'harmony.copyHex',
      defaultLabel: 'Copy Hex',
    },
  ];

  actions.forEach(({ action, icon, labelKey, defaultLabel }) => {
    const menuItem = document.createElement('button');
    menuItem.type = 'button';
    menuItem.className =
      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors';
    menuItem.style.color = 'var(--theme-text)';
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.backgroundColor = 'var(--theme-card-hover)';
    });
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.backgroundColor = '';
    });
    menuItem.setAttribute('role', 'menuitem');

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    menuItem.appendChild(iconSpan);

    const labelSpan = document.createElement('span');
    labelSpan.textContent = LanguageService.t(labelKey) || defaultLabel;
    menuItem.appendChild(labelSpan);

    menuItem.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();

      if (action === 'copy') {
        void copyHexToClipboard(dye.hex);
      } else if (onAction) {
        onAction(action, dye);
      }
    });

    menu.appendChild(menuItem);
  });

  container.appendChild(button);
  container.appendChild(menu);

  // Toggle menu on button click
  let isOpen = false;

  function openMenu(): void {
    // Close any other open dropdowns first by dispatching a global event
    document.dispatchEvent(
      new CustomEvent('dye-dropdown-close-all', { detail: { except: container } })
    );

    isOpen = true;
    menu.classList.remove('opacity-0', 'invisible', 'scale-95');
    menu.classList.add('opacity-100', 'visible', 'scale-100');
    button.setAttribute('aria-expanded', 'true');
    // Remove inert to allow focus on menu items
    menu.removeAttribute('inert');

    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  }

  function closeMenu(): void {
    isOpen = false;
    // Set inert before hiding to prevent focus issues
    menu.setAttribute('inert', '');
    menu.classList.add('opacity-0', 'invisible', 'scale-95');
    menu.classList.remove('opacity-100', 'visible', 'scale-100');
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleClickOutside);
  }

  function handleClickOutside(e: MouseEvent): void {
    if (!container.contains(e.target as Node)) {
      closeMenu();
    }
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on escape
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      button.focus();
    }
  });

  // Listen for global close event (fired when another dropdown opens)
  function handleCloseAll(e: Event): void {
    const customEvent = e as CustomEvent<{ except: HTMLElement }>;
    // Close this dropdown unless it's the one that triggered the event
    // Also check if container is still in DOM to handle cleanup
    if (isOpen && customEvent.detail?.except !== container && document.body.contains(container)) {
      closeMenu();
    }
  }

  document.addEventListener('dye-dropdown-close-all', handleCloseAll);

  return container;
}

/**
 * Copy hex value to clipboard
 */
async function copyHexToClipboard(hex: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(hex);
    ToastService.success(`${LanguageService.t('harmony.copiedHex') || 'Copied'}: ${hex}`);
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = hex;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      ToastService.success(`${LanguageService.t('harmony.copiedHex') || 'Copied'}: ${hex}`);
    } catch {
      ToastService.error(LanguageService.t('harmony.copyFailed') || 'Failed to copy');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

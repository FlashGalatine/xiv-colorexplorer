/**
 * XIV Dye Tools v2.0.0 - Outfit Slot Selector Component
 *
 * Phase 12: Architecture Refactor
 * Allows selection of dyes for different outfit equipment slots
 *
 * @module components/outfit-slot-selector
 */

import { BaseComponent } from './base-component';
import { DyeSelector } from './dye-selector';
import type { Dye } from '@shared/types';
import { clearContainer } from '@shared/utils';

/**
 * Outfit slot configuration
 */
export interface OutfitSlot {
  id: string;
  name: string;
  icon: string; // Icon emoji
  primary: Dye | null;
  secondary: Dye | null; // Optional dual dye
}

/**
 * Outfit Slot Selector Component
 * Manages selection of dyes for 6 FFXIV equipment slots
 */
export class OutfitSlotSelector extends BaseComponent {
  private slots: OutfitSlot[] = [
    { id: 'head', name: 'Head', icon: '👑', primary: null, secondary: null },
    { id: 'body', name: 'Body', icon: '👔', primary: null, secondary: null },
    { id: 'hands', name: 'Hands', icon: '🧤', primary: null, secondary: null },
    { id: 'legs', name: 'Legs', icon: '👖', primary: null, secondary: null },
    { id: 'feet', name: 'Feet', icon: '👞', primary: null, secondary: null },
    { id: 'weapon', name: 'Weapon', icon: '⚔️', primary: null, secondary: null },
  ];

  private dyeSelectors: Map<string, DyeSelector> = new Map();
  private enableDualDyes: boolean = false;

  constructor(container: HTMLElement, enableDualDyes: boolean = false) {
    super(container);
    this.enableDualDyes = enableDualDyes;
  }

  /**
   * Render the slot selector
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-6',
    });

    // Dual dyes toggle
    const toggleSection = this.createElement('div', {
      className:
        'flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800',
    });

    const checkbox = this.createElement('input', {
      className: 'w-4 h-4 border-gray-300 rounded focus:ring-blue-500',
      attributes: {
        type: 'checkbox',
        id: 'dual-dyes-toggle',
      },
    });

    if (this.enableDualDyes) {
      (checkbox as HTMLInputElement).checked = true;
    }

    const label = this.createElement('label', {
      attributes: {
        for: 'dual-dyes-toggle',
      },
      className: 'text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer',
      textContent: 'Enable Dual Dyes (secondary colors)',
    });

    toggleSection.appendChild(checkbox);
    toggleSection.appendChild(label);
    wrapper.appendChild(toggleSection);

    // Slots grid
    const slotsGrid = this.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    });

    for (const slot of this.slots) {
      const slotCard = this.renderSlotCard(slot);
      slotsGrid.appendChild(slotCard);
    }

    wrapper.appendChild(slotsGrid);

    clearContainer(this.container);
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Render a single slot card
   */
  private renderSlotCard(slot: OutfitSlot): HTMLElement {
    const card = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3',
    });

    // Slot header
    const header = this.createElement('div', {
      className: 'flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700',
    });

    const icon = this.createElement('span', {
      textContent: slot.icon,
      className: 'text-xl',
    });

    const name = this.createElement('div', {
      textContent: slot.name,
      className: 'font-semibold text-gray-900 dark:text-white flex-1',
    });

    header.appendChild(icon);
    header.appendChild(name);
    card.appendChild(header);

    // Primary dye selector
    const primaryLabel = this.createElement('label', {
      textContent: 'Primary Dye',
      className: 'text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide',
    });
    card.appendChild(primaryLabel);

    const primaryContainer = this.createElement('div', {
      id: `dye-selector-${slot.id}-primary`,
      className: 'rounded border border-gray-200 dark:border-gray-700',
    });
    card.appendChild(primaryContainer);

    // Secondary dye selector (if dual dyes enabled)
    if (this.enableDualDyes) {
      const secondaryLabel = this.createElement('label', {
        textContent: 'Secondary Dye (Optional)',
        className: 'text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide',
      });
      card.appendChild(secondaryLabel);

      const secondaryContainer = this.createElement('div', {
        id: `dye-selector-${slot.id}-secondary`,
        className: 'rounded border border-gray-200 dark:border-gray-700',
      });
      card.appendChild(secondaryContainer);
    }

    // Display selected dyes
    const display = this.createElement('div', {
      className: 'flex gap-2 pt-2',
    });

    if (slot.primary) {
      const primaryDisplay = this.createElement('div', {
        className: 'flex-1 text-xs',
      });

      const primarySwatch = this.createElement('div', {
        className: 'w-full h-6 rounded border border-gray-300 dark:border-gray-600 mb-1',
        attributes: {
          style: `background-color: ${slot.primary.hex}`,
        },
      });

      const primaryText = this.createElement('div', {
        textContent: slot.primary.name,
        className: 'truncate text-gray-600 dark:text-gray-400 font-mono text-xs',
      });

      primaryDisplay.appendChild(primarySwatch);
      primaryDisplay.appendChild(primaryText);
      display.appendChild(primaryDisplay);
    }

    if (this.enableDualDyes && slot.secondary) {
      const secondaryDisplay = this.createElement('div', {
        className: 'flex-1 text-xs',
      });

      const secondarySwatch = this.createElement('div', {
        className: 'w-full h-6 rounded border border-gray-300 dark:border-gray-600 mb-1',
        attributes: {
          style: `background-color: ${slot.secondary.hex}`,
        },
      });

      const secondaryText = this.createElement('div', {
        textContent: slot.secondary.name,
        className: 'truncate text-gray-600 dark:text-gray-400 font-mono text-xs',
      });

      secondaryDisplay.appendChild(secondarySwatch);
      secondaryDisplay.appendChild(secondaryText);
      display.appendChild(secondaryDisplay);
    }

    if (display.children.length > 0) {
      card.appendChild(display);
    }

    return card;
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    // Dual dyes toggle
    const toggle = this.querySelector<HTMLInputElement>('#dual-dyes-toggle');
    if (toggle) {
      this.on(toggle, 'change', () => {
        this.enableDualDyes = toggle.checked;
        this.update();
      });
    }

    // Initialize dye selectors for each slot
    for (const slot of this.slots) {
      const primaryContainer = this.querySelector<HTMLElement>(`#dye-selector-${slot.id}-primary`);

      if (primaryContainer && !this.dyeSelectors.has(`${slot.id}-primary`)) {
        const selector = new DyeSelector(primaryContainer, {
          maxSelections: 1,
          allowMultiple: false,
          showCategories: false,
          showPrices: false,
        });
        selector.init();
        this.dyeSelectors.set(`${slot.id}-primary`, selector);

        primaryContainer.addEventListener('selection-changed', (event: Event) => {
          const customEvent = event as CustomEvent;
          const selectedDyes = customEvent.detail?.selectedDyes || [];
          slot.primary = selectedDyes.length > 0 ? selectedDyes[0] : null;
          this.emit('slot-changed', {
            slotId: slot.id,
            primary: slot.primary,
            secondary: slot.secondary,
          });
        });
      }

      if (this.enableDualDyes) {
        const secondaryContainer = this.querySelector<HTMLElement>(
          `#dye-selector-${slot.id}-secondary`
        );

        if (secondaryContainer && !this.dyeSelectors.has(`${slot.id}-secondary`)) {
          const selector = new DyeSelector(secondaryContainer, {
            maxSelections: 1,
            allowMultiple: false,
            showCategories: false,
            showPrices: false,
          });
          selector.init();
          this.dyeSelectors.set(`${slot.id}-secondary`, selector);

          secondaryContainer.addEventListener('selection-changed', (event: Event) => {
            const customEvent = event as CustomEvent;
            const selectedDyes = customEvent.detail?.selectedDyes || [];
            slot.secondary = selectedDyes.length > 0 ? selectedDyes[0] : null;
            this.emit('slot-changed', {
              slotId: slot.id,
              primary: slot.primary,
              secondary: slot.secondary,
            });
          });
        }
      }
    }
  }

  /**
   * Get selected dyes for all slots
   */
  getSelectedSlots(): OutfitSlot[] {
    return this.slots.map((slot) => ({
      ...slot,
      primary: slot.primary ? { ...slot.primary } : null,
      secondary: slot.secondary ? { ...slot.secondary } : null,
    }));
  }

  /**
   * Get all primary colors
   */
  getPrimaryColors(): Record<string, string> {
    const colors: Record<string, string> = {};
    for (const slot of this.slots) {
      if (slot.primary) {
        colors[slot.id] = slot.primary.hex;
      }
    }
    return colors;
  }

  /**
   * Get all secondary colors
   */
  getSecondaryColors(): Record<string, string> {
    const colors: Record<string, string> = {};
    for (const slot of this.slots) {
      if (slot.secondary) {
        colors[slot.id] = slot.secondary.hex;
      }
    }
    return colors;
  }

  /**
   * Bind event listeners
   */
  protected getState(): Record<string, unknown> {
    return {
      slotCount: this.slots.length,
      selectedSlotCount: this.slots.filter((s) => s.primary).length,
      dualDyesEnabled: this.enableDualDyes,
    };
  }

  /**
   * Cleanup child components
   */
  destroy(): void {
    for (const selector of this.dyeSelectors.values()) {
      selector.destroy();
    }
    this.dyeSelectors.clear();
    super.destroy();
  }
}

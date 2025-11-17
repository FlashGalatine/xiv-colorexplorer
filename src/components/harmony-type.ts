/**
 * XIV Dye Tools v2.0.0 - Harmony Type Display Component
 *
 * Phase 12: Architecture Refactor
 * Displays matching dyes for a single color harmony type
 *
 * @module components/harmony-type
 */

import { BaseComponent } from './base-component';
import { ColorWheelDisplay } from './color-wheel-display';
import type { Dye } from '@shared/types';

/**
 * Harmony type information
 */
export interface HarmonyTypeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Harmony type display component
 * Shows matching dyes for a specific color harmony type
 */
export class HarmonyType extends BaseComponent {
  private harmonyInfo: HarmonyTypeInfo;
  private baseColor: string;
  private matchedDyes: Array<{ dye: Dye; deviance: number }> = [];
  private showPrices: boolean = false;

  constructor(
    container: HTMLElement,
    harmonyInfo: HarmonyTypeInfo,
    baseColor: string,
    matchedDyes: Array<{ dye: Dye; deviance: number }> = [],
    showPrices: boolean = false
  ) {
    super(container);
    this.harmonyInfo = harmonyInfo;
    this.baseColor = baseColor;
    this.matchedDyes = matchedDyes;
    this.showPrices = showPrices;
  }

  /**
   * Render the harmony type display
   */
  render(): void {
    const card = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-shadow',
    });

    // Header
    const header = this.renderHeader();
    card.appendChild(header);

    // Content
    const content = this.createElement('div', {
      className: 'p-4 space-y-3',
    });

    if (this.matchedDyes.length === 0) {
      const emptyState = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: 'No matching dyes found',
      });
      content.appendChild(emptyState);
    } else {
      // Color wheel visualization
      const wheelContainer = this.createElement('div', {
        className: 'flex justify-center py-3 border-b border-gray-200 dark:border-gray-700',
      });

      const matchedDyesOnly = this.matchedDyes.map(({ dye }) => dye);
      const colorWheel = new ColorWheelDisplay(
        wheelContainer,
        this.baseColor,
        matchedDyesOnly,
        this.harmonyInfo.id,
        160
      );
      colorWheel.init();

      content.appendChild(wheelContainer);

      // Dye list
      const dyeList = this.createElement('div', {
        className: 'space-y-2 max-h-64 overflow-y-auto',
      });

      for (const { dye, deviance } of this.matchedDyes) {
        const dyeItem = this.renderDyeItem(dye, deviance);
        dyeList.appendChild(dyeItem);
      }

      content.appendChild(dyeList);
    }

    card.appendChild(content);

    this.container.innerHTML = '';
    this.element = card;
    this.container.appendChild(this.element);
  }

  /**
   * Render the header section
   */
  private renderHeader(): HTMLElement {
    const header = this.createElement('div', {
      className: 'harmony-header bg-blue-700 dark:bg-blue-900 p-4 rounded-t-lg',
    });

    const titleDiv = this.createElement('div', {
      className: 'flex items-center gap-2 mb-2',
    });

    const icon = this.createElement('span', {
      textContent: this.harmonyInfo.icon,
      className: 'text-2xl',
    });

    const name = this.createElement('h3', {
      textContent: this.harmonyInfo.name,
      className: 'text-lg font-bold harmony-title',
    });

    titleDiv.appendChild(icon);
    titleDiv.appendChild(name);
    header.appendChild(titleDiv);

    const description = this.createElement('p', {
      textContent: this.harmonyInfo.description,
      className: 'text-sm harmony-description font-medium',
    });

    header.appendChild(description);

    // Deviance info
    if (this.matchedDyes.length > 0) {
      const avgDeviance =
        this.matchedDyes.reduce((sum, { deviance }) => sum + deviance, 0) / this.matchedDyes.length;
      const devianceDiv = this.createElement('div', {
        className: 'text-xs mt-2 harmony-deviance-info',
        textContent: `Avg Deviance: ${avgDeviance.toFixed(1)}/10`,
      });
      header.appendChild(devianceDiv);
    }

    return header;
  }

  /**
   * Render a single dye item
   */
  private renderDyeItem(dye: Dye, deviance: number): HTMLElement {
    const item = this.createElement('div', {
      className:
        'flex items-center gap-3 p-2 rounded border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
    });

    // Color swatch
    const swatch = this.createElement('div', {
      className: 'w-10 h-10 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
      attributes: {
        style: `background-color: ${dye.hex}`,
        title: dye.hex,
      },
    });
    item.appendChild(swatch);

    // Dye info
    const info = this.createElement('div', {
      className: 'flex-1 min-w-0',
    });

    const nameDiv = this.createElement('div', {
      textContent: dye.name,
      className: 'font-semibold text-sm text-gray-900 dark:text-white truncate',
    });

    const categoryDiv = this.createElement('div', {
      textContent: dye.category,
      className: 'text-xs text-gray-600 dark:text-gray-400 truncate',
    });

    info.appendChild(nameDiv);
    info.appendChild(categoryDiv);
    item.appendChild(info);

    // Deviance score
    const devianceDiv = this.createElement('div', {
      className: 'text-right flex-shrink-0',
    });

    const devianceValue = this.createElement('div', {
      textContent: deviance.toFixed(1),
      className: `text-sm font-bold ${this.getDevianceColor(deviance)}`,
      attributes: {
        title: 'Deviance: 0-10 (lower is better)',
      },
    });

    const devianceLabel = this.createElement('div', {
      textContent: 'deviance',
      className: 'text-xs text-gray-500 dark:text-gray-400',
    });

    devianceDiv.appendChild(devianceValue);
    devianceDiv.appendChild(devianceLabel);
    item.appendChild(devianceDiv);

    // Optional price
    if (this.showPrices && dye.cost) {
      const priceDiv = this.createElement('div', {
        textContent: `${dye.cost} Gil`,
        className: 'text-xs text-yellow-600 dark:text-yellow-400 font-mono flex-shrink-0 ml-2',
      });
      item.appendChild(priceDiv);
    }

    return item;
  }

  /**
   * Get color class for deviance score
   */
  private getDevianceColor(deviance: number): string {
    if (deviance <= 2) {
      return 'text-green-600 dark:text-green-400';
    }
    if (deviance <= 5) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (deviance <= 8) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-red-600 dark:text-red-400';
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    // Dye items could emit events or trigger detail views
    const dyeItems = this.querySelectorAll<HTMLDivElement>('[style*="background-color"]');
    for (const item of dyeItems) {
      this.on(item, 'click', () => {
        const dyeName = item.parentElement?.querySelector('div')?.textContent || '';
        this.emit('dye-selected', { dyeName });
      });
    }
  }

  /**
   * Update matched dyes
   */
  updateDyes(matchedDyes: Array<{ dye: Dye; deviance: number }>): void {
    this.matchedDyes = matchedDyes;
    this.update();
  }

  /**
   * Update base color
   */
  updateBaseColor(baseColor: string): void {
    this.baseColor = baseColor;
    this.update();
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      harmonyType: this.harmonyInfo.id,
      baseColor: this.baseColor,
      dyeCount: this.matchedDyes.length,
    };
  }
}

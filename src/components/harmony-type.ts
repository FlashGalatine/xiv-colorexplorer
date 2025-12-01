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
import { addInfoIconTo, TOOLTIP_CONTENT } from './info-tooltip';
import { createDyeActionDropdown, type DyeAction } from './dye-action-dropdown';
import { APIService, LanguageService } from '@services/index';
import type { Dye, PriceData } from '@shared/types';
import { clearContainer } from '@shared/utils';

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
  private priceData: Map<number, PriceData> = new Map();

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
        textContent: LanguageService.t('harmony.noMatchingDyes'),
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

      // Dye list - increased height to accommodate 4 dyes comfortably without scrolling
      const dyeList = this.createElement('div', {
        className: 'space-y-2 max-h-none overflow-y-visible',
      });

      for (const { dye, deviance } of this.matchedDyes) {
        const dyeItem = this.renderDyeItem(dye, deviance);
        dyeList.appendChild(dyeItem);
      }

      content.appendChild(dyeList);
    }

    card.appendChild(content);

    clearContainer(this.container);
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

    const icon = this.createElement('img', {
      attributes: {
        src: `/assets/icons/harmony/${this.harmonyInfo.icon}.svg`,
        alt: `${this.harmonyInfo.name} icon`,
        width: '28',
        height: '28',
      },
      className: 'harmony-icon',
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
      attributes: {
        style: 'color: var(--theme-text-header);',
      },
    });

    header.appendChild(description);

    // Deviance info
    if (this.matchedDyes.length > 0) {
      const avgDeviance =
        this.matchedDyes.reduce((sum, { deviance }) => sum + deviance, 0) / this.matchedDyes.length;
      const devianceDiv = this.createElement('div', {
        className: 'text-xs mt-2 harmony-deviance-info',
        textContent: `${LanguageService.t('harmony.avgHueDiff')}: ${avgDeviance.toFixed(1)}°`,
        attributes: {
          style: 'color: var(--theme-text-header);',
        },
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
      className: 'dye-swatch w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
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
      textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
      className: 'font-semibold text-sm text-gray-900 dark:text-white truncate',
    });

    const categoryDiv = this.createElement('div', {
      textContent: LanguageService.getCategory(dye.category),
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
      textContent: `${deviance.toFixed(1)}°`,
      className: `text-sm font-bold ${this.getDevianceColor(deviance)}`,
      attributes: {
        title: 'Hue Difference (lower is better)',
      },
    });

    const devianceLabel = this.createElement('div', {
      textContent: LanguageService.t('harmony.hueDiff'),
      className: 'text-xs text-gray-500 dark:text-gray-400 inline-flex items-center',
    });
    addInfoIconTo(devianceLabel, TOOLTIP_CONTENT.deviance);

    devianceDiv.appendChild(devianceValue);
    devianceDiv.appendChild(devianceLabel);
    item.appendChild(devianceDiv);

    // Optional market price
    if (this.showPrices) {
      const priceDiv = this.createElement('div', {
        className: 'text-right flex-shrink-0 ml-2 min-w-[80px]',
      });

      const price = this.priceData.get(dye.itemID);
      if (price) {
        const priceValue = this.createElement('div', {
          className: 'text-xs font-mono font-bold',
          attributes: {
            style: 'color: var(--theme-primary);',
          },
        });
        priceValue.textContent = APIService.formatPrice(price.currentAverage);
        const priceLabel = this.createElement('div', {
          textContent: LanguageService.t('matcher.market'),
          className: 'text-xs',
          attributes: {
            style: 'color: var(--theme-text-muted);',
          },
        });
        priceDiv.appendChild(priceValue);
        priceDiv.appendChild(priceLabel);
      } else {
        const noPriceLabel = this.createElement('div', {
          textContent: 'N/A',
          className: 'text-xs text-gray-400 dark:text-gray-600',
        });
        priceDiv.appendChild(noPriceLabel);
      }

      item.appendChild(priceDiv);
    }

    // Action dropdown for quick access
    const actionDropdown = createDyeActionDropdown(dye, (action: DyeAction, selectedDye: Dye) => {
      this.handleDyeAction(action, selectedDye);
    });
    item.appendChild(actionDropdown);

    return item;
  }

  /**
   * Handle dye action from dropdown
   */
  private handleDyeAction(action: DyeAction, dye: Dye): void {
    // Dispatch custom event for parent components to handle
    const event = new CustomEvent('dyeAction', {
      bubbles: true,
      detail: { action, dye },
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Get color class for deviance score
   */
  private getDevianceColor(deviance: number): string {
    if (deviance <= 5) {
      return 'text-green-600 dark:text-green-400';
    }
    if (deviance <= 15) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (deviance <= 30) {
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
   * Set price data for matched dyes
   */
  setPriceData(priceData: Map<number, PriceData>): void {
    this.priceData = priceData;
    this.update();
  }

  /**
   * Update show prices setting
   */
  updateShowPrices(showPrices: boolean): void {
    this.showPrices = showPrices;
    this.update();
  }

  /**
   * Get matched dyes
   */
  getDyes(): Dye[] {
    return this.matchedDyes.map(({ dye }) => dye);
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

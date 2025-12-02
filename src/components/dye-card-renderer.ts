import { Dye, DyeWithDistance, PriceData } from '@shared/types';
import { LanguageService, ColorService, APIService } from '@services/index';
import { CARD_CLASSES_COMPACT } from '@shared/constants';

export interface DyeCardOptions {
  dye: Dye | DyeWithDistance;
  sampledColor?: string;
  price?: PriceData;
  showPrice?: boolean;
  extraInfo?: HTMLElement | string;
  actions?: HTMLElement[];
  onHover?: (dye: Dye, enter: boolean) => void;
  onClick?: (dye: Dye) => void;
}

/**
 * Utility class for rendering dye cards
 * Does not extend BaseComponent as it's a stateless renderer
 */
export class DyeCardRenderer {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Create an HTML element with options
   */
  private createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: {
      className?: string;
      textContent?: string;
      attributes?: Record<string, string>;
    }
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    if (options?.className) element.className = options.className;
    if (options?.textContent) element.textContent = options.textContent;
    if (options?.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        element.setAttribute(key, value);
      }
    }
    return element;
  }

  /**
   * Destroy the renderer (cleanup)
   */
  destroy(): void {
    // No cleanup needed for stateless renderer
  }

  render(options: DyeCardOptions): HTMLElement {
    const { dye, sampledColor, price, showPrice, extraInfo, actions, onHover, onClick } = options;

    const card = this.createElement('div', {
      className: `${CARD_CLASSES_COMPACT} flex items-center gap-3 cursor-pointer`,
      attributes: {
        'data-dye-id': String(dye.id),
      },
    });

    // Swatches
    const swatchContainer = this.createElement('div', {
      className: 'flex gap-2',
    });

    if (sampledColor) {
      const sampledSwatch = this.createElement('div', {
        className: 'w-8 h-8 rounded border border-gray-300 dark:border-gray-600',
        attributes: {
          title: `Sampled: ${sampledColor}`,
          style: `background-color: ${sampledColor}`,
        },
      });
      swatchContainer.appendChild(sampledSwatch);
    }

    const dyeSwatch = this.createElement('div', {
      className: 'dye-swatch w-8 h-8 rounded border-2 border-gray-400 dark:border-gray-500',
      attributes: {
        title: `Dye: ${dye.hex}`,
        style: `background-color: ${dye.hex}`,
      },
    });

    swatchContainer.appendChild(dyeSwatch);
    card.appendChild(swatchContainer);

    // Dye info
    const info = this.createElement('div', {
      className: 'flex-1 min-w-0',
    });

    const name = this.createElement('div', {
      textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
      className: 'font-semibold text-gray-900 dark:text-white truncate',
    });

    info.appendChild(name);

    // Distance (if available or calculated)
    if (sampledColor) {
      const distance =
        'distance' in dye && typeof dye.distance === 'number'
          ? dye.distance
          : ColorService.getColorDistance(sampledColor, dye.hex);

      const distanceText = this.createElement('div', {
        textContent: `${LanguageService.t('matcher.distance')}: ${distance.toFixed(1)}`,
        className: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
      });
      info.appendChild(distanceText);
    }

    // Extra Info
    if (extraInfo) {
      if (typeof extraInfo === 'string') {
        const extraDiv = this.createElement('div', {
          textContent: extraInfo,
          className: 'text-xs text-gray-600 dark:text-gray-400',
        });
        info.appendChild(extraDiv);
      } else {
        info.appendChild(extraInfo);
      }
    }

    card.appendChild(info);

    // Category badge
    const category = this.createElement('div', {
      textContent: LanguageService.getCategory(dye.category),
      className:
        'text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-medium',
    });
    card.appendChild(category);

    // Actions
    if (actions && actions.length > 0) {
      const actionsContainer = this.createElement('div', {
        className: 'flex items-center gap-2 ml-2',
      });
      actions.forEach((action) => actionsContainer.appendChild(action));
      card.appendChild(actionsContainer);
    }

    // Optional market price
    if (showPrice) {
      const priceDiv = this.createElement('div', {
        className: 'text-right flex-shrink-0 ml-2 min-w-[80px]',
      });

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

      card.appendChild(priceDiv);
    }

    // Event listeners
    if (onHover) {
      card.addEventListener('mouseenter', () => onHover(dye, true));
      card.addEventListener('mouseleave', () => onHover(dye, false));
    }

    if (onClick) {
      card.addEventListener('click', () => onClick(dye));
    }

    return card;
  }
}

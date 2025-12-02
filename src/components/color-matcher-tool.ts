/**
 * XIV Dye Tools v2.0.0 - Color Matcher Tool Component
 *
 * Phase 12: Architecture Refactor
 * Match colors from images to FFXIV dyes
 *
 * @module components/color-matcher-tool
 */

import { BaseComponent } from './base-component';
import { ImageUploadDisplay } from './image-upload-display';
import { ColorPickerDisplay } from './color-picker-display';
import { MarketBoard } from './market-board';
import { DyeFilters } from './dye-filters';
import { addInfoIconTo, TOOLTIP_CONTENT } from './info-tooltip';
import { DyePreviewOverlay } from './dye-preview-overlay';
import {
  dyeService,
  LanguageService,
  ColorService,
  ToastService,
} from '@services/index';
import type { PriceData, DyeWithDistance } from '@shared/types';
import { PricingMixin, type PricingState } from '@services/pricing-mixin';
import { ToolHeader } from './tool-header';
import { DyeCardRenderer } from './dye-card-renderer';

import { CARD_CLASSES } from '@shared/constants';
import { logger } from '@shared/logger';
import { clearContainer } from '@shared/utils';
import { ImageZoomController } from './image-zoom-controller';
import { RecentColorsPanel } from './recent-colors-panel';

/**
 * Color Matcher Tool Component
 * Match colors to the closest FFXIV dyes
 */
export class ColorMatcherTool extends BaseComponent implements PricingState {
  private imageUpload: ImageUploadDisplay | null = null;
  private colorPicker: ColorPickerDisplay | null = null;
  marketBoard: MarketBoard | null = null;
  private dyeFilters: DyeFilters | null = null;
  private matchedDyes: DyeWithDistance[] = [];
  priceData: Map<number, PriceData> = new Map();
  showPrices: boolean = false;
  private sampleSize: number = 5;
  private lastSampledColor: string = '';
  private previewOverlay: DyePreviewOverlay | null = null;
  private samplePosition: { x: number; y: number } = { x: 0, y: 0 };

  // Sub-components
  private imageZoomController: ImageZoomController | null = null;
  private recentColorsPanel: RecentColorsPanel | null = null;

  private languageUnsubscribe: (() => void) | null = null;

  // PricingMixin implementation
  showPrices: boolean = false;
  priceData: Map<number, PriceData> = new Map();
  onPricesLoaded?: () => void;
  initMarketBoard!: (container: HTMLElement) => Promise<void>;
  setupMarketBoardListeners!: (container: HTMLElement) => void;
  fetchPrices!: () => Promise<void>;
  cleanupMarketBoard!: () => void;

  constructor(container: HTMLElement) {
    super(container);
    Object.assign(this, PricingMixin);
  }

  /**
   * Render the tool component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-8',
    });

    // Title
    new ToolHeader(wrapper, {
      title: LanguageService.t('tools.matcher.title'),
      description: LanguageService.t('tools.matcher.subtitle'),
    }).render();

    // Input section
    const inputSection = this.createElement('div', {
      className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    });

    // Image upload
    const uploadContainer = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const uploadTitle = this.createElement('h3', {
      textContent: LanguageService.t('matcher.imageUpload'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    uploadContainer.appendChild(uploadTitle);

    const imageUploadContainer = this.createElement('div', {
      id: 'image-upload-container',
    });
    uploadContainer.appendChild(imageUploadContainer);

    inputSection.appendChild(uploadContainer);

    // Color picker
    const pickerContainer = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const pickerTitle = this.createElement('h3', {
      textContent: LanguageService.t('matcher.manualColorInput'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    pickerContainer.appendChild(pickerTitle);

    const colorPickerContainer = this.createElement('div', {
      id: 'color-picker-container',
    });
    pickerContainer.appendChild(colorPickerContainer);

    inputSection.appendChild(pickerContainer);

    wrapper.appendChild(inputSection);

    // Settings section
    const settingsSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    const settingsTitle = this.createElement('h3', {
      textContent: LanguageService.t('matcher.sampleSettings'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    settingsSection.appendChild(settingsTitle);

    // Sample size slider
    const sampleDiv = this.createElement('div', {
      className: 'space-y-2',
    });

    const sampleLabel = this.createElement('label', {
      textContent: LanguageService.t('matcher.sampleSize'),
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    });
    addInfoIconTo(sampleLabel, TOOLTIP_CONTENT.sampleSize);

    const sampleContainer = this.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const sampleInput = this.createElement('input', {
      className:
        'flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none',
      attributes: {
        type: 'range',
        min: '1',
        max: '64',
        value: String(this.sampleSize),
        id: 'sample-size-input',
        style: 'accent-color: var(--theme-primary);',
      },
    });

    const sampleValue = this.createElement('div', {
      textContent: String(this.sampleSize),
      className: 'text-lg font-bold text-gray-900 dark:text-white w-12 text-center',
      attributes: {
        id: 'sample-size-value',
      },
    });

    sampleContainer.appendChild(sampleInput);
    sampleContainer.appendChild(sampleValue);

    const sampleHint = this.createElement('p', {
      textContent: LanguageService.t('matcher.sampleSizeDesc'),
      className: 'text-xs text-gray-600 dark:text-gray-400',
    });

    sampleDiv.appendChild(sampleLabel);
    sampleDiv.appendChild(sampleContainer);
    sampleDiv.appendChild(sampleHint);
    settingsSection.appendChild(sampleDiv);

    wrapper.appendChild(settingsSection);

    // Recent Colors History section (T5)
    const recentColorsWrapper = this.createElement('div', {
      id: 'recent-colors-wrapper',
    });
    wrapper.appendChild(recentColorsWrapper);

    // Dye Filters section
    const filtersSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const filtersContainer = this.createElement('div', {
      attributes: {
        id: 'colormatcher-filters-container',
      },
    });
    filtersSection.appendChild(filtersContainer);
    wrapper.appendChild(filtersSection);

    // Market Board section
    const marketBoardSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const marketBoardContainer = this.createElement('div', {
      id: 'market-board-container',
    });
    marketBoardSection.appendChild(marketBoardContainer);

    wrapper.appendChild(marketBoardSection);

    // Results section
    const resultsContainer = this.createElement('div', {
      id: 'results-container',
    });
    wrapper.appendChild(resultsContainer);

    clearContainer(this.container);
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  async bindEvents(): Promise<void> {
    const imageUploadContainer = this.querySelector<HTMLElement>('#image-upload-container');
    const colorPickerContainer = this.querySelector<HTMLElement>('#color-picker-container');
    const sampleInput = this.querySelector<HTMLInputElement>('#sample-size-input');
    const marketBoardContainer = this.querySelector<HTMLElement>('#market-board-container');

    // Initialize image upload
    if (imageUploadContainer && !this.imageUpload) {
      this.imageUpload = new ImageUploadDisplay(imageUploadContainer);
      this.imageUpload.init();

      imageUploadContainer.addEventListener('image-loaded', (event: Event) => {
        const customEvent = event as CustomEvent;
        const { image } = customEvent.detail;

        // Show success toast
        ToastService.success('✓ Image loaded successfully');

        // Show overlay for image interaction
        if (this.imageZoomController) {
          this.imageZoomController.setImage(image);
        }
      });

      imageUploadContainer.addEventListener('error', (event: Event) => {
        const customEvent = event as CustomEvent;
        const message = customEvent.detail?.message || 'Failed to load image';
        logger.error('Image upload error:', customEvent.detail);
        ToastService.error(message);
      });
    }

    // Initialize RecentColorsPanel
    const recentColorsWrapper = this.querySelector<HTMLElement>('#recent-colors-wrapper');
    if (recentColorsWrapper && !this.recentColorsPanel) {
      this.recentColorsPanel = new RecentColorsPanel(recentColorsWrapper, {
        onColorSelected: (hex) => this.matchColor(hex),
      });
      this.recentColorsPanel.init();
    }

    // Initialize ImageZoomController
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (resultsContainer && !this.imageZoomController) {
      this.imageZoomController = new ImageZoomController(resultsContainer, {
        onColorSampled: (hex, x, y) => {
          this.samplePosition = { x, y };
          // Manually trigger matching
          this.matchColor(hex);
        },
      });
      this.imageZoomController.init();
    }

    // Initialize image upload
    if (imageUploadContainer && !this.imageUpload) {
      this.imageUpload = new ImageUploadDisplay(imageUploadContainer);
      this.imageUpload.init();

      imageUploadContainer.addEventListener('image-loaded', (event: Event) => {
        const customEvent = event as CustomEvent;
        const { image } = customEvent.detail;

        // Show success toast
        ToastService.success('✓ Image loaded successfully');

        // Show overlay for image interaction via ImageZoomController
        if (this.imageZoomController) {
          this.imageZoomController.setImage(image);

          // Update preview overlay references
          if (this.previewOverlay) {
            const canvasContainer = this.imageZoomController.getCanvasContainer();
            const canvas = this.imageZoomController.getCanvas();
            if (canvasContainer && canvas) {
              this.previewOverlay.setCanvasContainer(canvasContainer, canvas);

              // Hide preview overlay when scrolling
              this.on(canvasContainer, 'scroll', () => {
                this.previewOverlay?.hidePreview();
              });
            }
          }
        }
      });

      imageUploadContainer.addEventListener('error', (event: Event) => {
        console.log('DEBUG: error event received');
        const customEvent = event as CustomEvent;
        const message = customEvent.detail?.message || 'Failed to load image';
        logger.error('Image upload error:', customEvent.detail);
        ToastService.error(message);
      });
    }

    // Initialize color picker
    if (colorPickerContainer && !this.colorPicker) {
      this.colorPicker = new ColorPickerDisplay(colorPickerContainer);
      this.colorPicker.init();

      colorPickerContainer.addEventListener('color-selected', (event: Event) => {
        const customEvent = event as CustomEvent;
        const { color } = customEvent.detail;
        this.matchColor(color);
      });
    }

    // Sample size slider
    if (sampleInput) {
      this.on(sampleInput, 'input', () => {
        this.sampleSize = parseInt(sampleInput.value, 10);
        const valueDisplay = this.querySelector<HTMLElement>('#sample-size-value');
        if (valueDisplay) {
          valueDisplay.textContent = String(this.sampleSize);
        }
      });
    }

    // Initialize DyeFilters component
    const filtersContainer = this.querySelector<HTMLElement>('#colormatcher-filters-container');
    if (filtersContainer && !this.dyeFilters) {
      this.dyeFilters = new DyeFilters(filtersContainer, {
        storageKeyPrefix: 'colormatcher',
        onFilterChange: () => {
          // Re-match color if we have a current match - use original sampled color
          if (this.matchedDyes.length > 0 && this.lastSampledColor) {
            this.matchColor(this.lastSampledColor);
          }
        },
      });
      this.dyeFilters.render();
      this.dyeFilters.bindEvents();
      this.dyeFilters.onMount();
    }

    // Initialize Market Board
    if (marketBoardContainer) {
      this.onPricesLoaded = this.refreshResults.bind(this);
      await this.initMarketBoard(marketBoardContainer);
    }
  }

  /**
   * Update localized text when language changes (without re-rendering)
   */
  private updateLocalizedText(): void {
    // Update title
    const title = this.querySelector<HTMLElement>('h2');
    if (title) {
      title.textContent = LanguageService.t('tools.matcher.title');
    }

    // Update subtitle
    const subtitle = this.querySelector<HTMLElement>('h2 + p');
    if (subtitle) {
      subtitle.textContent = LanguageService.t('tools.matcher.subtitle');
    }
  }



  /**
   * Fetch prices for matched dyes
   */
  async fetchPricesForMatchedDyes(): Promise<void> {
    if (!this.marketBoard || !this.showPrices || this.matchedDyes.length === 0) {
      return;
    }

    // Fetch prices using Market Board
    const prices = await this.marketBoard.fetchPricesForDyes(this.matchedDyes);

    this.priceData.clear();
    for (const [id, price] of prices.entries()) {
      this.priceData.set(id, price);
    }

    this.onPricesLoaded?.();
  }

  /**
   * Update prices (PricingMixin requirement)
   */
  async updatePrices(): Promise<void> {
    await this.fetchPricesForMatchedDyes();
  }



  /**
   * Refresh the results display (re-render with current price data)
   */
  private refreshResults(): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer || this.matchedDyes.length === 0) return;

    // Find the results section
    const resultsSection = resultsContainer.querySelector('[data-results-section]');
    if (!resultsSection) return;

    // Remove and re-create results section with updated price data
    resultsSection.remove();

    // Re-run matchColor with the first matched dye's original sampled color
    // Since we don't store the sampled color, we'll just re-render the cards
    // Safety check: ensure matchedDyes still has elements (BUG-019)
    if (this.matchedDyes.length === 0) return;

    const closestDye = this.matchedDyes[0];
    const otherDyes = this.matchedDyes.slice(1);

    // Results section
    const section = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
    });
    section.setAttribute('data-results-section', 'true');

    const title = this.createElement('h3', {
      textContent: LanguageService.t('matcher.matchedDyes'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    section.appendChild(title);

    // Best match
    const bestMatchSection = this.createElement('div', {
      className:
        'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-2',
    });

    const bestMatchLabel = this.createElement('div', {
      textContent: `🎯 ${LanguageService.t('matcher.bestMatch')}`,
      className: 'text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide',
    });
    bestMatchSection.appendChild(bestMatchLabel);

    // Use stored sampled color for distance calculation
    const bestMatchCard = this.renderDyeCard(closestDye, this.lastSampledColor || closestDye.hex);
    bestMatchSection.appendChild(bestMatchCard);

    section.appendChild(bestMatchSection);

    // Other matches
    if (otherDyes.length > 0) {
      const otherMatchesSection = this.createElement('div', {
        className: 'space-y-2',
      });

      const otherLabel = this.createElement('div', {
        textContent: `${LanguageService.t('matcher.similarDyes')} (${otherDyes.length})`,
        className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
      });
      otherMatchesSection.appendChild(otherLabel);

      const matchesList = this.createElement('div', {
        className: 'space-y-2 max-h-80 overflow-y-auto',
      });

      for (const dye of otherDyes) {
        // Use stored sampled color for distance calculation
        const dyeCard = this.renderDyeCard(dye, this.lastSampledColor || dye.hex);
        matchesList.appendChild(dyeCard);
      }

      otherMatchesSection.appendChild(matchesList);
      section.appendChild(otherMatchesSection);
    }

    resultsContainer.appendChild(section);
  }

  /**
   * Initialize the tool
   */
  onMount(): void {
    // Subscribe to language changes to update localized text
    this.languageUnsubscribe = LanguageService.subscribe(() => {
      this.updateLocalizedText();
    });

    // Load recent colors from localStorage (T5)
    // Load recent colors from localStorage (T5)
    // Handled by RecentColorsPanel

  }

  /**
   * Match a color to dyes
   */
  private matchColor(hex: string): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    // Store the sampled color for refreshResults()
    this.lastSampledColor = hex;

    // Add to recent colors history (T5)
    // Add to recent colors history (T5)
    if (this.recentColorsPanel) {
      this.recentColorsPanel.addRecentColor(hex);
    }

    // Clear any existing match results, but preserve the image
    const existingResults = resultsContainer.querySelector('[data-results-section]');
    if (existingResults) {
      existingResults.remove();
    }

    // Find closest dyes
    let closestDye = dyeService.findClosestDye(hex);
    let withinDistance = dyeService.findDyesWithinDistance(hex, 100, 10);

    // Apply filters if available
    if (this.dyeFilters) {
      // Filter closest dye
      if (closestDye && this.dyeFilters.isDyeExcluded(closestDye)) {
        // Find next closest non-excluded dye
        const allDyes = dyeService.getAllDyes();
        const filteredDyes = this.dyeFilters.filterDyes(allDyes);
        closestDye =
          filteredDyes.length > 0
            ? filteredDyes.reduce((best, dye) => {
              const bestDist = ColorService.getColorDistance(hex, best.hex);
              const dyeDist = ColorService.getColorDistance(hex, dye.hex);
              return dyeDist < bestDist ? dye : best;
            })
            : null;
      }

      // Filter within distance results
      withinDistance = this.dyeFilters.filterDyes(withinDistance);
    }

    if (!closestDye) {
      const empty = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: LanguageService.t('matcher.noMatchingDyes'),
      });
      resultsContainer.appendChild(empty);
      return;
    }

    // Cache distances to avoid recalculation during rendering
    const closestDyeWithDistance: DyeWithDistance = {
      ...closestDye,
      distance: ColorService.getColorDistance(hex, closestDye.hex),
    };

    const withinDistanceWithCache: DyeWithDistance[] = withinDistance.map((dye) => ({
      ...dye,
      distance: ColorService.getColorDistance(hex, dye.hex),
    }));

    // Store matched dyes with cached distances
    this.matchedDyes = [closestDyeWithDistance, ...withinDistanceWithCache];

    // Results section
    const section = this.createElement('div', {
      className: `${CARD_CLASSES} space-y-6`,
    });
    section.setAttribute('data-results-section', 'true');

    const title = this.createElement('h3', {
      textContent: LanguageService.t('matcher.matchedDyes'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    section.appendChild(title);

    // Best match
    const bestMatchSection = this.createElement('div', {
      className:
        'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-2',
    });

    const bestMatchLabel = this.createElement('div', {
      textContent: `🎯 ${LanguageService.t('matcher.bestMatch')}`,
      className: 'text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide',
    });
    bestMatchSection.appendChild(bestMatchLabel);

    const bestMatchCard = this.renderDyeCard(closestDyeWithDistance, hex);
    bestMatchSection.appendChild(bestMatchCard);

    section.appendChild(bestMatchSection);

    // Other matches
    if (withinDistanceWithCache.length > 0) {
      const otherMatchesSection = this.createElement('div', {
        className: 'space-y-2',
      });

      const otherLabel = this.createElement('div', {
        textContent: LanguageService.tInterpolate('matcher.similarDyesCount', {
          count: String(withinDistanceWithCache.length),
        }),
        className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
      });
      otherMatchesSection.appendChild(otherLabel);

      const matchesList = this.createElement('div', {
        className: 'space-y-2 max-h-80 overflow-y-auto',
      });

      for (const dye of withinDistanceWithCache) {
        const dyeCard = this.renderDyeCard(dye, hex);
        matchesList.appendChild(dyeCard);
      }

      otherMatchesSection.appendChild(matchesList);
      section.appendChild(otherMatchesSection);
    }

    resultsContainer.appendChild(section);

    // Fetch prices if enabled
    if (this.showPrices && this.marketBoard) {
      void this.updatePrices();
    }
  }

  /**
   * Render dye card
   */
  private renderDyeCard(dye: DyeWithDistance, sampledColor: string): HTMLElement {
    // Copy Hex button
    const copyButton = this.createElement('button', {
      textContent: LanguageService.t('matcher.copyHex'),
      className: 'px-2 py-1 text-xs font-medium rounded transition-colors border cursor-pointer',
      attributes: {
        style:
          'background-color: var(--theme-background-secondary); color: var(--theme-text); border-color: var(--theme-border);',
        title: `Copy ${dye.hex} to clipboard`,
      },
    });

    // Add hover effect
    copyButton.addEventListener('mouseenter', () => {
      copyButton.style.backgroundColor = 'var(--theme-card-hover)';
    });
    copyButton.addEventListener('mouseleave', () => {
      copyButton.style.backgroundColor = 'var(--theme-background-secondary)';
    });

    // Copy to clipboard on click
    copyButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(dye.hex);
        ToastService.success(`✓ Copied ${dye.hex} to clipboard`);
      } catch {
        // Fallback for older browsers (clipboard API not available)
        const textArea = document.createElement('textarea');
        textArea.value = dye.hex;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          ToastService.success(`✓ Copied ${dye.hex} to clipboard`);
        } catch {
          ToastService.error('Failed to copy hex code');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    });

    const renderer = new DyeCardRenderer(this.container);
    return renderer.render({
      dye,
      sampledColor,
      price: this.priceData.get(dye.itemID),
      showPrice: this.showPrices,
      actions: [copyButton],
      onHover: (d, enter) => {
        if (this.previewOverlay && this.samplePosition.x > 0) {
          if (enter) {
            this.previewOverlay.showPreview({
              sampledColor,
              sampledPosition: this.samplePosition,
              dye: d,
            });
          } else {
            this.previewOverlay.hide();
          }
        }
      },
      onClick: () => {
        // Handle click if needed
      },
    });
  }

  // ============================================================================


  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      matchedDyeCount: this.matchedDyes.length,
      sampleSize: this.sampleSize,
      recentColorsCount: this.recentColorsPanel?.getState().recentColorsCount,
    };
  }

  /**
   * Cleanup child components and references
   */
  destroy(): void {
    // Destroy child components
    // Destroy child components
    if (this.imageUpload) {
      this.imageUpload.destroy();
      this.imageUpload = null;
    }
    if (this.colorPicker) {
      this.colorPicker.destroy();
      this.colorPicker = null;
    }
    if (this.dyeFilters) {
      if (this.dyeFilters) {
        this.dyeFilters.destroy();
        this.dyeFilters = null;
      }
    }
    if (this.imageZoomController) {
      this.imageZoomController.destroy();
      this.imageZoomController = null;
    }
    if (this.recentColorsPanel) {
      this.recentColorsPanel.destroy();
      this.recentColorsPanel = null;
    }

    // Clear arrays and Maps
    this.matchedDyes = [];
    this.priceData.clear();

    super.destroy();
  }
}

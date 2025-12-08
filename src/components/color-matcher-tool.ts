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
import { dyeService, LanguageService, ColorService, ToastService } from '@services/index';
import type { PriceData, DyeWithDistance } from '@shared/types';
import { PricingMixin, type PricingState } from '@services/pricing-mixin';
import { ToolHeader } from './tool-header';
import { DyeCardRenderer } from './dye-card-renderer';
import { PaletteService, type PaletteMatch } from 'xivdyetools-core';

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

  // Palette extraction mode
  private paletteMode: boolean = false;
  private paletteColorCount: number = 4;
  private paletteService: PaletteService;
  private lastPaletteResults: PaletteMatch[] = [];
  private currentImage: HTMLImageElement | null = null;

  // Cached DOM references for performance
  private sampleSizeDisplay: HTMLElement | null = null;

  // Sub-components
  private imageZoomController: ImageZoomController | null = null;
  private recentColorsPanel: RecentColorsPanel | null = null;

  private languageUnsubscribe: (() => void) | null = null;

  // PricingMixin implementation
  onPricesLoaded?: () => void;
  initMarketBoard!: (container: HTMLElement) => Promise<void>;
  setupMarketBoardListeners!: (container: HTMLElement) => void;
  fetchPrices!: () => Promise<void>;
  cleanupMarketBoard!: () => void;

  constructor(container: HTMLElement) {
    super(container);
    Object.assign(this, PricingMixin);
    this.paletteService = new PaletteService();
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

    // Extraction Mode Toggle
    const modeDiv = this.createElement('div', {
      className: 'space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700',
    });

    const modeLabel = this.createElement('label', {
      textContent: LanguageService.t('matcher.extractionMode'),
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    });
    modeDiv.appendChild(modeLabel);

    // Mode toggle buttons
    const modeToggle = this.createElement('div', {
      className: 'flex gap-2',
      attributes: { id: 'extraction-mode-toggle' },
    });

    const singleModeBtn = this.createElement('button', {
      className:
        'flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors',
      textContent: LanguageService.t('matcher.singleColor'),
      attributes: {
        id: 'single-mode-btn',
        type: 'button',
        title: LanguageService.t('matcher.singleColorDesc'),
      },
    });

    const paletteModeBtn = this.createElement('button', {
      className:
        'flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors',
      textContent: LanguageService.t('matcher.paletteMode'),
      attributes: {
        id: 'palette-mode-btn',
        type: 'button',
        title: LanguageService.t('matcher.paletteModeDesc'),
      },
    });

    modeToggle.appendChild(singleModeBtn);
    modeToggle.appendChild(paletteModeBtn);
    modeDiv.appendChild(modeToggle);

    // Palette options (hidden by default)
    const paletteOptions = this.createElement('div', {
      className: 'space-y-3 hidden',
      attributes: { id: 'palette-options' },
    });

    // Color count slider
    const colorCountDiv = this.createElement('div', {
      className: 'space-y-2',
    });

    const colorCountLabel = this.createElement('label', {
      textContent: LanguageService.t('matcher.colorCount'),
      className: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
    });

    const colorCountContainer = this.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const colorCountInput = this.createElement('input', {
      className:
        'flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700',
      attributes: {
        type: 'range',
        min: '3',
        max: '5',
        value: String(this.paletteColorCount),
        id: 'palette-color-count',
        style: 'accent-color: var(--theme-primary);',
      },
    });

    const colorCountValue = this.createElement('div', {
      textContent: String(this.paletteColorCount),
      className: 'text-lg font-bold text-gray-900 dark:text-white w-8 text-center',
      attributes: { id: 'color-count-value' },
    });

    colorCountContainer.appendChild(colorCountInput);
    colorCountContainer.appendChild(colorCountValue);

    const colorCountHint = this.createElement('p', {
      textContent: LanguageService.t('matcher.colorCountDesc'),
      className: 'text-xs text-gray-600 dark:text-gray-400',
    });

    colorCountDiv.appendChild(colorCountLabel);
    colorCountDiv.appendChild(colorCountContainer);
    colorCountDiv.appendChild(colorCountHint);
    paletteOptions.appendChild(colorCountDiv);

    // Extract button
    const extractBtn = this.createElement('button', {
      className:
        'w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors',
      textContent: LanguageService.t('matcher.extractPalette'),
      attributes: {
        id: 'extract-palette-btn',
        type: 'button',
        style:
          'background-color: var(--theme-primary); color: white;',
      },
    });

    paletteOptions.appendChild(extractBtn);
    modeDiv.appendChild(paletteOptions);
    settingsSection.appendChild(modeDiv);

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

      this.onCustom('image-loaded', (event: CustomEvent) => {
        const { image } = event.detail;

        // Show success toast
        ToastService.success('✓ Image loaded successfully');

        // Show overlay for image interaction
        if (this.imageZoomController) {
          this.imageZoomController.setImage(image);
        }
      });

      this.onCustom('error', (event: CustomEvent) => {
        const message = event.detail?.message || 'Failed to load image';
        logger.error('Image upload error:', event.detail);
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

      this.onCustom('image-loaded', (event: CustomEvent) => {
        const { image } = event.detail;

        // Store reference to image for palette extraction redraw
        this.currentImage = image;

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

      this.onCustom('error', (event: CustomEvent) => {
        const message = event.detail?.message || 'Failed to load image';
        logger.error('Image upload error:', event.detail);
        ToastService.error(message);
      });
    }

    // Initialize color picker
    if (colorPickerContainer && !this.colorPicker) {
      this.colorPicker = new ColorPickerDisplay(colorPickerContainer);
      this.colorPicker.init();

      this.onCustom('color-selected', (event: CustomEvent) => {
        const { color } = event.detail;
        this.matchColor(color);
      });
    }

    // Sample size slider - cache DOM reference for performance
    if (sampleInput) {
      this.sampleSizeDisplay = this.querySelector<HTMLElement>('#sample-size-value');
      this.on(sampleInput, 'input', () => {
        this.sampleSize = parseInt(sampleInput.value, 10);
        if (this.sampleSizeDisplay) {
          this.sampleSizeDisplay.textContent = String(this.sampleSize);
        }
      });
    }

    // Extraction mode toggle
    const singleModeBtn = this.querySelector<HTMLButtonElement>('#single-mode-btn');
    const paletteModeBtn = this.querySelector<HTMLButtonElement>('#palette-mode-btn');
    const paletteOptions = this.querySelector<HTMLElement>('#palette-options');

    // Initialize button styles
    this.updateModeButtonStyles();

    if (singleModeBtn) {
      this.on(singleModeBtn, 'click', () => {
        this.paletteMode = false;
        this.updateModeButtonStyles();
        paletteOptions?.classList.add('hidden');
      });
    }

    if (paletteModeBtn) {
      this.on(paletteModeBtn, 'click', () => {
        this.paletteMode = true;
        this.updateModeButtonStyles();
        paletteOptions?.classList.remove('hidden');
      });
    }

    // Color count slider
    const colorCountInput = this.querySelector<HTMLInputElement>('#palette-color-count');
    const colorCountValue = this.querySelector<HTMLElement>('#color-count-value');

    if (colorCountInput) {
      this.on(colorCountInput, 'input', () => {
        this.paletteColorCount = parseInt(colorCountInput.value, 10);
        if (colorCountValue) {
          colorCountValue.textContent = String(this.paletteColorCount);
        }
      });
    }

    // Extract palette button
    const extractBtn = this.querySelector<HTMLButtonElement>('#extract-palette-btn');
    if (extractBtn) {
      this.on(extractBtn, 'click', () => {
        void this.extractPalette();
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
   * Update mode toggle button styles
   */
  private updateModeButtonStyles(): void {
    const singleModeBtn = this.querySelector<HTMLButtonElement>('#single-mode-btn');
    const paletteModeBtn = this.querySelector<HTMLButtonElement>('#palette-mode-btn');

    const activeClasses =
      'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    const inactiveClasses =
      'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600';

    if (singleModeBtn && paletteModeBtn) {
      if (this.paletteMode) {
        singleModeBtn.className = `flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${inactiveClasses}`;
        paletteModeBtn.className = `flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${activeClasses}`;
      } else {
        singleModeBtn.className = `flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${activeClasses}`;
        paletteModeBtn.className = `flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${inactiveClasses}`;
      }
    }
  }

  /**
   * Extract palette from loaded image
   */
  private async extractPalette(): Promise<void> {
    // Get canvas from ImageZoomController
    const canvas = this.imageZoomController?.getCanvas();

    if (!canvas) {
      ToastService.error(LanguageService.t('matcher.noImageForPalette'));
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      ToastService.error('Could not get canvas context');
      return;
    }

    // Update button to show loading
    const extractBtn = this.querySelector<HTMLButtonElement>('#extract-palette-btn');
    if (extractBtn) {
      extractBtn.textContent = LanguageService.t('matcher.extractingPalette');
      extractBtn.disabled = true;
    }

    try {
      // Get pixel data from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = PaletteService.pixelDataToRGBFiltered(imageData.data);

      if (pixels.length === 0) {
        ToastService.error('No pixels to analyze');
        return;
      }

      // Extract palette and match to dyes
      const matches = this.paletteService.extractAndMatchPalette(pixels, dyeService, {
        colorCount: this.paletteColorCount,
      });

      this.lastPaletteResults = matches;

      // Find representative positions for each extracted color and draw indicators
      const positions = this.findColorPositions(imageData, matches);
      this.drawSampleIndicators(canvas, ctx, matches, positions);

      // Render results
      this.renderPaletteResults(matches);

      // Fetch prices if enabled
      if (this.showPrices && this.marketBoard) {
        // Convert PaletteMatch to DyeWithDistance for price fetching
        this.matchedDyes = matches.map((m: PaletteMatch) => ({
          ...m.matchedDye,
          distance: m.distance,
        }));
        void this.updatePrices();
      }

      ToastService.success(`✓ Extracted ${matches.length} colors from image`);
    } catch (error) {
      logger.error('Palette extraction failed:', error);
      ToastService.error('Failed to extract palette');
    } finally {
      // Restore button
      if (extractBtn) {
        extractBtn.textContent = LanguageService.t('matcher.extractPalette');
        extractBtn.disabled = false;
      }
    }
  }

  /**
   * Find representative pixel positions for each extracted color
   * Scans the image to find pixels closest to each centroid
   */
  private findColorPositions(
    imageData: ImageData,
    matches: PaletteMatch[]
  ): Array<{ x: number; y: number }> {
    const { data, width, height } = imageData;
    const positions: Array<{ x: number; y: number; distance: number }> = matches.map(() => ({
      x: 0,
      y: 0,
      distance: Infinity,
    }));

    // Sample grid (every 4th pixel for performance on large images)
    const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 10000)));

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Check each extracted color
        for (let i = 0; i < matches.length; i++) {
          const extracted = matches[i].extracted;
          const dr = r - extracted.r;
          const dg = g - extracted.g;
          const db = b - extracted.b;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);

          if (dist < positions[i].distance) {
            positions[i] = { x, y, distance: dist };
          }
        }
      }
    }

    return positions.map((p) => ({ x: p.x, y: p.y }));
  }

  /**
   * Draw sample indicator circles on the canvas
   */
  private drawSampleIndicators(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    matches: PaletteMatch[],
    positions: Array<{ x: number; y: number }>
  ): void {
    // First redraw the original image to clear any previous indicators
    if (this.currentImage) {
      ctx.drawImage(this.currentImage, 0, 0);
    }

    // Calculate circle radius based on image size (2-4% of smaller dimension)
    const minDimension = Math.min(canvas.width, canvas.height);
    const radius = Math.max(15, Math.min(50, minDimension * 0.03));

    // Draw each indicator
    for (let i = 0; i < matches.length; i++) {
      const pos = positions[i];
      const match = matches[i];

      // Outer white circle (for visibility on dark backgrounds)
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner colored circle matching the extracted color
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgb(${match.extracted.r}, ${match.extracted.g}, ${match.extracted.b})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Small center dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${match.extracted.r}, ${match.extracted.g}, ${match.extracted.b})`;
      ctx.fill();
    }
  }

  /**
   * Render extracted palette results
   */
  private renderPaletteResults(matches: PaletteMatch[]): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    // Clear existing results
    const existingResults = resultsContainer.querySelector('[data-results-section]');
    if (existingResults) {
      existingResults.remove();
    }

    if (matches.length === 0) {
      return;
    }

    // Results section
    const section = this.createElement('div', {
      className: `${CARD_CLASSES} space-y-4`,
    });
    section.setAttribute('data-results-section', 'true');

    const title = this.createElement('h3', {
      textContent: LanguageService.t('matcher.paletteResults'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    section.appendChild(title);

    // Palette color bar (visual overview)
    const colorBar = this.createElement('div', {
      className: 'flex h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600',
    });

    for (const match of matches) {
      const colorSegment = this.createElement('div', {
        className: 'transition-all hover:flex-grow cursor-pointer',
        attributes: {
          style: `flex: ${match.dominance}; background-color: rgb(${match.extracted.r}, ${match.extracted.g}, ${match.extracted.b});`,
          title: `${match.matchedDye.name} (${match.dominance}%)`,
        },
      });
      colorBar.appendChild(colorSegment);
    }
    section.appendChild(colorBar);

    // Individual color entries
    const colorsGrid = this.createElement('div', {
      className: 'space-y-3',
    });

    for (const match of matches) {
      const entry = this.renderPaletteEntry(match);
      colorsGrid.appendChild(entry);
    }

    section.appendChild(colorsGrid);
    resultsContainer.appendChild(section);
  }

  /**
   * Render a single palette entry
   */
  private renderPaletteEntry(match: PaletteMatch): HTMLElement {
    const entry = this.createElement('div', {
      className:
        'flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
    });

    // Extracted color swatch
    const extractedSwatch = this.createElement('div', {
      className: 'flex flex-col items-center gap-1',
    });

    const extractedColor = this.createElement('div', {
      className: 'w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600',
      attributes: {
        style: `background-color: rgb(${match.extracted.r}, ${match.extracted.g}, ${match.extracted.b});`,
        title: LanguageService.t('matcher.extractedColor'),
      },
    });

    const extractedLabel = this.createElement('span', {
      textContent: LanguageService.t('matcher.extractedColor'),
      className: 'text-xs text-gray-500 dark:text-gray-400',
    });

    extractedSwatch.appendChild(extractedColor);
    extractedSwatch.appendChild(extractedLabel);
    entry.appendChild(extractedSwatch);

    // Arrow
    const arrow = this.createElement('span', {
      textContent: '→',
      className: 'text-xl text-gray-400 dark:text-gray-500',
    });
    entry.appendChild(arrow);

    // Matched dye swatch
    const matchedSwatch = this.createElement('div', {
      className: 'flex flex-col items-center gap-1',
    });

    const matchedColor = this.createElement('div', {
      className: 'w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600',
      attributes: {
        style: `background-color: ${match.matchedDye.hex};`,
        title: match.matchedDye.name,
      },
    });

    const matchedLabel = this.createElement('span', {
      textContent: LanguageService.t('matcher.matchedDye'),
      className: 'text-xs text-gray-500 dark:text-gray-400',
    });

    matchedSwatch.appendChild(matchedColor);
    matchedSwatch.appendChild(matchedLabel);
    entry.appendChild(matchedSwatch);

    // Dye info
    const dyeInfo = this.createElement('div', {
      className: 'flex-1 min-w-0',
    });

    const dyeName = this.createElement('div', {
      textContent: match.matchedDye.name,
      className: 'font-semibold text-gray-900 dark:text-white truncate',
    });

    const dyeDetails = this.createElement('div', {
      className: 'flex gap-3 text-xs text-gray-500 dark:text-gray-400',
    });

    const dominanceSpan = this.createElement('span', {
      textContent: `${LanguageService.t('matcher.dominance')}: ${match.dominance}%`,
    });

    const distanceSpan = this.createElement('span', {
      textContent: `Δ${match.distance.toFixed(1)}`,
    });

    const hexSpan = this.createElement('span', {
      textContent: match.matchedDye.hex.toUpperCase(),
      className: 'font-mono',
    });

    dyeDetails.appendChild(dominanceSpan);
    dyeDetails.appendChild(distanceSpan);
    dyeDetails.appendChild(hexSpan);

    dyeInfo.appendChild(dyeName);
    dyeInfo.appendChild(dyeDetails);
    entry.appendChild(dyeInfo);

    // Copy button
    const copyBtn = this.createElement('button', {
      textContent: LanguageService.t('matcher.copyHex'),
      className:
        'px-3 py-1 text-xs font-medium rounded transition-colors border cursor-pointer',
      attributes: {
        style:
          'background-color: var(--theme-background-secondary); color: var(--theme-text); border-color: var(--theme-border);',
      },
    });

    this.on(copyBtn, 'click', async () => {
      try {
        await navigator.clipboard.writeText(match.matchedDye.hex);
        ToastService.success(`✓ Copied ${match.matchedDye.hex}`);
      } catch {
        ToastService.error('Failed to copy hex code');
      }
    });

    entry.appendChild(copyBtn);

    return entry;
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
            if (typeof (this.previewOverlay as any).hidePreview === 'function') {
              (this.previewOverlay as any).hidePreview();
            } else if (typeof (this.previewOverlay as any).hide === 'function') {
              (this.previewOverlay as any).hide();
            }
          }
        }
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
      paletteMode: this.paletteMode,
      paletteColorCount: this.paletteColorCount,
      lastPaletteResultsCount: this.lastPaletteResults.length,
    };
  }

  /**
   * Cleanup child components and references
   */
  destroy(): void {
    // Unsubscribe from language changes
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
      this.languageUnsubscribe = null;
    }

    // Cleanup market board
    this.cleanupMarketBoard?.();

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
      this.dyeFilters.destroy();
      this.dyeFilters = null;
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
    this.lastPaletteResults = [];
    this.currentImage = null;

    // Clear cached DOM references
    this.sampleSizeDisplay = null;

    super.destroy();
  }
}

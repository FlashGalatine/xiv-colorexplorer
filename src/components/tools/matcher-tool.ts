/**
 * XIV Dye Tools v3.0.0 - Matcher Tool Component
 *
 * Phase 3: Color Matcher migration to v3 two-panel layout.
 * Orchestrates existing v2 components within the new shell structure.
 *
 * Left Panel: Image upload, color picker, sample settings, filters, market board
 * Right Panel: Image canvas with zoom, matched dye results, recent colors
 *
 * @module components/tools/matcher-tool
 */

import { BaseComponent } from '@components/base-component';
import { CollapsiblePanel } from '@components/collapsible-panel';
import { ImageUploadDisplay } from '@components/image-upload-display';
import { ColorPickerDisplay } from '@components/color-picker-display';
import { ImageZoomController } from '@components/image-zoom-controller';
import { RecentColorsPanel } from '@components/recent-colors-panel';
import { DyeFilters, type DyeFilterConfig } from '@components/dye-filters';
import { MarketBoard } from '@components/market-board';
import { DyeCardRenderer } from '@components/dye-card-renderer';
import {
  ColorService,
  dyeService,
  LanguageService,
  StorageService,
  ToastService,
} from '@services/index';
import { logger } from '@shared/logger';
import { clearContainer } from '@shared/utils';
import type { Dye, DyeWithDistance, PriceData } from '@shared/types';
import { PaletteService, type PaletteMatch } from 'xivdyetools-core';

// ============================================================================
// Types and Constants
// ============================================================================

export interface MatcherToolOptions {
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
  drawerContent?: HTMLElement | null;
}

/**
 * Storage keys for v3 matcher tool
 */
const STORAGE_KEYS = {
  sampleSize: 'v3_matcher_sample_size',
  paletteMode: 'v3_matcher_palette_mode',
  paletteColorCount: 'v3_matcher_palette_count',
} as const;

// SVG Icons
const ICON_FILTER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
</svg>`;

const ICON_MARKET = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>`;

const ICON_UPLOAD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>`;

// ============================================================================
// MatcherTool Component
// ============================================================================

/**
 * Matcher Tool - v3 Two-Panel Layout
 *
 * Match colors from images to FFXIV dyes.
 * Integrates existing v2 components into the new panel structure.
 */
export class MatcherTool extends BaseComponent {
  private options: MatcherToolOptions;

  // State
  private selectedColor: string | null = null;
  private sampleSize: number;
  private paletteMode: boolean;
  private paletteColorCount: number = 4;
  private matchedDyes: DyeWithDistance[] = [];
  private showPrices: boolean = false;
  private priceData: Map<number, PriceData> = new Map();
  private filterConfig: DyeFilterConfig | null = null;
  private currentImage: HTMLImageElement | null = null;

  // Child components
  private imageUpload: ImageUploadDisplay | null = null;
  private colorPicker: ColorPickerDisplay | null = null;
  private imageZoom: ImageZoomController | null = null;
  private recentColors: RecentColorsPanel | null = null;
  private dyeFilters: DyeFilters | null = null;
  private marketBoard: MarketBoard | null = null;
  private filtersPanel: CollapsiblePanel | null = null;
  private marketPanel: CollapsiblePanel | null = null;
  private paletteService: PaletteService;

  // DOM References
  private sampleSlider: HTMLInputElement | null = null;
  private sampleDisplay: HTMLElement | null = null;
  private paletteModeCheckbox: HTMLInputElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private canvasContainer: HTMLElement | null = null;
  private emptyStateContainer: HTMLElement | null = null;

  // Subscriptions
  private languageUnsubscribe: (() => void) | null = null;

  constructor(container: HTMLElement, options: MatcherToolOptions) {
    super(container);
    this.options = options;

    // Load persisted state
    this.sampleSize = StorageService.getItem<number>(STORAGE_KEYS.sampleSize) ?? 5;
    this.paletteMode = StorageService.getItem<boolean>(STORAGE_KEYS.paletteMode) ?? false;
    this.paletteColorCount = StorageService.getItem<number>(STORAGE_KEYS.paletteColorCount) ?? 4;

    // Initialize palette service
    this.paletteService = new PaletteService();
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  render(): void {
    this.renderLeftPanel();
    this.renderRightPanel();

    if (this.options.drawerContent) {
      this.renderDrawerContent();
    }

    this.element = this.container;
  }

  bindEvents(): void {
    // Subscribe to language changes
    this.languageUnsubscribe = LanguageService.subscribe(() => {
      this.update();
    });

    // Image upload events
    this.onCustom('image-loaded', (event: CustomEvent) => {
      const { image } = event.detail;
      this.currentImage = image;

      ToastService.success(LanguageService.t('matcher.imageLoaded') || 'Image loaded');

      if (this.imageZoom) {
        this.imageZoom.setImage(image);
      }

      this.showEmptyState(false);
      this.updateDrawerContent();
    });

    this.onCustom('error', (event: CustomEvent) => {
      const message = event.detail?.message || 'Failed to load image';
      logger.error('[MatcherTool] Image upload error:', event.detail);
      ToastService.error(message);
    });

    // Color picker events
    this.onCustom('color-selected', (event: CustomEvent) => {
      const { color } = event.detail;
      this.matchColor(color);
    });

    // Market board events
    this.onCustom('showPricesChanged', (event: CustomEvent) => {
      this.showPrices = event.detail.showPrices;
      this.renderMatchedResults();
    });

    this.onCustom('pricesLoaded', (event: CustomEvent) => {
      this.priceData = event.detail.prices;
      this.renderMatchedResults();
    });
  }

  onMount(): void {
    logger.info('[MatcherTool] Mounted');
  }

  destroy(): void {
    // Cleanup subscriptions
    this.languageUnsubscribe?.();

    // Cleanup child components
    this.imageUpload?.destroy();
    this.colorPicker?.destroy();
    this.imageZoom?.destroy();
    this.recentColors?.destroy();
    this.dyeFilters?.destroy();
    this.marketBoard?.destroy();
    this.filtersPanel?.destroy();
    this.marketPanel?.destroy();

    super.destroy();
    logger.info('[MatcherTool] Destroyed');
  }

  // ============================================================================
  // Left Panel Rendering
  // ============================================================================

  private renderLeftPanel(): void {
    const left = this.options.leftPanel;
    clearContainer(left);

    // Section 1: Image Upload
    const uploadSection = this.createSection(LanguageService.t('matcher.imageSource') || 'Image Source');
    this.renderImageUpload(uploadSection);
    left.appendChild(uploadSection);

    // Section 2: Color Selection
    const colorSection = this.createSection(LanguageService.t('matcher.colorSelection') || 'Color Selection');
    this.renderColorPicker(colorSection);
    left.appendChild(colorSection);

    // Section 3: Options
    const optionsSection = this.createSection(LanguageService.t('matcher.options') || 'Options');
    this.renderOptions(optionsSection);
    left.appendChild(optionsSection);

    // Collapsible: Dye Filters
    const filtersContainer = this.createElement('div');
    left.appendChild(filtersContainer);
    this.renderFiltersPanel(filtersContainer);

    // Collapsible: Market Board
    const marketContainer = this.createElement('div');
    left.appendChild(marketContainer);
    this.renderMarketPanel(marketContainer);
  }

  /**
   * Create a section with label
   */
  private createSection(label: string): HTMLElement {
    const section = this.createElement('div', {
      className: 'p-4 border-b',
      attributes: { style: 'border-color: var(--theme-border);' },
    });
    const sectionLabel = this.createElement('h3', {
      className: 'text-sm font-semibold uppercase tracking-wider mb-3',
      textContent: label,
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
    section.appendChild(sectionLabel);
    return section;
  }

  /**
   * Render image upload section
   */
  private renderImageUpload(container: HTMLElement): void {
    const uploadContainer = this.createElement('div');
    container.appendChild(uploadContainer);

    this.imageUpload = new ImageUploadDisplay(uploadContainer);
    this.imageUpload.init();
  }

  /**
   * Render color picker section
   */
  private renderColorPicker(container: HTMLElement): void {
    const pickerContainer = this.createElement('div');
    container.appendChild(pickerContainer);

    this.colorPicker = new ColorPickerDisplay(pickerContainer);
    this.colorPicker.init();
  }

  /**
   * Render options section (sample size, palette mode)
   */
  private renderOptions(container: HTMLElement): void {
    const optionsContainer = this.createElement('div', { className: 'space-y-4' });

    // Sample size slider
    const sampleGroup = this.createElement('div');
    const sampleLabel = this.createElement('label', {
      className: 'flex items-center justify-between text-sm mb-2',
    });
    sampleLabel.innerHTML = `
      <span style="color: var(--theme-text);">${LanguageService.t('matcher.sampleSize') || 'Sample Size'}</span>
      <span class="font-mono" style="color: var(--theme-text-muted);">${this.sampleSize}px</span>
    `;
    this.sampleDisplay = sampleLabel.querySelector('span:last-child') as HTMLElement;

    this.sampleSlider = this.createElement('input', {
      attributes: { type: 'range', min: '1', max: '10', value: String(this.sampleSize) },
      className: 'w-full',
    }) as HTMLInputElement;

    this.on(this.sampleSlider, 'input', () => {
      if (this.sampleSlider && this.sampleDisplay) {
        this.sampleSize = parseInt(this.sampleSlider.value, 10);
        this.sampleDisplay.textContent = `${this.sampleSize}px`;
        StorageService.setItem(STORAGE_KEYS.sampleSize, this.sampleSize);
      }
    });

    sampleGroup.appendChild(sampleLabel);
    sampleGroup.appendChild(this.sampleSlider);
    optionsContainer.appendChild(sampleGroup);

    // Palette mode toggle
    const paletteToggle = this.createElement('label', {
      className: 'flex items-center gap-3 cursor-pointer',
    });

    this.paletteModeCheckbox = this.createElement('input', {
      attributes: { type: 'checkbox' },
      className: 'w-5 h-5 rounded',
    }) as HTMLInputElement;
    this.paletteModeCheckbox.checked = this.paletteMode;

    this.on(this.paletteModeCheckbox, 'change', () => {
      if (this.paletteModeCheckbox) {
        this.paletteMode = this.paletteModeCheckbox.checked;
        StorageService.setItem(STORAGE_KEYS.paletteMode, this.paletteMode);
        this.updateDrawerContent();
      }
    });

    const toggleText = this.createElement('div');
    toggleText.innerHTML = `
      <p class="text-sm font-medium" style="color: var(--theme-text);">${LanguageService.t('matcher.extractPalette') || 'Extract Palette'}</p>
      <p class="text-xs" style="color: var(--theme-text-muted);">${LanguageService.t('matcher.extractPaletteDesc') || 'Get multiple colors from image'}</p>
    `;

    paletteToggle.appendChild(this.paletteModeCheckbox);
    paletteToggle.appendChild(toggleText);
    optionsContainer.appendChild(paletteToggle);

    container.appendChild(optionsContainer);
  }

  /**
   * Render dye filters collapsible panel
   */
  private renderFiltersPanel(container: HTMLElement): void {
    this.filtersPanel = new CollapsiblePanel(container, {
      title: LanguageService.t('filters.advancedFilters') || 'Dye Filters',
      storageKey: 'matcher_filters',
      defaultOpen: false,
      icon: ICON_FILTER,
    });
    this.filtersPanel.init();

    // Create filters content
    const filtersContent = this.createElement('div');
    this.dyeFilters = new DyeFilters(filtersContent, {
      storageKeyPrefix: 'v3_matcher',
      onFilterChange: (filters) => {
        this.filterConfig = filters;
        if (this.selectedColor) {
          this.matchColor(this.selectedColor);
        }
      },
    });
    this.dyeFilters.init();

    this.filtersPanel.setContent(filtersContent);
  }

  /**
   * Render market board collapsible panel
   */
  private renderMarketPanel(container: HTMLElement): void {
    this.marketPanel = new CollapsiblePanel(container, {
      title: LanguageService.t('marketBoard.title') || 'Market Board',
      storageKey: 'matcher_market',
      defaultOpen: false,
      icon: ICON_MARKET,
    });
    this.marketPanel.init();

    // Create market board content
    const marketContent = this.createElement('div');
    this.marketBoard = new MarketBoard(marketContent);
    this.marketBoard.init();

    this.marketPanel.setContent(marketContent);
  }

  // ============================================================================
  // Right Panel Rendering
  // ============================================================================

  private renderRightPanel(): void {
    const right = this.options.rightPanel;
    clearContainer(right);

    // Image Canvas Section
    this.canvasContainer = this.createElement('div', { className: 'mb-6' });
    this.renderImageCanvas();
    right.appendChild(this.canvasContainer);

    // Results Section
    this.resultsContainer = this.createElement('div', { className: 'mb-6' });
    const resultsHeader = this.createElement('h3', {
      className: 'text-sm font-semibold uppercase tracking-wider mb-3',
      textContent: LanguageService.t('matcher.matchedDyes') || 'Matched Dyes',
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
    this.resultsContainer.appendChild(resultsHeader);
    right.appendChild(this.resultsContainer);

    // Empty state
    this.emptyStateContainer = this.createElement('div');
    this.renderEmptyState();
    right.appendChild(this.emptyStateContainer);

    // Recent Colors Section
    const recentContainer = this.createElement('div', { className: 'mt-6' });
    this.renderRecentColors(recentContainer);
    right.appendChild(recentContainer);
  }

  /**
   * Render image canvas with zoom controller
   */
  private renderImageCanvas(): void {
    if (!this.canvasContainer) return;
    clearContainer(this.canvasContainer);

    const canvasWrapper = this.createElement('div');
    this.canvasContainer.appendChild(canvasWrapper);

    this.imageZoom = new ImageZoomController(canvasWrapper, {
      onColorSampled: (hex, x, y) => {
        this.matchColor(hex);
      },
    });
    this.imageZoom.init();

    // If we already have an image, set it
    if (this.currentImage) {
      this.imageZoom.setImage(this.currentImage);
    }
  }

  /**
   * Render empty state
   */
  private renderEmptyState(): void {
    if (!this.emptyStateContainer) return;
    clearContainer(this.emptyStateContainer);

    const empty = this.createElement('div', {
      className: 'p-8 rounded-lg border-2 border-dashed text-center',
      attributes: {
        style: 'border-color: var(--theme-border); background: var(--theme-card-background);',
      },
    });

    empty.innerHTML = `
      <span class="w-16 h-16 mx-auto mb-3 block opacity-30" style="color: var(--theme-text);">${ICON_UPLOAD}</span>
      <p style="color: var(--theme-text);">${LanguageService.t('matcher.uploadPrompt') || 'Upload an image to start matching'}</p>
      <p class="text-sm mt-2" style="color: var(--theme-text-muted);">${LanguageService.t('matcher.orEnterHex') || 'Or enter a hex color manually'}</p>
    `;

    this.emptyStateContainer.appendChild(empty);
  }

  /**
   * Render recent colors panel
   */
  private renderRecentColors(container: HTMLElement): void {
    this.recentColors = new RecentColorsPanel(container, {
      onColorSelected: (hex) => {
        this.matchColor(hex);
      },
      storageKey: 'v3_matcher_recent',
      maxColors: 10,
    });
    this.recentColors.init();
  }

  /**
   * Show/hide empty state
   */
  private showEmptyState(show: boolean): void {
    if (this.emptyStateContainer) {
      this.emptyStateContainer.classList.toggle('hidden', !show);
    }
  }

  // ============================================================================
  // Mobile Drawer Content
  // ============================================================================

  private renderDrawerContent(): void {
    if (!this.options.drawerContent) return;
    this.updateDrawerContent();
  }

  private updateDrawerContent(): void {
    if (!this.options.drawerContent) return;
    const drawer = this.options.drawerContent;
    clearContainer(drawer);

    const content = this.createElement('div', { className: 'p-4 space-y-3' });

    // Selected color display
    if (this.selectedColor) {
      const colorDisplay = this.createElement('div', {
        className: 'flex items-center gap-3 p-3 rounded-lg',
        attributes: { style: 'background: var(--theme-background-secondary);' },
      });

      const swatch = this.createElement('div', {
        className: 'w-10 h-10 rounded-lg border',
        attributes: {
          style: `background: ${this.selectedColor}; border-color: var(--theme-border);`,
        },
      });

      const info = this.createElement('div');
      info.innerHTML = `
        <p class="font-medium" style="color: var(--theme-text);">${LanguageService.t('matcher.selectedColor') || 'Selected Color'}</p>
        <p class="text-xs font-mono" style="color: var(--theme-text-muted);">${this.selectedColor}</p>
      `;

      colorDisplay.appendChild(swatch);
      colorDisplay.appendChild(info);
      content.appendChild(colorDisplay);
    } else {
      const placeholder = this.createElement('p', {
        className: 'text-sm',
        textContent: LanguageService.t('matcher.noColorSelected') || 'No color selected',
        attributes: { style: 'color: var(--theme-text-muted);' },
      });
      content.appendChild(placeholder);
    }

    // Image status
    if (this.currentImage) {
      const imageStatus = this.createElement('div', {
        className: 'flex items-center gap-2 text-sm',
        attributes: { style: 'color: var(--theme-text-muted);' },
      });
      imageStatus.innerHTML = `
        <span class="w-4 h-4">${ICON_UPLOAD}</span>
        <span>${LanguageService.t('matcher.imageLoaded') || 'Image loaded'}</span>
      `;
      content.appendChild(imageStatus);
    }

    // Settings summary
    const settingsInfo = this.createElement('div', {
      className: 'text-xs space-y-1',
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
    settingsInfo.innerHTML = `
      <p>${LanguageService.t('matcher.sampleSize') || 'Sample Size'}: ${this.sampleSize}px</p>
      <p>${LanguageService.t('matcher.paletteMode') || 'Palette Mode'}: ${this.paletteMode ? 'On' : 'Off'}</p>
    `;
    content.appendChild(settingsInfo);

    drawer.appendChild(content);
  }

  // ============================================================================
  // Color Matching Logic
  // ============================================================================

  /**
   * Match a color to the closest dyes
   */
  private matchColor(hex: string): void {
    this.selectedColor = hex;
    this.showEmptyState(false);

    // Add to recent colors
    if (this.recentColors) {
      this.recentColors.addRecentColor(hex);
    }

    // Find closest dyes
    let closestDye = dyeService.findClosestDye(hex);
    let withinDistance = dyeService.findDyesWithinDistance(hex, 100, 10);

    // Apply filters if available
    if (this.dyeFilters) {
      // Filter closest dye
      if (closestDye && this.dyeFilters.isDyeExcluded(closestDye)) {
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
      this.matchedDyes = [];
      this.renderMatchedResults();
      return;
    }

    // Cache distances
    const closestDyeWithDistance: DyeWithDistance = {
      ...closestDye,
      distance: ColorService.getColorDistance(hex, closestDye.hex),
    };

    const withinDistanceWithCache: DyeWithDistance[] = withinDistance.map((dye) => ({
      ...dye,
      distance: ColorService.getColorDistance(hex, dye.hex),
    }));

    // Store matched dyes
    this.matchedDyes = [closestDyeWithDistance, ...withinDistanceWithCache];

    // Render results
    this.renderMatchedResults();
    this.updateDrawerContent();

    // Fetch prices if enabled
    if (this.showPrices && this.marketBoard) {
      void this.fetchPricesForMatches();
    }

    logger.info('[MatcherTool] Matched color:', hex, 'Found:', this.matchedDyes.length, 'dyes');
  }

  /**
   * Render matched dye results
   */
  private renderMatchedResults(): void {
    if (!this.resultsContainer) return;

    // Clear existing results (keep header)
    const header = this.resultsContainer.querySelector('h3');
    clearContainer(this.resultsContainer);
    if (header) {
      this.resultsContainer.appendChild(header);
    }

    if (this.matchedDyes.length === 0) {
      if (this.selectedColor) {
        const noResults = this.createElement('p', {
          className: 'text-sm text-center py-4',
          textContent: LanguageService.t('matcher.noMatchingDyes') || 'No matching dyes found',
          attributes: { style: 'color: var(--theme-text-muted);' },
        });
        this.resultsContainer.appendChild(noResults);
      }
      return;
    }

    const grid = this.createElement('div', { className: 'grid gap-3 sm:grid-cols-2' });

    this.matchedDyes.forEach((dye, index) => {
      const card = this.createDyeCard(dye, index);
      grid.appendChild(card);
    });

    this.resultsContainer.appendChild(grid);
  }

  /**
   * Create a dye result card
   */
  private createDyeCard(dye: DyeWithDistance, index: number): HTMLElement {
    const card = this.createElement('div', {
      className: 'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
      attributes: {
        style: 'background: var(--theme-card-background); border: 1px solid var(--theme-border);',
      },
    });

    // Rank badge
    const rank = this.createElement('span', {
      className: 'w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full flex-shrink-0',
      textContent: String(index + 1),
      attributes: {
        style:
          index === 0
            ? 'background: var(--theme-primary); color: var(--theme-text-header);'
            : 'background: var(--theme-background-secondary); color: var(--theme-text-muted);',
      },
    });

    // Color swatches (sampled + dye)
    const swatches = this.createElement('div', { className: 'flex gap-1' });
    if (this.selectedColor) {
      const sampledSwatch = this.createElement('div', {
        className: 'w-5 h-10 rounded-l',
        attributes: { style: `background: ${this.selectedColor};`, title: 'Sampled color' },
      });
      swatches.appendChild(sampledSwatch);
    }
    const dyeSwatch = this.createElement('div', {
      className: 'w-5 h-10 rounded-r',
      attributes: { style: `background: ${dye.hex};`, title: dye.hex },
    });
    swatches.appendChild(dyeSwatch);

    // Dye info
    const info = this.createElement('div', { className: 'flex-1 min-w-0' });
    const dyeName = LanguageService.getDyeName(dye.itemID) ?? dye.name;
    info.innerHTML = `
      <p class="text-sm font-medium truncate" style="color: var(--theme-text);">${dyeName}</p>
      <p class="text-xs" style="color: var(--theme-text-muted);">
        Δ ${dye.distance.toFixed(1)}
        ${this.showPrices && this.priceData.has(dye.itemID) ? ` · ${this.priceData.get(dye.itemID)!.currentMinPrice.toLocaleString()} gil` : ''}
      </p>
    `;

    card.appendChild(rank);
    card.appendChild(swatches);
    card.appendChild(info);

    // Hover effect
    this.on(card, 'mouseenter', () => {
      card.style.background = 'var(--theme-card-hover)';
    });
    this.on(card, 'mouseleave', () => {
      card.style.background = 'var(--theme-card-background)';
    });

    return card;
  }

  /**
   * Fetch prices for matched dyes
   */
  private async fetchPricesForMatches(): Promise<void> {
    if (!this.marketBoard || this.matchedDyes.length === 0) return;

    try {
      const prices = await this.marketBoard.fetchPricesForDyes(this.matchedDyes);
      this.priceData.clear();
      for (const [id, price] of prices.entries()) {
        this.priceData.set(id, price);
      }
      this.renderMatchedResults();
    } catch (error) {
      logger.error('[MatcherTool] Failed to fetch prices:', error);
    }
  }
}

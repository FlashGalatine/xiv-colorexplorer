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
  ColorService,
  dyeService,
  APIService,
  LanguageService,
  AnnouncerService,
} from '@services/index';
import { StorageService } from '@services/index';
import type { Dye, PriceData } from '@shared/types';

/**
 * Recent color entry for history (T5)
 */
interface RecentColor {
  hex: string;
  timestamp: number;
}

/**
 * Dye with cached distance for performance optimization
 */
interface DyeWithDistance extends Dye {
  distance: number;
}
import { logger } from '@shared/logger';
import { clearContainer } from '@shared/utils';
import { ICON_ZOOM_FIT, ICON_ZOOM_WIDTH } from '@shared/ui-icons';

/**
 * Color Matcher Tool Component
 * Match colors to the closest FFXIV dyes
 */
export class ColorMatcherTool extends BaseComponent {
  private imageUpload: ImageUploadDisplay | null = null;
  private colorPicker: ColorPickerDisplay | null = null;
  private marketBoard: MarketBoard | null = null;
  private dyeFilters: DyeFilters | null = null;
  private matchedDyes: DyeWithDistance[] = [];
  private priceData: Map<number, PriceData> = new Map();
  private showPrices: boolean = false;
  private sampleSize: number = 5;
  private zoomLevel: number = 100;
  private currentImage: HTMLImageElement | null = null;
  private lastSampledColor: string = '';
  private previewOverlay: DyePreviewOverlay | null = null;
  private samplePosition: { x: number; y: number } = { x: 0, y: 0 };
  private canvasContainerRef: HTMLElement | null = null;
  private canvasRef: HTMLCanvasElement | null = null;

  // Recent Colors History (T5)
  private recentColors: RecentColor[] = [];
  private readonly maxRecentColors = 10;
  private readonly recentColorsStorageKey = 'colormatcher_recent_colors';

  /**
   * Render the tool component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-8',
    });

    // Title
    const title = this.createElement('div', {
      className: 'space-y-2 text-center',
    });

    const heading = this.createElement('h2', {
      textContent: LanguageService.t('tools.matcher.title'),
      className: 'text-3xl font-bold',
      attributes: {
        style: 'color: var(--theme-text);',
      },
    });

    const subtitle = this.createElement('p', {
      textContent: LanguageService.t('tools.matcher.subtitle'),
      attributes: {
        style: 'color: var(--theme-text-muted);',
      },
    });

    title.appendChild(heading);
    title.appendChild(subtitle);
    wrapper.appendChild(title);

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
    const recentColorsSection = this.createElement('div', {
      id: 'recent-colors-section',
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
      attributes: {
        style: 'display: none;', // Hidden until there are recent colors
      },
    });

    const recentColorsTitle = this.createElement('h3', {
      textContent: LanguageService.t('matcher.recentColors') || 'Recent Picks',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-3',
    });
    recentColorsSection.appendChild(recentColorsTitle);

    const recentColorsContainer = this.createElement('div', {
      id: 'recent-colors-container',
      className: 'flex flex-wrap items-center gap-2',
    });
    recentColorsSection.appendChild(recentColorsContainer);

    wrapper.appendChild(recentColorsSection);

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
        this.showToast('✓ Image loaded successfully', 'success');

        // Show overlay for image interaction
        this.showImageOverlay(image);
      });

      imageUploadContainer.addEventListener('error', (event: Event) => {
        const customEvent = event as CustomEvent;
        const message = customEvent.detail?.message || 'Failed to load image';
        logger.error('Image upload error:', customEvent.detail);
        this.showToast(message, 'error');
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
    if (marketBoardContainer && !this.marketBoard) {
      this.marketBoard = new MarketBoard(marketBoardContainer);
      await this.marketBoard.loadServerData();
      this.marketBoard.init();

      // Listen for Market Board events
      marketBoardContainer.addEventListener('toggle-prices', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.showPrices = customEvent.detail?.showPrices ?? false;
        if (this.showPrices && this.matchedDyes.length > 0) {
          void this.fetchPricesForMatchedDyes();
        } else {
          this.priceData.clear();
          this.refreshResults();
        }
      });

      marketBoardContainer.addEventListener('server-changed', () => {
        if (this.showPrices && this.matchedDyes.length > 0) {
          void this.fetchPricesForMatchedDyes();
        }
      });

      marketBoardContainer.addEventListener('categories-changed', () => {
        if (this.showPrices && this.matchedDyes.length > 0) {
          void this.fetchPricesForMatchedDyes();
        }
      });

      marketBoardContainer.addEventListener('refresh-requested', () => {
        if (this.showPrices && this.matchedDyes.length > 0) {
          void this.fetchPricesForMatchedDyes();
        }
      });

      // Get initial showPrices state
      this.showPrices = this.marketBoard.getShowPrices();
    }
  }

  /**
   * Initialize the tool
   */
  onMount(): void {
    // Subscribe to language changes to update localized text
    LanguageService.subscribe(() => {
      this.updateLocalizedText();
    });

    // Load recent colors from localStorage (T5)
    this.loadRecentColors();
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
   * Show image overlay for eyedropper
   */
  private showImageOverlay(image: HTMLImageElement): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    clearContainer(resultsContainer);

    // Store current image for zoom interactions
    this.currentImage = image;
    this.zoomLevel = 100;

    const section = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    const sectionTitle = this.createElement('h3', {
      textContent: LanguageService.t('matcher.imageColorPicker'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-2',
    });
    section.appendChild(sectionTitle);

    const hint = this.createElement('p', {
      textContent: LanguageService.t('matcher.clickToSample'),
      className: 'text-sm text-gray-600 dark:text-gray-400',
    });
    section.appendChild(hint);

    const privacyNotice = this.createElement('p', {
      innerHTML: `🔒 <strong>${LanguageService.t('matcher.privacyNoteFull')}</strong> (<a class="underline" href="https://github.com/FlashGalatine/xivdyetools-web-app/blob/main/docs/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy Guide</a>).`,
      className: 'text-xs text-gray-500 dark:text-gray-400 mb-4',
    });
    section.appendChild(privacyNotice);

    // Create zoom controls container
    const zoomControls = this.createElement('div', {
      className: 'flex flex-wrap gap-2 mb-4',
    });

    // Fit button - inline SVG for theme color inheritance
    const fitBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
      innerHTML: `<span class="inline-block w-4 h-4 mr-1" aria-hidden="true">${ICON_ZOOM_FIT}</span> ${LanguageService.t('matcher.zoomFit')}`,
      attributes: {
        title: LanguageService.t('matcher.zoomFit'),
        id: 'zoom-fit-btn',
      },
    });
    zoomControls.appendChild(fitBtn);

    // Width button - inline SVG for theme color inheritance
    const widthBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
      innerHTML: `<span class="inline-block w-4 h-4 mr-1" aria-hidden="true">${ICON_ZOOM_WIDTH}</span> ${LanguageService.t('matcher.zoomWidth')}`,
      attributes: {
        title: LanguageService.t('matcher.zoomWidth'),
        id: 'zoom-width-btn',
      },
    });
    zoomControls.appendChild(widthBtn);

    // Zoom out button
    const zoomOutBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
      textContent: '−',
      attributes: {
        title: 'Zoom out (10%)',
        id: 'zoom-out-btn',
      },
    });
    zoomControls.appendChild(zoomOutBtn);

    // Zoom level display
    const zoomDisplay = this.createElement('div', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-w-20 text-center',
      textContent: '100%',
      attributes: {
        id: 'zoom-level-display',
      },
    });
    zoomControls.appendChild(zoomDisplay);

    // Zoom in button
    const zoomInBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
      textContent: '+',
      attributes: {
        title: 'Zoom in (10%)',
        id: 'zoom-in-btn',
      },
    });
    zoomControls.appendChild(zoomInBtn);

    // Reset button
    const resetBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
      textContent: `↺ ${LanguageService.t('matcher.zoomReset')}`,
      attributes: {
        title: LanguageService.t('matcher.zoomReset'),
        id: 'zoom-reset-btn',
      },
    });
    zoomControls.appendChild(resetBtn);

    section.appendChild(zoomControls);

    // Create canvas container for scrolling
    const canvasContainer = this.createElement('div', {
      className:
        'w-full max-h-96 overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900',
      attributes: {
        id: 'canvas-container',
      },
    });

    // Create canvas for image display
    const canvas = this.createElement('canvas', {
      className: 'cursor-crosshair block',
      attributes: {
        width: String(image.width),
        height: String(image.height),
        id: 'image-canvas',
      },
    });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(image, 0, 0);
    }

    canvasContainer.appendChild(canvas);
    section.appendChild(canvasContainer);

    // Store references for preview overlay
    this.canvasContainerRef = canvasContainer;
    this.canvasRef = canvas as HTMLCanvasElement;

    // Initialize preview overlay
    if (!this.previewOverlay) {
      const overlayContainer = document.createElement('div');
      this.previewOverlay = new DyePreviewOverlay(overlayContainer);
      this.previewOverlay.init();
    }
    this.previewOverlay.setCanvasContainer(canvasContainer, canvas as HTMLCanvasElement);

    // Hide preview overlay when scrolling the canvas container
    canvasContainer.addEventListener(
      'scroll',
      () => {
        this.previewOverlay?.hidePreview();
      },
      { passive: true }
    );

    // Image interaction
    this.setupImageInteraction(canvas as HTMLCanvasElement, image);

    resultsContainer.appendChild(section);

    // Setup zoom controls
    this.setupZoomControls(
      canvas,
      image,
      canvasContainer,
      fitBtn,
      widthBtn,
      zoomOutBtn,
      zoomInBtn,
      resetBtn,
      zoomDisplay
    );
  }

  /**
   * Setup image click/drag interaction
   */
  private setupImageInteraction(canvas: HTMLCanvasElement, image: HTMLImageElement): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    this.on(canvas, 'mousedown', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      startX = (mouseEvent.clientX - rect.left) * (canvas.width / rect.width);
      startY = (mouseEvent.clientY - rect.top) * (canvas.height / rect.height);
      isDragging = true;
    });

    this.on(canvas, 'mousemove', (e: Event) => {
      if (!isDragging) return;

      const mouseEvent = e as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      const currentX = (mouseEvent.clientX - rect.left) * (canvas.width / rect.width);
      const currentY = (mouseEvent.clientY - rect.top) * (canvas.height / rect.height);

      // Redraw canvas with selection rectangle
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0);

        // Draw selection rectangle
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        const width = currentX - startX;
        const height = currentY - startY;
        ctx.strokeRect(startX, startY, width, height);
      }
    });

    this.on(canvas, 'mouseup', (e: Event) => {
      if (!isDragging) return;
      isDragging = false;

      const mouseEvent = e as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      const endX = (mouseEvent.clientX - rect.left) * (canvas.width / rect.width);
      const endY = (mouseEvent.clientY - rect.top) * (canvas.height / rect.height);

      // Sample color from region
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;
      const size = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));

      // Store sample position for preview overlay
      this.samplePosition = { x: centerX, y: centerY };

      if (this.colorPicker) {
        this.colorPicker.setColorFromImage(canvas, centerX, centerY, Math.max(1, size));
        // Manually trigger matching since setColorFromImage doesn't fire color-selected event
        const sampledHex = this.colorPicker.getColor();
        if (sampledHex) {
          this.matchColor(sampledHex);
        }
      }

      // Redraw original image
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0);
      }
    });

    this.on(canvas, 'mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0);
        }
      }
    });
  }

  /**
   * Setup zoom controls for image
   */
  private setupZoomControls(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    canvasContainer: HTMLElement,
    fitBtn: HTMLElement,
    widthBtn: HTMLElement,
    zoomOutBtn: HTMLElement,
    zoomInBtn: HTMLElement,
    resetBtn: HTMLElement,
    zoomDisplay: HTMLElement
  ): void {
    const MIN_ZOOM = 10;
    const MAX_ZOOM = 400;
    const MIN_CONTAINER_DIMENSION = 50; // Minimum valid container dimension in pixels

    /**
     * Get container dimensions with fallbacks for mobile reliability
     */
    const getContainerDimensions = (): { width: number; height: number } => {
      // Try clientWidth/clientHeight first (most accurate for content area)
      let width = canvasContainer.clientWidth;
      let height = canvasContainer.clientHeight;

      // If clientWidth/clientHeight are invalid, try offsetWidth/offsetHeight
      if (width <= 0 || height <= 0) {
        width = canvasContainer.offsetWidth;
        height = canvasContainer.offsetHeight;
      }

      // If still invalid, try getBoundingClientRect as final fallback
      if (width <= 0 || height <= 0) {
        const rect = canvasContainer.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      }

      // If still invalid, use viewport dimensions as last resort
      if (width <= 0 || height <= 0) {
        width = window.innerWidth - 32; // Account for padding/margins
        height = window.innerHeight * 0.4; // Use 40% of viewport height as reasonable default
        logger.warn('Color Matcher: Using fallback container dimensions', { width, height });
      }

      // Ensure minimum dimensions
      width = Math.max(width, MIN_CONTAINER_DIMENSION);
      height = Math.max(height, MIN_CONTAINER_DIMENSION);

      // Account for padding/borders (16px total)
      return {
        width: Math.max(width - 16, MIN_CONTAINER_DIMENSION),
        height: Math.max(height - 16, MIN_CONTAINER_DIMENSION),
      };
    };

    const updateZoom = (newZoom: number): void => {
      this.zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      const scale = this.zoomLevel / 100;

      // Update canvas size
      canvas.style.transform = `scale(${scale})`;
      canvas.style.transformOrigin = 'top left';
      canvas.style.cursor = this.zoomLevel > 100 ? 'move' : 'crosshair';

      // Update display
      zoomDisplay.textContent = `${this.zoomLevel}%`;

      // Update button states - use boolean property, not string attribute
      (zoomOutBtn as HTMLButtonElement).disabled = this.zoomLevel <= MIN_ZOOM;
      (zoomInBtn as HTMLButtonElement).disabled = this.zoomLevel >= MAX_ZOOM;

      // Update button styling based on disabled state
      if (this.zoomLevel <= MIN_ZOOM) {
        zoomOutBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        zoomOutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }

      if (this.zoomLevel >= MAX_ZOOM) {
        zoomInBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        zoomInBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    };

    const fitToContainer = (): void => {
      // Use requestAnimationFrame to ensure layout is complete on mobile
      requestAnimationFrame(() => {
        const container = getContainerDimensions();
        // Use naturalWidth/naturalHeight for reliable image dimensions (handles EXIF orientation)
        const imageWidth = image.naturalWidth || image.width;
        const imageHeight = image.naturalHeight || image.height;

        // Validate image dimensions
        if (imageWidth <= 0 || imageHeight <= 0) {
          logger.warn('Color Matcher: Invalid image dimensions', { imageWidth, imageHeight });
          return;
        }

        const zoomX = (container.width / imageWidth) * 100;
        const zoomY = (container.height / imageHeight) * 100;
        const newZoom = Math.min(zoomX, zoomY, 100); // Cap at 100% to avoid upscaling

        // Ensure minimum zoom threshold
        const finalZoom = Math.max(newZoom, MIN_ZOOM);
        updateZoom(finalZoom);
      });
    };

    const zoomToWidth = (): void => {
      // Use requestAnimationFrame to ensure layout is complete on mobile
      requestAnimationFrame(() => {
        const container = getContainerDimensions();
        // Use naturalWidth for reliable image dimensions (handles EXIF orientation)
        const imageWidth = image.naturalWidth || image.width;

        // Validate image dimensions
        if (imageWidth <= 0) {
          logger.warn('Color Matcher: Invalid image width', { imageWidth });
          return;
        }

        const newZoom = (container.width / imageWidth) * 100;

        // Ensure minimum zoom threshold and respect max zoom
        const finalZoom = Math.max(Math.min(newZoom, MAX_ZOOM), MIN_ZOOM);
        updateZoom(finalZoom);
      });
    };

    // Setup button listeners
    this.on(fitBtn, 'click', fitToContainer);
    this.on(widthBtn, 'click', zoomToWidth);
    this.on(zoomOutBtn, 'click', () => {
      if (this.zoomLevel > MIN_ZOOM) {
        updateZoom(this.zoomLevel - 10);
      }
    });
    this.on(zoomInBtn, 'click', () => {
      if (this.zoomLevel < MAX_ZOOM) {
        updateZoom(this.zoomLevel + 10);
      }
    });
    this.on(resetBtn, 'click', () => {
      updateZoom(100);
    });

    // Allow mouse wheel zoom
    this.on(canvasContainer, 'wheel', (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (!wheelEvent.shiftKey) {
        return;
      }

      wheelEvent.preventDefault();
      const delta = wheelEvent.deltaY > 0 ? -10 : 10;
      updateZoom(this.zoomLevel + delta);
    });

    // Allow keyboard shortcuts (using this.on for proper cleanup)
    this.on(document, 'keydown', (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (
        document.activeElement === document.body ||
        document.activeElement?.contains(canvasContainer)
      ) {
        if (keyEvent.key === '+' || keyEvent.key === '=') {
          keyEvent.preventDefault();
          if (this.zoomLevel < MAX_ZOOM) {
            updateZoom(this.zoomLevel + 10);
          }
        } else if (keyEvent.key === '-') {
          keyEvent.preventDefault();
          if (this.zoomLevel > MIN_ZOOM) {
            updateZoom(this.zoomLevel - 10);
          }
        } else if (keyEvent.key === '0') {
          keyEvent.preventDefault();
          updateZoom(100);
        }
      }
    });
  }

  /**
   * Fetch prices for matched dyes
   */
  private async fetchPricesForMatchedDyes(): Promise<void> {
    if (!this.marketBoard || !this.showPrices || this.matchedDyes.length === 0) return;

    // Fetch prices using Market Board
    this.priceData = await this.marketBoard.fetchPricesForDyes(this.matchedDyes);

    // Refresh results display with prices
    this.refreshResults();
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
   * Match a color to dyes
   */
  private matchColor(hex: string): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    // Store the sampled color for refreshResults()
    this.lastSampledColor = hex;

    // Add to recent colors history (T5)
    this.addToRecentColors(hex);

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
      void this.fetchPricesForMatchedDyes();
    }
  }

  /**
   * Render dye card
   */
  private renderDyeCard(dye: Dye, sampledColor: string): HTMLElement {
    const card = this.createElement('div', {
      className:
        'flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
    });

    // Swatches
    const swatchContainer = this.createElement('div', {
      className: 'flex gap-2',
    });

    const sampledSwatch = this.createElement('div', {
      className: 'w-8 h-8 rounded border border-gray-300 dark:border-gray-600',
      attributes: {
        title: `Sampled: ${sampledColor}`,
        style: `background-color: ${sampledColor}`,
      },
    });

    const dyeSwatch = this.createElement('div', {
      className: 'dye-swatch w-8 h-8 rounded border-2 border-gray-400 dark:border-gray-500',
      attributes: {
        title: `Dye: ${dye.hex}`,
        style: `background-color: ${dye.hex}`,
      },
    });

    swatchContainer.appendChild(sampledSwatch);
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

    // Use cached distance if available, otherwise calculate
    const distance =
      'distance' in dye && typeof dye.distance === 'number'
        ? dye.distance
        : ColorService.getColorDistance(sampledColor, dye.hex);
    const distanceText = this.createElement('div', {
      textContent: `${LanguageService.t('matcher.distance')}: ${distance.toFixed(1)}`,
      className: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
    });

    info.appendChild(name);
    info.appendChild(distanceText);
    card.appendChild(info);

    // Category badge
    const category = this.createElement('div', {
      textContent: LanguageService.getCategory(dye.category),
      className:
        'text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-medium',
    });
    card.appendChild(category);

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
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(dye.hex);
        this.showToast(`✓ Copied ${dye.hex} to clipboard`, 'success');
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
          this.showToast(`✓ Copied ${dye.hex} to clipboard`, 'success');
        } catch {
          this.showToast('Failed to copy hex code', 'error');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    });

    card.appendChild(copyButton);

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

      card.appendChild(priceDiv);
    }

    // Add hover events for preview overlay
    card.addEventListener('mouseenter', () => {
      if (this.previewOverlay && this.samplePosition.x > 0) {
        this.previewOverlay.showPreview({
          sampledColor,
          sampledPosition: this.samplePosition,
          dye,
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      if (this.previewOverlay) {
        this.previewOverlay.hidePreview();
      }
    });

    return card;
  }

  // ============================================================================
  // Recent Colors History Methods (T5)
  // ============================================================================

  /**
   * Load recent colors from localStorage
   */
  private loadRecentColors(): void {
    try {
      const stored = StorageService.getItem<RecentColor[]>(this.recentColorsStorageKey);
      if (stored && Array.isArray(stored)) {
        this.recentColors = stored.slice(0, this.maxRecentColors);
        this.renderRecentColors();
      }
    } catch (error) {
      logger.warn('Failed to load recent colors from storage:', error);
    }
  }

  /**
   * Save recent colors to localStorage
   */
  private saveRecentColors(): void {
    try {
      StorageService.setItem(this.recentColorsStorageKey, this.recentColors);
    } catch (error) {
      logger.warn('Failed to save recent colors to storage:', error);
    }
  }

  /**
   * Add a color to recent history
   */
  private addToRecentColors(hex: string): void {
    // Normalize hex to uppercase
    const normalizedHex = hex.toUpperCase();

    // Remove if already exists (to move to front)
    this.recentColors = this.recentColors.filter((c) => c.hex.toUpperCase() !== normalizedHex);

    // Add to front
    this.recentColors.unshift({
      hex: normalizedHex,
      timestamp: Date.now(),
    });

    // Trim to max size
    if (this.recentColors.length > this.maxRecentColors) {
      this.recentColors = this.recentColors.slice(0, this.maxRecentColors);
    }

    // Save and re-render
    this.saveRecentColors();
    this.renderRecentColors();
  }

  /**
   * Clear all recent colors
   */
  private clearRecentColors(): void {
    this.recentColors = [];
    this.saveRecentColors();
    this.renderRecentColors();
    AnnouncerService.announce('Recent colors cleared');
  }

  /**
   * Render the recent colors UI
   */
  private renderRecentColors(): void {
    const section = this.querySelector<HTMLElement>('#recent-colors-section');
    const container = this.querySelector<HTMLElement>('#recent-colors-container');
    if (!section || !container) return;

    // Clear existing content
    clearContainer(container);

    // Hide section if no recent colors
    if (this.recentColors.length === 0) {
      section.style.display = 'none';
      return;
    }

    // Show section
    section.style.display = 'block';

    // Render swatches
    this.recentColors.forEach((color, index) => {
      const swatch = this.createElement('button', {
        className:
          'w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer ' +
          'hover:scale-110 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
          'transition-transform',
        attributes: {
          style: `background-color: ${color.hex};`,
          title: `${color.hex} - Click to re-match`,
          'aria-label': `Recent color ${color.hex}, click to match`,
          'data-recent-index': String(index),
        },
      });

      // Click to re-match
      this.on(swatch, 'click', () => {
        this.matchColor(color.hex);
        AnnouncerService.announce(`Re-matching color ${color.hex}`);
      });

      container.appendChild(swatch);
    });

    // Add clear button
    const clearBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 ' +
        'hover:bg-red-50 hover:border-red-300 hover:text-red-600 ' +
        'dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400 ' +
        'transition-colors ml-2',
      textContent: LanguageService.t('matcher.clearHistory') || 'Clear',
      attributes: {
        title: 'Clear recent colors history',
        'aria-label': 'Clear recent colors history',
      },
    });

    this.on(clearBtn, 'click', () => {
      this.clearRecentColors();
    });

    container.appendChild(clearBtn);
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      matchedDyeCount: this.matchedDyes.length,
      sampleSize: this.sampleSize,
      recentColorsCount: this.recentColors.length,
    };
  }

  /**
   * Cleanup child components
   */
  destroy(): void {
    if (this.imageUpload) {
      this.imageUpload.destroy();
    }
    if (this.colorPicker) {
      this.colorPicker.destroy();
    }
    if (this.marketBoard) {
      this.marketBoard.destroy();
    }
    super.destroy();
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText =
        'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    toast.style.cssText = `
      background-color: ${bgColor};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
    `;

    toast.textContent = `${icon} ${message}`;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        toast.remove();
        if (toastContainer && toastContainer.children.length === 0) {
          toastContainer.remove();
        }
      }, 300);
    }, 3000);

    // Allow manual dismiss on click
    toast.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        toast.remove();
        if (toastContainer && toastContainer.children.length === 0) {
          toastContainer.remove();
        }
      }, 300);
    });
  }
}

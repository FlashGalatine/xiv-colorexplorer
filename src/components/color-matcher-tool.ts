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
import { ColorService, dyeService, APIService } from '@services/index';
import type { Dye, PriceData } from '@shared/types';

/**
 * Color Matcher Tool Component
 * Match colors to the closest FFXIV dyes
 */
export class ColorMatcherTool extends BaseComponent {
  private imageUpload: ImageUploadDisplay | null = null;
  private colorPicker: ColorPickerDisplay | null = null;
  private marketBoard: MarketBoard | null = null;
  private dyeFilters: DyeFilters | null = null;
  private matchedDyes: Dye[] = [];
  private priceData: Map<number, PriceData> = new Map();
  private showPrices: boolean = false;
  private sampleSize: number = 5;
  private zoomLevel: number = 100;
  private currentImage: HTMLImageElement | null = null;

  /**
   * Render the tool component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-8',
    });

    // Title
    const title = this.createElement('div', {
      className: 'space-y-2',
    });

    const heading = this.createElement('h2', {
      textContent: 'Color Matcher',
      className: 'text-3xl font-bold text-gray-900 dark:text-white',
    });

    const subtitle = this.createElement('p', {
      textContent:
        'Upload an image or select a color to find the closest matching FFXIV dyes. Use the eyedropper to sample colors directly from images.',
      className: 'text-gray-600 dark:text-gray-300',
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
      textContent: 'Image Upload',
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
      textContent: 'Manual Color Input',
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
      textContent: 'Sample Settings',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    settingsSection.appendChild(settingsTitle);

    // Sample size slider
    const sampleDiv = this.createElement('div', {
      className: 'space-y-2',
    });

    const sampleLabel = this.createElement('label', {
      textContent: 'Sample Size (for image color averaging)',
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    });

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
      textContent: 'Larger sizes produce more accurate color matching but ignore fine details',
      className: 'text-xs text-gray-600 dark:text-gray-400',
    });

    sampleDiv.appendChild(sampleLabel);
    sampleDiv.appendChild(sampleContainer);
    sampleDiv.appendChild(sampleHint);
    settingsSection.appendChild(sampleDiv);

    wrapper.appendChild(settingsSection);

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

    this.container.innerHTML = '';
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
        console.error('Image upload error:', customEvent.detail);
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
          // Re-match color if we have a current match
          if (this.matchedDyes.length > 0) {
            const lastColor = this.matchedDyes[0]?.hex || '#FF0000';
            this.matchColor(lastColor);
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
          this.fetchPricesForMatchedDyes();
        } else {
          this.priceData.clear();
          this.refreshResults();
        }
      });

      marketBoardContainer.addEventListener('server-changed', () => {
        if (this.showPrices && this.matchedDyes.length > 0) {
          this.fetchPricesForMatchedDyes();
        }
      });

      marketBoardContainer.addEventListener('categories-changed', () => {
        if (this.showPrices && this.matchedDyes.length > 0) {
          this.fetchPricesForMatchedDyes();
        }
      });

      marketBoardContainer.addEventListener('refresh-requested', () => {
        if (this.showPrices && this.matchedDyes.length > 0) {
          this.fetchPricesForMatchedDyes();
        }
      });

      // Get initial showPrices state
      this.showPrices = this.marketBoard.getShowPrices();
    }
  }

  /**
   * Show image overlay for eyedropper
   */
  private showImageOverlay(image: HTMLImageElement): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    // Store current image for zoom interactions
    this.currentImage = image;
    this.zoomLevel = 100;

    const section = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    const sectionTitle = this.createElement('h3', {
      textContent: 'Image Color Picker',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-2',
    });
    section.appendChild(sectionTitle);

    const hint = this.createElement('p', {
      textContent:
        'Click on the image to sample a color. Drag to sample a region. Use the zoom controls or hold Shift + scroll to adjust view.',
      className: 'text-sm text-gray-600 dark:text-gray-400',
    });
    section.appendChild(hint);

    const privacyNotice = this.createElement('p', {
      innerHTML:
        '🔒 <strong>Privacy:</strong> Images never leave your browser. All processing happens locally (<a class="underline" href="https://github.com/FlashGalatine/xivdyetools/blob/main/docs/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy Guide</a>).',
      className: 'text-xs text-gray-500 dark:text-gray-400 mb-4',
    });
    section.appendChild(privacyNotice);

    // Create zoom controls container
    const zoomControls = this.createElement('div', {
      className: 'flex flex-wrap gap-2 mb-4',
    });

    // Fit button
    const fitBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
      textContent: '📐 Fit',
      attributes: {
        title: 'Fit image to container',
        id: 'zoom-fit-btn',
      },
    });
    zoomControls.appendChild(fitBtn);

    // Width button
    const widthBtn = this.createElement('button', {
      className:
        'px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ' +
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
      textContent: '↔️ Width',
      attributes: {
        title: 'Zoom to width',
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
      textContent: '↺ Reset',
      attributes: {
        title: 'Reset zoom to 100%',
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

    // Image interaction
    this.setupImageInteraction(canvas, image);

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

      if (this.colorPicker) {
        this.colorPicker.setColorFromImage(canvas, centerX, centerY, Math.max(1, size));
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

    const updateZoom = (newZoom: number): void => {
      this.zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      const scale = this.zoomLevel / 100;

      // Update canvas size
      canvas.style.transform = `scale(${scale})`;
      canvas.style.transformOrigin = 'top left';
      canvas.style.cursor = this.zoomLevel > 100 ? 'move' : 'crosshair';

      // Update display
      zoomDisplay.textContent = `${this.zoomLevel}%`;

      // Update button states
      zoomOutBtn.setAttribute('disabled', this.zoomLevel <= MIN_ZOOM ? 'true' : 'false');
      zoomInBtn.setAttribute('disabled', this.zoomLevel >= MAX_ZOOM ? 'true' : 'false');

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
      const containerWidth = canvasContainer.clientWidth - 16; // Account for padding
      const containerHeight = canvasContainer.clientHeight - 16;
      const imageWidth = image.width;
      const imageHeight = image.height;

      const zoomX = (containerWidth / imageWidth) * 100;
      const zoomY = (containerHeight / imageHeight) * 100;
      const newZoom = Math.min(zoomX, zoomY, 100); // Cap at 100% to avoid upscaling

      updateZoom(newZoom);
    };

    const zoomToWidth = (): void => {
      const containerWidth = canvasContainer.clientWidth - 16;
      const imageWidth = image.width;
      const newZoom = (containerWidth / imageWidth) * 100;

      updateZoom(Math.min(newZoom, 400)); // Still respect max zoom
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

    // Allow keyboard shortcuts
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (
        document.activeElement === document.body ||
        document.activeElement?.contains(canvasContainer)
      ) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          if (this.zoomLevel < MAX_ZOOM) {
            updateZoom(this.zoomLevel + 10);
          }
        } else if (e.key === '-') {
          e.preventDefault();
          if (this.zoomLevel > MIN_ZOOM) {
            updateZoom(this.zoomLevel - 10);
          }
        } else if (e.key === '0') {
          e.preventDefault();
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
    const closestDye = this.matchedDyes[0];
    const otherDyes = this.matchedDyes.slice(1);

    // Results section
    const section = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
    });
    section.setAttribute('data-results-section', 'true');

    const title = this.createElement('h3', {
      textContent: 'Matched Dyes',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    section.appendChild(title);

    // Best match
    const bestMatchSection = this.createElement('div', {
      className:
        'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-2',
    });

    const bestMatchLabel = this.createElement('div', {
      textContent: '🎯 Best Match',
      className: 'text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide',
    });
    bestMatchSection.appendChild(bestMatchLabel);

    const bestMatchCard = this.renderDyeCard(closestDye, closestDye.hex);
    bestMatchSection.appendChild(bestMatchCard);

    section.appendChild(bestMatchSection);

    // Other matches
    if (otherDyes.length > 0) {
      const otherMatchesSection = this.createElement('div', {
        className: 'space-y-2',
      });

      const otherLabel = this.createElement('div', {
        textContent: `Similar Dyes (${otherDyes.length} matches)`,
        className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
      });
      otherMatchesSection.appendChild(otherLabel);

      const matchesList = this.createElement('div', {
        className: 'space-y-2 max-h-80 overflow-y-auto',
      });

      for (const dye of otherDyes) {
        const dyeCard = this.renderDyeCard(dye, dye.hex);
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
        closestDye = filteredDyes.length > 0
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
        textContent: 'No matching dyes found',
      });
      resultsContainer.appendChild(empty);
      return;
    }

    // Results section
    const section = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
    });
    section.setAttribute('data-results-section', 'true');

    const title = this.createElement('h3', {
      textContent: 'Matched Dyes',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    section.appendChild(title);

    // Best match
    const bestMatchSection = this.createElement('div', {
      className:
        'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-2',
    });

    const bestMatchLabel = this.createElement('div', {
      textContent: '🎯 Best Match',
      className: 'text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide',
    });
    bestMatchSection.appendChild(bestMatchLabel);

    const bestMatchCard = this.renderDyeCard(closestDye, hex);
    bestMatchSection.appendChild(bestMatchCard);

    section.appendChild(bestMatchSection);

    // Other matches
    if (withinDistance.length > 0) {
      const otherMatchesSection = this.createElement('div', {
        className: 'space-y-2',
      });

      const otherLabel = this.createElement('div', {
        textContent: `Similar Dyes (${withinDistance.length} matches within distance 100)`,
        className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
      });
      otherMatchesSection.appendChild(otherLabel);

      const matchesList = this.createElement('div', {
        className: 'space-y-2 max-h-80 overflow-y-auto',
      });

      for (const dye of withinDistance) {
        const dyeCard = this.renderDyeCard(dye, hex);
        matchesList.appendChild(dyeCard);
      }

      otherMatchesSection.appendChild(matchesList);
      section.appendChild(otherMatchesSection);
    }

    resultsContainer.appendChild(section);

    this.matchedDyes = [closestDye, ...withinDistance];

    // Fetch prices if enabled
    if (this.showPrices && this.marketBoard) {
      this.fetchPricesForMatchedDyes();
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
      className: 'w-8 h-8 rounded border-2 border-gray-400 dark:border-gray-500',
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
      textContent: dye.name,
      className: 'font-semibold text-gray-900 dark:text-white truncate',
    });

    const distance = ColorService.getColorDistance(sampledColor, dye.hex);
    const distanceText = this.createElement('div', {
      textContent: `Distance: ${distance.toFixed(1)}`,
      className: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
    });

    info.appendChild(name);
    info.appendChild(distanceText);
    card.appendChild(info);

    // Category badge
    const category = this.createElement('div', {
      textContent: dye.category,
      className:
        'text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-medium',
    });
    card.appendChild(category);

    // Copy Hex button
    const copyButton = this.createElement('button', {
      textContent: 'Copy Hex',
      className:
        'px-2 py-1 text-xs font-medium rounded transition-colors border cursor-pointer',
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
      } catch (error) {
        // Fallback for older browsers
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
        priceValue.innerHTML = APIService.formatPrice(price.currentAverage);
        const priceLabel = this.createElement('div', {
          textContent: 'market',
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

    return card;
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      matchedDyeCount: this.matchedDyes.length,
      sampleSize: this.sampleSize,
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

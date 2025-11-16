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
import { ColorDisplay } from './color-display';
import { ColorService, dyeService } from '@services/index';
import type { Dye } from '@shared/types';

/**
 * Color Matcher Tool Component
 * Match colors to the closest FFXIV dyes
 */
export class ColorMatcherTool extends BaseComponent {
  private imageUpload: ImageUploadDisplay | null = null;
  private colorPicker: ColorPickerDisplay | null = null;
  private matchedDyes: Dye[] = [];
  private sampleSize: number = 5;

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
      className: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
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
      className: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
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
      className: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
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
      className: 'flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
      attributes: {
        type: 'range',
        min: '1',
        max: '64',
        value: String(this.sampleSize),
        id: 'sample-size-input',
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
  bindEvents(): void {
    const imageUploadContainer = this.querySelector<HTMLElement>('#image-upload-container');
    const colorPickerContainer = this.querySelector<HTMLElement>('#color-picker-container');
    const sampleInput = this.querySelector<HTMLInputElement>('#sample-size-input');

    // Initialize image upload
    if (imageUploadContainer && !this.imageUpload) {
      this.imageUpload = new ImageUploadDisplay(imageUploadContainer);
      this.imageUpload.init();

      imageUploadContainer.addEventListener('image-loaded', (event: Event) => {
        const customEvent = event as CustomEvent;
        const { image } = customEvent.detail;

        // Show overlay for image interaction
        this.showImageOverlay(image);
      });

      imageUploadContainer.addEventListener('error', (event: Event) => {
        const customEvent = event as CustomEvent;
        console.error('Image upload error:', customEvent.detail);
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
  }

  /**
   * Show image overlay for eyedropper
   */
  private showImageOverlay(image: HTMLImageElement): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    const section = this.createElement('div', {
      className: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    const sectionTitle = this.createElement('h3', {
      textContent: 'Image Color Picker',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-2',
    });
    section.appendChild(sectionTitle);

    const hint = this.createElement('p', {
      textContent: 'Click on the image to sample a color. Drag to sample a region.',
      className: 'text-sm text-gray-600 dark:text-gray-400 mb-4',
    });
    section.appendChild(hint);

    // Create canvas for image display
    const canvas = this.createElement('canvas', {
      className: 'w-full rounded-lg border border-gray-300 dark:border-gray-600 cursor-crosshair',
      attributes: {
        width: String(image.width),
        height: String(image.height),
      },
    });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(image, 0, 0);
    }

    section.appendChild(canvas);

    // Image interaction
    this.setupImageInteraction(canvas, image);

    resultsContainer.appendChild(section);
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
   * Match a color to dyes
   */
  private matchColor(hex: string): void {
    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    // Find closest dyes
    const closestDye = dyeService.findClosestDye(hex);
    const withinDistance = dyeService.findDyesWithinDistance(hex, 100, 10);

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
      className: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
    });

    const title = this.createElement('h3', {
      textContent: 'Matched Dyes',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    section.appendChild(title);

    // Best match
    const bestMatchSection = this.createElement('div', {
      className: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-2',
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
  }

  /**
   * Render dye card
   */
  private renderDyeCard(dye: Dye, sampledColor: string): HTMLElement {
    const card = this.createElement('div', {
      className: 'flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
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
      className: 'text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-medium',
    });
    card.appendChild(category);

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
    super.destroy();
  }
}

/**
 * XIV Dye Tools v2.2.0 - Dye Preview Overlay Component
 *
 * Shows a visual comparison overlay on the canvas when hovering dye suggestions
 * Displays sampled color vs suggested dye color at the sample point
 *
 * @module components/dye-preview-overlay
 */

import { BaseComponent } from './base-component';
import type { Dye } from '@shared/types';
import { LanguageService } from '@services/index';

// ============================================================================
// Overlay Configuration
// ============================================================================

interface PreviewConfig {
  sampledColor: string;
  sampledPosition: { x: number; y: number };
  dye: Dye;
}

// ============================================================================
// Dye Preview Overlay Component
// ============================================================================

/**
 * Preview overlay showing sampled vs dye color comparison
 */
export class DyePreviewOverlay extends BaseComponent {
  private overlayElement: HTMLElement | null = null;
  private canvasContainer: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(container: HTMLElement) {
    super(container);
  }

  /**
   * Set the canvas container reference for positioning
   */
  setCanvasContainer(canvasContainer: HTMLElement, canvas: HTMLCanvasElement): void {
    this.canvasContainer = canvasContainer;
    this.canvas = canvas;
  }

  /**
   * Show the preview overlay at the sample position
   */
  showPreview(config: PreviewConfig): void {
    this.hidePreview(); // Clear any existing overlay

    if (!this.canvasContainer || !this.canvas) return;

    // Get canvas bounding rect - this already accounts for CSS transforms (scale)
    // and scroll position within any parent containers
    const canvasRect = this.canvas.getBoundingClientRect();

    // Calculate scale factor from CSS transform: scale()
    // canvasRect.width = visual size after transform
    // canvas.width = native canvas pixel size
    const scaleX = canvasRect.width / this.canvas.width;
    const scaleY = canvasRect.height / this.canvas.height;

    // Convert canvas coordinates to visual offset from canvas top-left
    const visualOffsetX = config.sampledPosition.x * scaleX;
    const visualOffsetY = config.sampledPosition.y * scaleY;

    // Calculate screen position:
    // canvasRect.left/top is already the canvas's position on screen (accounting for scroll)
    // Add the visual offset to get the sample point's screen position
    const screenX = canvasRect.left + visualOffsetX;
    const screenY = canvasRect.top + visualOffsetY;

    // Create overlay element
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'dye-preview-overlay fixed z-50 pointer-events-none';
    this.overlayElement.setAttribute('role', 'tooltip');
    this.overlayElement.setAttribute('aria-live', 'polite');

    // Position near the sample point (offset to not cover it)
    const offsetX = 20;
    const offsetY = -60;

    // Ensure overlay stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const overlayWidth = 160;
    const overlayHeight = 80;

    let left = screenX + offsetX;
    let top = screenY + offsetY;

    // Adjust if would overflow right
    if (left + overlayWidth > viewportWidth - 10) {
      left = screenX - overlayWidth - offsetX;
    }

    // Adjust if would overflow top
    if (top < 10) {
      top = screenY + 20;
    }

    // Adjust if would overflow bottom
    if (top + overlayHeight > viewportHeight - 10) {
      top = viewportHeight - overlayHeight - 10;
    }

    this.overlayElement.style.cssText = `
      left: ${left}px;
      top: ${top}px;
      transform: translateY(0);
      opacity: 0;
      transition: opacity 150ms ease-in-out;
    `;

    // Create overlay content
    const content = this.createOverlayContent(config);
    this.overlayElement.appendChild(content);

    // Add connecting line to sample point
    const connector = this.createConnectorLine(screenX, screenY, left, top + overlayHeight / 2);
    this.overlayElement.appendChild(connector);

    // Add to body
    document.body.appendChild(this.overlayElement);

    // Trigger animation
    requestAnimationFrame(() => {
      if (this.overlayElement) {
        this.overlayElement.style.opacity = '1';
      }
    });
  }

  /**
   * Hide the preview overlay
   */
  hidePreview(): void {
    if (this.overlayElement) {
      this.overlayElement.style.opacity = '0';
      const element = this.overlayElement;
      setTimeout(() => {
        element.remove();
      }, 150);
      this.overlayElement = null;
    }
  }

  /**
   * Create the overlay content with color comparison
   */
  private createOverlayContent(config: PreviewConfig): HTMLElement {
    const container = document.createElement('div');
    container.className = `
      bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
      p-3 min-w-[150px]
    `
      .replace(/\s+/g, ' ')
      .trim();

    // Header with magnifying glass icon and description
    const header = document.createElement('div');
    header.className =
      'flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200 dark:border-gray-600';
    header.innerHTML = `
      <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <span class="text-xs font-medium text-gray-600 dark:text-gray-300">${LanguageService.t('matcher.samplePreview') || 'Sample Point Preview'}</span>
    `;
    container.appendChild(header);

    // Color comparison swatches
    const swatchRow = document.createElement('div');
    swatchRow.className = 'flex items-center gap-2 mb-2';

    // Sampled color
    const sampledSwatch = document.createElement('div');
    sampledSwatch.className = 'flex-1 text-center';
    sampledSwatch.innerHTML = `
      <div class="w-10 h-10 mx-auto rounded border border-gray-300 dark:border-gray-600 shadow-inner"
           style="background-color: ${config.sampledColor}"></div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${LanguageService.t('matcher.sampled') || 'Sampled'}</div>
    `;

    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'text-gray-400 dark:text-gray-500';
    arrow.textContent = '→';

    // Dye color - use localized name
    const localizedDyeName = LanguageService.getDyeName(config.dye.itemID) || config.dye.name;
    const dyeSwatch = document.createElement('div');
    dyeSwatch.className = 'flex-1 text-center';
    dyeSwatch.innerHTML = `
      <div class="w-10 h-10 mx-auto rounded border-2 border-gray-400 dark:border-gray-500 shadow-inner"
           style="background-color: ${config.dye.hex}"></div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title="${localizedDyeName}">${localizedDyeName}</div>
    `;

    swatchRow.appendChild(sampledSwatch);
    swatchRow.appendChild(arrow);
    swatchRow.appendChild(dyeSwatch);
    container.appendChild(swatchRow);

    // Hex comparison
    const hexRow = document.createElement('div');
    hexRow.className = 'text-xs text-center font-mono text-gray-600 dark:text-gray-400';
    hexRow.textContent = `${config.sampledColor} → ${config.dye.hex}`;
    container.appendChild(hexRow);

    return container;
  }

  /**
   * Create a visual connector line from overlay to sample point
   */
  private createConnectorLine(
    targetX: number,
    targetY: number,
    overlayX: number,
    overlayY: number
  ): HTMLElement {
    const connector = document.createElement('div');
    connector.className = 'absolute pointer-events-none';

    // Calculate line properties
    const dx = targetX - overlayX;
    const dy = targetY - overlayY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    connector.style.cssText = `
      position: fixed;
      left: ${overlayX}px;
      top: ${overlayY}px;
      width: ${length}px;
      height: 2px;
      background: linear-gradient(to right, rgba(59, 130, 246, 0.5), transparent);
      transform-origin: left center;
      transform: rotate(${angle}deg);
    `;

    // Add dot at sample point
    const dot = document.createElement('div');
    dot.className = 'absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg';
    dot.style.cssText = `
      position: fixed;
      left: ${targetX - 6}px;
      top: ${targetY - 6}px;
      animation: pulse 1.5s ease-in-out infinite;
    `;

    // Return just the dot (simpler visual)
    return dot;
  }

  /**
   * Render implementation (BaseComponent requirement)
   */
  render(): void {
    // Overlay is created dynamically, nothing to render statically
  }

  /**
   * Bind events implementation (BaseComponent requirement)
   */
  bindEvents(): void {
    // Events are handled externally
  }

  /**
   * Cleanup on destroy
   */
  onUnmount(): void {
    this.hidePreview();
  }
}

// ============================================================================
// CSS for overlay animations (add to globals.css)
// ============================================================================

// Add this CSS to globals.css:
// @keyframes pulse {
//   0%, 100% { transform: scale(1); opacity: 1; }
//   50% { transform: scale(1.2); opacity: 0.8; }
// }

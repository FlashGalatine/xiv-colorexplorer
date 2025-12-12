/**
 * XIV Dye Tools v3.0.0 - Mixer Tool Component
 *
 * Phase 6: Dye Mixer migration to v3 two-panel layout.
 * Orchestrates color interpolation between two dyes with intermediate matches.
 *
 * Left Panel: Start/End dye selectors, steps slider, color space toggle, filters, market board
 * Right Panel: Gradient preview, intermediate dye matches, export options
 *
 * @module components/tools/mixer-tool
 */

import { BaseComponent } from '@components/base-component';
import { CollapsiblePanel } from '@components/collapsible-panel';
import { DyeSelector } from '@components/dye-selector';
import { DyeFilters } from '@components/dye-filters';
import { MarketBoard } from '@components/market-board';
import { ColorService, dyeService, LanguageService, StorageService, ToastService } from '@services/index';
import { ICON_TOOL_MIXER } from '@shared/tool-icons';
import { logger } from '@shared/logger';
import { clearContainer } from '@shared/utils';
import type { Dye } from '@shared/types';

// ============================================================================
// Types and Constants
// ============================================================================

export interface MixerToolOptions {
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
  drawerContent?: HTMLElement | null;
}

/**
 * Interpolation step with dye match
 */
interface InterpolationStep {
  position: number; // 0-1
  theoreticalColor: string;
  matchedDye: Dye | null;
  distance: number;
}

/**
 * Storage keys for v3 mixer tool
 */
const STORAGE_KEYS = {
  stepCount: 'v3_mixer_steps',
  colorSpace: 'v3_mixer_color_space',
} as const;

/**
 * Default values
 */
const DEFAULTS = {
  stepCount: 5,
  colorSpace: 'hsv' as const,
};

const ICON_FILTER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
</svg>`;

const ICON_MARKET = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>`;

const ICON_EXPORT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
</svg>`;

// ============================================================================
// MixerTool Component
// ============================================================================

/**
 * Mixer Tool - v3 Two-Panel Layout
 *
 * Creates smooth color transitions between two dyes with intermediate matches.
 */
export class MixerTool extends BaseComponent {
  private options: MixerToolOptions;

  // State
  private startDye: Dye | null = null;
  private endDye: Dye | null = null;
  private stepCount: number;
  private colorSpace: 'rgb' | 'hsv';
  private currentSteps: InterpolationStep[] = [];

  // Child components
  private startDyeSelector: DyeSelector | null = null;
  private endDyeSelector: DyeSelector | null = null;
  private dyeFilters: DyeFilters | null = null;
  private marketBoard: MarketBoard | null = null;
  private filtersPanel: CollapsiblePanel | null = null;
  private marketPanel: CollapsiblePanel | null = null;

  // DOM References
  private startDyeContainer: HTMLElement | null = null;
  private endDyeContainer: HTMLElement | null = null;
  private stepValueDisplay: HTMLElement | null = null;
  private emptyStateContainer: HTMLElement | null = null;
  private gradientContainer: HTMLElement | null = null;
  private matchesContainer: HTMLElement | null = null;
  private exportContainer: HTMLElement | null = null;

  // Subscriptions
  private languageUnsubscribe: (() => void) | null = null;

  constructor(container: HTMLElement, options: MixerToolOptions) {
    super(container);
    this.options = options;

    // Load persisted settings
    this.stepCount = StorageService.getItem<number>(STORAGE_KEYS.stepCount) ?? DEFAULTS.stepCount;
    this.colorSpace = StorageService.getItem<'rgb' | 'hsv'>(STORAGE_KEYS.colorSpace) ?? DEFAULTS.colorSpace;
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
    this.languageUnsubscribe = LanguageService.subscribe(() => {
      this.update();
    });
  }

  onMount(): void {
    logger.info('[MixerTool] Mounted');
  }

  destroy(): void {
    this.languageUnsubscribe?.();
    this.startDyeSelector?.destroy();
    this.endDyeSelector?.destroy();
    this.dyeFilters?.destroy();
    this.marketBoard?.destroy();
    this.filtersPanel?.destroy();
    this.marketPanel?.destroy();

    this.startDye = null;
    this.endDye = null;
    this.currentSteps = [];

    super.destroy();
    logger.info('[MixerTool] Destroyed');
  }

  // ============================================================================
  // Left Panel Rendering
  // ============================================================================

  private renderLeftPanel(): void {
    const left = this.options.leftPanel;
    clearContainer(left);

    // Section 1: Start Dye
    const startSection = this.createSection(LanguageService.t('mixer.startDye') || 'Start Dye');
    this.renderDyeSelector(startSection, 'start');
    left.appendChild(startSection);

    // Section 2: End Dye
    const endSection = this.createSection(LanguageService.t('mixer.endDye') || 'End Dye');
    this.renderDyeSelector(endSection, 'end');
    left.appendChild(endSection);

    // Section 3: Interpolation Settings
    const settingsSection = this.createSection(LanguageService.t('mixer.interpolationSettings') || 'Interpolation');
    this.renderSettings(settingsSection);
    left.appendChild(settingsSection);

    // Section 4: Dye Filters (collapsible)
    const filtersContainer = this.createElement('div');
    left.appendChild(filtersContainer);
    this.filtersPanel = new CollapsiblePanel(filtersContainer, {
      title: LanguageService.t('filters.title') || 'Dye Filters',
      storageKey: 'v3_mixer_filters',
      defaultOpen: false,
      icon: ICON_FILTER,
    });
    this.filtersPanel.init();

    const filtersContent = this.createElement('div');
    this.dyeFilters = new DyeFilters(filtersContent, {
      storageKeyPrefix: 'v3_mixer',
      onFilterChange: () => {
        this.updateInterpolation();
      },
    });
    this.dyeFilters.render();
    this.dyeFilters.bindEvents();
    this.filtersPanel.setContent(filtersContent);

    // Section 5: Market Board (collapsible)
    const marketContainer = this.createElement('div');
    left.appendChild(marketContainer);
    this.marketPanel = new CollapsiblePanel(marketContainer, {
      title: LanguageService.t('marketBoard.title') || 'Market Board',
      storageKey: 'v3_mixer_market',
      defaultOpen: false,
      icon: ICON_MARKET,
    });
    this.marketPanel.init();

    const marketContent = this.createElement('div');
    this.marketBoard = new MarketBoard(marketContent);
    this.marketBoard.init();
    this.marketPanel.setContent(marketContent);
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
   * Create a header for right panel sections
   */
  private createHeader(text: string): HTMLElement {
    return this.createElement('h3', {
      className: 'text-sm font-semibold uppercase tracking-wider mb-3',
      textContent: text,
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
  }

  /**
   * Render dye selector section (start or end)
   */
  private renderDyeSelector(container: HTMLElement, type: 'start' | 'end'): void {
    const dyeContainer = this.createElement('div', { className: 'space-y-3' });

    // Selected dye display
    const displayContainer = this.createElement('div', {
      className: 'selected-dye-display',
    });
    dyeContainer.appendChild(displayContainer);

    if (type === 'start') {
      this.startDyeContainer = displayContainer;
    } else {
      this.endDyeContainer = displayContainer;
    }

    this.updateDyeDisplay(type);

    // Dye selector component
    const selectorContainer = this.createElement('div', { className: 'mt-2' });
    dyeContainer.appendChild(selectorContainer);

    const selector = new DyeSelector(selectorContainer, {
      maxSelections: 1,
      allowMultiple: false,
      allowDuplicates: false,
      showCategories: true,
      showPrices: true,
      excludeFacewear: true,
      showFavorites: true,
      compactMode: true,
    });
    selector.init();

    // Store reference
    if (type === 'start') {
      this.startDyeSelector = selector;
    } else {
      this.endDyeSelector = selector;
    }

    // Listen for selection changes
    selectorContainer.addEventListener('selection-changed', () => {
      const selectedDyes = selector.getSelectedDyes();
      if (type === 'start') {
        this.startDye = selectedDyes[0] || null;
      } else {
        this.endDye = selectedDyes[0] || null;
      }
      this.updateDyeDisplay(type);
      this.updateInterpolation();
      this.updateDrawerContent();
    });

    container.appendChild(dyeContainer);
  }

  /**
   * Update the selected dye display
   */
  private updateDyeDisplay(type: 'start' | 'end'): void {
    const displayContainer = type === 'start' ? this.startDyeContainer : this.endDyeContainer;
    const dye = type === 'start' ? this.startDye : this.endDye;

    if (!displayContainer) return;
    clearContainer(displayContainer);

    if (!dye) {
      // Empty state - dashed border placeholder
      const placeholder = this.createElement('div', {
        className: 'p-3 rounded-lg border-2 border-dashed text-center text-sm',
        textContent: LanguageService.t('mixer.selectDye') || 'Select a dye',
        attributes: {
          style: 'border-color: var(--theme-border); color: var(--theme-text-muted);',
        },
      });
      displayContainer.appendChild(placeholder);
      return;
    }

    // Display selected dye card (matching mockup style)
    const card = this.createElement('div', {
      className: 'flex items-center gap-3 p-3 rounded-lg',
      attributes: { style: 'background: var(--theme-primary);' },
    });

    const swatch = this.createElement('div', {
      className: 'w-10 h-10 rounded border-2 border-white/30',
      attributes: { style: `background: ${dye.hex};` },
    });

    const info = this.createElement('div');
    const name = this.createElement('p', {
      className: 'font-medium',
      textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
      attributes: { style: 'color: var(--theme-text-header) !important;' },
    });
    const hex = this.createElement('p', {
      className: 'text-xs opacity-80 font-mono',
      textContent: dye.hex,
      attributes: { style: 'color: var(--theme-text-header) !important;' },
    });
    info.appendChild(name);
    info.appendChild(hex);

    card.appendChild(swatch);
    card.appendChild(info);
    displayContainer.appendChild(card);
  }

  /**
   * Render interpolation settings
   */
  private renderSettings(container: HTMLElement): void {
    const settingsContainer = this.createElement('div', { className: 'space-y-4' });

    // Steps slider
    const stepsGroup = this.createElement('div');
    const stepsLabel = this.createElement('label', {
      className: 'flex items-center justify-between text-sm mb-2',
    });
    const stepsText = this.createElement('span', {
      textContent: LanguageService.t('mixer.steps') || 'Steps',
      attributes: { style: 'color: var(--theme-text);' },
    });
    this.stepValueDisplay = this.createElement('span', {
      className: 'font-mono',
      textContent: String(this.stepCount),
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
    stepsLabel.appendChild(stepsText);
    stepsLabel.appendChild(this.stepValueDisplay);
    stepsGroup.appendChild(stepsLabel);

    const stepsInput = this.createElement('input', {
      className: 'w-full',
      attributes: {
        type: 'range',
        min: '2',
        max: '10',
        value: String(this.stepCount),
        style: 'accent-color: var(--theme-primary);',
      },
    }) as HTMLInputElement;

    this.on(stepsInput, 'input', () => {
      this.stepCount = parseInt(stepsInput.value, 10);
      if (this.stepValueDisplay) {
        this.stepValueDisplay.textContent = String(this.stepCount);
      }
      StorageService.setItem(STORAGE_KEYS.stepCount, this.stepCount);
      this.updateInterpolation();
      this.updateDrawerContent();
    });

    stepsGroup.appendChild(stepsInput);
    settingsContainer.appendChild(stepsGroup);

    // Color space toggle
    const colorSpaceGroup = this.createElement('div');
    const colorSpaceLabel = this.createElement('label', {
      className: 'block text-sm mb-2',
      textContent: LanguageService.t('mixer.colorSpace') || 'Color Space',
      attributes: { style: 'color: var(--theme-text);' },
    });
    colorSpaceGroup.appendChild(colorSpaceLabel);

    const buttonContainer = this.createElement('div', { className: 'flex gap-2' });

    const rgbBtn = this.createElement('button', {
      className: 'flex-1 px-3 py-2 text-sm rounded-lg transition-colors',
      textContent: 'RGB',
      attributes: {
        style: this.colorSpace === 'rgb'
          ? 'background: var(--theme-primary); color: var(--theme-text-header);'
          : 'background: var(--theme-background-secondary); color: var(--theme-text);',
      },
    });

    const hsvBtn = this.createElement('button', {
      className: 'flex-1 px-3 py-2 text-sm rounded-lg transition-colors',
      textContent: 'HSV',
      attributes: {
        style: this.colorSpace === 'hsv'
          ? 'background: var(--theme-primary); color: var(--theme-text-header);'
          : 'background: var(--theme-background-secondary); color: var(--theme-text);',
      },
    });

    this.on(rgbBtn, 'click', () => {
      this.colorSpace = 'rgb';
      StorageService.setItem(STORAGE_KEYS.colorSpace, 'rgb');
      rgbBtn.setAttribute('style', 'background: var(--theme-primary); color: var(--theme-text-header);');
      hsvBtn.setAttribute('style', 'background: var(--theme-background-secondary); color: var(--theme-text);');
      this.updateInterpolation();
      this.updateDrawerContent();
    });

    this.on(hsvBtn, 'click', () => {
      this.colorSpace = 'hsv';
      StorageService.setItem(STORAGE_KEYS.colorSpace, 'hsv');
      hsvBtn.setAttribute('style', 'background: var(--theme-primary); color: var(--theme-text-header);');
      rgbBtn.setAttribute('style', 'background: var(--theme-background-secondary); color: var(--theme-text);');
      this.updateInterpolation();
      this.updateDrawerContent();
    });

    buttonContainer.appendChild(rgbBtn);
    buttonContainer.appendChild(hsvBtn);
    colorSpaceGroup.appendChild(buttonContainer);
    settingsContainer.appendChild(colorSpaceGroup);

    container.appendChild(settingsContainer);
  }

  // ============================================================================
  // Right Panel Rendering
  // ============================================================================

  private renderRightPanel(): void {
    const right = this.options.rightPanel;
    clearContainer(right);

    // Empty state (shown when dyes not selected)
    this.emptyStateContainer = this.createElement('div');
    this.renderEmptyState();
    right.appendChild(this.emptyStateContainer);

    // Gradient Preview section
    const gradientSection = this.createElement('div', { className: 'mb-6 hidden' });
    gradientSection.appendChild(this.createHeader(LanguageService.t('mixer.interpolationPreview') || 'Interpolation Preview'));
    this.gradientContainer = this.createElement('div');
    gradientSection.appendChild(this.gradientContainer);
    right.appendChild(gradientSection);

    // Intermediate Matches section
    const matchesSection = this.createElement('div', { className: 'mb-6 hidden' });
    matchesSection.appendChild(this.createHeader(LanguageService.t('mixer.intermediateDyeMatches') || 'Intermediate Dye Matches'));
    this.matchesContainer = this.createElement('div');
    matchesSection.appendChild(this.matchesContainer);
    right.appendChild(matchesSection);

    // Export section
    this.exportContainer = this.createElement('div', { className: 'hidden' });
    right.appendChild(this.exportContainer);
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
      <span class="inline-block w-12 h-12 mx-auto mb-3 opacity-30" style="color: var(--theme-text);">${ICON_TOOL_MIXER}</span>
      <p style="color: var(--theme-text);">${LanguageService.t('mixer.selectStartEndDyes') || 'Select start and end dyes to create a color transition'}</p>
    `;

    this.emptyStateContainer.appendChild(empty);
  }

  /**
   * Update all results
   */
  private updateInterpolation(): void {
    if (!this.startDye || !this.endDye) {
      this.showEmptyState(true);
      this.currentSteps = [];
      return;
    }

    this.showEmptyState(false);
    this.calculateInterpolation();
    this.renderGradientPreview();
    this.renderIntermediateMatches();
    this.renderExportOptions();
  }

  /**
   * Show/hide empty state
   */
  private showEmptyState(show: boolean): void {
    if (this.emptyStateContainer) {
      this.emptyStateContainer.classList.toggle('hidden', !show);
    }

    // Toggle all result sections
    const rightPanel = this.options.rightPanel;
    const sections = rightPanel.querySelectorAll(':scope > div:not(:first-child)');
    sections.forEach((section) => {
      section.classList.toggle('hidden', show);
    });
  }

  /**
   * Calculate interpolation steps
   */
  private calculateInterpolation(): void {
    if (!this.startDye || !this.endDye) {
      this.currentSteps = [];
      return;
    }

    const result: InterpolationStep[] = [];
    const steps = this.stepCount;

    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1);

      let theoreticalColor: string;

      if (this.colorSpace === 'rgb') {
        // RGB interpolation (linear)
        const startRgb = ColorService.hexToRgb(this.startDye.hex);
        const endRgb = ColorService.hexToRgb(this.endDye.hex);

        const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * t);
        const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * t);
        const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * t);

        theoreticalColor = ColorService.rgbToHex(r, g, b);
      } else {
        // HSV interpolation (perceptual, with hue wraparound)
        const startHsv = ColorService.hexToHsv(this.startDye.hex);
        const endHsv = ColorService.hexToHsv(this.endDye.hex);

        // Handle hue wraparound
        let hueDiff = endHsv.h - startHsv.h;
        if (hueDiff > 180) hueDiff -= 360;
        if (hueDiff < -180) hueDiff += 360;

        const h = (startHsv.h + hueDiff * t + 360) % 360;
        const s = startHsv.s + (endHsv.s - startHsv.s) * t;
        const v = startHsv.v + (endHsv.v - startHsv.v) * t;

        theoreticalColor = ColorService.hsvToHex(h, s, v);
      }

      // Find closest dye (excluding start and end)
      const excludeIds = [this.startDye.id, this.endDye.id];
      let matchedDye = dyeService.findClosestDye(theoreticalColor, excludeIds);

      // Apply filters if available
      if (this.dyeFilters && matchedDye && this.dyeFilters.isDyeExcluded(matchedDye)) {
        // Find next closest non-excluded dye
        const allDyes = dyeService.getAllDyes();
        const filteredDyes = this.dyeFilters
          .filterDyes(allDyes)
          .filter((dye) => !excludeIds.includes(dye.id) && dye.category !== 'Facewear');
        matchedDye = filteredDyes.length > 0
          ? filteredDyes.reduce((best, dye) => {
              const bestDist = ColorService.getColorDistance(theoreticalColor, best.hex);
              const dyeDist = ColorService.getColorDistance(theoreticalColor, dye.hex);
              return dyeDist < bestDist ? dye : best;
            })
          : null;
      }

      const distance = matchedDye
        ? ColorService.getColorDistance(theoreticalColor, matchedDye.hex)
        : Infinity;

      result.push({
        position: t,
        theoreticalColor,
        matchedDye: matchedDye || null,
        distance: distance === Infinity ? 0 : distance,
      });
    }

    this.currentSteps = result;
  }

  /**
   * Render gradient preview with step markers
   */
  private renderGradientPreview(): void {
    if (!this.gradientContainer || !this.startDye || !this.endDye) return;
    clearContainer(this.gradientContainer);

    const card = this.createElement('div', {
      className: 'p-4 rounded-lg',
      attributes: { style: 'background: var(--theme-card-background); border: 1px solid var(--theme-border);' },
    });

    // Gradient bar
    const gradient = this.createElement('div', {
      className: 'h-16 rounded-lg mb-3',
      attributes: { style: `background: linear-gradient(to right, ${this.startDye.hex}, ${this.endDye.hex});` },
    });
    card.appendChild(gradient);

    // Step markers
    const markers = this.createElement('div', { className: 'flex justify-between' });
    for (let i = 0; i < this.currentSteps.length; i++) {
      const step = this.currentSteps[i];
      const marker = this.createElement('div', { className: 'text-center' });
      marker.innerHTML = `
        <div class="w-8 h-8 rounded mx-auto mb-1" style="background: ${step.theoreticalColor}; border: 1px solid var(--theme-border);"></div>
        <span class="text-xs font-mono" style="color: var(--theme-text-muted);">${i}</span>
      `;
      markers.appendChild(marker);
    }
    card.appendChild(markers);

    this.gradientContainer.appendChild(card);
  }

  /**
   * Render intermediate dye matches list
   */
  private renderIntermediateMatches(): void {
    if (!this.matchesContainer) return;
    clearContainer(this.matchesContainer);

    const container = this.createElement('div', { className: 'space-y-2' });

    // Only show intermediate steps (skip first and last which are the start/end dyes)
    for (let i = 1; i < this.currentSteps.length - 1; i++) {
      const step = this.currentSteps[i];
      const row = this.createElement('div', {
        className: 'flex items-center gap-3 p-3 rounded-lg',
        attributes: { style: 'background: var(--theme-card-background); border: 1px solid var(--theme-border);' },
      });

      // Step number
      const stepNum = this.createElement('span', {
        className: 'w-6 text-center font-medium',
        textContent: String(i),
        attributes: { style: 'color: var(--theme-text-muted);' },
      });
      row.appendChild(stepNum);

      // Theoretical color swatch
      const theoreticalSwatch = this.createElement('div', {
        className: 'w-10 h-10 rounded border',
        attributes: {
          style: `background: ${step.theoreticalColor}; border-color: var(--theme-border);`,
          title: LanguageService.t('mixer.targetColor') || 'Target',
        },
      });
      row.appendChild(theoreticalSwatch);

      // Arrow
      const arrow = this.createElement('span', {
        textContent: '\u2192',
        attributes: { style: 'color: var(--theme-text-muted);' },
      });
      row.appendChild(arrow);

      // Matched dye swatch
      if (step.matchedDye) {
        const matchedSwatch = this.createElement('div', {
          className: 'w-10 h-10 rounded',
          attributes: {
            style: `background: ${step.matchedDye.hex};`,
            title: LanguageService.t('mixer.bestMatch') || 'Best Match',
          },
        });
        row.appendChild(matchedSwatch);

        // Dye info
        const info = this.createElement('div', { className: 'flex-1' });
        const dyeName = this.createElement('p', {
          className: 'text-sm font-medium',
          textContent: LanguageService.getDyeName(step.matchedDye.itemID) || step.matchedDye.name,
          attributes: { style: 'color: var(--theme-text);' },
        });
        const distance = this.createElement('p', {
          className: 'text-xs',
          textContent: `${LanguageService.t('mixer.distance') || 'Distance'}: ${step.distance.toFixed(1)}`,
          attributes: { style: 'color: var(--theme-text-muted);' },
        });
        info.appendChild(dyeName);
        info.appendChild(distance);
        row.appendChild(info);
      } else {
        // No match found
        const noMatch = this.createElement('span', {
          className: 'text-sm italic',
          textContent: LanguageService.t('mixer.noMatchFound') || 'No match found',
          attributes: { style: 'color: var(--theme-text-muted);' },
        });
        row.appendChild(noMatch);
      }

      container.appendChild(row);
    }

    // If no intermediate steps (only 2 steps total)
    if (this.currentSteps.length <= 2) {
      const noSteps = this.createElement('div', {
        className: 'p-4 text-center text-sm',
        textContent: LanguageService.t('mixer.increaseSteps') || 'Increase steps to see intermediate matches',
        attributes: { style: 'color: var(--theme-text-muted);' },
      });
      container.appendChild(noSteps);
    }

    this.matchesContainer.appendChild(container);
  }

  /**
   * Render export options
   */
  private renderExportOptions(): void {
    if (!this.exportContainer) return;
    clearContainer(this.exportContainer);

    const card = this.createElement('div', {
      className: 'p-4 rounded-lg flex items-center justify-between',
      attributes: { style: 'background: var(--theme-card-background); border: 1px solid var(--theme-border);' },
    });

    const label = this.createElement('span', {
      className: 'text-sm font-medium',
      textContent: LanguageService.t('mixer.exportPalette') || 'Export Palette',
      attributes: { style: 'color: var(--theme-text);' },
    });
    card.appendChild(label);

    const buttonGroup = this.createElement('div', { className: 'flex gap-2' });

    // Copy button
    const copyBtn = this.createElement('button', {
      className: 'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
      attributes: { style: 'background: var(--theme-background-secondary); color: var(--theme-text);' },
    });
    const copyIcon = this.createElement('span', { className: 'w-4 h-4' });
    copyIcon.innerHTML = ICON_EXPORT;
    copyBtn.appendChild(copyIcon);
    copyBtn.appendChild(document.createTextNode(LanguageService.t('common.copy') || 'Copy'));

    this.on(copyBtn, 'click', () => this.copyPalette());
    buttonGroup.appendChild(copyBtn);

    // Download button
    const downloadBtn = this.createElement('button', {
      className: 'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
      attributes: { style: 'background: var(--theme-primary); color: var(--theme-text-header);' },
    });
    const downloadIcon = this.createElement('span', { className: 'w-4 h-4' });
    downloadIcon.innerHTML = ICON_EXPORT;
    downloadBtn.appendChild(downloadIcon);
    downloadBtn.appendChild(document.createTextNode(LanguageService.t('common.download') || 'Download'));

    this.on(downloadBtn, 'click', () => this.downloadPalette());
    buttonGroup.appendChild(downloadBtn);

    card.appendChild(buttonGroup);
    this.exportContainer.appendChild(card);
  }

  /**
   * Copy palette to clipboard
   */
  private copyPalette(): void {
    if (!this.startDye || !this.endDye) return;

    const lines: string[] = [
      `Start: ${this.startDye.name} (${this.startDye.hex})`,
      `End: ${this.endDye.name} (${this.endDye.hex})`,
      `Steps: ${this.stepCount}, Color Space: ${this.colorSpace.toUpperCase()}`,
      '',
      'Intermediate Matches:',
    ];

    for (let i = 1; i < this.currentSteps.length - 1; i++) {
      const step = this.currentSteps[i];
      if (step.matchedDye) {
        lines.push(`  ${i}. ${step.matchedDye.name} (${step.matchedDye.hex}) - Distance: ${step.distance.toFixed(1)}`);
      }
    }

    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => {
        ToastService.success(LanguageService.t('common.copied') || 'Copied to clipboard');
      })
      .catch(() => {
        ToastService.error(LanguageService.t('common.copyFailed') || 'Failed to copy');
      });
  }

  /**
   * Download palette as JSON
   */
  private downloadPalette(): void {
    if (!this.startDye || !this.endDye) return;

    const data = {
      startDye: { name: this.startDye.name, hex: this.startDye.hex, id: this.startDye.id },
      endDye: { name: this.endDye.name, hex: this.endDye.hex, id: this.endDye.id },
      stepCount: this.stepCount,
      colorSpace: this.colorSpace,
      intermediates: this.currentSteps.slice(1, -1).map((step, i) => ({
        index: i + 1,
        theoreticalColor: step.theoreticalColor,
        matchedDye: step.matchedDye ? {
          name: step.matchedDye.name,
          hex: step.matchedDye.hex,
          id: step.matchedDye.id,
        } : null,
        distance: step.distance,
      })),
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dye-gradient-${this.startDye.name}-to-${this.endDye.name}.json`;
    a.click();
    URL.revokeObjectURL(url);

    ToastService.success(LanguageService.t('common.downloaded') || 'Downloaded');
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

    // Dye swatches preview
    const preview = this.createElement('div', { className: 'flex items-center gap-2' });

    if (this.startDye) {
      const startSwatch = this.createElement('div', {
        className: 'w-8 h-8 rounded',
        attributes: {
          style: `background: ${this.startDye.hex};`,
          title: LanguageService.getDyeName(this.startDye.itemID) || this.startDye.name,
        },
      });
      preview.appendChild(startSwatch);
    } else {
      const placeholder = this.createElement('div', {
        className: 'w-8 h-8 rounded border-2 border-dashed',
        attributes: { style: 'border-color: var(--theme-border);' },
      });
      preview.appendChild(placeholder);
    }

    const arrow = this.createElement('span', {
      textContent: '\u2192',
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
    preview.appendChild(arrow);

    if (this.endDye) {
      const endSwatch = this.createElement('div', {
        className: 'w-8 h-8 rounded',
        attributes: {
          style: `background: ${this.endDye.hex};`,
          title: LanguageService.getDyeName(this.endDye.itemID) || this.endDye.name,
        },
      });
      preview.appendChild(endSwatch);
    } else {
      const placeholder = this.createElement('div', {
        className: 'w-8 h-8 rounded border-2 border-dashed',
        attributes: { style: 'border-color: var(--theme-border);' },
      });
      preview.appendChild(placeholder);
    }

    content.appendChild(preview);

    // Settings summary
    const summary = this.createElement('p', {
      className: 'text-sm',
      textContent: `${this.stepCount} ${LanguageService.t('mixer.steps') || 'steps'}, ${this.colorSpace.toUpperCase()}`,
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
    content.appendChild(summary);

    drawer.appendChild(content);
  }
}

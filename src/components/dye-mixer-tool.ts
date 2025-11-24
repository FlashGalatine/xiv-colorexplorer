/**
 * XIV Dye Tools v2.0.0 - Dye Mixer Tool Component
 *
 * Phase 12: Architecture Refactor
 * Main tool component for finding intermediate dyes in color transitions
 *
 * @module components/dye-mixer-tool
 */

import { BaseComponent } from './base-component';
import { DyeSelector } from './dye-selector';
import { ColorInterpolationDisplay } from './color-interpolation-display';
import type { InterpolationStep } from './color-interpolation-display';
import { DyeFilters } from './dye-filters';
import { PaletteExporter, type PaletteData } from './palette-exporter';
import { ColorService, dyeService } from '@services/index';
import type { Dye } from '@shared/types';
import { logger } from '@shared/logger';
import { clearContainer } from '@shared/utils';

/**
 * Dye Mixer Tool Component
 * Find intermediate dyes for smooth color transitions
 */
export class DyeMixerTool extends BaseComponent {
  private selectedDyes: Dye[] = [];
  private dyeSelector: DyeSelector | null = null;
  private dyeFilters: DyeFilters | null = null;
  private interpolationDisplay: ColorInterpolationDisplay | null = null;
  private stepCount: number = 10;
  private colorSpace: 'rgb' | 'hsv' = 'hsv';
  private currentSteps: InterpolationStep[] = [];
  private paletteExporter: PaletteExporter | null = null;

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
      textContent: 'Dye Mixer Tool',
      className: 'text-3xl font-bold text-gray-900 dark:text-white',
    });

    const subtitle = this.createElement('p', {
      textContent:
        'Find intermediate dyes for smooth color transitions. Select two dyes and see all the steps needed to transition between them.',
      className: 'text-gray-600 dark:text-gray-300',
    });

    title.appendChild(heading);
    title.appendChild(subtitle);
    wrapper.appendChild(title);

    // Dye selector section
    const selectorSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const selectorLabel = this.createElement('h3', {
      textContent: 'Select Start & End Dyes',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    selectorSection.appendChild(selectorLabel);

    const dyeSelectorContainer = this.createElement('div', {
      id: 'dye-selector-container',
    });
    selectorSection.appendChild(dyeSelectorContainer);

    wrapper.appendChild(selectorSection);

    // Dye Filters section
    const filtersSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const filtersContainer = this.createElement('div', {
      attributes: {
        id: 'dyemixer-filters-container',
      },
    });
    filtersSection.appendChild(filtersContainer);
    wrapper.appendChild(filtersSection);

    // Settings section
    const settingsSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
    });

    const settingsLabel = this.createElement('h3', {
      textContent: 'Interpolation Settings',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    settingsSection.appendChild(settingsLabel);

    // Step count setting
    const stepDiv = this.createElement('div', {
      className: 'space-y-2',
    });

    const stepLabel = this.createElement('label', {
      textContent: 'Interpolation Steps',
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    });

    const stepContainer = this.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const stepInput = this.createElement('input', {
      className:
        'flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none',
      attributes: {
        type: 'range',
        min: '2',
        max: '20',
        value: String(this.stepCount),
        id: 'step-count-input',
        style: 'accent-color: var(--theme-primary);',
      },
    });

    const stepValue = this.createElement('div', {
      textContent: String(this.stepCount),
      className: 'text-lg font-bold text-gray-900 dark:text-white w-12 text-center',
      attributes: {
        id: 'step-count-value',
      },
    });

    stepContainer.appendChild(stepInput);
    stepContainer.appendChild(stepValue);

    const stepHint = this.createElement('p', {
      textContent: 'More steps provide a smoother transition but may result in more repeated dyes',
      className: 'text-xs text-gray-600 dark:text-gray-400',
    });

    stepDiv.appendChild(stepLabel);
    stepDiv.appendChild(stepContainer);
    stepDiv.appendChild(stepHint);
    settingsSection.appendChild(stepDiv);

    // Color space setting
    const colorSpaceDiv = this.createElement('div', {
      className: 'space-y-2',
    });

    const colorSpaceLabel = this.createElement('label', {
      textContent: 'Color Space',
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    });

    const colorSpaceContainer = this.createElement('div', {
      className: 'flex gap-4',
    });

    const rgbLabel = this.createElement('label', {
      className: 'flex items-center gap-2 cursor-pointer',
    });

    const rgbRadio = this.createElement('input', {
      attributes: {
        type: 'radio',
        name: 'color-space',
        value: 'rgb',
        id: 'color-space-rgb',
      },
      className: 'w-4 h-4 border-gray-300 rounded focus:ring-blue-500',
    });

    const rgbText = this.createElement('span', {
      textContent: 'RGB (Linear)',
      className: 'text-sm text-gray-700 dark:text-gray-300',
    });

    rgbLabel.appendChild(rgbRadio);
    rgbLabel.appendChild(rgbText);

    const hsvLabel = this.createElement('label', {
      className: 'flex items-center gap-2 cursor-pointer',
    });

    const hsvRadio = this.createElement('input', {
      attributes: {
        type: 'radio',
        name: 'color-space',
        value: 'hsv',
        id: 'color-space-hsv',
        checked: 'checked',
      },
      className: 'w-4 h-4 border-gray-300 rounded focus:ring-blue-500',
    });

    const hsvText = this.createElement('span', {
      textContent: 'HSV (Perceptual)',
      className: 'text-sm text-gray-700 dark:text-gray-300',
    });

    hsvLabel.appendChild(hsvRadio);
    hsvLabel.appendChild(hsvText);

    colorSpaceContainer.appendChild(rgbLabel);
    colorSpaceContainer.appendChild(hsvLabel);

    const colorSpaceHint = this.createElement('p', {
      textContent:
        'HSV typically produces more natural-looking transitions. RGB is linear but more mathematically straightforward.',
      className: 'text-xs text-gray-600 dark:text-gray-400',
    });

    colorSpaceDiv.appendChild(colorSpaceLabel);
    colorSpaceDiv.appendChild(colorSpaceContainer);
    colorSpaceDiv.appendChild(colorSpaceHint);
    settingsSection.appendChild(colorSpaceDiv);

    wrapper.appendChild(settingsSection);

    // Interpolation display
    const displayContainer = this.createElement('div', {
      id: 'interpolation-display-container',
    });
    wrapper.appendChild(displayContainer);

    // Export section
    const exportContainer = this.createElement('div', {
      id: 'dyemixer-export-container',
    });
    wrapper.appendChild(exportContainer);

    // Quick Actions section
    const actionsSection = this.createElement('div', {
      className: 'mt-6 pt-6 border-t border-gray-200 dark:border-gray-700',
    });

    const actionsTitle = this.createElement('h3', {
      textContent: 'Quick Actions',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    actionsSection.appendChild(actionsTitle);

    const actionsContainer = this.createElement('div', {
      className: 'flex flex-col sm:flex-row gap-2',
    });

    const saveBtn = this.createElement('button', {
      id: 'save-gradient-btn',
      textContent: '💾 Save Gradient',
      className:
        'px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-semibold flex-1 min-h-[44px]',
    });

    const shareBtn = this.createElement('button', {
      id: 'copy-url-btn',
      textContent: '🔗 Copy Share URL',
      className:
        'px-4 py-3 rounded-lg transition-all duration-200 text-sm font-semibold flex-1 min-h-[44px]',
      attributes: {
        style: 'background-color: var(--theme-primary); color: var(--theme-text-header);',
      },
    });

    // Add hover effect with brightness filter
    shareBtn.addEventListener('mouseenter', () => {
      shareBtn.style.filter = 'brightness(0.9)';
    });
    shareBtn.addEventListener('mouseleave', () => {
      shareBtn.style.filter = '';
    });
    shareBtn.addEventListener('mousedown', () => {
      shareBtn.style.filter = 'brightness(0.8)';
    });
    shareBtn.addEventListener('mouseup', () => {
      shareBtn.style.filter = 'brightness(0.9)';
    });

    actionsContainer.appendChild(saveBtn);
    actionsContainer.appendChild(shareBtn);
    actionsSection.appendChild(actionsContainer);
    wrapper.appendChild(actionsSection);

    // Saved Gradients section
    const savedSection = this.createElement('div', {
      className: 'mt-6 pt-6 border-t border-gray-200 dark:border-gray-700',
    });

    const savedHeader = this.createElement('div', {
      className: 'flex items-center justify-between mb-4',
    });

    const savedTitle = this.createElement('h3', {
      textContent: 'Saved Gradients',
      className: 'text-lg font-semibold text-gray-900 dark:text-white',
    });

    const toggleBtn = this.createElement('button', {
      id: 'toggle-saved-gradients',
      textContent: '▼',
      className:
        'px-3 py-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400',
    });

    savedHeader.appendChild(savedTitle);
    savedHeader.appendChild(toggleBtn);
    savedSection.appendChild(savedHeader);

    const savedContainer = this.createElement('div', {
      id: 'saved-gradients-container',
      className: 'space-y-2',
      attributes: {
        style: 'max-height: 300px; overflow-y: auto; transition: max-height 0.3s ease-in-out;',
      },
    });
    savedSection.appendChild(savedContainer);

    const noSavedText = this.createElement('p', {
      id: 'no-saved-gradients-text',
      textContent: 'No saved gradients yet. Click "Save Gradient" to create one!',
      className: 'text-sm text-gray-500 dark:text-gray-400',
    });
    savedSection.appendChild(noSavedText);

    wrapper.appendChild(savedSection);

    clearContainer(this.container);
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const dyeSelectorContainer = this.querySelector<HTMLElement>('#dye-selector-container');

    // Initialize dye selector
    if (dyeSelectorContainer && !this.dyeSelector) {
      this.dyeSelector = new DyeSelector(dyeSelectorContainer, {
        maxSelections: 2,
        allowMultiple: true,
        showCategories: true,
        showPrices: true,
      });
      this.dyeSelector.init();

      // Listen for dye selection changes
      dyeSelectorContainer.addEventListener('selection-changed', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.selectedDyes = customEvent.detail?.selectedDyes || [];
        this.updateInterpolation();
      });
    }

    // Initialize DyeFilters component
    const filtersContainer = this.querySelector<HTMLElement>('#dyemixer-filters-container');
    if (filtersContainer && !this.dyeFilters) {
      this.dyeFilters = new DyeFilters(filtersContainer, {
        storageKeyPrefix: 'dyemixer',
        onFilterChange: () => {
          // Recalculate interpolation if we have selected dyes
          if (this.selectedDyes.length >= 2) {
            this.updateInterpolation();
          }
        },
      });
      this.dyeFilters.render();
      this.dyeFilters.bindEvents();
      this.dyeFilters.onMount();
    }

    // Step count slider
    const stepCountInput = this.querySelector<HTMLInputElement>('#step-count-input');
    const stepCountValue = this.querySelector<HTMLElement>('#step-count-value');

    if (stepCountInput) {
      this.on(stepCountInput, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        this.stepCount = parseInt(target.value, 10);
        if (stepCountValue) {
          stepCountValue.textContent = String(this.stepCount);
        }
        this.updateInterpolation();
      });
    }

    // Color space radio buttons
    const rgbRadio = this.querySelector<HTMLInputElement>('#color-space-rgb');
    const hsvRadio = this.querySelector<HTMLInputElement>('#color-space-hsv');

    if (rgbRadio) {
      this.on(rgbRadio, 'change', () => {
        this.colorSpace = 'rgb';
        this.updateInterpolation();
      });
    }

    if (hsvRadio) {
      this.on(hsvRadio, 'change', () => {
        this.colorSpace = 'hsv';
        this.updateInterpolation();
      });
    }

    // Save/Load button event listeners
    const saveBtn = this.querySelector<HTMLButtonElement>('#save-gradient-btn');
    const shareBtn = this.querySelector<HTMLButtonElement>('#copy-url-btn');
    const toggleBtn = this.querySelector<HTMLButtonElement>('#toggle-saved-gradients');

    if (saveBtn) {
      this.on(saveBtn, 'click', () => this.saveGradient());
    }

    if (shareBtn) {
      this.on(shareBtn, 'click', () => this.copyShareUrl());
    }

    if (toggleBtn) {
      this.on(toggleBtn, 'click', () => this.toggleSavedGradientsPanel());
    }

    // Load saved gradients on init
    this.displaySavedGradients();

    // Initialize PaletteExporter
    const exportContainer = this.querySelector<HTMLElement>('#dyemixer-export-container');
    if (exportContainer && !this.paletteExporter) {
      this.paletteExporter = new PaletteExporter(exportContainer, {
        title: 'Export Palette',
        dataProvider: () => this.getPaletteData(),
        enabled: () => this.selectedDyes.length >= 2 && this.currentSteps.length > 0,
      });
      this.paletteExporter.init();
    }
  }

  /**
   * Update interpolation display
   */
  private updateInterpolation(): void {
    const displayContainer = this.querySelector<HTMLElement>('#interpolation-display-container');
    if (!displayContainer) return;

    clearContainer(displayContainer);

    if (this.selectedDyes.length < 2) {
      const empty = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: 'Select 2 dyes to see interpolation',
      });
      displayContainer.appendChild(empty);
      this.currentSteps = []; // Clear steps
      // Update palette exporter
      if (this.paletteExporter) {
        this.paletteExporter.update();
      }
      return;
    }

    // Calculate interpolation
    const startDye = this.selectedDyes[0];
    const endDye = this.selectedDyes[1];

    const steps = this.calculateInterpolation(startDye, endDye, this.stepCount, this.colorSpace);
    this.currentSteps = steps; // Store steps for export

    // Create and render display component
    if (this.interpolationDisplay) {
      this.interpolationDisplay.destroy();
    }

    this.interpolationDisplay = new ColorInterpolationDisplay(
      displayContainer,
      startDye.hex,
      endDye.hex,
      steps,
      this.colorSpace
    );
    this.interpolationDisplay.init();

    // Update palette exporter
    if (this.paletteExporter) {
      this.paletteExporter.update();
    }
  }

  /**
   * Calculate interpolation steps
   */
  private calculateInterpolation(
    startDye: Dye,
    endDye: Dye,
    steps: number,
    colorSpace: 'rgb' | 'hsv'
  ): InterpolationStep[] {
    const result: InterpolationStep[] = [];

    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1); // Position 0-1

      let theoreticalColor: string;

      if (colorSpace === 'rgb') {
        // RGB interpolation (linear)
        const startRgb = ColorService.hexToRgb(startDye.hex);
        const endRgb = ColorService.hexToRgb(endDye.hex);

        const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * t);
        const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * t);
        const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * t);

        theoreticalColor = ColorService.rgbToHex(r, g, b);
      } else {
        // HSV interpolation (perceptual)
        const startHsv = ColorService.hexToHsv(startDye.hex);
        const endHsv = ColorService.hexToHsv(endDye.hex);

        // Handle hue wraparound
        let hueDiff = endHsv.h - startHsv.h;
        if (hueDiff > 180) hueDiff -= 360;
        if (hueDiff < -180) hueDiff += 360;

        const h = (startHsv.h + hueDiff * t + 360) % 360;
        const s = startHsv.s + (endHsv.s - startHsv.s) * t;
        const v = startHsv.v + (endHsv.v - startHsv.v) * t;

        theoreticalColor = ColorService.hsvToHex(h, s, v);
      }

      // Find closest dye (excluding the start and end dyes)
      const excludeIds = [startDye.id, endDye.id];
      let matchedDye = dyeService.findClosestDye(theoreticalColor, excludeIds);

      // Apply filters if available
      if (this.dyeFilters && matchedDye && this.dyeFilters.isDyeExcluded(matchedDye)) {
        // Find next closest non-excluded dye
        const allDyes = dyeService.getAllDyes();
        const filteredDyes = this.dyeFilters.filterDyes(allDyes).filter(
          (dye) => !excludeIds.includes(dye.id) && dye.category !== 'Facewear'
        );
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

    return result;
  }

  /**
   * Initialize the tool
   */
  onMount(): void {
    // Initialize components after mount
    setTimeout(() => {
      this.updateInterpolation();
    }, 100);
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      selectedDyeCount: this.selectedDyes.length,
      selectedDyeNames: this.selectedDyes.map((d) => d.name),
      stepCount: this.stepCount,
      colorSpace: this.colorSpace,
    };
  }

  /**
   * Get palette data for export
   */
  private getPaletteData(): PaletteData {
    const startDye = this.selectedDyes[0] || null;
    const endDye = this.selectedDyes[1] || null;

    // Extract matched dyes from steps
    const stepDyes = this.currentSteps
      .map((step) => step.matchedDye)
      .filter((dye): dye is Dye => dye !== null);

    return {
      base: startDye, // Use start as base
      groups: {
        end: endDye ? [endDye] : [],
        steps: stepDyes,
      },
      metadata: {
        stepCount: this.stepCount,
        colorSpace: this.colorSpace,
      },
    };
  }

  /**
   * Cleanup child components
   */
  destroy(): void {
    if (this.dyeSelector) {
      this.dyeSelector.destroy();
    }
    if (this.interpolationDisplay) {
      this.interpolationDisplay.destroy();
    }
    if (this.paletteExporter) {
      this.paletteExporter.destroy();
    }
    super.destroy();
  }

  /**
   * Save current gradient to localStorage
   */
  private saveGradient(): void {
    if (this.selectedDyes.length < 2) {
      this.showToast('Please select 2 dyes to save gradient', 'error');
      return;
    }

    const gradientName = prompt('Name your gradient (e.g., "Sunset Fade"):');
    if (!gradientName) return;

    const gradient = {
      name: gradientName,
      dye1Id: this.selectedDyes[0].id,
      dye1Name: this.selectedDyes[0].name,
      dye2Id: this.selectedDyes[1].id,
      dye2Name: this.selectedDyes[1].name,
      stepCount: this.stepCount,
      colorSpace: this.colorSpace,
      timestamp: new Date().toISOString(),
    };

    try {
      const savedGradients = JSON.parse(
        localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]'
      ) as (typeof gradient)[];
      savedGradients.push(gradient);
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(savedGradients));
      this.showToast(`✓ Gradient "${gradientName}" saved!`, 'success');
      this.displaySavedGradients();
    } catch (error) {
      logger.error('Error saving gradient:', error);
      this.showToast('Failed to save gradient', 'error');
    }
  }

  /**
   * Load a saved gradient
   */
  private loadSavedGradient(index: number): void {
    try {
      const savedGradients = JSON.parse(
        localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]'
      ) as Array<{
        name: string;
        dye1Id: number;
        dye2Id: number;
        stepCount: number;
        colorSpace: string;
      }>;

      if (!savedGradients[index]) {
        this.showToast('Gradient not found', 'error');
        return;
      }

      const gradient = savedGradients[index];

      // Find dyes by ID
      const dye1 = dyeService.getDyeById(gradient.dye1Id);
      const dye2 = dyeService.getDyeById(gradient.dye2Id);

      if (!dye1 || !dye2) {
        this.showToast('One or more dyes not found in database', 'error');
        return;
      }

      // Set selected dyes
      this.selectedDyes = [dye1, dye2];
      this.stepCount = gradient.stepCount || 10;
      this.colorSpace = (gradient.colorSpace as 'rgb' | 'hsv') || 'hsv';

      // Update UI
      if (this.dyeSelector) {
        this.dyeSelector.setSelectedDyes([dye1, dye2]);
      }

      // Update controls
      const stepInput = this.querySelector<HTMLInputElement>('input[type="range"]');
      if (stepInput) {
        stepInput.value = String(this.stepCount);
      }

      const colorSpaceInput = this.querySelector<HTMLInputElement>(
        `#color-space-${this.colorSpace}`
      );
      if (colorSpaceInput) {
        colorSpaceInput.checked = true;
      }

      this.updateInterpolation();
      this.showToast(`✓ Loaded gradient "${gradient.name}"`, 'success');
    } catch (error) {
      logger.error('Error loading gradient:', error);
      this.showToast('Failed to load gradient', 'error');
    }
  }

  /**
   * Delete a saved gradient
   */
  private deleteSavedGradient(index: number): void {
    try {
      const savedGradients = JSON.parse(
        localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]'
      ) as Array<{ name: string }>;

      if (!savedGradients[index]) {
        this.showToast('Gradient not found', 'error');
        return;
      }

      const gradientName = savedGradients[index].name;
      savedGradients.splice(index, 1);
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(savedGradients));
      this.showToast(`✓ Gradient "${gradientName}" deleted`, 'success');
      this.displaySavedGradients();
    } catch (error) {
      logger.error('Error deleting gradient:', error);
      this.showToast('Failed to delete gradient', 'error');
    }
  }

  /**
   * Display saved gradients
   */
  private displaySavedGradients(): void {
    const container = this.querySelector<HTMLElement>('#saved-gradients-container');
    const noText = this.querySelector<HTMLElement>('#no-saved-gradients-text');

    if (!container || !noText) return;

    try {
      const savedGradients = JSON.parse(
        localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]'
      ) as Array<{ name: string; dye1Name: string; dye2Name: string; timestamp: string }>;

      clearContainer(container);

      if (savedGradients.length === 0) {
        noText.style.display = 'block';
        return;
      }

      noText.style.display = 'none';

      for (let i = 0; i < savedGradients.length; i++) {
        const gradient = savedGradients[i];
        const item = this.createElement('div', {
          className:
            'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600',
        });

        const info = this.createElement('div');
        const name = this.createElement('div', {
          textContent: gradient.name,
          className: 'font-semibold text-sm text-gray-900 dark:text-white',
        });
        const dyes = this.createElement('div', {
          textContent: `${gradient.dye1Name} → ${gradient.dye2Name}`,
          className: 'text-xs text-gray-600 dark:text-gray-400',
        });
        info.appendChild(name);
        info.appendChild(dyes);
        item.appendChild(info);

        const actions = this.createElement('div', {
          className: 'flex gap-2',
        });

        const loadBtn = this.createElement('button', {
          textContent: '📂 Load',
          className:
            'px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition',
        });
        loadBtn.addEventListener('click', () => this.loadSavedGradient(i));

        const deleteBtn = this.createElement('button', {
          textContent: '🗑️ Delete',
          className: 'px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition',
        });
        deleteBtn.addEventListener('click', () => this.deleteSavedGradient(i));

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        item.appendChild(actions);
        container.appendChild(item);
      }
    } catch (error) {
      logger.error('Error displaying saved gradients:', error);
    }
  }

  /**
   * Toggle saved gradients panel visibility
   */
  private toggleSavedGradientsPanel(): void {
    const container = this.querySelector<HTMLElement>('#saved-gradients-container');
    const toggleBtn = this.querySelector<HTMLElement>('#toggle-saved-gradients');

    if (!container || !toggleBtn) return;

    const isHidden = container.style.maxHeight === '0px';
    if (isHidden) {
      container.style.maxHeight = '300px';
      toggleBtn.textContent = '▲';
    } else {
      container.style.maxHeight = '0px';
      toggleBtn.textContent = '▼';
    }
  }

  /**
   * Copy shareable URL to clipboard
   */
  private copyShareUrl(): void {
    if (this.selectedDyes.length < 2) {
      this.showToast('Please select 2 dyes to share', 'error');
      return;
    }

    const params = new URLSearchParams({
      dye1: String(this.selectedDyes[0].id),
      dye2: String(this.selectedDyes[1].id),
      steps: String(this.stepCount),
      colorSpace: this.colorSpace,
    });

    const url = `${window.location.origin}${window.location.pathname}?tool=dye-mixer&${params.toString()}`;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.showToast('✓ Share URL copied to clipboard!', 'success');
        logger.info('Share URL copied:', url);
      })
      .catch((error: Error) => {
        logger.error('Failed to copy URL:', error);
        this.showToast('Failed to copy URL. Please try again.', 'error');
      });
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

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
import { ColorService, dyeService } from '@services/index';
import type { Dye } from '@shared/types';

/**
 * Dye Mixer Tool Component
 * Find intermediate dyes for smooth color transitions
 */
export class DyeMixerTool extends BaseComponent {
  private selectedDyes: Dye[] = [];
  private dyeSelector: DyeSelector | null = null;
  private interpolationDisplay: ColorInterpolationDisplay | null = null;
  private stepCount: number = 10;
  private colorSpace: 'rgb' | 'hsv' = 'hsv';

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
        'flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
      attributes: {
        type: 'range',
        min: '2',
        max: '20',
        value: String(this.stepCount),
        id: 'step-count-input',
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

    // Quick Actions section
    const actionsSection = this.createElement('div', {
      className:
        'mt-6 pt-6 border-t border-gray-200 dark:border-gray-700',
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
        'px-4 py-3 text-white rounded-lg transition text-sm font-semibold flex-1 min-h-[44px]',
      attributes: {
        style: 'background-color: var(--theme-primary);',
      },
    });

    actionsContainer.appendChild(saveBtn);
    actionsContainer.appendChild(shareBtn);
    actionsSection.appendChild(actionsContainer);
    wrapper.appendChild(actionsSection);

    // Saved Gradients section
    const savedSection = this.createElement('div', {
      className:
        'mt-6 pt-6 border-t border-gray-200 dark:border-gray-700',
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

    this.container.innerHTML = '';
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
  }

  /**
   * Update interpolation display
   */
  private updateInterpolation(): void {
    const displayContainer = this.querySelector<HTMLElement>('#interpolation-display-container');
    if (!displayContainer) return;

    displayContainer.innerHTML = '';

    if (this.selectedDyes.length < 2) {
      const empty = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: 'Select 2 dyes to see interpolation',
      });
      displayContainer.appendChild(empty);
      return;
    }

    // Calculate interpolation
    const startDye = this.selectedDyes[0];
    const endDye = this.selectedDyes[1];

    const steps = this.calculateInterpolation(startDye, endDye, this.stepCount, this.colorSpace);

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
      const matchedDye = dyeService.findClosestDye(theoreticalColor, excludeIds);

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
   * Cleanup child components
   */
  destroy(): void {
    if (this.dyeSelector) {
      this.dyeSelector.destroy();
    }
    if (this.interpolationDisplay) {
      this.interpolationDisplay.destroy();
    }
    super.destroy();
  }

  /**
   * Save current gradient to localStorage
   */
  private saveGradient(): void {
    if (this.selectedDyes.length < 2) {
      console.info('Need 2 dyes to save gradient');
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
      ) as typeof gradient[];
      savedGradients.push(gradient);
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(savedGradients));
      console.info(`✓ Gradient "${gradientName}" saved!`);
      this.displaySavedGradients();
    } catch (error) {
      console.error('Error saving gradient:', error);
    }
  }

  /**
   * Load a saved gradient
   */
  private loadSavedGradient(index: number): void {
    try {
      const savedGradients = JSON.parse(
        localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]'
      ) as Array<{ dye1Id: number; dye2Id: number; stepCount: number; colorSpace: string }>;

      if (!savedGradients[index]) return;

      const gradient = savedGradients[index];

      // Find dyes by ID
      const dye1 = dyeService.getDyeById(gradient.dye1Id);
      const dye2 = dyeService.getDyeById(gradient.dye2Id);

      if (!dye1 || !dye2) {
        console.warn('One or more dyes from saved gradient not found');
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
    } catch (error) {
      console.error('Error loading gradient:', error);
    }
  }

  /**
   * Delete a saved gradient
   */
  private deleteSavedGradient(index: number): void {
    try {
      const savedGradients = JSON.parse(
        localStorage.getItem('xivdyetools_dyemixer_gradients') || '[]'
      ) as unknown[];
      savedGradients.splice(index, 1);
      localStorage.setItem('xivdyetools_dyemixer_gradients', JSON.stringify(savedGradients));
      this.displaySavedGradients();
    } catch (error) {
      console.error('Error deleting gradient:', error);
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

      container.innerHTML = '';

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
          className:
            'px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition',
        });
        deleteBtn.addEventListener('click', () => this.deleteSavedGradient(i));

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        item.appendChild(actions);
        container.appendChild(item);
      }
    } catch (error) {
      console.error('Error displaying saved gradients:', error);
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
      console.info('Need 2 dyes to share');
      return;
    }

    const params = new URLSearchParams({
      dye1: String(this.selectedDyes[0].id),
      dye2: String(this.selectedDyes[1].id),
      steps: String(this.stepCount),
      colorSpace: this.colorSpace,
    });

    const url = `${window.location.origin}${window.location.pathname}?tool=dye-mixer&${params.toString()}`;

    navigator.clipboard.writeText(url).then(() => {
      console.info('✓ Share URL copied to clipboard!');
    });
  }
}

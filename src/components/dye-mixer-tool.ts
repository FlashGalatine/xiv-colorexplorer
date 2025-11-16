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
      className: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
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
      className: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
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
      className: 'flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
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
      textContent: 'HSV typically produces more natural-looking transitions. RGB is linear but more mathematically straightforward.',
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
  private calculateInterpolation(startDye: Dye, endDye: Dye, steps: number, colorSpace: 'rgb' | 'hsv'): InterpolationStep[] {
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

      const distance = matchedDye ? ColorService.getColorDistance(theoreticalColor, matchedDye.hex) : Infinity;

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
}

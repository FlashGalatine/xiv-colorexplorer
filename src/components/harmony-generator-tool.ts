/**
 * XIV Dye Tools v2.0.0 - Harmony Generator Tool Component
 *
 * Phase 12: Architecture Refactor
 * Main tool component for color harmony generation
 *
 * @module components/harmony-generator-tool
 */

import { BaseComponent } from './base-component';
import { DyeSelector } from './dye-selector';
import { HarmonyType, type HarmonyTypeInfo } from './harmony-type';
import { ColorService, DyeService } from '@services/index';
import type { Dye } from '@shared/types';

/**
 * Harmony types with their descriptions
 */
const HARMONY_TYPES: HarmonyTypeInfo[] = [
  {
    id: 'complementary',
    name: 'Complementary',
    description: 'Colors opposite on the color wheel (180°)',
    icon: '🔄',
  },
  {
    id: 'analogous',
    name: 'Analogous',
    description: 'Colors adjacent on the color wheel (±30°)',
    icon: '➡️',
  },
  {
    id: 'triadic',
    name: 'Triadic',
    description: 'Three colors equally spaced on the wheel (120°)',
    icon: '🔺',
  },
  {
    id: 'split-complementary',
    name: 'Split-Complementary',
    description: 'Base + two colors ±30° from complement',
    icon: '⛓️',
  },
  {
    id: 'tetradic',
    name: 'Tetradic',
    description: 'Four colors in two pairs (90° apart)',
    icon: '🔶',
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Four colors evenly spaced (90° each)',
    icon: '⬜',
  },
];

/**
 * Harmony Generator Tool Component
 * Generates color harmony palettes from a base color
 */
export class HarmonyGeneratorTool extends BaseComponent {
  private baseColor: string = '#FF0000';
  private dyeSelector: DyeSelector | null = null;
  private harmonyDisplays: Map<string, HarmonyType> = new Map();
  private showPrices: boolean = false;
  private harmonyContainers: Map<string, HTMLElement> = new Map();

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
      textContent: 'Color Harmony Explorer',
      className: 'text-3xl font-bold text-gray-900 dark:text-white',
    });

    const subtitle = this.createElement('p', {
      textContent:
        'Discover harmonious color combinations using color theory. Select a base color to generate six classic harmony types.',
      className: 'text-gray-600 dark:text-gray-300',
    });

    title.appendChild(heading);
    title.appendChild(subtitle);
    wrapper.appendChild(title);

    // Input section
    const inputSection = this.renderInputSection();
    wrapper.appendChild(inputSection);

    // Options section
    const optionsSection = this.renderOptionsSection();
    wrapper.appendChild(optionsSection);

    // Harmony displays grid
    const harmoniesGrid = this.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    });

    for (const harmony of HARMONY_TYPES) {
      const container = this.createElement('div', {
        id: `harmony-${harmony.id}`,
      });
      this.harmonyContainers.set(harmony.id, container);
      harmoniesGrid.appendChild(container);
    }

    wrapper.appendChild(harmoniesGrid);

    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Render the input section
   */
  private renderInputSection(): HTMLElement {
    const section = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    const label = this.createElement('label', {
      textContent: 'Base Color',
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3',
    });
    section.appendChild(label);

    // Color input methods
    const inputMethods = this.createElement('div', {
      className: 'space-y-3',
    });

    // Hex input
    const hexInputDiv = this.createElement('div', {
      className: 'flex gap-2',
    });

    const hexInput = this.createElement('input', {
      attributes: {
        type: 'text',
        placeholder: '#FF0000',
        value: this.baseColor,
        maxlength: '7',
      },
      className:
        'flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500',
    });

    const colorPicker = this.createElement('input', {
      attributes: {
        type: 'color',
        value: this.baseColor,
      },
      className: 'w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer',
    });

    const generateBtn = this.createElement('button', {
      textContent: 'Generate',
      className:
        'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-semibold',
    });

    hexInputDiv.appendChild(hexInput);
    hexInputDiv.appendChild(colorPicker);
    hexInputDiv.appendChild(generateBtn);
    inputMethods.appendChild(hexInputDiv);

    // Or use dye selector
    const divider = this.createElement('div', {
      className: 'relative',
    });
    divider.innerHTML =
      '<div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300 dark:border-gray-600"></div></div><div class="relative flex justify-center text-sm"><span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span></div>';
    inputMethods.appendChild(divider);

    // Dye selector
    const dyeSelectorContainer = this.createElement('div', {
      id: 'dye-selector-container',
    });
    inputMethods.appendChild(dyeSelectorContainer);

    section.appendChild(inputMethods);

    // Store references for event binding
    this.querySelector = this.querySelector.bind(this);
    const storedHexInput = hexInput;
    const storedColorPicker = colorPicker;
    const storedGenerateBtn = generateBtn;
    const storedDyeSelectorContainer = dyeSelectorContainer;

    // Store for use in bindEvents
    (this as unknown as Record<string, HTMLElement>)._hexInput = storedHexInput;
    (this as unknown as Record<string, HTMLElement>)._colorPicker = storedColorPicker;
    (this as unknown as Record<string, HTMLElement>)._generateBtn = storedGenerateBtn;
    (this as unknown as Record<string, HTMLElement>)._dyeSelectorContainer =
      storedDyeSelectorContainer;

    return section;
  }

  /**
   * Render the options section
   */
  private renderOptionsSection(): HTMLElement {
    const section = this.createElement('div', {
      className: 'flex flex-wrap gap-4 items-center',
    });

    const label = this.createElement('label', {
      className: 'flex items-center gap-2 cursor-pointer',
    });

    const checkboxAttrs: Record<string, string> = {
      type: 'checkbox',
    };
    if (this.showPrices) {
      checkboxAttrs.checked = 'checked';
    }

    const checkbox = this.createElement('input', {
      attributes: checkboxAttrs,
      className: 'w-4 h-4 border-gray-300 rounded focus:ring-blue-500',
    });

    const labelText = this.createElement('span', {
      textContent: 'Show market prices (if available)',
      className: 'text-sm text-gray-700 dark:text-gray-300',
    });

    label.appendChild(checkbox);
    label.appendChild(labelText);
    section.appendChild(label);

    // Store for event binding
    (this as unknown as Record<string, HTMLElement>)._pricesCheckbox = checkbox;

    return section;
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const hexInput = (this as unknown as Record<string, HTMLElement>)._hexInput as HTMLInputElement;
    const colorPicker = (this as unknown as Record<string, HTMLElement>)
      ._colorPicker as HTMLInputElement;
    const generateBtn = (this as unknown as Record<string, HTMLElement>)
      ._generateBtn as HTMLButtonElement;
    const dyeSelectorContainer = (this as unknown as Record<string, HTMLElement>)
      ._dyeSelectorContainer as HTMLElement;
    const pricesCheckbox = (this as unknown as Record<string, HTMLElement>)
      ._pricesCheckbox as HTMLInputElement;

    if (hexInput && colorPicker) {
      // Sync hex input and color picker
      this.on(hexInput, 'input', () => {
        if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
          this.baseColor = hexInput.value;
          colorPicker.value = this.baseColor;
        }
      });

      this.on(colorPicker, 'input', () => {
        this.baseColor = colorPicker.value;
        hexInput.value = this.baseColor;
      });
    }

    // Generate harmonies
    if (generateBtn) {
      this.on(generateBtn, 'click', () => {
        this.generateHarmonies();
      });
    }

    // Prices checkbox
    if (pricesCheckbox) {
      this.on(pricesCheckbox, 'change', () => {
        this.showPrices = pricesCheckbox.checked;
        this.updateAllDisplays();
      });
    }

    // Initialize dye selector
    if (dyeSelectorContainer && !this.dyeSelector) {
      this.dyeSelector = new DyeSelector(dyeSelectorContainer, {
        maxSelections: 1,
        allowMultiple: false,
        showCategories: true,
        showPrices: false,
      });
      this.dyeSelector.init();

      // Listen for dye selection
      dyeSelectorContainer.addEventListener('selection-changed', (event: Event) => {
        const customEvent = event as CustomEvent;
        const selectedDyes = customEvent.detail?.selectedDyes || [];
        if (selectedDyes.length > 0) {
          this.baseColor = selectedDyes[0].hex;
          if (hexInput) {
            hexInput.value = this.baseColor;
          }
          if (colorPicker) {
            colorPicker.value = this.baseColor;
          }
          this.generateHarmonies();
        }
      });
    }
  }

  /**
   * Generate all harmony types
   */
  private generateHarmonies(): void {
    const dyeService = DyeService.getInstance();

    for (const harmony of HARMONY_TYPES) {
      const container = this.harmonyContainers.get(harmony.id);
      if (!container) continue;

      let matchedDyes: Array<{ dye: Dye; deviance: number }> = [];

      try {
        // Get matched dyes based on harmony type
        switch (harmony.id) {
          case 'complementary': {
            const dye = dyeService.findComplementaryPair(this.baseColor);
            if (dye) {
              const distance = ColorService.getColorDistance(this.baseColor, dye.hex);
              matchedDyes = [{ dye, deviance: Math.min(distance / 44.17, 10) }];
            }
            break;
          }

          case 'analogous': {
            const dyes = dyeService.findAnalogousDyes(this.baseColor, 30);
            matchedDyes = dyes.map((dye) => ({
              dye,
              deviance: ColorService.getColorDistance(this.baseColor, dye.hex) / 44.17,
            }));
            break;
          }

          case 'triadic': {
            const dyes = dyeService.findTriadicDyes(this.baseColor);
            matchedDyes = dyes.map((dye) => ({
              dye,
              deviance: ColorService.getColorDistance(this.baseColor, dye.hex) / 44.17,
            }));
            break;
          }

          case 'split-complementary': {
            // Implement split-complementary: base + two colors ±30° from complement
            const complement = dyeService.findComplementaryPair(this.baseColor);
            const analogous = dyeService.findAnalogousDyes(this.baseColor, 30);
            matchedDyes = [
              ...(complement ? [{ dye: complement, deviance: 0 }] : []),
              ...analogous.map((dye) => ({
                dye,
                deviance: ColorService.getColorDistance(this.baseColor, dye.hex) / 44.17,
              })),
            ];
            break;
          }

          case 'tetradic': {
            // Implement tetradic: two pairs of complementary colors
            const complement = dyeService.findComplementaryPair(this.baseColor);
            const analogous = dyeService.findAnalogousDyes(this.baseColor, 30);
            matchedDyes = [
              ...(complement ? [{ dye: complement, deviance: 0 }] : []),
              ...analogous.slice(0, 2).map((dye) => ({
                dye,
                deviance: ColorService.getColorDistance(this.baseColor, dye.hex) / 44.17,
              })),
            ];
            break;
          }

          case 'square': {
            // Implement square: four colors at 90° intervals
            const triadic = dyeService.findTriadicDyes(this.baseColor);
            matchedDyes = triadic.map((dye) => ({
              dye,
              deviance: ColorService.getColorDistance(this.baseColor, dye.hex) / 44.17,
            }));
            break;
          }
        }
      } catch (error) {
        console.warn(`Failed to generate ${harmony.id} harmony:`, error);
      }

      // Filter out Facewear dyes from results
      matchedDyes = matchedDyes.filter((item) => item.dye.category !== 'Facewear');

      // Sort by deviance (lower is better) and limit to top 6 results
      matchedDyes = matchedDyes.sort((a, b) => a.deviance - b.deviance).slice(0, 6);

      // Create or update harmony display
      if (!this.harmonyDisplays.has(harmony.id)) {
        const harmonyDisplay = new HarmonyType(
          container,
          harmony,
          this.baseColor,
          matchedDyes,
          this.showPrices
        );
        harmonyDisplay.init();
        this.harmonyDisplays.set(harmony.id, harmonyDisplay);
      } else {
        const harmonyDisplay = this.harmonyDisplays.get(harmony.id);
        if (harmonyDisplay) {
          harmonyDisplay.updateDyes(matchedDyes);
          harmonyDisplay.updateBaseColor(this.baseColor);
          harmonyDisplay.update();
        }
      }
    }
  }

  /**
   * Update all harmony displays
   */
  private updateAllDisplays(): void {
    for (const display of this.harmonyDisplays.values()) {
      display.update();
    }
  }

  /**
   * Initialize the tool
   */
  onMount(): void {
    // Generate initial harmonies with default color
    setTimeout(() => {
      this.generateHarmonies();
    }, 100);
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      baseColor: this.baseColor,
      showPrices: this.showPrices,
      harmoniesGenerated: this.harmonyDisplays.size,
    };
  }

  /**
   * Cleanup child components
   */
  destroy(): void {
    if (this.dyeSelector) {
      this.dyeSelector.destroy();
    }
    for (const display of this.harmonyDisplays.values()) {
      display.destroy();
    }
    super.destroy();
  }
}

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
import { MarketBoard } from './market-board';
import { DyeFilters } from './dye-filters';
import { PaletteExporter, type PaletteData } from './palette-exporter';
import { EmptyState } from './empty-state';
import { ICON_HARMONY } from '@shared/empty-state-icons';
import { showSavedPalettesModal, showSavePaletteDialog } from './saved-palettes-modal';
import { ColorService, DyeService, LanguageService, PaletteService } from '@services/index';
import { appStorage } from '@services/storage-service';
import {
  STORAGE_KEYS,
  COMPANION_DYES_MIN,
  COMPANION_DYES_MAX,
  COMPANION_DYES_DEFAULT,
} from '@shared/constants';
import type { Dye, PriceData } from '@shared/types';
import { logger } from '@shared/logger';
import { clearContainer, isValidHexColor } from '@shared/utils';

/**
 * Suggestions mode type
 */
type SuggestionsMode = 'simple' | 'expanded';

/**
 * Harmony type IDs with their SVG icon names
 * Icons are located at /assets/icons/harmony/{name}.svg
 */
const HARMONY_TYPE_IDS = [
  { id: 'complementary', icon: 'complementary' },
  { id: 'analogous', icon: 'analogous' },
  { id: 'triadic', icon: 'triadic' },
  { id: 'split-complementary', icon: 'split-complementary' },
  { id: 'tetradic', icon: 'tetradic' },
  { id: 'square', icon: 'square' },
  { id: 'monochromatic', icon: 'monochromatic' },
  { id: 'compound', icon: 'compound' },
  { id: 'shades', icon: 'shades' },
] as const;

/**
 * Get harmony types with localized names and descriptions
 */
function getHarmonyTypes(): HarmonyTypeInfo[] {
  return HARMONY_TYPE_IDS.map(({ id, icon }) => {
    // Convert id with hyphen to camelCase for core library lookups
    const camelCaseKey = id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return {
      id,
      name: LanguageService.getHarmonyType(camelCaseKey),
      description: LanguageService.t(`harmony.types.${camelCaseKey}Desc`),
      icon,
    };
  });
}

/**
 * Harmony offsets (in degrees) for each harmony type
 */
const HARMONY_OFFSETS: Record<string, number[]> = {
  complementary: [180],
  analogous: [30, 330],
  triadic: [120, 240],
  'split-complementary': [150, 210],
  tetradic: [60, 180, 240],
  square: [90, 180, 270],
  monochromatic: [0],
  compound: [30, 180, 330],
  shades: [15, 345],
};

/**
 * Harmony Generator Tool Component
 * Generates color harmony palettes from a base color
 */
export class HarmonyGeneratorTool extends BaseComponent {
  private baseColor: string = '';
  private dyeSelector: DyeSelector | null = null;
  private marketBoard: MarketBoard | null = null;
  private harmonyDisplays: Map<string, HarmonyType> = new Map();
  private showPrices: boolean = false;
  private priceData: Map<number, PriceData> = new Map();
  private harmonyContainers: Map<string, HTMLElement> = new Map();
  private harmoniesGridElement: HTMLElement | null = null;
  private emptyStateElement: EmptyState | null = null;
  private dyeFilters: DyeFilters | null = null;
  private suggestionsMode: SuggestionsMode = 'simple';
  private suggestionsModeRadios: Map<SuggestionsMode, HTMLInputElement> = new Map();
  private companionDyesCount: number = COMPANION_DYES_DEFAULT;
  private companionDyesInput: HTMLInputElement | null = null;
  private paletteExporter: PaletteExporter | null = null;

  /**
   * Render the tool component
   */
  render(): void {
    const wrapper = this.createElement('div', {
      className: 'space-y-8',
    });

    // Title section with saved palettes button
    const titleSection = this.createElement('div', {
      className: 'space-y-2',
    });

    const titleRow = this.createElement('div', {
      className: 'flex items-center justify-between',
    });

    const titleText = this.createElement('div', {
      className: 'text-center flex-1',
    });

    const heading = this.createElement('h2', {
      textContent: LanguageService.t('tools.harmony.title'),
      className: 'text-3xl font-bold',
      attributes: {
        style: 'color: var(--theme-text);',
      },
    });

    const subtitle = this.createElement('p', {
      textContent: LanguageService.t('tools.harmony.subtitle'),
      attributes: {
        style: 'color: var(--theme-text-muted);',
      },
    });

    titleText.appendChild(heading);
    titleText.appendChild(subtitle);

    // Spacer for centering
    const spacerLeft = this.createElement('div', {
      className: 'w-32',
    });

    // Saved Palettes button
    const savedPalettesBtn = this.createElement('button', {
      className:
        'saved-palettes-btn flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-32 justify-center',
      attributes: {
        style: 'color: var(--theme-text);',
      },
    });

    // Bookmark icon
    savedPalettesBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;

    const btnText = this.createElement('span', {
      textContent: LanguageService.t('palette.saved'),
    });
    savedPalettesBtn.appendChild(btnText);

    // Add palette count badge
    const count = PaletteService.getPaletteCount();
    if (count > 0) {
      const badge = this.createElement('span', {
        textContent: count.toString(),
        className: 'px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full',
      });
      savedPalettesBtn.appendChild(badge);
    }

    titleRow.appendChild(spacerLeft);
    titleRow.appendChild(titleText);
    titleRow.appendChild(savedPalettesBtn);

    titleSection.appendChild(titleRow);
    wrapper.appendChild(titleSection);

    // Store reference for event binding
    (this as unknown as Record<string, HTMLElement>)._savedPalettesBtn = savedPalettesBtn;

    // Input section
    const inputSection = this.renderInputSection();
    wrapper.appendChild(inputSection);

    // Options section
    const optionsSection = this.renderOptionsSection();
    wrapper.appendChild(optionsSection);

    // Harmony displays wrapper (contains grid or empty state)
    const harmoniesWrapper = this.createElement('div', {
      id: 'harmonies-wrapper',
    });

    // Harmony displays grid
    const harmoniesGrid = this.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    });
    this.harmoniesGridElement = harmoniesGrid;

    for (const { id } of HARMONY_TYPE_IDS) {
      const container = this.createElement('div', {
        id: `harmony-${id}`,
      });
      this.harmonyContainers.set(id, container);
      harmoniesGrid.appendChild(container);
    }

    // Empty state container (hidden initially via generateHarmonies)
    const emptyStateContainer = this.createElement('div', {
      id: 'harmony-empty-state',
    });

    harmoniesWrapper.appendChild(harmoniesGrid);
    harmoniesWrapper.appendChild(emptyStateContainer);
    wrapper.appendChild(harmoniesWrapper);

    // Export section
    const exportContainer = this.createElement('div', {
      id: 'harmony-export-container',
    });
    wrapper.appendChild(exportContainer);

    clearContainer(this.container);
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
      textContent: LanguageService.t('harmony.baseColorSection'),
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3',
    });
    section.appendChild(label);

    // Color input methods
    const inputMethods = this.createElement('div', {
      className: 'space-y-3',
    });

    // Hex input
    const hexInputDiv = this.createElement('div', {
      className: 'flex flex-col sm:flex-row gap-2',
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
      textContent: LanguageService.t('common.generate'),
      className: 'px-6 py-2 rounded-lg transition-all duration-200 font-semibold w-full sm:w-auto',
      attributes: {
        style: 'background-color: var(--theme-primary); color: var(--theme-text-header);',
      },
    });

    // Add hover effect with brightness filter
    generateBtn.addEventListener('mouseenter', () => {
      generateBtn.style.filter = 'brightness(0.9)';
    });
    generateBtn.addEventListener('mouseleave', () => {
      generateBtn.style.filter = '';
    });
    generateBtn.addEventListener('mousedown', () => {
      generateBtn.style.filter = 'brightness(0.8)';
    });
    generateBtn.addEventListener('mouseup', () => {
      generateBtn.style.filter = 'brightness(0.9)';
    });

    hexInputDiv.appendChild(hexInput);
    hexInputDiv.appendChild(colorPicker);
    hexInputDiv.appendChild(generateBtn);
    inputMethods.appendChild(hexInputDiv);

    // Or use dye selector
    const divider = this.createElement('div', {
      className: 'relative',
    });
    divider.innerHTML = `<div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300 dark:border-gray-600"></div></div><div class="relative flex justify-center text-sm"><span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">${LanguageService.t('common.or')}</span></div>`;
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
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
    });

    // Dye Filters section - using DyeFilters component
    const filtersContainer = this.createElement('div', {
      attributes: {
        id: 'harmony-filters-container',
      },
    });
    section.appendChild(filtersContainer);

    // Divider
    const divider = this.createElement('div', {
      className: 'border-t border-gray-200 dark:border-gray-700',
    });
    section.appendChild(divider);

    // Suggestions Mode section
    const suggestionsSection = this.createElement('div', {
      className: 'space-y-3',
    });

    const suggestionsLabel = this.createElement('label', {
      textContent: LanguageService.t('harmony.suggestionMode'),
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    });
    suggestionsSection.appendChild(suggestionsLabel);

    // Radio buttons for suggestions mode
    const suggestionsContainer = this.createElement('div', {
      className: 'space-y-2',
    });

    const modes: Array<{ value: SuggestionsMode; labelKey: string; descKey: string }> = [
      {
        value: 'simple',
        labelKey: 'harmony.simple',
        descKey: 'harmony.simpleDesc',
      },
      {
        value: 'expanded',
        labelKey: 'harmony.expanded',
        descKey: 'harmony.expandedDesc',
      },
    ];

    for (const mode of modes) {
      const radioDiv = this.createElement('div', {
        className: 'flex items-start gap-3',
      });

      const radio = this.createElement('input', {
        attributes: {
          type: 'radio',
          name: 'suggestions-mode',
          value: mode.value,
          id: `mode-${mode.value}`,
        },
        className:
          'mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer',
      });

      const labelElement = this.createElement('label', {
        attributes: {
          for: `mode-${mode.value}`,
        },
        className: 'cursor-pointer flex-1',
      });

      const labelText = this.createElement('div', {
        textContent: LanguageService.t(mode.labelKey),
        className: 'text-sm font-medium text-gray-700 dark:text-gray-300',
      });

      const descText = this.createElement('div', {
        textContent: LanguageService.t(mode.descKey),
        className: 'text-xs text-gray-500 dark:text-gray-400',
      });

      labelElement.appendChild(labelText);
      labelElement.appendChild(descText);

      radioDiv.appendChild(radio);
      radioDiv.appendChild(labelElement);
      suggestionsContainer.appendChild(radioDiv);

      // Store radio reference
      this.suggestionsModeRadios.set(mode.value, radio);
    }

    suggestionsSection.appendChild(suggestionsContainer);

    // Companion Dyes Count section (only for Expanded mode)
    const companionSection = this.createElement('div', {
      className: 'space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700 hidden',
      attributes: {
        id: 'companion-dyes-section',
      },
    });

    const companionLabel = this.createElement('label', {
      textContent: LanguageService.t('harmony.companionDyes'),
      className: 'block text-sm font-semibold text-gray-700 dark:text-gray-300',
      attributes: {
        for: 'companion-dyes-input',
      },
    });
    companionSection.appendChild(companionLabel);

    const companionDescription = this.createElement('p', {
      textContent: LanguageService.t('harmony.companionDyesDesc'),
      className: 'text-xs text-gray-500 dark:text-gray-400',
    });
    companionSection.appendChild(companionDescription);

    const companionInputDiv = this.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const companionInput = this.createElement('input', {
      attributes: {
        type: 'range',
        id: 'companion-dyes-input',
        min: COMPANION_DYES_MIN.toString(),
        max: COMPANION_DYES_MAX.toString(),
        value: COMPANION_DYES_DEFAULT.toString(),
      },
      className: 'w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer',
    }) as HTMLInputElement;

    const companionValue = this.createElement('span', {
      textContent: COMPANION_DYES_DEFAULT.toString(),
      className: 'text-sm font-medium text-gray-700 dark:text-gray-300 min-w-8 text-center',
      attributes: {
        id: 'companion-dyes-value',
      },
    });

    companionInputDiv.appendChild(companionInput);
    companionInputDiv.appendChild(companionValue);
    companionSection.appendChild(companionInputDiv);

    suggestionsSection.appendChild(companionSection);
    section.appendChild(suggestionsSection);

    // Store for event binding
    this.companionDyesInput = companionInput;
    (this as unknown as Record<string, HTMLInputElement>)._companionDyesInput = companionInput;
    (this as unknown as Record<string, HTMLElement>)._companionDyesSection = companionSection;

    // Divider 2
    const divider2 = this.createElement('div', {
      className: 'border-t border-gray-200 dark:border-gray-700',
    });
    section.appendChild(divider2);

    // Market Board container
    const marketBoardContainer = this.createElement('div', {
      id: 'market-board-container',
    });
    section.appendChild(marketBoardContainer);

    // Store for event binding
    (this as unknown as Record<string, HTMLElement>)._marketBoardContainer = marketBoardContainer;

    return section;
  }

  /**
   * Bind event listeners
   */
  async bindEvents(): Promise<void> {
    const hexInput = (this as unknown as Record<string, HTMLElement>)._hexInput as HTMLInputElement;
    const colorPicker = (this as unknown as Record<string, HTMLElement>)
      ._colorPicker as HTMLInputElement;
    const generateBtn = (this as unknown as Record<string, HTMLElement>)
      ._generateBtn as HTMLButtonElement;
    const dyeSelectorContainer = (this as unknown as Record<string, HTMLElement>)
      ._dyeSelectorContainer as HTMLElement;
    const marketBoardContainer = (this as unknown as Record<string, HTMLElement>)
      ._marketBoardContainer as HTMLElement;

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

    // Initialize Market Board
    if (marketBoardContainer && !this.marketBoard) {
      this.marketBoard = new MarketBoard(marketBoardContainer);
      await this.marketBoard.loadServerData();
      this.marketBoard.init();

      // Listen for Market Board events
      marketBoardContainer.addEventListener('toggle-prices', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.showPrices = customEvent.detail?.showPrices ?? false;
        if (this.showPrices) {
          void this.fetchPricesForCurrentDyes();
        } else {
          this.priceData.clear();
          this.updateAllDisplays();
        }
      });

      marketBoardContainer.addEventListener('server-changed', () => {
        if (this.showPrices) {
          void this.fetchPricesForCurrentDyes();
        }
      });

      marketBoardContainer.addEventListener('categories-changed', () => {
        if (this.showPrices) {
          void this.fetchPricesForCurrentDyes();
        }
      });

      marketBoardContainer.addEventListener('refresh-requested', () => {
        if (this.showPrices) {
          void this.fetchPricesForCurrentDyes();
        }
      });

      // Get initial showPrices state from Market Board
      this.showPrices = this.marketBoard.getShowPrices();
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

    // Initialize DyeFilters component
    const filtersContainer = this.querySelector<HTMLElement>('#harmony-filters-container');
    if (filtersContainer && !this.dyeFilters) {
      this.dyeFilters = new DyeFilters(filtersContainer, {
        storageKeyPrefix: 'harmony',
        onFilterChange: () => {
          this.generateHarmonies();
        },
      });
      this.dyeFilters.render();
      this.dyeFilters.bindEvents();
      this.dyeFilters.onMount();
    }

    // Initialize suggestions mode radio buttons and load saved state
    this.loadSuggestionsMode();
    for (const [_mode, radio] of this.suggestionsModeRadios) {
      this.on(radio, 'change', () => {
        this.updateSuggestionsMode();
        this.toggleCompanionSection();
        this.generateHarmonies();
      });
    }

    // Initialize companion dyes input and load saved state
    this.loadCompanionDyesCount();
    if (this.companionDyesInput) {
      this.on(this.companionDyesInput, 'input', () => {
        this.updateCompanionDyesCount();
        this.generateHarmonies();
      });
    }

    // Initialize PaletteExporter
    const exportContainer = this.querySelector<HTMLElement>('#harmony-export-container');
    if (exportContainer && !this.paletteExporter) {
      this.paletteExporter = new PaletteExporter(exportContainer, {
        title: LanguageService.t('export.title'),
        dataProvider: () => this.getPaletteData(),
        enabled: () => this.harmonyDisplays.size > 0,
      });
      this.paletteExporter.init();
    }

    // Listen for dye action events from harmony type components (Add to Comparison/Mixer)
    this.container.addEventListener('dyeAction', ((event: CustomEvent) => {
      const { action, dye } = event.detail as { action: 'comparison' | 'mixer'; dye: Dye };
      if (action && dye) {
        // Dispatch event to main app to navigate to the appropriate tool with the dye
        window.dispatchEvent(
          new CustomEvent('navigateToTool', {
            detail: { tool: action, dye },
          })
        );
      }
    }) as EventListener);

    // Listen for save palette events from harmony type components
    this.container.addEventListener('savePalette', ((event: CustomEvent) => {
      const { harmonyType, harmonyName, baseColor, dyes } = event.detail as {
        harmonyType: string;
        harmonyName: string;
        baseColor: string;
        dyes: Dye[];
      };

      // Get base dye name
      const baseDye = DyeService.getInstance().findClosestDye(baseColor);
      const baseDyeName = baseDye
        ? LanguageService.getDyeName(baseDye.itemID) || baseDye.name
        : 'Unknown';

      // Get companion dye names
      const companions = dyes.map((dye) => LanguageService.getDyeName(dye.itemID) || dye.name);

      // Show save dialog
      showSavePaletteDialog(harmonyType, harmonyName, baseColor, baseDyeName, companions);
    }) as EventListener);

    // Saved palettes button
    const savedPalettesBtn = (this as unknown as Record<string, HTMLElement>)
      ._savedPalettesBtn as HTMLButtonElement;
    if (savedPalettesBtn) {
      this.on(savedPalettesBtn, 'click', () => {
        showSavedPalettesModal((palette) => {
          // Load palette: set base color and regenerate
          this.baseColor = palette.baseColor;

          // Update UI
          const hexInput = (this as unknown as Record<string, HTMLElement>)
            ._hexInput as HTMLInputElement;
          const colorPicker = (this as unknown as Record<string, HTMLElement>)
            ._colorPicker as HTMLInputElement;

          if (hexInput) hexInput.value = this.baseColor;
          if (colorPicker) colorPicker.value = this.baseColor;

          // Regenerate harmonies with the loaded base color
          this.generateHarmonies();
        });
      });
    }
  }

  /**
   * Load suggestions mode from localStorage
   */
  private loadSuggestionsMode(): void {
    const saved = appStorage.getItem<SuggestionsMode>(
      STORAGE_KEYS.HARMONY_SUGGESTIONS_MODE,
      'simple'
    ) as SuggestionsMode;
    this.suggestionsMode = saved || 'simple';

    // Update radio button to reflect saved state
    const radio = this.suggestionsModeRadios.get(this.suggestionsMode);
    if (radio) {
      radio.checked = true;
    }
  }

  /**
   * Update suggestions mode from radio buttons and save to localStorage
   */
  private updateSuggestionsMode(): void {
    for (const [mode, radio] of this.suggestionsModeRadios) {
      if (radio.checked) {
        this.suggestionsMode = mode;
        break;
      }
    }
    appStorage.setItem(STORAGE_KEYS.HARMONY_SUGGESTIONS_MODE, this.suggestionsMode);
  }

  /**
   * Check if a dye should be excluded based on current filter settings
   */
  private isDyeExcluded(dye: Dye): boolean {
    return this.dyeFilters?.isDyeExcluded(dye) ?? false;
  }

  /**
   * Replace excluded dyes with alternatives that don't match exclusion criteria
   * This ensures harmony cards always show the expected number of dyes
   */
  private replaceExcludedDyes(
    dyes: Array<{ dye: Dye; deviance: number }>,
    harmonyId: string
  ): Array<{ dye: Dye; deviance: number }> {
    const result: Array<{ dye: Dye; deviance: number }> = [];
    const usedDyeIds = new Set<number>();
    const allDyes = DyeService.getInstance().getAllDyes();

    for (const item of dyes) {
      // If dye is not excluded, keep it
      if (!this.isDyeExcluded(item.dye)) {
        result.push(item);
        usedDyeIds.add(item.dye.itemID);
        continue;
      }

      // Dye is excluded, find alternative
      // Use the target color from the excluded dye to find a similar alternative
      const targetColor = item.dye.hex;
      let bestAlternative: Dye | null = null;
      let bestDistance = Infinity;

      // Find the closest dye that:
      // 1. Doesn't match exclusion criteria
      // 2. Isn't already used
      // 3. Isn't Facewear
      for (const dye of allDyes) {
        if (usedDyeIds.has(dye.itemID) || dye.category === 'Facewear' || this.isDyeExcluded(dye)) {
          continue;
        }

        const distance = ColorService.getColorDistance(targetColor, dye.hex);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestAlternative = dye;
        }
      }

      // Add the alternative if found, otherwise skip (better than showing excluded dye)
      if (bestAlternative) {
        // Calculate deviance using hue difference
        const offsets = HARMONY_OFFSETS[harmonyId] || [];
        const deviance = this.calculateHueDeviance(this.baseColor, bestAlternative.hex, offsets);
        result.push({ dye: bestAlternative, deviance });
        usedDyeIds.add(bestAlternative.itemID);
      }
    }

    return result;
  }

  /**
   * Calculate hue deviance (difference in degrees) from the closest ideal offset
   */
  private calculateHueDeviance(baseHex: string, dyeHex: string, offsets: number[]): number {
    const baseHsv = ColorService.hexToHsv(baseHex);
    const dyeHsv = ColorService.hexToHsv(dyeHex);
    let minDiff = Infinity;

    for (const offset of offsets) {
      const targetHue = (baseHsv.h + offset) % 360;
      const diff = Math.abs(dyeHsv.h - targetHue);
      // Handle wrap-around (e.g. 359 vs 1 is 2 degrees, not 358)
      const shortestPath = Math.min(diff, 360 - diff);
      minDiff = Math.min(minDiff, shortestPath);
    }

    return minDiff;
  }

  /**
   * Apply dye filters to matched dyes (legacy method, kept for compatibility)
   */
  private applyDyeFilters(
    dyes: Array<{ dye: Dye; deviance: number }>
  ): Array<{ dye: Dye; deviance: number }> {
    return dyes.filter((item) => !this.isDyeExcluded(item.dye));
  }

  /**
   * Fetch prices for all currently displayed dyes
   */
  private async fetchPricesForCurrentDyes(): Promise<void> {
    if (!this.marketBoard || !this.showPrices) return;

    // Collect all unique dyes from all harmony displays
    const dyesToFetch: Dye[] = [];
    for (const display of this.harmonyDisplays.values()) {
      const dyes = display.getDyes();
      for (const dye of dyes) {
        if (!dyesToFetch.find((d) => d.itemID === dye.itemID)) {
          dyesToFetch.push(dye);
        }
      }
    }

    // Fetch prices using Market Board
    this.priceData = await this.marketBoard.fetchPricesForDyes(dyesToFetch);

    // Update all displays with new price data
    this.updateAllDisplays();
  }

  /**
   * Get the dye limit count for a harmony type in Simple mode
   */
  private getSimpleModeLimit(harmonyId: string): number {
    switch (harmonyId) {
      case 'complementary':
        return 2; // base + 1 complementary
      case 'analogous':
        return 3; // base + 2 analogous
      case 'triadic':
        return 3; // base + 2 triadic
      case 'split-complementary':
        return 3; // base + 2 split-complementary
      case 'tetradic':
        return 4; // base + 3 others
      case 'square':
        return 4; // base + 3 others
      case 'monochromatic':
        return 3; // base + 2 monochromatic
      case 'compound':
        return 4; // base + 3 compound
      case 'shades':
        return 3; // base + 2 shades
      default:
        return 6; // fallback
    }
  }

  /**
   * Apply suggestions mode logic to dyes
   */
  private applySuggestionsMode(
    harmonyId: string,
    matchedDyes: Array<{ dye: Dye; deviance: number }>
  ): Array<{ dye: Dye; deviance: number }> {
    // Sort by deviance (lower is better)
    matchedDyes = matchedDyes.sort((a, b) => a.deviance - b.deviance);

    if (this.suggestionsMode === 'simple') {
      // Simple mode: limit to exact counts per harmony type
      const limit = this.getSimpleModeLimit(harmonyId);
      return matchedDyes.slice(0, limit);
    } else {
      // Expanded mode: start with Simple limits, then add similar dyes
      const simpleLimit = this.getSimpleModeLimit(harmonyId);
      const simpleDyes = matchedDyes.slice(0, simpleLimit);

      // For each harmony dye (except base), find companion dyes based on companion count
      const allDyes = DyeService.getInstance().getAllDyes();
      const usedDyeIds = new Set(simpleDyes.map((d) => d.dye.itemID));
      const expandedDyes = [...simpleDyes];

      // For each harmony dye (skip base at index 0), add companion dyes
      for (let i = 0; i < simpleDyes.length; i++) {
        const harmonyDye = simpleDyes[i].dye;
        const targetColor = harmonyDye.hex;

        // Find N companion dyes (where N = this.companionDyesCount)
        for (let companionIndex = 0; companionIndex < this.companionDyesCount; companionIndex++) {
          let closestDye: Dye | null = null;
          let closestDistance = Infinity;

          // Find the next closest dye to this harmony dye (that we haven't used)
          for (const dye of allDyes) {
            if (
              usedDyeIds.has(dye.itemID) ||
              dye.category === 'Facewear' ||
              this.isDyeExcluded(dye)
            ) {
              continue;
            }

            const distance = ColorService.getColorDistance(targetColor, dye.hex);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestDye = dye;
            }
          }

          // Add the companion dye if found
          if (closestDye) {
            usedDyeIds.add(closestDye.itemID);
            expandedDyes.push({
              dye: closestDye,
              deviance: this.calculateHueDeviance(
                this.baseColor,
                closestDye.hex,
                HARMONY_OFFSETS[harmonyId] || []
              ),
            });
          } else {
            // No more dyes available, stop looking for this harmony color
            break;
          }
        }
      }

      return expandedDyes;
    }
  }

  /**
   * Generate all harmony types
   */
  private generateHarmonies(): void {
    const emptyStateContainer = this.querySelector<HTMLElement>('#harmony-empty-state');

    // Show empty state when no base color is selected
    if (!this.baseColor || !isValidHexColor(this.baseColor)) {
      // Hide the grid, show empty state
      if (this.harmoniesGridElement) {
        this.harmoniesGridElement.classList.add('hidden');
      }
      if (emptyStateContainer) {
        emptyStateContainer.classList.remove('hidden');
        // Create empty state if not already present
        if (!this.emptyStateElement) {
          const focusHexInput = () => {
            const hexInput = this.querySelector<HTMLInputElement>('#harmony-hex-input');
            if (hexInput) hexInput.focus();
          };
          this.emptyStateElement = new EmptyState(emptyStateContainer, {
            icon: ICON_HARMONY,
            title: LanguageService.t('harmony.selectColorPrompt'),
            description: LanguageService.t('harmony.selectColorMessage'),
            actionLabel: LanguageService.t('harmony.selectColorAction'),
            onAction: focusHexInput,
          });
          this.emptyStateElement.init();
        }
      }
      return;
    }

    // Hide empty state, show the grid
    if (emptyStateContainer) {
      emptyStateContainer.classList.add('hidden');
    }
    if (this.harmoniesGridElement) {
      this.harmoniesGridElement.classList.remove('hidden');
    }

    const dyeService = DyeService.getInstance();
    const harmonyTypes = getHarmonyTypes();

    for (const harmony of harmonyTypes) {
      const container = this.harmonyContainers.get(harmony.id);
      if (!container) continue;

      let matchedDyes: Array<{ dye: Dye; deviance: number }> = [];

      try {
        // Get matched dyes based on harmony type
        switch (harmony.id) {
          case 'complementary': {
            const dye = dyeService.findComplementaryPair(this.baseColor);
            if (dye) {
              const deviance = this.calculateHueDeviance(
                this.baseColor,
                dye.hex,
                HARMONY_OFFSETS.complementary
              );
              matchedDyes = [{ dye, deviance }];
            }
            break;
          }

          case 'analogous': {
            const dyes = dyeService.findAnalogousDyes(this.baseColor, 30);
            matchedDyes = dyes.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(
                this.baseColor,
                dye.hex,
                HARMONY_OFFSETS.analogous
              ),
            }));
            break;
          }

          case 'triadic': {
            const dyes = dyeService.findTriadicDyes(this.baseColor);
            matchedDyes = dyes.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(this.baseColor, dye.hex, HARMONY_OFFSETS.triadic),
            }));
            break;
          }

          case 'split-complementary': {
            const dyes = dyeService.findSplitComplementaryDyes(this.baseColor);
            matchedDyes = dyes.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(
                this.baseColor,
                dye.hex,
                HARMONY_OFFSETS['split-complementary']
              ),
            }));
            break;
          }

          case 'tetradic': {
            const dyes = dyeService.findTetradicDyes(this.baseColor);
            matchedDyes = dyes.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(
                this.baseColor,
                dye.hex,
                HARMONY_OFFSETS.tetradic
              ),
            }));
            break;
          }

          case 'square': {
            const square = dyeService.findSquareDyes(this.baseColor);
            matchedDyes = square.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(this.baseColor, dye.hex, HARMONY_OFFSETS.square),
            }));
            break;
          }

          case 'monochromatic': {
            const monochromatic = dyeService.findMonochromaticDyes(this.baseColor);
            matchedDyes = monochromatic.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(
                this.baseColor,
                dye.hex,
                HARMONY_OFFSETS.monochromatic
              ),
            }));
            break;
          }

          case 'compound': {
            const compound = dyeService.findCompoundDyes(this.baseColor);
            matchedDyes = compound.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(
                this.baseColor,
                dye.hex,
                HARMONY_OFFSETS.compound
              ),
            }));
            break;
          }

          case 'shades': {
            const shades = dyeService.findShadesDyes(this.baseColor);
            matchedDyes = shades.map((dye) => ({
              dye,
              deviance: this.calculateHueDeviance(this.baseColor, dye.hex, HARMONY_OFFSETS.shades),
            }));
            break;
          }
        }
      } catch (error) {
        logger.warn(`Failed to generate ${harmony.id} harmony:`, error);
      }

      // Filter out Facewear dyes from results
      matchedDyes = matchedDyes.filter((item) => item.dye.category !== 'Facewear');

      // Replace excluded dyes with alternatives instead of just removing them
      matchedDyes = this.replaceExcludedDyes(matchedDyes, harmony.id);

      // Apply suggestions mode (Simple or Expanded)
      matchedDyes = this.applySuggestionsMode(harmony.id, matchedDyes);

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

    // Fetch prices if enabled
    if (this.showPrices && this.marketBoard) {
      void this.fetchPricesForCurrentDyes();
    }

    // Update palette exporter
    if (this.paletteExporter) {
      this.paletteExporter.update();
    }
  }

  /**
   * Update all harmony displays with current price data
   */
  private updateAllDisplays(): void {
    for (const display of this.harmonyDisplays.values()) {
      display.setPriceData(this.priceData);
      display.updateShowPrices(this.showPrices);
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

    // Subscribe to language changes to update localized text
    LanguageService.subscribe(() => {
      this.update();
    });
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
   * Load companion dyes count from localStorage
   */
  private loadCompanionDyesCount(): void {
    const saved =
      appStorage.getItem<number>(STORAGE_KEYS.HARMONY_COMPANION_DYES, COMPANION_DYES_DEFAULT) ??
      COMPANION_DYES_DEFAULT;
    this.companionDyesCount = Math.max(COMPANION_DYES_MIN, Math.min(COMPANION_DYES_MAX, saved));

    // Update input and display
    if (this.companionDyesInput) {
      this.companionDyesInput.value = this.companionDyesCount.toString();
    }
    this.updateCompanionDyesDisplay();
  }

  /**
   * Update companion dyes count from input and save to localStorage
   */
  private updateCompanionDyesCount(): void {
    if (this.companionDyesInput) {
      this.companionDyesCount = parseInt(this.companionDyesInput.value, 10);
      appStorage.setItem(STORAGE_KEYS.HARMONY_COMPANION_DYES, this.companionDyesCount);
      this.updateCompanionDyesDisplay();
    }
  }

  /**
   * Update companion dyes count display value
   */
  private updateCompanionDyesDisplay(): void {
    const display = document.getElementById('companion-dyes-value');
    if (display) {
      display.textContent = this.companionDyesCount.toString();
    }
  }

  /**
   * Toggle companion dyes section visibility based on suggestions mode
   */
  private toggleCompanionSection(): void {
    const section = (this as unknown as Record<string, HTMLElement>)._companionDyesSection as
      | HTMLElement
      | undefined;
    if (!section) return;

    if (this.suggestionsMode === 'expanded') {
      // Show companion section in expanded mode
      section.classList.remove('hidden');
    } else {
      // Hide companion section in simple mode
      section.classList.add('hidden');
    }
  }

  /**
   * Get palette data for export
   */
  private getPaletteData(): PaletteData {
    const baseDye = DyeService.getInstance().findClosestDye(this.baseColor);
    const groups: Record<string, Dye[]> = {};

    for (const [harmonyId, display] of this.harmonyDisplays) {
      const dyes = display.getDyes();
      if (dyes.length > 0) {
        groups[harmonyId] = dyes;
      }
    }

    return { base: baseDye, groups };
  }

  /**
   * Cleanup child components
   */
  destroy(): void {
    if (this.dyeSelector) {
      this.dyeSelector.destroy();
    }
    if (this.marketBoard) {
      this.marketBoard.destroy();
    }
    if (this.paletteExporter) {
      this.paletteExporter.destroy();
    }
    for (const display of this.harmonyDisplays.values()) {
      display.destroy();
    }
    super.destroy();
  }
}

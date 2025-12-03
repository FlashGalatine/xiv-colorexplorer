/**
 * XIV Dye Tools v2.0.0 - Accessibility Checker Tool Component
 *
 * Phase 12: Architecture Refactor
 * Main tool for checking color accessibility and colorblindness simulation
 *
 * @module components/accessibility-checker-tool
 */

import { BaseComponent } from './base-component';
import { DyeSelector } from './dye-selector';
import { addInfoIconTo, TOOLTIP_CONTENT } from './info-tooltip';
import type { Dye } from '@shared/types';
import { ColorService, LanguageService } from '@services/index';
import { clearContainer } from '@shared/utils';
import { ICON_TOOL_ACCESSIBILITY } from '@shared/tool-icons';
import { ICON_WARNING } from '@shared/ui-icons';

/**
 * Contrast result for a single background
 */
export interface ContrastResult {
  ratio: number; // Actual WCAG contrast ratio (1-21)
  wcagLevel: 'AAA' | 'AA' | 'Fail';
}

/**
 * Individual dye accessibility analysis
 */
export interface DyeAccessibilityResult {
  dyeId: number;
  dyeName: string;
  hex: string;
  contrastVsWhite: ContrastResult;
  contrastVsBlack: ContrastResult;
  warnings: string[];
  // Colorblindness simulations for all 5 vision types
  colorblindnessSimulations: {
    normal: string;
    deuteranopia: string;
    protanopia: string;
    tritanopia: string;
    achromatopsia: string;
  };
}

/**
 * Dye pair comparison result
 */
export interface DyePairResult {
  dye1Id: number;
  dye1Name: string;
  dye1Hex: string;
  dye2Id: number;
  dye2Name: string;
  dye2Hex: string;
  contrastRatio: number; // Actual WCAG contrast ratio between the two dyes
  wcagLevel: 'AAA' | 'AA' | 'Fail';
  distinguishability: number; // 0-100 color distance score
  colorblindnessDistinguishability: {
    normal: number;
    deuteranopia: number;
    protanopia: number;
    tritanopia: number;
  };
  warnings: string[];
}

/**
 * Accessibility Checker Tool Component
 * Simulate colorblindness and check color accessibility for up to 4 dyes
 * Shows contrast ratios vs white/black and pairwise comparisons
 */
export class AccessibilityCheckerTool extends BaseComponent {
  private dyeSelector: DyeSelector | null = null;
  private selectedDyes: Dye[] = [];
  private dyeResults: DyeAccessibilityResult[] = [];
  private pairResults: DyePairResult[] = [];
  private languageUnsubscribe: (() => void) | null = null;

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
      textContent: LanguageService.t('tools.accessibility.title'),
      className: 'text-2xl font-bold text-gray-900 dark:text-white',
    });

    const subtitle = this.createElement('p', {
      textContent: LanguageService.t('tools.accessibility.subtitle'),
      attributes: {
        style: 'color: var(--theme-text-muted);',
      },
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
      textContent: LanguageService.tInterpolate('accessibility.selectUpTo', { count: '4' }),
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    selectorSection.appendChild(selectorLabel);

    const dyeSelectorContainer = this.createElement('div', {
      id: 'dye-selector-container',
    });
    selectorSection.appendChild(dyeSelectorContainer);

    wrapper.appendChild(selectorSection);

    // Results section
    const resultsSection = this.createElement('div', {
      id: 'results-container',
    });
    wrapper.appendChild(resultsSection);

    clearContainer(this.container);
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const dyeSelectorContainer = this.querySelector<HTMLElement>('#dye-selector-container');

    if (dyeSelectorContainer && !this.dyeSelector) {
      this.dyeSelector = new DyeSelector(dyeSelectorContainer, {
        maxSelections: 4,
        allowMultiple: true,
        allowDuplicates: true,
        showCategories: true,
        showPrices: false,
        excludeFacewear: true,
      });
      this.dyeSelector.init();

      dyeSelectorContainer.addEventListener('selection-changed', () => {
        this.updateResults();
      });
    }
  }

  /**
   * Initialize the tool
   */
  onMount(): void {
    // Subscribe to language changes to update localized text
    this.languageUnsubscribe = LanguageService.subscribe(() => {
      this.updateLocalizedText();
    });
  }

  /**
   * Cleanup child components and references
   */
  destroy(): void {
    // Unsubscribe from language changes
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
      this.languageUnsubscribe = null;
    }

    // Destroy child components
    if (this.dyeSelector) {
      this.dyeSelector.destroy();
      this.dyeSelector = null;
    }

    // Clear arrays
    this.pairResults = [];

    super.destroy();
  }

  /**
   * Update localized text when language changes (without re-rendering)
   */
  private updateLocalizedText(): void {
    // Update title
    const title = this.querySelector<HTMLElement>('h2');
    if (title) {
      title.textContent = LanguageService.t('tools.accessibility.title');
    }

    // Update subtitle
    const subtitle = this.querySelector<HTMLElement>('h2 + p');
    if (subtitle) {
      subtitle.textContent = LanguageService.t('tools.accessibility.subtitle');
    }

    // Update selector label
    const selectorLabel = this.querySelector<HTMLElement>('h3');
    if (selectorLabel) {
      selectorLabel.textContent = LanguageService.tInterpolate('accessibility.selectUpTo', {
        count: '4',
      });
    }

    // Update results section text (labels are recreated on data change, no update needed)
  }

  /**
   * Update results display
   */
  private updateResults(): void {
    if (!this.dyeSelector) return;

    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    clearContainer(resultsContainer);

    this.selectedDyes = this.dyeSelector.getSelectedDyes();

    if (this.selectedDyes.length === 0) {
      const empty = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: LanguageService.t('accessibility.selectDyesToSeeAnalysis'),
      });
      resultsContainer.appendChild(empty);
      return;
    }

    // Calculate individual dye results
    this.dyeResults = this.selectedDyes.map((dye) => this.analyzeDye(dye));

    // Render individual dye analysis
    const dyesSection = this.createElement('div', {
      className: 'space-y-4',
    });

    const dyesLabel = this.createElement('h3', {
      textContent: LanguageService.t('accessibility.individualAnalysis'),
      className: 'text-lg font-semibold text-gray-900 dark:text-white',
    });
    dyesSection.appendChild(dyesLabel);

    const dyesGrid = this.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    });

    for (const result of this.dyeResults) {
      const card = this.renderDyeCard(result);
      dyesGrid.appendChild(card);
    }

    dyesSection.appendChild(dyesGrid);
    resultsContainer.appendChild(dyesSection);

    // Render pair comparison section if 2+ dyes selected
    if (this.selectedDyes.length >= 2) {
      // Calculate all pair results
      this.pairResults = [];
      for (let i = 0; i < this.selectedDyes.length; i++) {
        for (let j = i + 1; j < this.selectedDyes.length; j++) {
          this.pairResults.push(this.analyzePair(this.selectedDyes[i], this.selectedDyes[j]));
        }
      }

      const pairsSection = this.createElement('div', {
        className: 'space-y-4 mt-8',
      });

      const pairsLabel = this.createElement('h3', {
        textContent: LanguageService.t('accessibility.pairComparisons'),
        className: 'text-lg font-semibold text-gray-900 dark:text-white',
      });
      pairsSection.appendChild(pairsLabel);

      const pairsGrid = this.createElement('div', {
        className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
      });

      for (const pairResult of this.pairResults) {
        const card = this.renderPairCard(pairResult);
        pairsGrid.appendChild(card);
      }

      pairsSection.appendChild(pairsGrid);
      resultsContainer.appendChild(pairsSection);
    }
  }

  /**
   * Get WCAG level from contrast ratio
   */
  private getWCAGLevel(ratio: number): 'AAA' | 'AA' | 'Fail' {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'Fail';
  }

  /**
   * Analyze a single dye for accessibility
   */
  private analyzeDye(dye: Dye): DyeAccessibilityResult {
    const primaryHex = dye.hex;

    // Background colors for contrast testing
    const lightBg = '#FFFFFF';
    const darkBg = '#000000';

    const contrastLight = ColorService.getContrastRatio(primaryHex, lightBg);
    const contrastDark = ColorService.getContrastRatio(primaryHex, darkBg);

    const warnings: string[] = [];

    // Simulate colorblindness for all 5 vision types
    const deuterColor = ColorService.simulateColorblindnessHex(primaryHex, 'deuteranopia');
    const protanColor = ColorService.simulateColorblindnessHex(primaryHex, 'protanopia');
    const tritanColor = ColorService.simulateColorblindnessHex(primaryHex, 'tritanopia');
    const achromColor = ColorService.simulateColorblindnessHex(primaryHex, 'achromatopsia');

    // Generate warnings for distinguishability issues
    if (deuterColor === protanColor) {
      warnings.push(LanguageService.t('accessibility.redGreenWarning'));
    }

    if (ColorService.getColorDistance(primaryHex, tritanColor) < 30) {
      warnings.push(LanguageService.t('accessibility.tritanopiaWarning'));
    }

    if (ColorService.getColorDistance(primaryHex, achromColor) < 30) {
      warnings.push(LanguageService.t('accessibility.achromatopsiaWarning'));
    }

    return {
      dyeId: dye.id,
      dyeName: LanguageService.getDyeName(dye.itemID) || dye.name,
      hex: primaryHex,
      contrastVsWhite: {
        ratio: Math.round(contrastLight * 100) / 100,
        wcagLevel: this.getWCAGLevel(contrastLight),
      },
      contrastVsBlack: {
        ratio: Math.round(contrastDark * 100) / 100,
        wcagLevel: this.getWCAGLevel(contrastDark),
      },
      warnings,
      colorblindnessSimulations: {
        normal: primaryHex,
        deuteranopia: deuterColor,
        protanopia: protanColor,
        tritanopia: tritanColor,
        achromatopsia: achromColor,
      },
    };
  }

  /**
   * Analyze distinguishability between two dyes
   */
  private analyzePair(dye1: Dye, dye2: Dye): DyePairResult {
    const contrastRatio = ColorService.getContrastRatio(dye1.hex, dye2.hex);
    const distance = ColorService.getColorDistance(dye1.hex, dye2.hex);
    // Normalize to 0-100 scale (max distance is 441.67)
    const distinguishability = Math.round((distance / 441.67) * 100);

    // Calculate distinguishability under each vision type
    const normalDist = Math.round(
      (ColorService.getColorDistance(dye1.hex, dye2.hex) / 441.67) * 100
    );
    const deuterDist = Math.round(
      (ColorService.getColorDistance(
        ColorService.simulateColorblindnessHex(dye1.hex, 'deuteranopia'),
        ColorService.simulateColorblindnessHex(dye2.hex, 'deuteranopia')
      ) /
        441.67) *
        100
    );
    const protanDist = Math.round(
      (ColorService.getColorDistance(
        ColorService.simulateColorblindnessHex(dye1.hex, 'protanopia'),
        ColorService.simulateColorblindnessHex(dye2.hex, 'protanopia')
      ) /
        441.67) *
        100
    );
    const tritanDist = Math.round(
      (ColorService.getColorDistance(
        ColorService.simulateColorblindnessHex(dye1.hex, 'tritanopia'),
        ColorService.simulateColorblindnessHex(dye2.hex, 'tritanopia')
      ) /
        441.67) *
        100
    );

    const warnings: string[] = [];

    if (distinguishability < 20) {
      warnings.push(LanguageService.t('accessibility.verySimular'));
    } else if (distinguishability < 40) {
      warnings.push(LanguageService.t('accessibility.somewhatSimilar'));
    }

    // Add colorblindness-specific warnings
    if (deuterDist < 20 && normalDist >= 20) {
      warnings.push(LanguageService.t('accessibility.hardForDeuteranopia'));
    }
    if (protanDist < 20 && normalDist >= 20) {
      warnings.push(LanguageService.t('accessibility.hardForProtanopia'));
    }
    if (tritanDist < 20 && normalDist >= 20) {
      warnings.push(LanguageService.t('accessibility.hardForTritanopia'));
    }

    return {
      dye1Id: dye1.id,
      dye1Name: LanguageService.getDyeName(dye1.itemID) || dye1.name,
      dye1Hex: dye1.hex,
      dye2Id: dye2.id,
      dye2Name: LanguageService.getDyeName(dye2.itemID) || dye2.name,
      dye2Hex: dye2.hex,
      contrastRatio: Math.round(contrastRatio * 100) / 100,
      wcagLevel: this.getWCAGLevel(contrastRatio),
      distinguishability,
      colorblindnessDistinguishability: {
        normal: normalDist,
        deuteranopia: deuterDist,
        protanopia: protanDist,
        tritanopia: tritanDist,
      },
      warnings,
    };
  }

  /**
   * Render a dye analysis card
   */
  private renderDyeCard(result: DyeAccessibilityResult): HTMLElement {
    const card = this.createElement('div', {
      className:
        'bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
    });

    // Color swatch
    const swatchRow = this.createElement('div', {
      className: 'flex items-center gap-3 mb-3',
    });

    const swatch = this.createElement('div', {
      className:
        'dye-swatch w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
      attributes: {
        style: `background-color: ${result.hex}`,
      },
    });
    swatchRow.appendChild(swatch);

    const swatchText = this.createElement('div');
    const swatchName = this.createElement('div', {
      textContent: result.dyeName,
      className: 'font-semibold text-gray-900 dark:text-white',
    });
    const swatchHex = this.createElement('div', {
      textContent: result.hex,
      className: 'text-xs text-gray-500 dark:text-gray-400 font-mono',
    });
    swatchText.appendChild(swatchName);
    swatchText.appendChild(swatchHex);
    swatchRow.appendChild(swatchText);
    card.appendChild(swatchRow);

    // Contrast section - vs White and vs Black
    const contrastSection = this.createElement('div', {
      className: 'space-y-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700',
    });

    const contrastLabel = this.createElement('div', {
      textContent: LanguageService.t('accessibility.contrastRatios'),
      className: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    });
    addInfoIconTo(contrastLabel, TOOLTIP_CONTENT.wcagContrast);
    contrastSection.appendChild(contrastLabel);

    // Contrast vs White
    const whiteRow = this.renderContrastRow(
      LanguageService.t('accessibility.vsWhite'),
      '#FFFFFF',
      result.contrastVsWhite
    );
    contrastSection.appendChild(whiteRow);

    // Contrast vs Black
    const blackRow = this.renderContrastRow(
      LanguageService.t('accessibility.vsBlack'),
      '#000000',
      result.contrastVsBlack
    );
    contrastSection.appendChild(blackRow);

    card.appendChild(contrastSection);

    // Warnings
    if (result.warnings.length > 0) {
      const warningsSection = this.createElement('div', {
        className: 'space-y-1 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700',
      });

      const warningsLabel = this.createElement('div', {
        innerHTML: `<span class="inline-block w-4 h-4 align-middle mr-1">${ICON_WARNING}</span>${LanguageService.t('accessibility.colorblindnessIssues')}`,
        className: 'text-xs font-semibold text-warning',
      });
      warningsSection.appendChild(warningsLabel);

      for (const warning of result.warnings) {
        const warningText = this.createElement('div', {
          textContent: warning,
          className: 'text-xs text-gray-600 dark:text-gray-400',
        });
        warningsSection.appendChild(warningText);
      }

      card.appendChild(warningsSection);
    }

    // Colorblindness simulations
    const colorblindSection = this.createElement('div', {
      className: 'space-y-2',
    });

    const colorblindLabel = this.createElement('div', {
      className: 'text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5',
    });
    colorblindLabel.innerHTML = `<span class="inline-block w-4 h-4">${ICON_TOOL_ACCESSIBILITY}</span> ${LanguageService.t('accessibility.visionSimulation')}`;
    colorblindSection.appendChild(colorblindLabel);

    // Flex wrap container for vision type simulations
    const simulationsGrid = this.createElement('div', {
      className: 'flex flex-wrap gap-3',
    });

    // Vision types to display (using core localization for vision type names)
    const visionTypes: Array<{
      key: keyof typeof result.colorblindnessSimulations;
      localeKey: string;
    }> = [
      { key: 'normal', localeKey: 'normal' },
      { key: 'deuteranopia', localeKey: 'deuteranopia' },
      { key: 'protanopia', localeKey: 'protanopia' },
      { key: 'tritanopia', localeKey: 'tritanopia' },
      { key: 'achromatopsia', localeKey: 'achromatopsia' },
    ];

    for (const visionType of visionTypes) {
      const simCard = this.createElement('div', {
        className: 'flex flex-col items-center gap-1 min-w-[4.5rem] flex-1',
      });

      const colorSwatch = this.createElement('div', {
        className: 'w-full h-8 rounded border border-gray-300 dark:border-gray-600',
        attributes: {
          style: `background-color: ${result.colorblindnessSimulations[visionType.key]}`,
        },
      });

      const typeLabel = this.createElement('div', {
        textContent: LanguageService.getVisionType(visionType.localeKey),
        className: 'text-xs text-gray-600 dark:text-gray-400 text-center',
      });

      simCard.appendChild(colorSwatch);
      simCard.appendChild(typeLabel);
      simulationsGrid.appendChild(simCard);
    }

    colorblindSection.appendChild(simulationsGrid);
    card.appendChild(colorblindSection);

    return card;
  }

  /**
   * Render a contrast ratio row with color swatch and WCAG badge
   */
  private renderContrastRow(
    label: string,
    bgColor: string,
    contrast: ContrastResult
  ): HTMLElement {
    const row = this.createElement('div', {
      className: 'flex items-center justify-between gap-2',
    });

    const leftSide = this.createElement('div', {
      className: 'flex items-center gap-2',
    });

    const colorSwatch = this.createElement('div', {
      className: 'w-5 h-5 rounded border border-gray-400 dark:border-gray-500',
      attributes: {
        style: `background-color: ${bgColor}`,
      },
    });
    leftSide.appendChild(colorSwatch);

    const labelText = this.createElement('span', {
      textContent: label,
      className: 'text-xs text-gray-600 dark:text-gray-400',
    });
    leftSide.appendChild(labelText);

    row.appendChild(leftSide);

    const rightSide = this.createElement('div', {
      className: 'flex items-center gap-2',
    });

    const ratioText = this.createElement('span', {
      textContent: `${contrast.ratio}:1`,
      className: 'text-xs font-mono font-semibold text-gray-900 dark:text-white',
    });
    rightSide.appendChild(ratioText);

    const wcagBadge = this.createElement('span', {
      textContent: `WCAG ${contrast.wcagLevel}`,
      className: this.getWCAGBadgeColor(contrast.wcagLevel),
    });
    rightSide.appendChild(wcagBadge);

    row.appendChild(rightSide);

    return row;
  }

  /**
   * Render a dye pair comparison card
   */
  private renderPairCard(result: DyePairResult): HTMLElement {
    const card = this.createElement('div', {
      className:
        'bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
    });

    // Dyes side by side
    const pairRow = this.createElement('div', {
      className: 'flex items-center justify-between gap-4 mb-3',
    });

    // Left dye
    const leftDye = this.createElement('div', {
      className: 'flex-1 flex items-center gap-2',
    });
    const leftSwatch = this.createElement('div', {
      className:
        'dye-swatch w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
      attributes: {
        style: `background-color: ${result.dye1Hex}`,
      },
    });
    const leftName = this.createElement('div', {
      textContent: result.dye1Name,
      className: 'text-sm font-medium text-gray-900 dark:text-white truncate',
    });
    leftDye.appendChild(leftSwatch);
    leftDye.appendChild(leftName);
    pairRow.appendChild(leftDye);

    // Arrow
    const arrow = this.createElement('div', {
      textContent: '↔',
      className: 'text-gray-400 dark:text-gray-600 text-lg',
    });
    pairRow.appendChild(arrow);

    // Right dye
    const rightDye = this.createElement('div', {
      className: 'flex-1 flex items-center gap-2 justify-end',
    });
    const rightName = this.createElement('div', {
      textContent: result.dye2Name,
      className: 'text-sm font-medium text-gray-900 dark:text-white truncate text-right',
    });
    const rightSwatch = this.createElement('div', {
      className:
        'dye-swatch w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
      attributes: {
        style: `background-color: ${result.dye2Hex}`,
      },
    });
    rightDye.appendChild(rightName);
    rightDye.appendChild(rightSwatch);
    pairRow.appendChild(rightDye);
    card.appendChild(pairRow);

    // Contrast ratio between the two dyes
    const contrastSection = this.createElement('div', {
      className: 'mb-3 pb-3 border-b border-gray-200 dark:border-gray-700',
    });

    const contrastRow = this.createElement('div', {
      className: 'flex items-center justify-between',
    });

    const contrastLabel = this.createElement('span', {
      textContent: LanguageService.t('accessibility.contrastBetween'),
      className: 'text-xs text-gray-600 dark:text-gray-400',
    });
    contrastRow.appendChild(contrastLabel);

    const contrastValue = this.createElement('div', {
      className: 'flex items-center gap-2',
    });

    const ratioText = this.createElement('span', {
      textContent: `${result.contrastRatio}:1`,
      className: 'text-sm font-mono font-semibold text-gray-900 dark:text-white',
    });
    contrastValue.appendChild(ratioText);

    const wcagBadge = this.createElement('span', {
      textContent: `WCAG ${result.wcagLevel}`,
      className: this.getWCAGBadgeColor(result.wcagLevel),
    });
    contrastValue.appendChild(wcagBadge);

    contrastRow.appendChild(contrastValue);
    contrastSection.appendChild(contrastRow);
    card.appendChild(contrastSection);

    // Distinguishability under different vision types
    const visionSection = this.createElement('div', {
      className: 'space-y-2',
    });

    const visionLabel = this.createElement('div', {
      textContent: LanguageService.t('accessibility.distinguishabilityByVision'),
      className: 'text-xs font-semibold text-gray-700 dark:text-gray-300',
    });
    visionSection.appendChild(visionLabel);

    const visionGrid = this.createElement('div', {
      className: 'grid grid-cols-2 gap-2',
    });

    const visionTypes: Array<{
      key: keyof typeof result.colorblindnessDistinguishability;
      localeKey: string;
    }> = [
      { key: 'normal', localeKey: 'normal' },
      { key: 'deuteranopia', localeKey: 'deuteranopia' },
      { key: 'protanopia', localeKey: 'protanopia' },
      { key: 'tritanopia', localeKey: 'tritanopia' },
    ];

    for (const visionType of visionTypes) {
      const dist = result.colorblindnessDistinguishability[visionType.key];
      const visionRow = this.createElement('div', {
        className: 'flex items-center justify-between',
      });

      const visionName = this.createElement('span', {
        textContent: LanguageService.getVisionType(visionType.localeKey),
        className: 'text-xs text-gray-600 dark:text-gray-400',
      });
      visionRow.appendChild(visionName);

      const distValue = this.createElement('span', {
        textContent: `${dist}%`,
        className: `text-xs font-semibold ${this.getDistinguishabilityTextColor(dist)}`,
      });
      visionRow.appendChild(distValue);

      visionGrid.appendChild(visionRow);
    }

    visionSection.appendChild(visionGrid);
    card.appendChild(visionSection);

    // Warnings
    if (result.warnings.length > 0) {
      const warningsSection = this.createElement('div', {
        className: 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1',
      });

      for (const warning of result.warnings) {
        const warningText = this.createElement('div', {
          innerHTML: `<span class="inline-block w-4 h-4 align-middle mr-1">${ICON_WARNING}</span>${warning}`,
          className: 'text-xs text-warning',
        });
        warningsSection.appendChild(warningText);
      }

      card.appendChild(warningsSection);
    }

    return card;
  }

  /**
   * Get badge color for WCAG level
   */
  private getWCAGBadgeColor(level: string): string {
    switch (level) {
      case 'AAA':
        return 'px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs';
      case 'AA':
        return 'px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs';
      default:
        return 'px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs';
    }
  }

  /**
   * Get text color class for distinguishability percentage
   */
  private getDistinguishabilityTextColor(score: number): string {
    if (score >= 60) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-blue-600 dark:text-blue-400';
    if (score >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }
}

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

/**
 * Individual dye accessibility analysis
 */
export interface DyeAccessibilityResult {
  dyeId: number;
  dyeName: string;
  hex: string;
  contrastScore: number; // 0-100
  wcagLevel: 'AAA' | 'AA' | 'Fail';
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
 * Dye pair distinguishability analysis
 */
export interface DyePairResult {
  dye1Id: number;
  dye1Name: string;
  dye1Hex: string;
  dye2Id: number;
  dye2Name: string;
  dye2Hex: string;
  distinguishability: number; // 0-100
  warnings: string[];
}

/**
 * Accessibility Checker Tool Component
 * Simulate colorblindness and check color accessibility for up to 12 dyes
 * Supports both individual dye analysis and optional pairwise comparisons
 */
export class AccessibilityCheckerTool extends BaseComponent {
  private dyeSelector: DyeSelector | null = null;
  private selectedDyes: Dye[] = [];
  private dyePairs: [Dye, Dye][] = [];
  private dyeResults: DyeAccessibilityResult[] = [];
  private pairResults: DyePairResult[] = [];

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
      className: 'text-3xl font-bold',
      attributes: {
        style: 'color: var(--theme-text);',
      },
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
      textContent: LanguageService.tInterpolate('accessibility.selectUpTo', { count: '12' }),
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
        maxSelections: 12,
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
    LanguageService.subscribe(() => {
      this.update();
    });
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

    // Render overall accessibility score
    const overallScore = this.calculateOverallAccessibilityScore();
    const overallSection = this.renderOverallAccessibilityScore(overallScore);
    resultsContainer.appendChild(overallSection);

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
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    });

    for (const result of this.dyeResults) {
      const card = this.renderDyeCard(result);
      dyesGrid.appendChild(card);
    }

    dyesSection.appendChild(dyesGrid);
    resultsContainer.appendChild(dyesSection);

    // Render pair comparison section if 2+ dyes selected
    if (this.selectedDyes.length >= 2) {
      const pairsSection = this.createElement('div', {
        className: 'space-y-4 mt-8',
      });

      const pairsLabel = this.createElement('h3', {
        textContent: LanguageService.t('accessibility.pairComparisons'),
        className: 'text-lg font-semibold text-gray-900 dark:text-white',
      });
      pairsSection.appendChild(pairsLabel);

      const pairsNote = this.createElement('p', {
        textContent: LanguageService.t('accessibility.pairComparisonNote'),
        className: 'text-sm text-gray-600 dark:text-gray-400 mb-4',
      });
      pairsSection.appendChild(pairsNote);

      const pairsContainer = this.createElement('div', {
        id: 'pairs-container',
        className: 'space-y-3',
      });
      pairsSection.appendChild(pairsContainer);

      resultsContainer.appendChild(pairsSection);
    }
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

    // Use the worse contrast ratio (min value) for safety
    const contrastScore = Math.round(Math.min(contrastLight, contrastDark) * 20);

    // Check accessibility levels
    const wcagLevel = contrastScore >= 100 ? 'AAA' : contrastScore >= 70 ? 'AA' : 'Fail';

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
      contrastScore,
      wcagLevel,
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
    const distance = ColorService.getColorDistance(dye1.hex, dye2.hex);
    // Normalize to 0-100 scale (max distance is 441.67)
    const distinguishability = Math.round((distance / 441.67) * 100);

    const warnings: string[] = [];

    if (distinguishability < 20) {
      warnings.push(LanguageService.t('accessibility.verySimular'));
    } else if (distinguishability < 40) {
      warnings.push(LanguageService.t('accessibility.somewhatSimilar'));
    }

    return {
      dye1Id: dye1.id,
      dye1Name: LanguageService.getDyeName(dye1.itemID) || dye1.name,
      dye1Hex: dye1.hex,
      dye2Id: dye2.id,
      dye2Name: LanguageService.getDyeName(dye2.itemID) || dye2.name,
      dye2Hex: dye2.hex,
      distinguishability,
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
      className: 'w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
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

    // Contrast score
    const scoreSection = this.createElement('div', {
      className: 'space-y-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700',
    });

    const scoreLabel = this.createElement('div', {
      textContent: LanguageService.t('accessibility.contrastScore'),
      className: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    });
    addInfoIconTo(scoreLabel, TOOLTIP_CONTENT.wcagContrast);
    scoreSection.appendChild(scoreLabel);

    const scoreBar = this.createElement('div', {
      className: 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden',
    });

    const scoreFill = this.createElement('div', {
      className: this.getScoreColor(result.contrastScore),
      attributes: {
        style: `width: ${result.contrastScore}%`,
      },
    });
    scoreBar.appendChild(scoreFill);
    scoreSection.appendChild(scoreBar);

    const scoreText = this.createElement('div', {
      className: 'flex justify-between text-xs',
    });
    const scoreValue = this.createElement('span', {
      textContent: `${result.contrastScore}/${100}`,
      className: 'font-semibold text-gray-900 dark:text-white',
    });
    const wcagBadge = this.createElement('span', {
      textContent: `WCAG ${result.wcagLevel}`,
      className: this.getWCAGBadgeColor(result.wcagLevel),
    });
    scoreText.appendChild(scoreValue);
    scoreText.appendChild(wcagBadge);
    scoreSection.appendChild(scoreText);
    card.appendChild(scoreSection);

    // Warnings
    if (result.warnings.length > 0) {
      const warningsSection = this.createElement('div', {
        className: 'space-y-1',
      });

      const warningsLabel = this.createElement('div', {
        textContent: `⚠️ ${LanguageService.t('accessibility.colorblindnessIssues')}`,
        className: 'text-xs font-semibold text-orange-700 dark:text-orange-300',
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
      className: 'space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700',
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
      className: 'w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
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
      className: 'w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0',
      attributes: {
        style: `background-color: ${result.dye2Hex}`,
      },
    });
    rightDye.appendChild(rightName);
    rightDye.appendChild(rightSwatch);
    pairRow.appendChild(rightDye);
    card.appendChild(pairRow);

    // Distinguishability score
    const scoreSection = this.createElement('div', {
      className: 'space-y-2',
    });

    const scoreBar = this.createElement('div', {
      className: 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden',
    });

    const scoreFill = this.createElement('div', {
      className: this.getDistinguishabilityColor(result.distinguishability),
      attributes: {
        style: `width: ${result.distinguishability}%`,
      },
    });
    scoreBar.appendChild(scoreFill);
    scoreSection.appendChild(scoreBar);

    const scoreText = this.createElement('div', {
      className: 'flex justify-between text-xs',
    });
    const scoreValue = this.createElement('span', {
      textContent: `${result.distinguishability}% ${LanguageService.t('accessibility.distinguishable')}`,
      className: 'font-semibold text-gray-900 dark:text-white',
    });
    scoreText.appendChild(scoreValue);
    scoreSection.appendChild(scoreText);

    // Warnings
    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        const warningText = this.createElement('div', {
          textContent: `⚠️ ${warning}`,
          className: 'text-xs text-orange-700 dark:text-orange-300 mt-2',
        });
        scoreSection.appendChild(warningText);
      }
    }

    card.appendChild(scoreSection);
    return card;
  }

  /**
   * Get color class for contrast score bar
   */
  private getScoreColor(score: number): string {
    if (score >= 100) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  /**
   * Get badge color for WCAG level
   */
  private getWCAGBadgeColor(level: string): string {
    switch (level) {
      case 'AAA':
        return 'px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded';
      case 'AA':
        return 'px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded';
      default:
        return 'px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded';
    }
  }

  /**
   * Get color class for distinguishability score
   */
  private getDistinguishabilityColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  /**
   * Calculate overall accessibility score from selected dyes
   * Uses legacy logic: Starts at 100 and subtracts points for distinguishability issues
   * across all vision types (Normal, Deuteranopia, Protanopia, Tritanopia).
   */
  private calculateOverallAccessibilityScore(): number {
    // If less than 2 dyes, there are no pairs to compare, so score is 100% (Pass)
    if (this.selectedDyes.length < 2) return 100;

    let score = 100;
    const visionTypes: ('normal' | 'deuteranopia' | 'protanopia' | 'tritanopia')[] = [
      'normal',
      'deuteranopia',
      'protanopia',
      'tritanopia',
    ];

    // Check every pair of dyes
    for (let i = 0; i < this.selectedDyes.length; i++) {
      for (let j = i + 1; j < this.selectedDyes.length; j++) {
        const dye1 = this.selectedDyes[i];
        const dye2 = this.selectedDyes[j];

        // Check distinguishability under each vision type
        for (const visionType of visionTypes) {
          const c1 = ColorService.simulateColorblindnessHex(dye1.hex, visionType);
          const c2 = ColorService.simulateColorblindnessHex(dye2.hex, visionType);
          const distance = ColorService.getColorDistance(c1, c2);

          // Apply penalties based on distance (thresholds from legacy tool)
          if (distance < 30) {
            score -= 10; // Hard to distinguish
          } else if (distance < 60) {
            score -= 2; // Somewhat similar
          }
        }
      }
    }

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get color and label for overall accessibility score
   */
  private getAccessibilityScoreStyle(score: number): {
    color: string;
    label: string;
    bgClass: string;
  } {
    if (score >= 80) {
      return {
        color: 'text-green-700 dark:text-green-300',
        label: LanguageService.t('accessibility.excellent'),
        bgClass: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
      };
    }
    if (score >= 50) {
      return {
        color: 'text-yellow-700 dark:text-yellow-300',
        label: LanguageService.t('accessibility.fair'),
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
      };
    }
    return {
      color: 'text-red-700 dark:text-red-300',
      label: LanguageService.t('accessibility.poor'),
      bgClass: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    };
  }

  /**
   * Render overall accessibility score section
   */
  private renderOverallAccessibilityScore(score: number): HTMLElement {
    const section = this.createElement('div', {
      className: 'space-y-4 mb-8',
    });

    const { color, label, bgClass } = this.getAccessibilityScoreStyle(score);

    const card = this.createElement('div', {
      className: `rounded-lg border-2 p-6 ${bgClass}`,
    });

    const headerRow = this.createElement('div', {
      className: 'flex items-center justify-between mb-4',
    });

    const titleSection = this.createElement('div');
    const title = this.createElement('h3', {
      textContent: LanguageService.t('accessibility.overallScore'),
      className: 'text-xl font-bold text-gray-900 dark:text-white',
    });
    const description = this.createElement('p', {
      textContent: LanguageService.tInterpolate('accessibility.overallScoreDesc', { count: this.dyeResults.length.toString() }),
      className: 'text-sm text-gray-600 dark:text-gray-400 mt-1',
    });
    titleSection.appendChild(title);
    titleSection.appendChild(description);
    headerRow.appendChild(titleSection);

    const scoreDisplay = this.createElement('div', {
      className: 'text-right',
    });
    const scoreValue = this.createElement('div', {
      textContent: `${score}`,
      className: `text-5xl font-bold ${color}`,
    });
    const scoreMax = this.createElement('div', {
      textContent: '/ 100',
      className: 'text-lg text-gray-600 dark:text-gray-400 mt-1',
    });
    const statusLabel = this.createElement('div', {
      textContent: label,
      className: `text-sm font-semibold ${color} mt-2`,
    });
    scoreDisplay.appendChild(scoreValue);
    scoreDisplay.appendChild(scoreMax);
    scoreDisplay.appendChild(statusLabel);
    headerRow.appendChild(scoreDisplay);

    card.appendChild(headerRow);

    // Progress bar
    const barContainer = this.createElement('div', {
      className: 'w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden',
    });
    const barFill = this.createElement('div', {
      className: this.getScoreColor(score),
      attributes: {
        style: `width: ${score}%`,
      },
    });
    barContainer.appendChild(barFill);
    card.appendChild(barContainer);

    section.appendChild(card);
    return section;
  }

  /**
   * Create a pair from two dyes
   */
  createPair(dye1: Dye, dye2: Dye): void {
    this.dyePairs.push([dye1, dye2]);
    const pairResult = this.analyzePair(dye1, dye2);
    this.pairResults.push(pairResult);

    const pairsContainer = this.querySelector<HTMLElement>('#pairs-container');
    if (pairsContainer) {
      const card = this.renderPairCard(pairResult);
      pairsContainer.appendChild(card);
    }
  }

  /**
   * Clear all pairs
   */
  clearPairs(): void {
    this.dyePairs = [];
    this.pairResults = [];
    const pairsContainer = this.querySelector<HTMLElement>('#pairs-container');
    if (pairsContainer) {
      clearContainer(pairsContainer);
    }
  }
}

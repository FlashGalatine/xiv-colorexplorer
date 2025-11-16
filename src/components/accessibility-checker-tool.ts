/**
 * XIV Dye Tools v2.0.0 - Accessibility Checker Tool Component
 *
 * Phase 12: Architecture Refactor
 * Main tool for checking color accessibility and colorblindness simulation
 *
 * @module components/accessibility-checker-tool
 */

import { BaseComponent } from './base-component';
import { OutfitSlotSelector } from './outfit-slot-selector';
import { ColorblindnessDisplay } from './colorblindness-display';
import type { OutfitSlot } from './outfit-slot-selector';
import { ColorService } from '@services/index';

/**
 * Accessibility Check Result
 */
export interface AccessibilityResult {
  slotId: string;
  slotName: string;
  primaryHex: string;
  secondaryHex?: string;
  contrastScore: number; // 0-100
  distinguishability: number; // 0-100
  warnings: string[];
  wcagLevel: 'AAA' | 'AA' | 'Fail';
}

/**
 * Accessibility Checker Tool Component
 * Simulate colorblindness and check color accessibility
 */
export class AccessibilityCheckerTool extends BaseComponent {
  private slotSelector: OutfitSlotSelector | null = null;
  private colorblindnessDisplays: Map<string, ColorblindnessDisplay> = new Map();
  private selectedSlots: OutfitSlot[] = [];
  private enableDualDyes: boolean = false;
  private results: AccessibilityResult[] = [];

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
      textContent: 'Accessibility Checker',
      className: 'text-3xl font-bold text-gray-900 dark:text-white',
    });

    const subtitle = this.createElement('p', {
      textContent:
        'Check how your outfit colors appear to people with color vision deficiency. Simulate deuteranopia, protanopia, tritanopia, and achromatopsia.',
      className: 'text-gray-600 dark:text-gray-300',
    });

    title.appendChild(heading);
    title.appendChild(subtitle);
    wrapper.appendChild(title);

    // Slot selector section
    const selectorSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const selectorLabel = this.createElement('h3', {
      textContent: 'Select Outfit Dyes',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    selectorSection.appendChild(selectorLabel);

    const slotSelectorContainer = this.createElement('div', {
      id: 'slot-selector-container',
    });
    selectorSection.appendChild(slotSelectorContainer);

    wrapper.appendChild(selectorSection);

    // Results section
    const resultsSection = this.createElement('div', {
      id: 'results-container',
    });
    wrapper.appendChild(resultsSection);

    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const slotSelectorContainer = this.querySelector<HTMLElement>('#slot-selector-container');

    if (slotSelectorContainer && !this.slotSelector) {
      this.slotSelector = new OutfitSlotSelector(slotSelectorContainer, this.enableDualDyes);
      this.slotSelector.init();

      slotSelectorContainer.addEventListener('slot-changed', () => {
        this.updateResults();
      });
    }
  }

  /**
   * Update results display
   */
  private updateResults(): void {
    if (!this.slotSelector) return;

    const resultsContainer = this.querySelector<HTMLElement>('#results-container');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    this.selectedSlots = this.slotSelector.getSelectedSlots();

    // Filter to only slots with primary dyes selected
    const slotsWithDyes = this.selectedSlots.filter((slot) => slot.primary);

    if (slotsWithDyes.length === 0) {
      const empty = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: 'Select dyes for outfit slots to see accessibility analysis',
      });
      resultsContainer.appendChild(empty);
      return;
    }

    // Calculate results
    this.results = slotsWithDyes.map((slot) => this.analyzeSlot(slot));

    // Render summary
    const summary = this.renderSummary();
    resultsContainer.appendChild(summary);

    // Render each slot's analysis
    for (const result of this.results) {
      const slotAnalysis = this.renderSlotAnalysis(result);
      resultsContainer.appendChild(slotAnalysis);
    }
  }

  /**
   * Analyze a single outfit slot
   */
  private analyzeSlot(slot: OutfitSlot): AccessibilityResult {
    const primaryHex = slot.primary!.hex;
    const secondaryHex = slot.secondary?.hex;

    // Background colors for contrast testing
    const lightBg = '#FFFFFF';
    const darkBg = '#000000';

    const contrastLight = ColorService.getContrastRatio(primaryHex, lightBg);
    const contrastDark = ColorService.getContrastRatio(primaryHex, darkBg);

    // Use the better contrast ratio (min value used for edge case handling)
    const contrastScore = Math.round(Math.min(contrastLight, contrastDark) * 20);

    // Check if primary and secondary are distinguishable
    let distinguishability = 100;
    const warnings: string[] = [];

    if (secondaryHex) {
      const slotDistance = ColorService.getColorDistance(primaryHex, secondaryHex);
      // Normalize to 0-100 scale
      distinguishability = Math.round((1 - slotDistance / 441.67) * 100);

      if (distinguishability < 20) {
        warnings.push('Primary and secondary dyes are very similar - may be hard to distinguish');
      }
    }

    // Check accessibility levels
    const wcaaLevel = contrastScore >= 100 ? 'AAA' : contrastScore >= 70 ? 'AA' : 'Fail';

    // Check for colorblindness issues
    const deuterColor = ColorService.simulateColorblindnessHex(primaryHex, 'deuteranopia');
    const protanColor = ColorService.simulateColorblindnessHex(primaryHex, 'protanopia');
    const tritanColor = ColorService.simulateColorblindnessHex(primaryHex, 'tritanopia');

    if (deuterColor === protanColor) {
      warnings.push('Red-green colorblind users see identical colors');
    }

    if (ColorService.getColorDistance(primaryHex, tritanColor) < 30) {
      warnings.push('Color may be hard to see for tritanopia (blue-yellow colorblindness)');
    }

    return {
      slotId: slot.id,
      slotName: slot.name,
      primaryHex,
      secondaryHex,
      contrastScore: Math.min(100, contrastScore),
      distinguishability: distinguishability,
      warnings,
      wcagLevel: wcaaLevel,
    };
  }

  /**
   * Render summary statistics
   */
  private renderSummary(): HTMLElement {
    const summary = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    const title = this.createElement('h3', {
      textContent: 'Accessibility Summary',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    summary.appendChild(title);

    // Overall score
    const avgContrast = Math.round(
      this.results.reduce((sum, r) => sum + r.contrastScore, 0) / this.results.length
    );

    const overallScore = this.createElement('div', {
      className: 'grid grid-cols-3 gap-4',
    });

    const scoreCard = this.renderStatCard(
      'Overall Contrast',
      String(avgContrast),
      this.getScoreColor(avgContrast)
    );
    overallScore.appendChild(scoreCard);

    const slotsCard = this.renderStatCard(
      'Slots Analyzed',
      String(this.results.length),
      'text-blue-600 dark:text-blue-400'
    );
    overallScore.appendChild(slotsCard);

    const warningCount = this.results.reduce((sum, r) => sum + r.warnings.length, 0);
    const warningColor =
      warningCount === 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-yellow-600 dark:text-yellow-400';
    const warningsCard = this.renderStatCard('Warnings', String(warningCount), warningColor);
    overallScore.appendChild(warningsCard);

    summary.appendChild(overallScore);

    // Warnings list
    const allWarnings = this.results.flatMap((r) => r.warnings.map((w) => `${r.slotName}: ${w}`));

    if (allWarnings.length > 0) {
      const warningsSection = this.createElement('div', {
        className:
          'mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg',
      });

      const warningsTitle = this.createElement('div', {
        textContent: '⚠️ Accessibility Warnings',
        className: 'text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2',
      });
      warningsSection.appendChild(warningsTitle);

      const warningsList = this.createElement('ul', {
        className: 'text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside',
      });

      for (const warning of allWarnings) {
        const item = this.createElement('li', {
          textContent: warning,
          className: 'text-xs',
        });
        warningsList.appendChild(item);
      }

      warningsSection.appendChild(warningsList);
      summary.appendChild(warningsSection);
    }

    return summary;
  }

  /**
   * Render stat card
   */
  private renderStatCard(label: string, value: string, colorClass: string): HTMLElement {
    const card = this.createElement('div', {
      className: 'bg-gray-50 dark:bg-gray-700 rounded p-3 text-center',
    });

    const labelDiv = this.createElement('div', {
      textContent: label,
      className: 'text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1',
    });

    const valueDiv = this.createElement('div', {
      textContent: value,
      className: `text-2xl font-bold ${colorClass}`,
    });

    card.appendChild(labelDiv);
    card.appendChild(valueDiv);

    return card;
  }

  /**
   * Get color class for contrast score
   */
  private getScoreColor(score: number): string {
    if (score >= 100) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 45) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  /**
   * Render slot analysis section
   */
  private renderSlotAnalysis(result: AccessibilityResult): HTMLElement {
    const section = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    // Header with slot icon
    const header = this.createElement('div', {
      className:
        'flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700',
    });

    const titleDiv = this.createElement('div', {
      textContent: result.slotName,
      className: 'text-lg font-semibold text-gray-900 dark:text-white',
    });

    const wcagBadge = this.createElement('div', {
      textContent: `WCAG ${result.wcagLevel}`,
      className: `px-3 py-1 rounded-full text-sm font-bold ${
        result.wcagLevel === 'AAA'
          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
          : result.wcagLevel === 'AA'
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200'
            : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
      }`,
    });

    header.appendChild(titleDiv);
    header.appendChild(wcagBadge);
    section.appendChild(header);

    // Metrics
    const metrics = this.createElement('div', {
      className: 'grid grid-cols-2 gap-3',
    });

    const contrastCard = this.renderMetricCard(
      'Contrast Score',
      result.contrastScore,
      this.getScoreColor(result.contrastScore)
    );
    metrics.appendChild(contrastCard);

    const distinguishCard = this.renderMetricCard(
      'Distinguishability',
      Math.round(result.distinguishability),
      'text-blue-600 dark:text-blue-400'
    );
    metrics.appendChild(distinguishCard);

    section.appendChild(metrics);

    // Colorblindness display
    const displayContainer = this.createElement('div', {
      id: `colorblindness-${result.slotId}`,
    });
    section.appendChild(displayContainer);

    return section;
  }

  /**
   * Render metric card
   */
  private renderMetricCard(label: string, value: number, colorClass: string): HTMLElement {
    const card = this.createElement('div', {
      className: 'bg-gray-50 dark:bg-gray-700/50 rounded p-3',
    });

    const labelDiv = this.createElement('div', {
      textContent: label,
      className: 'text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2',
    });

    const valueDiv = this.createElement('div', {
      textContent: `${value}`,
      className: `text-xl font-bold ${colorClass}`,
    });

    const barContainer = this.createElement('div', {
      className: 'h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden',
    });

    const barFill = this.createElement('div', {
      className: 'h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500',
      attributes: {
        style: `width: ${Math.min(100, value)}%`,
      },
    });

    barContainer.appendChild(barFill);

    card.appendChild(labelDiv);
    card.appendChild(valueDiv);
    card.appendChild(barContainer);

    return card;
  }

  /**
   * Initialize the tool
   */
  onMount(): void {
    // Initialize displays after mount
    setTimeout(() => {
      this.updateResults();

      // Initialize colorblindness displays for each result
      for (const result of this.results) {
        const displayContainer = this.querySelector<HTMLElement>(
          `#colorblindness-${result.slotId}`
        );
        if (displayContainer) {
          const display = new ColorblindnessDisplay(displayContainer, result.primaryHex);
          display.init();
          this.colorblindnessDisplays.set(result.slotId, display);
        }
      }
    }, 100);
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      selectedSlotCount: this.selectedSlots.filter((s) => s.primary).length,
      dualDyesEnabled: this.enableDualDyes,
      resultsCount: this.results.length,
    };
  }

  /**
   * Cleanup child components
   */
  destroy(): void {
    if (this.slotSelector) {
      this.slotSelector.destroy();
    }
    for (const display of this.colorblindnessDisplays.values()) {
      display.destroy();
    }
    this.colorblindnessDisplays.clear();
    super.destroy();
  }
}

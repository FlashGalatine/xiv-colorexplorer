/**
 * XIV Dye Tools v2.0.0 - Dye Comparison Tool Component
 *
 * Phase 12: Architecture Refactor
 * Main tool component for comparing multiple dyes
 *
 * @module components/dye-comparison-tool
 */

import { BaseComponent } from './base-component';
import { DyeSelector } from './dye-selector';
import { ColorDistanceMatrix } from './color-distance-matrix';
import { DyeComparisonChart } from './dye-comparison-chart';
import { MarketBoard } from './market-board';
import { ColorService } from '@services/index';
import type { Dye, PriceData } from '@shared/types';

/**
 * Dye Comparison Tool Component
 * Compare up to 4 dyes with visualizations and metrics
 */
export class DyeComparisonTool extends BaseComponent {
  private selectedDyes: Dye[] = [];
  private dyeSelector: DyeSelector | null = null;
  private marketBoard: MarketBoard | null = null;
  private priceData: Map<number, PriceData> = new Map();
  private showPrices: boolean = false;
  private colorMatrix: ColorDistanceMatrix | null = null;
  private hueSatChart: DyeComparisonChart | null = null;
  private brightnessChart: DyeComparisonChart | null = null;

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
      textContent: 'Dye Comparison Tool',
      className: 'text-3xl font-bold text-gray-900 dark:text-white',
    });

    const subtitle = this.createElement('p', {
      textContent:
        'Compare up to 4 dyes using color distance matrices and visualizations. Analyze hue, saturation, and brightness relationships.',
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
      textContent: 'Select Dyes',
      className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
    });
    selectorSection.appendChild(selectorLabel);

    const dyeSelectorContainer = this.createElement('div', {
      id: 'dye-selector-container',
    });
    selectorSection.appendChild(dyeSelectorContainer);

    wrapper.appendChild(selectorSection);

    // Market Board section
    const marketBoardSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    const marketBoardContainer = this.createElement('div', {
      id: 'market-board-container',
    });
    marketBoardSection.appendChild(marketBoardContainer);

    wrapper.appendChild(marketBoardSection);

    // Summary section
    const summaryContainer = this.createElement('div', {
      id: 'summary-container',
    });
    wrapper.appendChild(summaryContainer);

    // Analysis tabs
    const tabsSection = this.createElement('div', {
      className: 'space-y-6',
    });

    // Distance matrix
    const matrixContainer = this.createElement('div', {
      id: 'matrix-container',
    });
    tabsSection.appendChild(matrixContainer);

    // Charts
    const chartsSection = this.createElement('div', {
      className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    });

    const hueSatContainer = this.createElement('div', {
      id: 'hue-sat-container',
    });

    const brightnessContainer = this.createElement('div', {
      id: 'brightness-container',
    });

    chartsSection.appendChild(hueSatContainer);
    chartsSection.appendChild(brightnessContainer);
    tabsSection.appendChild(chartsSection);

    // Export section
    const exportContainer = this.createElement('div', {
      id: 'export-container',
    });
    tabsSection.appendChild(exportContainer);

    wrapper.appendChild(tabsSection);

    this.container.innerHTML = '';
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Bind event listeners
   */
  async bindEvents(): Promise<void> {
    const dyeSelectorContainer = this.querySelector<HTMLElement>('#dye-selector-container');
    const marketBoardContainer = this.querySelector<HTMLElement>('#market-board-container');

    // Initialize dye selector
    if (dyeSelectorContainer && !this.dyeSelector) {
      this.dyeSelector = new DyeSelector(dyeSelectorContainer, {
        maxSelections: 4,
        allowMultiple: true,
        showCategories: true,
        showPrices: false,
      });
      this.dyeSelector.init();

      // Listen for dye selection changes
      dyeSelectorContainer.addEventListener('selection-changed', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.selectedDyes = customEvent.detail?.selectedDyes || [];
        this.updateAnalysis();
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
        if (this.showPrices && this.selectedDyes.length > 0) {
          this.fetchPricesForSelectedDyes();
        } else {
          this.priceData.clear();
          this.updateSummary();
        }
      });

      marketBoardContainer.addEventListener('server-changed', () => {
        if (this.showPrices && this.selectedDyes.length > 0) {
          this.fetchPricesForSelectedDyes();
        }
      });

      marketBoardContainer.addEventListener('categories-changed', () => {
        if (this.showPrices && this.selectedDyes.length > 0) {
          this.fetchPricesForSelectedDyes();
        }
      });

      marketBoardContainer.addEventListener('refresh-requested', () => {
        if (this.showPrices && this.selectedDyes.length > 0) {
          this.fetchPricesForSelectedDyes();
        }
      });

      // Get initial showPrices state
      this.showPrices = this.marketBoard.getShowPrices();
    }
  }

  /**
   * Fetch prices for selected dyes
   */
  private async fetchPricesForSelectedDyes(): Promise<void> {
    if (!this.marketBoard || !this.showPrices || this.selectedDyes.length === 0) return;

    // Fetch prices using Market Board
    this.priceData = await this.marketBoard.fetchPricesForDyes(this.selectedDyes);

    // Update summary with prices
    this.updateSummary();
  }

  /**
   * Update analysis displays
   */
  private updateAnalysis(): void {
    this.updateSummary();
    this.updateMatrix();
    this.updateCharts();
    this.updateExport();

    // Fetch prices if enabled
    if (this.showPrices && this.marketBoard && this.selectedDyes.length > 0) {
      this.fetchPricesForSelectedDyes();
    }
  }

  /**
   * Update summary section
   */
  private updateSummary(): void {
    const summaryContainer = this.querySelector<HTMLElement>('#summary-container');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = '';

    if (this.selectedDyes.length === 0) {
      const empty = this.createElement('div', {
        className: 'text-center py-8 text-gray-500 dark:text-gray-400',
        textContent: 'Select 2 or more dyes to see analysis',
      });
      summaryContainer.appendChild(empty);
      return;
    }

    const summary = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    // Selected dyes display
    const selectedDiv = this.createElement('div', {
      className: 'flex flex-wrap gap-2',
    });

    const selectedLabel = this.createElement('span', {
      textContent: 'Selected:',
      className: 'font-semibold text-gray-700 dark:text-gray-300',
    });
    selectedDiv.appendChild(selectedLabel);

    for (const dye of this.selectedDyes) {
      const tag = this.createElement('div', {
        className:
          'inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full',
      });

      const swatch = this.createElement('div', {
        className: 'w-3 h-3 rounded-full',
        attributes: {
          style: `background-color: ${dye.hex}`,
        },
      });

      const name = this.createElement('span', {
        textContent: dye.name,
        className: 'text-sm text-blue-900 dark:text-blue-100',
      });

      tag.appendChild(swatch);
      tag.appendChild(name);

      // Optional market price
      if (this.showPrices && this.priceData.size > 0) {
        const price = this.priceData.get(dye.itemID);
        if (price) {
          const priceSpan = this.createElement('span', {
            textContent: `(${(price.currentAverage / 1000).toFixed(1)}k)`,
            className: 'text-xs text-blue-700 dark:text-blue-200 font-mono',
          });
          tag.appendChild(priceSpan);
        }
      }

      selectedDiv.appendChild(tag);
    }

    summary.appendChild(selectedDiv);

    // Statistics
    if (this.selectedDyes.length >= 2) {
      const stats = this.createElement('div', {
        className: 'grid grid-cols-2 md:grid-cols-4 gap-4',
      });

      // Average saturation
      const avgSat =
        this.selectedDyes.reduce((sum, d) => sum + d.hsv.s, 0) / this.selectedDyes.length;
      const satCard = this.renderStatCard('Avg Saturation', `${avgSat.toFixed(1)}%`);
      stats.appendChild(satCard);

      // Average brightness
      const avgBright =
        this.selectedDyes.reduce((sum, d) => sum + d.hsv.v, 0) / this.selectedDyes.length;
      const brightCard = this.renderStatCard('Avg Brightness', `${avgBright.toFixed(1)}%`);
      stats.appendChild(brightCard);

      // Hue range
      const hues = this.selectedDyes.map((d) => d.hsv.h);
      const hueRange = Math.max(...hues) - Math.min(...hues);
      const hueCard = this.renderStatCard('Hue Range', `${hueRange.toFixed(0)}°`);
      stats.appendChild(hueCard);

      // Average distance
      let totalDistance = 0;
      let count = 0;
      for (let i = 0; i < this.selectedDyes.length; i++) {
        for (let j = i + 1; j < this.selectedDyes.length; j++) {
          totalDistance += ColorService.getColorDistance(
            this.selectedDyes[i].hex,
            this.selectedDyes[j].hex
          );
          count++;
        }
      }
      const avgDistance = count > 0 ? totalDistance / count : 0;
      const distCard = this.renderStatCard('Avg Distance', avgDistance.toFixed(1));
      stats.appendChild(distCard);

      summary.appendChild(stats);
    }

    summaryContainer.appendChild(summary);
  }

  /**
   * Render a statistic card
   */
  private renderStatCard(label: string, value: string): HTMLElement {
    const card = this.createElement('div', {
      className: 'bg-gray-50 dark:bg-gray-700 rounded p-3 text-center',
    });

    const labelDiv = this.createElement('div', {
      textContent: label,
      className: 'text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1',
    });

    const valueDiv = this.createElement('div', {
      textContent: value,
      className: 'text-lg font-bold text-gray-900 dark:text-white',
    });

    card.appendChild(labelDiv);
    card.appendChild(valueDiv);

    return card;
  }

  /**
   * Update color distance matrix
   */
  private updateMatrix(): void {
    const matrixContainer = this.querySelector<HTMLElement>('#matrix-container');
    if (!matrixContainer) return;

    matrixContainer.innerHTML = '';

    if (!this.colorMatrix) {
      this.colorMatrix = new ColorDistanceMatrix(matrixContainer, this.selectedDyes);
      this.colorMatrix.init();
    } else {
      this.colorMatrix.updateDyes(this.selectedDyes);
      this.colorMatrix.update();
    }
  }

  /**
   * Update charts
   */
  private updateCharts(): void {
    const hueSatContainer = this.querySelector<HTMLElement>('#hue-sat-container');
    const brightnessContainer = this.querySelector<HTMLElement>('#brightness-container');

    if (!hueSatContainer || !brightnessContainer) return;

    if (!this.hueSatChart) {
      this.hueSatChart = new DyeComparisonChart(
        hueSatContainer,
        'hue-saturation',
        this.selectedDyes
      );
      this.hueSatChart.init();
    } else {
      this.hueSatChart.updateDyes(this.selectedDyes);
      this.hueSatChart.update();
    }

    if (!this.brightnessChart) {
      this.brightnessChart = new DyeComparisonChart(
        brightnessContainer,
        'brightness',
        this.selectedDyes
      );
      this.brightnessChart.init();
    } else {
      this.brightnessChart.updateDyes(this.selectedDyes);
      this.brightnessChart.update();
    }
  }

  /**
   * Update export section
   */
  private updateExport(): void {
    const exportContainer = this.querySelector<HTMLElement>('#export-container');
    if (!exportContainer) return;

    exportContainer.innerHTML = '';

    if (this.selectedDyes.length === 0) {
      return;
    }

    const exportSection = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
    });

    const title = this.createElement('h3', {
      textContent: 'Export Comparison',
      className: 'text-lg font-semibold text-gray-900 dark:text-white',
    });
    exportSection.appendChild(title);

    const buttonGroup = this.createElement('div', {
      className: 'flex flex-wrap gap-2',
    });

    // JSON export
    const jsonBtn = this.createElement('button', {
      textContent: 'Export as JSON',
      className:
        'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-semibold',
      attributes: {
        'data-export': 'json',
      },
    });

    // CSS export
    const cssBtn = this.createElement('button', {
      textContent: 'Export as CSS',
      className:
        'px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-500 transition-colors font-semibold',
      attributes: {
        'data-export': 'css',
      },
    });

    // Copy hex codes
    const copyBtn = this.createElement('button', {
      textContent: 'Copy Hex Codes',
      className:
        'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors font-semibold',
      attributes: {
        'data-export': 'hex',
      },
    });

    buttonGroup.appendChild(jsonBtn);
    buttonGroup.appendChild(cssBtn);
    buttonGroup.appendChild(copyBtn);
    exportSection.appendChild(buttonGroup);

    // Export result area
    const resultArea = this.createElement('textarea', {
      className:
        'w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
      attributes: {
        readonly: 'readonly',
        id: 'export-result',
      },
    });
    exportSection.appendChild(resultArea);

    exportContainer.appendChild(exportSection);

    // Bind export buttons
    this.on(jsonBtn, 'click', () => {
      const json = this.generateJsonExport();
      const resultArea = this.querySelector<HTMLTextAreaElement>('#export-result');
      if (resultArea) {
        resultArea.value = json;
        resultArea.select();
      }
    });

    this.on(cssBtn, 'click', () => {
      const css = this.generateCssExport();
      const resultArea = this.querySelector<HTMLTextAreaElement>('#export-result');
      if (resultArea) {
        resultArea.value = css;
        resultArea.select();
      }
    });

    this.on(copyBtn, 'click', () => {
      const hex = this.selectedDyes.map((d) => d.hex).join('\n');
      const resultArea = this.querySelector<HTMLTextAreaElement>('#export-result');
      if (resultArea) {
        resultArea.value = hex;
        resultArea.select();
        void navigator.clipboard.writeText(hex);
      }
    });
  }

  /**
   * Generate JSON export
   */
  private generateJsonExport(): string {
    const data = {
      timestamp: new Date().toISOString(),
      dyes: this.selectedDyes.map((d) => ({
        id: d.id,
        name: d.name,
        hex: d.hex,
        rgb: d.rgb,
        hsv: d.hsv,
        category: d.category,
        cost: d.cost,
      })),
      statistics: {
        count: this.selectedDyes.length,
        averageSaturation:
          this.selectedDyes.reduce((sum, d) => sum + d.hsv.s, 0) / this.selectedDyes.length,
        averageBrightness:
          this.selectedDyes.reduce((sum, d) => sum + d.hsv.v, 0) / this.selectedDyes.length,
      },
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate CSS export
   */
  private generateCssExport(): string {
    let css = ':root {\n';
    for (let i = 0; i < this.selectedDyes.length; i++) {
      const dye = this.selectedDyes[i];
      css += `  --dye-${i + 1}: ${dye.hex};\n`;
      css += `  --dye-${i + 1}-name: '${dye.name}';\n`;
    }
    css += '}\n';
    return css;
  }

  /**
   * Initialize the tool
   */
  onMount(): void {
    // Initialize components after mount
    setTimeout(() => {
      this.updateAnalysis();
    }, 100);
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      selectedDyeCount: this.selectedDyes.length,
      selectedDyeNames: this.selectedDyes.map((d) => d.name),
    };
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
    if (this.colorMatrix) {
      this.colorMatrix.destroy();
    }
    if (this.hueSatChart) {
      this.hueSatChart.destroy();
    }
    if (this.brightnessChart) {
      this.brightnessChart.destroy();
    }
    super.destroy();
  }
}

/**
 * XIV Dye Tools v3.0.0 - Dye Comparison Mockup
 *
 * Two-panel layout mockup for the Dye Comparison tool.
 * Left: Dye selector (up to 4), comparison options, market board
 * Right: Hue-Saturation plot, Brightness chart, Color distance matrix
 *
 * @module mockups/tools/ComparisonMockup
 */

import { BaseComponent } from '@components/base-component';
import { CollapsiblePanel } from '../CollapsiblePanel';
import { clearContainer } from '@shared/utils';

const ICON_MARKET = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>`;

const SAMPLE_DYES = [
  { name: 'Dalamud Red', hex: '#E85A5A', h: 0, s: 60, b: 91 },
  { name: 'Turquoise Blue', hex: '#4AC0B0', h: 170, s: 61, b: 75 },
  { name: 'Royal Purple', hex: '#7A58A6', h: 270, s: 46, b: 65 },
];

export interface ComparisonMockupOptions {
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
  drawerContent?: HTMLElement | null;
}

export class ComparisonMockup extends BaseComponent {
  private options: ComparisonMockupOptions;
  private selectedDyes = SAMPLE_DYES;
  private marketPanel: CollapsiblePanel | null = null;

  constructor(container: HTMLElement, options: ComparisonMockupOptions) {
    super(container);
    this.options = options;
  }

  render(): void {
    this.renderLeftPanel();
    this.renderRightPanel();
    if (this.options.drawerContent) this.renderDrawerContent();
    this.element = this.container;
  }

  private renderLeftPanel(): void {
    const left = this.options.leftPanel;
    clearContainer(left);

    // Dye Selection
    const dyeSection = this.createSection('Compare Dyes');
    dyeSection.appendChild(this.createDyeSelector());
    left.appendChild(dyeSection);

    // Options
    const optSection = this.createSection('Options');
    optSection.appendChild(this.createOptions());
    left.appendChild(optSection);

    // Market Board
    const marketContainer = this.createElement('div');
    left.appendChild(marketContainer);
    this.marketPanel = new CollapsiblePanel(marketContainer, {
      title: 'Market Board',
      storageKey: 'comparison_mockup_market',
      defaultOpen: false,
      icon: ICON_MARKET,
    });
    this.marketPanel.init();
    this.marketPanel.setContent(this.createMarketContent());
  }

  private renderRightPanel(): void {
    const right = this.options.rightPanel;
    clearContainer(right);

    // Charts Grid
    const chartsGrid = this.createElement('div', { className: 'grid gap-4 lg:grid-cols-2 mb-6' });

    // Hue-Saturation Plot
    chartsGrid.appendChild(this.createChart('Hue-Saturation Plot', this.createHueSatPlot()));

    // Brightness Chart
    chartsGrid.appendChild(this.createChart('Brightness Distribution', this.createBrightnessChart()));

    right.appendChild(chartsGrid);

    // Distance Matrix
    const matrixSection = this.createElement('div');
    matrixSection.appendChild(this.createHeader('Color Distance Matrix'));
    matrixSection.appendChild(this.createDistanceMatrix());
    right.appendChild(matrixSection);
  }

  private renderDrawerContent(): void {
    if (!this.options.drawerContent) return;
    clearContainer(this.options.drawerContent);
    this.options.drawerContent.innerHTML = `
      <div class="p-4">
        <p class="text-sm" style="color: var(--theme-text-muted);">Comparing ${this.selectedDyes.length} dyes</p>
      </div>
    `;
  }

  private createSection(label: string): HTMLElement {
    const section = this.createElement('div', { className: 'p-4 border-b', attributes: { style: 'border-color: var(--theme-border);' } });
    section.appendChild(this.createElement('h3', {
      className: 'text-sm font-semibold uppercase tracking-wider mb-3',
      textContent: label,
      attributes: { style: 'color: var(--theme-text-muted);' },
    }));
    return section;
  }

  private createHeader(text: string): HTMLElement {
    return this.createElement('h3', {
      className: 'text-sm font-semibold uppercase tracking-wider mb-3',
      textContent: text,
      attributes: { style: 'color: var(--theme-text-muted);' },
    });
  }

  private createDyeSelector(): HTMLElement {
    const container = this.createElement('div', { className: 'space-y-2' });

    this.selectedDyes.forEach(dye => {
      const item = this.createElement('div', {
        className: 'flex items-center gap-3 p-2 rounded-lg',
        attributes: { style: 'background: var(--theme-background-secondary);' },
      });
      item.innerHTML = `
        <div class="w-8 h-8 rounded" style="background: ${dye.hex};"></div>
        <span class="flex-1 text-sm font-medium" style="color: var(--theme-text);">${dye.name}</span>
        <button class="text-xs px-2 py-1 rounded" style="background: var(--theme-card-hover); color: var(--theme-text-muted);">×</button>
      `;
      container.appendChild(item);
    });

    if (this.selectedDyes.length < 4) {
      const addBtn = this.createElement('button', {
        className: 'w-full p-3 rounded-lg border-2 border-dashed text-sm',
        textContent: '+ Add Dye',
        attributes: { style: 'border-color: var(--theme-border); color: var(--theme-text-muted);' },
      });
      container.appendChild(addBtn);
    }

    return container;
  }

  private createOptions(): HTMLElement {
    const container = this.createElement('div', { className: 'space-y-2' });
    ['Show Distance Values', 'Highlight Closest Pair', 'Show Price Comparison'].forEach(opt => {
      const label = this.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' });
      label.innerHTML = `<input type="checkbox" class="w-4 h-4 rounded"><span class="text-sm" style="color: var(--theme-text);">${opt}</span>`;
      container.appendChild(label);
    });
    return container;
  }

  private createMarketContent(): HTMLElement {
    const container = this.createElement('div', { className: 'space-y-3' });
    container.innerHTML = `
      <select class="w-full p-2 rounded text-sm" style="background: var(--theme-background-secondary); color: var(--theme-text); border: 1px solid var(--theme-border);">
        <option>Aether</option><option>Primal</option><option>Crystal</option>
      </select>
    `;
    return container;
  }

  private createChart(title: string, content: HTMLElement): HTMLElement {
    const card = this.createElement('div', {
      className: 'p-4 rounded-lg',
      attributes: { style: 'background: var(--theme-card-background); border: 1px solid var(--theme-border);' },
    });
    card.appendChild(this.createElement('h4', {
      className: 'text-sm font-medium mb-3',
      textContent: title,
      attributes: { style: 'color: var(--theme-text);' },
    }));
    card.appendChild(content);
    return card;
  }

  private createHueSatPlot(): HTMLElement {
    const plot = this.createElement('div', { className: 'relative aspect-square' });
    plot.innerHTML = `
      <svg viewBox="0 0 100 100" class="w-full h-full">
        <rect width="100" height="100" fill="var(--theme-background-secondary)" rx="4" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="var(--theme-border)" stroke-dasharray="2" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--theme-border)" stroke-dasharray="2" />
        ${this.selectedDyes.map(d => `
          <circle cx="${(d.h / 360) * 100}" cy="${100 - d.s}" r="6" fill="${d.hex}" stroke="white" stroke-width="2" />
        `).join('')}
        <text x="50" y="98" text-anchor="middle" font-size="6" fill="var(--theme-text-muted)">Hue</text>
        <text x="2" y="50" font-size="6" fill="var(--theme-text-muted)" transform="rotate(-90 5 50)">Saturation</text>
      </svg>
    `;
    return plot;
  }

  private createBrightnessChart(): HTMLElement {
    const chart = this.createElement('div', { className: 'flex items-end gap-2 h-32' });

    this.selectedDyes.forEach(dye => {
      const bar = this.createElement('div', { className: 'flex-1 flex flex-col items-center' });
      bar.innerHTML = `
        <div class="w-full rounded-t" style="height: ${dye.b}%; background: ${dye.hex};"></div>
        <div class="w-4 h-4 mt-2 rounded" style="background: ${dye.hex};"></div>
        <span class="text-xs mt-1" style="color: var(--theme-text-muted);">${dye.b}%</span>
      `;
      chart.appendChild(bar);
    });

    return chart;
  }

  private createDistanceMatrix(): HTMLElement {
    const matrix = this.createElement('div', {
      className: 'rounded-lg overflow-hidden',
      attributes: { style: 'background: var(--theme-card-background); border: 1px solid var(--theme-border);' },
    });

    let html = '<table class="w-full text-sm"><thead><tr><th></th>';
    this.selectedDyes.forEach(d => { html += `<th class="p-2"><div class="w-6 h-6 rounded mx-auto" style="background: ${d.hex};" title="${d.name}"></div></th>`; });
    html += '</tr></thead><tbody>';

    this.selectedDyes.forEach((dye, i) => {
      html += `<tr><td class="p-2"><div class="w-6 h-6 rounded" style="background: ${dye.hex};"></div></td>`;
      this.selectedDyes.forEach((_, j) => {
        if (i === j) {
          html += '<td class="p-2 text-center" style="color: var(--theme-text-muted);">-</td>';
        } else {
          const dist = (Math.abs(i - j) * 15 + Math.random() * 10).toFixed(1);
          html += `<td class="p-2 text-center font-mono" style="color: var(--theme-text);">${dist}</td>`;
        }
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    matrix.innerHTML = html;
    return matrix;
  }

  bindEvents(): void {}
  destroy(): void {
    this.marketPanel?.destroy();
    super.destroy();
  }
}

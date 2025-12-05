/**
 * XIV Dye Tools - Preset Palettes Browser Tool
 *
 * Browse and explore curated dye palettes organized by category:
 * jobs, grand-companies, seasons, events, aesthetics
 *
 * @module components/preset-browser-tool
 */

import { BaseComponent } from './base-component';
import { ToolHeader } from './tool-header';
import { LanguageService } from '@services/index';
import {
  PresetService,
  presetData,
  DyeService,
  dyeDatabase,
  type PresetPalette,
  type PresetCategory,
  type PresetData,
  type Dye,
} from 'xivdyetools-core';

// Initialize services - cast presetData to fix JSON import typing
const presetService = new PresetService(presetData as PresetData);
const dyeService = new DyeService(dyeDatabase);

/**
 * Category icons for visual distinction
 */
const CATEGORY_ICONS: Record<PresetCategory, string> = {
  jobs: '⚔️',
  'grand-companies': '🏛️',
  seasons: '🌸',
  events: '🎉',
  aesthetics: '✨',
  community: '👥',
};

/**
 * Preset Browser Tool Component
 * Displays curated dye palettes in a browsable grid layout
 */
export class PresetBrowserTool extends BaseComponent {
  private selectedCategory: PresetCategory | null = null;
  private selectedPreset: PresetPalette | null = null;
  private categoryContainer: HTMLElement | null = null;
  private presetGrid: HTMLElement | null = null;
  private detailPanel: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    super(container);
  }

  render(): void {
    // Clear previous content
    this.container.innerHTML = '';

    const wrapper = this.createElement('div', {
      className: 'space-y-8',
    });

    // Tool header
    new ToolHeader(wrapper, {
      title: LanguageService.t('tools.presets.title'),
      description: LanguageService.t('tools.presets.subtitle'),
    }).render();

    // Main content layout
    const content = this.createElement('div', {
      className: 'space-y-6',
    });

    // Category filter tabs
    this.categoryContainer = this.renderCategoryTabs();
    content.appendChild(this.categoryContainer);

    // Preset grid
    this.presetGrid = this.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    });
    this.renderPresets();
    content.appendChild(this.presetGrid);

    // Detail panel (initially hidden)
    this.detailPanel = this.createElement('div', {
      className: 'hidden',
    });
    content.appendChild(this.detailPanel);

    wrapper.appendChild(content);
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  /**
   * Render category filter tabs
   */
  private renderCategoryTabs(): HTMLElement {
    const container = this.createElement('div', {
      className:
        'flex flex-wrap gap-2 justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
    });

    // "All" tab
    const allTab = this.createCategoryTab(null, LanguageService.t('tools.presets.allCategories'));
    container.appendChild(allTab);

    // Category tabs
    const categories = presetService.getCategories();
    categories.forEach((categoryMeta) => {
      const categoryId = categoryMeta.id as PresetCategory;
      const icon = CATEGORY_ICONS[categoryId] || '🎨';
      const label = `${icon} ${categoryMeta.name}`;
      const tab = this.createCategoryTab(categoryId, label);
      container.appendChild(tab);
    });

    return container;
  }

  /**
   * Create a single category tab button
   */
  private createCategoryTab(category: PresetCategory | null, label: string): HTMLElement {
    const isActive = this.selectedCategory === category;
    const tab = this.createElement('button', {
      className: `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`,
      textContent: label,
      dataAttributes: {
        category: category || 'all',
      },
    });

    return tab;
  }

  /**
   * Render preset cards in the grid
   */
  private renderPresets(): void {
    if (!this.presetGrid) return;
    this.presetGrid.innerHTML = '';

    const presets = this.selectedCategory
      ? presetService.getPresetsByCategory(this.selectedCategory)
      : presetService.getAllPresets();

    if (presets.length === 0) {
      const emptyState = this.createElement('div', {
        className: 'col-span-full text-center py-12 text-gray-500 dark:text-gray-400',
        textContent: LanguageService.t('tools.presets.noPresets'),
      });
      this.presetGrid.appendChild(emptyState);
      return;
    }

    presets.forEach((preset) => {
      const card = this.createPresetCard(preset);
      this.presetGrid!.appendChild(card);
    });
  }

  /**
   * Create a preset card element
   */
  private createPresetCard(preset: PresetPalette): HTMLElement {
    const card = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer',
      dataAttributes: {
        presetId: preset.id,
      },
    });

    // Color swatch strip at top
    const swatchStrip = this.createElement('div', {
      className: 'flex h-16',
    });

    preset.dyes.forEach((dyeId) => {
      const dye = dyeService.getDyeById(dyeId);
      const swatch = this.createElement('div', {
        className: 'flex-1',
        attributes: {
          style: `background-color: ${dye?.hex || '#888888'}`,
          title: dye?.name || 'Unknown',
        },
      });
      swatchStrip.appendChild(swatch);
    });

    card.appendChild(swatchStrip);

    // Card content
    const content = this.createElement('div', {
      className: 'p-4',
    });

    // Category badge + title
    const header = this.createElement('div', {
      className: 'flex items-center gap-2 mb-2',
    });

    const categoryBadge = this.createElement('span', {
      className: 'text-lg',
      textContent: CATEGORY_ICONS[preset.category] || '🎨',
    });
    header.appendChild(categoryBadge);

    const title = this.createElement('h3', {
      className: 'font-semibold text-gray-900 dark:text-white',
      textContent: preset.name,
    });
    header.appendChild(title);

    content.appendChild(header);

    // Description
    const description = this.createElement('p', {
      className: 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2',
      textContent: preset.description,
    });
    content.appendChild(description);

    // Dye count
    const dyeCount = this.createElement('div', {
      className: 'mt-3 text-xs text-gray-500 dark:text-gray-500',
      textContent: `${preset.dyes.length} ${LanguageService.t('tools.presets.dyes')}`,
    });
    content.appendChild(dyeCount);

    card.appendChild(content);

    return card;
  }

  /**
   * Show detailed view of a preset
   */
  private showPresetDetail(preset: PresetPalette): void {
    if (!this.detailPanel || !this.presetGrid) return;

    this.selectedPreset = preset;
    this.presetGrid.classList.add('hidden');
    this.detailPanel.classList.remove('hidden');
    this.detailPanel.innerHTML = '';

    const detail = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    // Back button
    const backBtn = this.createElement('button', {
      className:
        'mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline',
      innerHTML: `← ${LanguageService.t('tools.presets.backToList')}`,
    });
    detail.appendChild(backBtn);

    // Title and category
    const header = this.createElement('div', {
      className: 'mb-6',
    });

    const categoryMeta = presetService.getCategoryMeta(preset.category);
    const categoryLabel = this.createElement('div', {
      className: 'text-sm text-gray-500 dark:text-gray-400 mb-1',
      textContent: `${CATEGORY_ICONS[preset.category]} ${categoryMeta?.name || preset.category}`,
    });
    header.appendChild(categoryLabel);

    const title = this.createElement('h2', {
      className: 'text-2xl font-bold text-gray-900 dark:text-white',
      textContent: preset.name,
    });
    header.appendChild(title);

    const description = this.createElement('p', {
      className: 'mt-2 text-gray-600 dark:text-gray-400',
      textContent: preset.description,
    });
    header.appendChild(description);

    detail.appendChild(header);

    // Large color swatches with dye info
    const swatchesSection = this.createElement('div', {
      className: 'space-y-4',
    });

    const swatchesTitle = this.createElement('h3', {
      className: 'font-semibold text-gray-900 dark:text-white',
      textContent: LanguageService.t('tools.presets.colorsInPalette'),
    });
    swatchesSection.appendChild(swatchesTitle);

    const swatchGrid = this.createElement('div', {
      className: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4',
    });

    preset.dyes.forEach((dyeId) => {
      const dye = dyeService.getDyeById(dyeId);
      if (!dye) return;

      const swatchCard = this.createDyeSwatchCard(dye);
      swatchGrid.appendChild(swatchCard);
    });

    swatchesSection.appendChild(swatchGrid);
    detail.appendChild(swatchesSection);

    // Tags section
    if (preset.tags && preset.tags.length > 0) {
      const tagsSection = this.createElement('div', {
        className: 'mt-6',
      });

      const tagsTitle = this.createElement('h4', {
        className: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
        textContent: LanguageService.t('tools.presets.tags'),
      });
      tagsSection.appendChild(tagsTitle);

      const tagsList = this.createElement('div', {
        className: 'flex flex-wrap gap-2',
      });

      preset.tags.forEach((tag) => {
        const tagBadge = this.createElement('span', {
          className:
            'px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
          textContent: tag,
        });
        tagsList.appendChild(tagBadge);
      });

      tagsSection.appendChild(tagsList);
      detail.appendChild(tagsSection);
    }

    this.detailPanel.appendChild(detail);
  }

  /**
   * Create a dye swatch card for detail view
   */
  private createDyeSwatchCard(dye: Dye): HTMLElement {
    const card = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
    });

    // Color swatch
    const swatch = this.createElement('div', {
      className: 'h-20 w-full',
      attributes: {
        style: `background-color: ${dye.hex}`,
      },
    });
    card.appendChild(swatch);

    // Dye info
    const info = this.createElement('div', {
      className: 'p-3',
    });

    const name = this.createElement('div', {
      className: 'font-medium text-sm text-gray-900 dark:text-white truncate',
      textContent: LanguageService.getDyeName(dye.id) || dye.name,
      attributes: {
        title: dye.name,
      },
    });
    info.appendChild(name);

    const hex = this.createElement('div', {
      className: 'text-xs text-gray-500 dark:text-gray-400 font-mono',
      textContent: dye.hex.toUpperCase(),
    });
    info.appendChild(hex);

    card.appendChild(info);

    return card;
  }

  /**
   * Hide detail view and show grid
   */
  private hidePresetDetail(): void {
    if (!this.detailPanel || !this.presetGrid) return;

    this.selectedPreset = null;
    this.detailPanel.classList.add('hidden');
    this.presetGrid.classList.remove('hidden');
  }

  /**
   * Update category selection without full re-render
   * This preserves event listeners by only updating visuals and preset grid
   */
  private updateCategorySelection(category: PresetCategory | null): void {
    this.selectedCategory = category;

    // Update tab visual states
    if (this.categoryContainer) {
      this.categoryContainer.querySelectorAll('button').forEach((btn) => {
        const btnCategory = (btn as HTMLElement).dataset.category;
        const isActive =
          (category === null && btnCategory === 'all') || btnCategory === category;

        if (isActive) {
          btn.className =
            'px-4 py-2 rounded-full text-sm font-medium transition-colors bg-indigo-600 text-white';
        } else {
          btn.className =
            'px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
        }
      });
    }

    // Re-render only the presets grid (not the whole component)
    this.renderPresets();
  }

  bindEvents(): void {
    // Category tab clicks
    if (this.categoryContainer) {
      this.on(this.categoryContainer, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON') {
          const category = target.dataset.category;
          const newCategory = category === 'all' ? null : (category as PresetCategory);
          this.updateCategorySelection(newCategory);
        }
      });
    }

    // Preset card clicks
    if (this.presetGrid) {
      this.on(this.presetGrid, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const card = target.closest('[data-preset-id]') as HTMLElement;
        if (card) {
          const presetId = card.dataset.presetId;
          const preset = presetService.getPreset(presetId || '');
          if (preset) {
            this.showPresetDetail(preset);
          }
        }
      });
    }

    // Detail panel back button
    if (this.detailPanel) {
      this.on(this.detailPanel, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target.textContent?.includes('←')) {
          this.hidePresetDetail();
        }
      });
    }
  }

  destroy(): void {
    this.selectedCategory = null;
    this.selectedPreset = null;
    super.destroy();
  }
}

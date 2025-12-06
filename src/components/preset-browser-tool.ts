/**
 * XIV Dye Tools - Preset Palettes Browser Tool
 *
 * Browse and explore curated and community dye palettes organized by category:
 * jobs, grand-companies, seasons, events, aesthetics, community
 *
 * Features:
 * - Vote counts for community presets
 * - Author attribution
 * - Sort by popular/recent/name
 * - Featured section
 * - Visual distinction between curated and community presets
 *
 * @module components/preset-browser-tool
 */

import { BaseComponent } from './base-component';
import { ToolHeader } from './tool-header';
import { LanguageService } from '@services/index';
import {
  hybridPresetService,
  type UnifiedPreset,
  type UnifiedCategory,
  type PresetSortOption,
} from '@services/index';
import { getCategoryIcon, ICON_ARROW_BACK } from '@shared/category-icons';
import { DyeService, dyeDatabase, type Dye, type PresetCategory } from 'xivdyetools-core';

// Initialize dye service for resolving dye IDs
const dyeService = new DyeService(dyeDatabase);

/**
 * Preset Browser Tool Component
 * Displays curated and community dye palettes in a browsable grid layout
 */
export class PresetBrowserTool extends BaseComponent {
  private selectedCategory: PresetCategory | null = null;
  private selectedPreset: UnifiedPreset | null = null;
  private currentSort: PresetSortOption = 'name';
  private categoryContainer: HTMLElement | null = null;
  private sortContainer: HTMLElement | null = null;
  private featuredSection: HTMLElement | null = null;
  private presetGrid: HTMLElement | null = null;
  private detailPanel: HTMLElement | null = null;
  private categories: UnifiedCategory[] = [];
  private presets: UnifiedPreset[] = [];
  private featuredPresets: UnifiedPreset[] = [];
  private isLoading = false;

  constructor(container: HTMLElement) {
    super(container);
  }

  async render(): Promise<void> {
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

    // Loading state
    const loadingIndicator = this.createElement('div', {
      className: 'text-center py-8 text-gray-500',
      textContent: 'Loading presets...',
    });
    content.appendChild(loadingIndicator);

    wrapper.appendChild(content);
    this.element = wrapper;
    this.container.appendChild(this.element);

    // Load data asynchronously
    await this.loadData();

    // Remove loading indicator and render content
    content.innerHTML = '';

    // Featured section (if API is available)
    if (hybridPresetService.isAPIAvailable() && this.featuredPresets.length > 0) {
      this.featuredSection = this.renderFeaturedSection();
      content.appendChild(this.featuredSection);
    }

    // Category filter tabs
    this.categoryContainer = this.renderCategoryTabs();
    content.appendChild(this.categoryContainer);

    // Sort controls
    this.sortContainer = this.renderSortControls();
    content.appendChild(this.sortContainer);

    // Discord CTA (if API available)
    if (hybridPresetService.isAPIAvailable()) {
      const discordCTA = this.renderDiscordCTA();
      content.appendChild(discordCTA);
    }

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

    // Re-bind events after async render
    this.bindEvents();
  }

  /**
   * Load data from hybrid service
   */
  private async loadData(): Promise<void> {
    this.isLoading = true;

    try {
      // Initialize hybrid service if needed
      await hybridPresetService.initialize();

      // Load categories and presets in parallel
      const [categories, presets, featured] = await Promise.all([
        hybridPresetService.getCategories(),
        hybridPresetService.getPresets({ sort: this.currentSort }),
        hybridPresetService.getFeaturedPresets(5),
      ]);

      this.categories = categories;
      this.presets = presets;
      this.featuredPresets = featured;
    } catch (error) {
      console.error('Failed to load preset data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render featured presets section
   */
  private renderFeaturedSection(): HTMLElement {
    const section = this.createElement('div', {
      className: 'bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white',
    });

    const header = this.createElement('div', {
      className: 'flex items-center gap-2 mb-4',
    });

    const starIcon = this.createElement('span', {
      innerHTML: '&#11088;', // Star emoji
      className: 'text-xl',
    });
    header.appendChild(starIcon);

    const title = this.createElement('h3', {
      className: 'text-lg font-semibold',
      textContent: 'Featured Community Presets',
    });
    header.appendChild(title);

    section.appendChild(header);

    const grid = this.createElement('div', {
      className: 'flex gap-4 overflow-x-auto pb-2',
    });

    this.featuredPresets.forEach((preset) => {
      const card = this.createFeaturedCard(preset);
      grid.appendChild(card);
    });

    section.appendChild(grid);

    return section;
  }

  /**
   * Create a featured preset card
   */
  private createFeaturedCard(preset: UnifiedPreset): HTMLElement {
    const card = this.createElement('div', {
      className:
        'flex-shrink-0 w-48 bg-white/10 backdrop-blur rounded-lg overflow-hidden cursor-pointer hover:bg-white/20 transition-colors',
      dataAttributes: {
        presetId: preset.id,
      },
    });

    // Color strip
    const swatchStrip = this.createElement('div', {
      className: 'flex h-12',
    });

    preset.dyes.forEach((dyeId) => {
      const dye = dyeService.getDyeById(dyeId);
      const swatch = this.createElement('div', {
        className: 'flex-1',
        attributes: {
          style: `background-color: ${dye?.hex || '#888888'}`,
        },
      });
      swatchStrip.appendChild(swatch);
    });

    card.appendChild(swatchStrip);

    // Info
    const info = this.createElement('div', {
      className: 'p-3',
    });

    const name = this.createElement('div', {
      className: 'font-medium text-sm truncate',
      textContent: preset.name,
    });
    info.appendChild(name);

    if (preset.voteCount > 0) {
      const votes = this.createElement('div', {
        className: 'text-xs opacity-75 mt-1',
        textContent: `${preset.voteCount} votes`,
      });
      info.appendChild(votes);
    }

    card.appendChild(info);

    return card;
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

    // Category tabs from loaded data
    this.categories.forEach((category) => {
      const tab = this.createCategoryTab(category.id, category.name, category.icon);
      container.appendChild(tab);
    });

    return container;
  }

  /**
   * Create a single category tab button
   */
  private createCategoryTab(
    category: PresetCategory | null,
    label: string,
    icon?: string
  ): HTMLElement {
    const isActive = this.selectedCategory === category;
    const tab = this.createElement('button', {
      className: `px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`,
      dataAttributes: {
        category: category || 'all',
      },
    });

    // Add SVG icon for category tabs (not for "All" tab)
    if (category && icon) {
      const iconSpan = this.createElement('span', {
        className: 'w-4 h-4 flex-shrink-0',
        innerHTML: getCategoryIcon(category),
      });
      tab.appendChild(iconSpan);
    }

    // Add label text
    const labelSpan = this.createElement('span', {
      textContent: label,
    });
    tab.appendChild(labelSpan);

    return tab;
  }

  /**
   * Render sort controls
   */
  private renderSortControls(): HTMLElement {
    const container = this.createElement('div', {
      className: 'flex items-center justify-between',
    });

    const label = this.createElement('span', {
      className: 'text-sm text-gray-600 dark:text-gray-400',
      textContent: 'Sort by:',
    });
    container.appendChild(label);

    const buttons = this.createElement('div', {
      className: 'flex gap-2',
    });

    const sortOptions: { value: PresetSortOption; label: string }[] = [
      { value: 'name', label: 'Name' },
      { value: 'popular', label: 'Popular' },
      { value: 'recent', label: 'Recent' },
    ];

    sortOptions.forEach(({ value, label }) => {
      const btn = this.createElement('button', {
        className: `px-3 py-1 text-sm rounded transition-colors ${
          this.currentSort === value
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`,
        textContent: label,
        dataAttributes: {
          sort: value,
        },
      });
      buttons.appendChild(btn);
    });

    container.appendChild(buttons);

    return container;
  }

  /**
   * Render Discord submission CTA
   */
  private renderDiscordCTA(): HTMLElement {
    const cta = this.createElement('div', {
      className:
        'flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800',
    });

    const text = this.createElement('div', {});

    const title = this.createElement('div', {
      className: 'font-medium text-indigo-900 dark:text-indigo-100',
      textContent: 'Share Your Presets!',
    });
    text.appendChild(title);

    const subtitle = this.createElement('div', {
      className: 'text-sm text-indigo-700 dark:text-indigo-300',
      textContent: 'Submit your color palettes via our Discord bot using /preset submit',
    });
    text.appendChild(subtitle);

    cta.appendChild(text);

    const link = this.createElement('a', {
      className:
        'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium',
      textContent: 'Join Discord',
      attributes: {
        href: 'https://discord.gg/xivdyetools',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    });
    cta.appendChild(link);

    return cta;
  }

  /**
   * Render preset cards in the grid
   */
  private renderPresets(): void {
    if (!this.presetGrid) return;
    this.presetGrid.innerHTML = '';

    const filteredPresets = this.filterPresetsByCategory(this.presets);
    const sortedPresets = this.sortPresets(filteredPresets);

    if (sortedPresets.length === 0) {
      const emptyState = this.createElement('div', {
        className: 'col-span-full text-center py-12 text-gray-500 dark:text-gray-400',
        textContent: LanguageService.t('tools.presets.noPresets'),
      });
      this.presetGrid.appendChild(emptyState);
      return;
    }

    sortedPresets.forEach((preset) => {
      const card = this.createPresetCard(preset);
      this.presetGrid!.appendChild(card);
    });
  }

  /**
   * Filter presets by selected category
   */
  private filterPresetsByCategory(presets: UnifiedPreset[]): UnifiedPreset[] {
    if (!this.selectedCategory) return presets;
    return presets.filter((p) => p.category === this.selectedCategory);
  }

  /**
   * Sort presets by current sort option
   */
  private sortPresets(presets: UnifiedPreset[]): UnifiedPreset[] {
    return [...presets].sort((a, b) => {
      switch (this.currentSort) {
        case 'popular':
          return b.voteCount - a.voteCount;
        case 'recent':
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  /**
   * Create a preset card element
   */
  private createPresetCard(preset: UnifiedPreset): HTMLElement {
    const card = this.createElement('div', {
      className: `bg-white dark:bg-gray-800 rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
        preset.isCurated
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-indigo-200 dark:border-indigo-800'
      }`,
      dataAttributes: {
        presetId: preset.id,
      },
    });

    // Community badge for non-curated presets
    if (!preset.isCurated) {
      const badge = this.createElement('div', {
        className: 'px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium',
        textContent: 'Community',
      });
      card.appendChild(badge);
    }

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
      className: 'w-5 h-5 flex-shrink-0',
      innerHTML: getCategoryIcon(preset.category),
    });
    header.appendChild(categoryBadge);

    const title = this.createElement('h3', {
      className: 'font-semibold text-gray-900 dark:text-white flex-1 truncate',
      textContent: preset.name,
    });
    header.appendChild(title);

    // Vote count
    if (preset.voteCount > 0) {
      const votes = this.createElement('span', {
        className: 'text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1',
      });
      const starIcon = this.createElement('span', {
        innerHTML: '&#9733;', // Star
      });
      votes.appendChild(starIcon);
      const voteCount = this.createElement('span', {
        textContent: String(preset.voteCount),
      });
      votes.appendChild(voteCount);
      header.appendChild(votes);
    }

    content.appendChild(header);

    // Description
    const description = this.createElement('p', {
      className: 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2',
      textContent: preset.description,
    });
    content.appendChild(description);

    // Footer: dye count and author
    const footer = this.createElement('div', {
      className: 'mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500',
    });

    const dyeCount = this.createElement('span', {
      textContent: `${preset.dyes.length} ${LanguageService.t('tools.presets.dyes')}`,
    });
    footer.appendChild(dyeCount);

    if (preset.author) {
      const author = this.createElement('span', {
        className: 'truncate max-w-[100px]',
        textContent: `by ${preset.author}`,
        attributes: {
          title: `by ${preset.author}`,
        },
      });
      footer.appendChild(author);
    } else if (preset.isCurated) {
      const official = this.createElement('span', {
        className: 'text-indigo-600 dark:text-indigo-400',
        textContent: 'Official',
      });
      footer.appendChild(official);
    }

    content.appendChild(footer);
    card.appendChild(content);

    return card;
  }

  /**
   * Show detailed view of a preset
   */
  private showPresetDetail(preset: UnifiedPreset): void {
    if (!this.detailPanel || !this.presetGrid) return;

    this.selectedPreset = preset;
    this.presetGrid.classList.add('hidden');
    if (this.featuredSection) this.featuredSection.classList.add('hidden');
    if (this.sortContainer) this.sortContainer.classList.add('hidden');
    this.detailPanel.classList.remove('hidden');
    this.detailPanel.innerHTML = '';

    const detail = this.createElement('div', {
      className:
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
    });

    // Back button
    const backBtn = this.createElement('button', {
      className:
        'mb-4 flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline',
      dataAttributes: {
        action: 'back',
      },
    });
    const backIcon = this.createElement('span', {
      className: 'w-4 h-4',
      innerHTML: ICON_ARROW_BACK,
    });
    backBtn.appendChild(backIcon);
    const backText = this.createElement('span', {
      textContent: LanguageService.t('tools.presets.backToList'),
    });
    backBtn.appendChild(backText);
    detail.appendChild(backBtn);

    // Header with badges
    const header = this.createElement('div', {
      className: 'mb-6',
    });

    // Badges row
    const badges = this.createElement('div', {
      className: 'flex items-center gap-2 mb-2',
    });

    // Category badge
    const categoryMeta = hybridPresetService.getCategoryMeta(preset.category);
    const categoryBadge = this.createElement('span', {
      className:
        'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm',
    });
    const categoryIcon = this.createElement('span', {
      className: 'w-4 h-4',
      innerHTML: getCategoryIcon(preset.category),
    });
    categoryBadge.appendChild(categoryIcon);
    const categoryName = this.createElement('span', {
      textContent: categoryMeta?.name || preset.category,
    });
    categoryBadge.appendChild(categoryName);
    badges.appendChild(categoryBadge);

    // Curated/Community badge
    if (preset.isCurated) {
      const curatedBadge = this.createElement('span', {
        className:
          'px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm',
        textContent: 'Official',
      });
      badges.appendChild(curatedBadge);
    } else {
      const communityBadge = this.createElement('span', {
        className:
          'px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm',
        textContent: 'Community',
      });
      badges.appendChild(communityBadge);
    }

    // Vote count
    if (preset.voteCount > 0) {
      const voteBadge = this.createElement('span', {
        className:
          'px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-sm flex items-center gap-1',
      });
      const starIcon = this.createElement('span', {
        innerHTML: '&#9733;',
      });
      voteBadge.appendChild(starIcon);
      const voteText = this.createElement('span', {
        textContent: `${preset.voteCount} votes`,
      });
      voteBadge.appendChild(voteText);
      badges.appendChild(voteBadge);
    }

    header.appendChild(badges);

    // Title
    const title = this.createElement('h2', {
      className: 'text-2xl font-bold text-gray-900 dark:text-white',
      textContent: preset.name,
    });
    header.appendChild(title);

    // Description
    const description = this.createElement('p', {
      className: 'mt-2 text-gray-600 dark:text-gray-400',
      textContent: preset.description,
    });
    header.appendChild(description);

    // Author
    if (preset.author) {
      const authorInfo = this.createElement('p', {
        className: 'mt-2 text-sm text-gray-500',
        textContent: `Created by ${preset.author}`,
      });
      header.appendChild(authorInfo);
    }

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

    // Vote CTA for community presets
    if (preset.isFromAPI && !preset.isCurated) {
      const voteCTA = this.createElement('div', {
        className:
          'mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center',
      });
      const ctaText = this.createElement('p', {
        className: 'text-sm text-indigo-700 dark:text-indigo-300',
        textContent: 'Like this preset? Vote for it on Discord with /preset vote',
      });
      voteCTA.appendChild(ctaText);
      detail.appendChild(voteCTA);
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
    if (this.featuredSection) this.featuredSection.classList.remove('hidden');
    if (this.sortContainer) this.sortContainer.classList.remove('hidden');
  }

  /**
   * Update category selection
   */
  private async updateCategorySelection(category: PresetCategory | null): Promise<void> {
    this.selectedCategory = category;

    // Update tab visual states
    if (this.categoryContainer) {
      this.categoryContainer.querySelectorAll('button').forEach((btn) => {
        const btnCategory = (btn as HTMLElement).dataset.category;
        const isActive =
          (category === null && btnCategory === 'all') || btnCategory === category;

        if (isActive) {
          btn.className =
            'px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 bg-indigo-600 text-white';
        } else {
          btn.className =
            'px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
        }
      });
    }

    // Fetch category-specific presets if community
    if (category === 'community') {
      try {
        this.presets = await hybridPresetService.getPresets({
          category: 'community',
          sort: this.currentSort,
        });
      } catch (error) {
        console.error('Failed to load community presets:', error);
      }
    } else {
      // Reload all presets for other categories (uses cache)
      this.presets = await hybridPresetService.getPresets({ sort: this.currentSort });
    }

    // Re-render presets
    this.renderPresets();
  }

  /**
   * Update sort selection
   */
  private updateSortSelection(sort: PresetSortOption): void {
    this.currentSort = sort;

    // Update button visual states
    if (this.sortContainer) {
      this.sortContainer.querySelectorAll('button').forEach((btn) => {
        const btnSort = (btn as HTMLElement).dataset.sort;
        const isActive = btnSort === sort;

        if (isActive) {
          btn.className = 'px-3 py-1 text-sm rounded transition-colors bg-indigo-600 text-white';
        } else {
          btn.className =
            'px-3 py-1 text-sm rounded transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
        }
      });
    }

    // Re-render with new sort
    this.renderPresets();
  }

  bindEvents(): void {
    // Category tab clicks
    if (this.categoryContainer) {
      this.on(this.categoryContainer, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button') as HTMLElement | null;
        if (button) {
          const category = button.dataset.category;
          const newCategory = category === 'all' ? null : (category as PresetCategory);
          this.updateCategorySelection(newCategory);
        }
      });
    }

    // Sort button clicks
    if (this.sortContainer) {
      this.on(this.sortContainer, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button') as HTMLElement | null;
        if (button && button.dataset.sort) {
          this.updateSortSelection(button.dataset.sort as PresetSortOption);
        }
      });
    }

    // Featured section clicks
    if (this.featuredSection) {
      this.on(this.featuredSection, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const card = target.closest('[data-preset-id]') as HTMLElement;
        if (card) {
          const presetId = card.dataset.presetId;
          const preset = this.presets.find((p) => p.id === presetId) ||
                        this.featuredPresets.find((p) => p.id === presetId);
          if (preset) {
            this.showPresetDetail(preset);
          }
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
          const preset = this.presets.find((p) => p.id === presetId);
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
        const backBtn = target.closest('[data-action="back"]') as HTMLElement;
        if (backBtn) {
          this.hidePresetDetail();
        }
      });
    }
  }

  destroy(): void {
    this.selectedCategory = null;
    this.selectedPreset = null;
    this.categories = [];
    this.presets = [];
    this.featuredPresets = [];
    super.destroy();
  }
}

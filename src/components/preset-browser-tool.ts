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
  authService,
  communityPresetService,
  ToastService,
} from '@services/index';
import { getCategoryIcon, ICON_ARROW_BACK } from '@shared/category-icons';
import { DyeService, dyeDatabase, type Dye, type PresetCategory } from 'xivdyetools-core';
import { AuthButton } from './auth-button';
import { showPresetSubmissionForm } from './preset-submission-form';
import { MySubmissionsPanel } from './my-submissions-panel';

// Initialize dye service for resolving dye IDs
const dyeService = new DyeService(dyeDatabase);

/**
 * Preset Browser Tool Component
 * Displays curated and community dye palettes in a browsable grid layout
 */
type ViewTab = 'browse' | 'my-submissions';

export class PresetBrowserTool extends BaseComponent {
  private selectedCategory: PresetCategory | null = null;
  private selectedPreset: UnifiedPreset | null = null;
  private currentSort: PresetSortOption = 'name';
  private currentTab: ViewTab = 'browse';
  private categoryContainer: HTMLElement | null = null;
  private sortContainer: HTMLElement | null = null;
  private featuredSection: HTMLElement | null = null;
  private presetGrid: HTMLElement | null = null;
  private detailPanel: HTMLElement | null = null;
  private authSection: HTMLElement | null = null;
  private authButton: AuthButton | null = null;
  private tabContainer: HTMLElement | null = null;
  private browseContent: HTMLElement | null = null;
  private mySubmissionsContainer: HTMLElement | null = null;
  private mySubmissionsPanel: MySubmissionsPanel | null = null;
  private categories: UnifiedCategory[] = [];
  private presets: UnifiedPreset[] = [];
  private featuredPresets: UnifiedPreset[] = [];
  private isLoading = false;
  private authUnsubscribe: (() => void) | null = null;
  private navigateHandler: ((e: Event) => void) | null = null;

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

    // Auth section with submission CTA (if API available)
    if (hybridPresetService.isAPIAvailable()) {
      this.authSection = this.renderAuthSection();
      content.appendChild(this.authSection);
    }

    // Browse content wrapper
    this.browseContent = this.createElement('div', {
      className: this.currentTab === 'browse' ? '' : 'hidden',
    });

    // Preset grid
    this.presetGrid = this.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    });
    this.renderPresets();
    this.browseContent.appendChild(this.presetGrid);

    // Detail panel (initially hidden)
    this.detailPanel = this.createElement('div', {
      className: 'hidden',
    });
    this.browseContent.appendChild(this.detailPanel);

    content.appendChild(this.browseContent);

    // Subscribe to auth state changes AFTER browseContent exists
    // The subscription fires immediately, and updateViewTabs() appends mySubmissionsContainer
    // as a sibling to browseContent - so browseContent must exist first
    if (hybridPresetService.isAPIAvailable()) {
      this.authUnsubscribe = authService.subscribe(() => {
        this.updateAuthSection();
        this.updateViewTabs();
      });
    }

    // Re-bind events after async render
    this.bindEvents();

    // Check for pending preset ID from URL routing
    this.checkPendingPresetId();
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
   * Select and display a preset by its ID (public method for URL routing)
   * @param presetId - The UUID of the preset to display
   */
  public async selectPresetById(presetId: string): Promise<void> {
    // First check if it's already loaded
    let preset = this.presets.find((p) => p.id === presetId) ||
                 this.featuredPresets.find((p) => p.id === presetId);

    if (preset) {
      this.showPresetDetail(preset, false); // Don't update URL since we're already at it
      return;
    }

    // If not in loaded presets, try to fetch from service directly
    try {
      const fetchedPreset = await hybridPresetService.getPreset(presetId);
      if (fetchedPreset) {
        this.showPresetDetail(fetchedPreset, false);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch preset by ID:', error);
    }

    // Preset not found
    console.warn(`Preset not found: ${presetId}`);
  }

  /**
   * Check for pending preset ID from URL routing and select it
   */
  private checkPendingPresetId(): void {
    const pendingId = sessionStorage.getItem('pendingPresetId');
    if (pendingId) {
      sessionStorage.removeItem('pendingPresetId');
      // Use setTimeout to ensure render is complete
      setTimeout(() => {
        void this.selectPresetById(pendingId);
      }, 100);
    }
  }

  /**
   * Render featured presets section
   */
  private renderFeaturedSection(): HTMLElement {
    const section = this.createElement('div', {
      className: 'featured-section-gradient rounded-lg p-6 text-white',
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
          ? 'bg-[var(--theme-primary)] text-white'
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
            ? 'bg-[var(--theme-primary)] text-white'
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
   * Render auth section with login/submission UI
   */
  private renderAuthSection(): HTMLElement {
    const section = this.createElement('div', {
      className:
        'flex items-center justify-between gap-4 p-4 bg-[var(--theme-primary)]/10 rounded-lg border border-[var(--theme-primary)]/30',
    });

    // Left side: text and optional auth button
    const leftSide = this.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const text = this.createElement('div', {});

    const isLoggedIn = authService.isAuthenticated();

    if (isLoggedIn) {
      const title = this.createElement('div', {
        className: 'font-medium text-gray-900 dark:text-gray-100',
        textContent: 'Share Your Presets!',
      });
      text.appendChild(title);

      const subtitle = this.createElement('div', {
        className: 'text-sm text-gray-700 dark:text-gray-300',
        textContent: 'Create and submit your own dye palettes for the community',
      });
      text.appendChild(subtitle);
    } else {
      const title = this.createElement('div', {
        className: 'font-medium text-gray-900 dark:text-gray-100',
        textContent: 'Want to Share Your Presets?',
      });
      text.appendChild(title);

      const subtitle = this.createElement('div', {
        className: 'text-sm text-gray-700 dark:text-gray-300',
        textContent: 'Sign in with Discord to submit your color palettes',
      });
      text.appendChild(subtitle);
    }

    leftSide.appendChild(text);
    section.appendChild(leftSide);

    // Right side: auth button or submit button
    const rightSide = this.createElement('div', {
      className: 'flex items-center gap-3 flex-shrink-0',
    });

    if (isLoggedIn) {
      // Show submit button
      const submitBtn = this.createElement('button', {
        className:
          'btn-theme-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2',
        dataAttributes: {
          action: 'submit-preset',
        },
      });

      // Plus icon
      const plusIcon = this.createElement('span', {
        innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>`,
      });
      submitBtn.appendChild(plusIcon);

      const btnText = this.createElement('span', {
        textContent: 'Submit Preset',
      });
      submitBtn.appendChild(btnText);

      rightSide.appendChild(submitBtn);

      // Auth button (shows username with logout option)
      const authBtnContainer = this.createElement('div', {});
      this.authButton = new AuthButton(authBtnContainer, { returnTool: 'presets' });
      this.authButton.init();
      rightSide.appendChild(authBtnContainer);
    } else {
      // Show login button
      const authBtnContainer = this.createElement('div', {});
      this.authButton = new AuthButton(authBtnContainer, { returnTool: 'presets' });
      this.authButton.init();
      rightSide.appendChild(authBtnContainer);
    }

    section.appendChild(rightSide);

    return section;
  }

  /**
   * Update auth section when auth state changes
   */
  private updateAuthSection(): void {
    if (!this.authSection) return;

    // Clean up old auth button
    if (this.authButton) {
      this.authButton.destroy();
      this.authButton = null;
    }

    // Get parent and position
    const parent = this.authSection.parentElement;
    const nextSibling = this.authSection.nextSibling;

    // Remove old section
    this.authSection.remove();

    // Create new section
    this.authSection = this.renderAuthSection();

    // Insert at same position
    if (parent) {
      if (nextSibling) {
        parent.insertBefore(this.authSection, nextSibling);
      } else {
        parent.appendChild(this.authSection);
      }
    }

    // Re-bind events for the new section
    this.bindAuthSectionEvents();
  }

  /**
   * Bind events for auth section
   */
  private bindAuthSectionEvents(): void {
    if (!this.authSection) return;

    // Submit button click
    const submitBtn = this.authSection.querySelector('[data-action="submit-preset"]');
    if (submitBtn) {
      this.on(submitBtn as HTMLElement, 'click', () => {
        this.handleSubmitPreset();
      });
    }
  }

  /**
   * Handle submit preset button click
   */
  private handleSubmitPreset(): void {
    showPresetSubmissionForm(async (result) => {
      if (result.success) {
        // Refresh presets to show new submission (if approved)
        try {
          this.presets = await hybridPresetService.getPresets({
            sort: this.currentSort,
            category: this.selectedCategory || undefined,
          });
          this.renderPresets();

          // Also refresh my submissions if on that tab
          if (this.currentTab === 'my-submissions' && this.mySubmissionsPanel) {
            this.mySubmissionsPanel.render();
          }
        } catch (error) {
          console.error('Failed to refresh presets:', error);
        }
      }
    });
  }

  /**
   * Render view tabs (Browse / My Submissions)
   */
  private renderViewTabs(): HTMLElement {
    const container = this.createElement('div', {
      className: 'flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4',
    });

    // Browse tab
    const browseTab = this.createElement('button', {
      className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        this.currentTab === 'browse'
          ? 'text-[var(--theme-primary)] border-[var(--theme-primary)]'
          : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }`,
      textContent: 'Browse Presets',
      dataAttributes: { tab: 'browse' },
    });
    container.appendChild(browseTab);

    // My Submissions tab
    const mySubmissionsTab = this.createElement('button', {
      className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        this.currentTab === 'my-submissions'
          ? 'text-[var(--theme-primary)] border-[var(--theme-primary)]'
          : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }`,
      textContent: 'My Submissions',
      dataAttributes: { tab: 'my-submissions' },
    });
    container.appendChild(mySubmissionsTab);

    return container;
  }

  /**
   * Update view tabs when auth state changes
   */
  private updateViewTabs(): void {
    const isLoggedIn = authService.isAuthenticated();

    if (isLoggedIn) {
      // Clean up any existing elements first to prevent duplicates
      if (this.tabContainer) {
        this.tabContainer.remove();
        this.tabContainer = null;
      }
      if (this.mySubmissionsPanel) {
        this.mySubmissionsPanel.destroy();
        this.mySubmissionsPanel = null;
      }
      if (this.mySubmissionsContainer) {
        this.mySubmissionsContainer.remove();
        this.mySubmissionsContainer = null;
      }

      // User is logged in - create tabs and submissions panel
      const authSectionParent = this.authSection?.parentElement;
      if (authSectionParent && this.authSection) {
        this.tabContainer = this.renderViewTabs();
        // Insert after auth section
        this.authSection.insertAdjacentElement('afterend', this.tabContainer);

        // Create my submissions panel
        this.mySubmissionsContainer = this.createElement('div', {
          className: 'hidden',
        });
        this.mySubmissionsPanel = new MySubmissionsPanel(this.mySubmissionsContainer);
        this.mySubmissionsPanel.render();
        this.browseContent?.parentElement?.appendChild(this.mySubmissionsContainer);

        // Bind tab events
        this.bindTabEvents();
      }
    } else if (!isLoggedIn && this.tabContainer) {
      // User just logged out - remove tabs and switch to browse
      this.currentTab = 'browse';
      this.tabContainer.remove();
      this.tabContainer = null;

      // Show browse content, hide my submissions
      if (this.browseContent) this.browseContent.classList.remove('hidden');
      if (this.mySubmissionsContainer) {
        this.mySubmissionsContainer.classList.add('hidden');
      }

      // Clean up my submissions panel
      if (this.mySubmissionsPanel) {
        this.mySubmissionsPanel.destroy();
        this.mySubmissionsPanel = null;
      }
      if (this.mySubmissionsContainer) {
        this.mySubmissionsContainer.remove();
        this.mySubmissionsContainer = null;
      }
    }
  }

  /**
   * Switch between view tabs
   */
  private switchTab(tab: ViewTab): void {
    if (this.currentTab === tab) return;

    this.currentTab = tab;

    // Update tab button styles
    if (this.tabContainer) {
      this.tabContainer.querySelectorAll('button').forEach((btn) => {
        const btnTab = (btn as HTMLElement).dataset.tab;
        const isActive = btnTab === tab;
        btn.className = `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          isActive
            ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
            : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`;
      });
    }

    // Show/hide content
    if (this.browseContent) {
      this.browseContent.classList.toggle('hidden', tab !== 'browse');
    }
    if (this.mySubmissionsContainer) {
      this.mySubmissionsContainer.classList.toggle('hidden', tab !== 'my-submissions');
    }

    // Refresh my submissions when switching to that tab
    if (tab === 'my-submissions' && this.mySubmissionsPanel) {
      this.mySubmissionsPanel.render();
    }
  }

  /**
   * Bind tab click events
   */
  private bindTabEvents(): void {
    if (!this.tabContainer) return;

    this.on(this.tabContainer, 'click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button') as HTMLElement | null;
      if (button && button.dataset.tab) {
        this.switchTab(button.dataset.tab as ViewTab);
      }
    });
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
   * @param preset - The preset to display
   * @param updateUrl - Whether to update the browser URL (default true)
   */
  private showPresetDetail(preset: UnifiedPreset, updateUrl: boolean = true): void {
    if (!this.detailPanel || !this.presetGrid) return;

    this.selectedPreset = preset;
    this.presetGrid.classList.add('hidden');
    if (this.featuredSection) this.featuredSection.classList.add('hidden');
    if (this.sortContainer) this.sortContainer.classList.add('hidden');
    this.detailPanel.classList.remove('hidden');
    this.detailPanel.innerHTML = '';

    // Update URL to shareable preset link
    if (updateUrl) {
      history.pushState({ presetId: preset.id }, '', `/presets/${preset.id}`);
    }

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

    // Action buttons section (share and vote)
    const actionsSection = this.createElement('div', {
      className: 'mt-6 flex flex-wrap gap-3',
    });

    // Share button
    const shareBtn = this.createElement('button', {
      className:
        'flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
      dataAttributes: {
        action: 'share-preset',
        presetId: preset.id,
      },
    });
    const shareIcon = this.createElement('span', {
      innerHTML: '🔗',
    });
    shareBtn.appendChild(shareIcon);
    const shareText = this.createElement('span', {
      textContent: 'Copy Link',
    });
    shareBtn.appendChild(shareText);
    actionsSection.appendChild(shareBtn);

    // Vote button for community presets (from API)
    if (preset.isFromAPI && !preset.isCurated) {
      const voteBtn = this.createElement('button', {
        className:
          'flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors',
        dataAttributes: {
          action: 'vote-preset',
          presetId: preset.id,
        },
      });
      const voteIcon = this.createElement('span', {
        innerHTML: '⭐',
        className: 'vote-icon',
      });
      voteBtn.appendChild(voteIcon);
      const voteText = this.createElement('span', {
        className: 'vote-text',
        textContent: `Vote (${preset.voteCount})`,
      });
      voteBtn.appendChild(voteText);
      actionsSection.appendChild(voteBtn);

      // Check vote status and update button if already voted
      if (authService.isAuthenticated() && preset.apiPresetId) {
        void communityPresetService.hasVoted(preset.apiPresetId).then((result) => {
          if (result.has_voted) {
            voteBtn.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/30');
            voteBtn.classList.add('bg-green-100', 'dark:bg-green-900/30', 'text-green-700', 'dark:text-green-300');
            voteIcon.innerHTML = '✓';
            voteText.textContent = `Voted (${result.vote_count})`;
          }
        });
      }
    }

    detail.appendChild(actionsSection);

    // Login CTA if not authenticated and preset is voteable
    if (preset.isFromAPI && !preset.isCurated && !authService.isAuthenticated()) {
      const loginCTA = this.createElement('div', {
        className:
          'mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center text-sm text-gray-600 dark:text-gray-400',
      });
      loginCTA.textContent = 'Login with Discord to vote for this preset';
      detail.appendChild(loginCTA);
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

    // Reset URL to base presets path
    history.pushState({}, '', '/');
  }

  /**
   * Handle vote button click
   */
  private async handleVoteClick(btn: HTMLElement): Promise<void> {
    if (!authService.isAuthenticated()) {
      ToastService.warning('Please login with Discord to vote');
      return;
    }

    const presetId = btn.dataset.presetId;
    if (!presetId || !this.selectedPreset?.apiPresetId) return;

    const voteIcon = btn.querySelector('.vote-icon') as HTMLElement;
    const voteText = btn.querySelector('.vote-text') as HTMLElement;
    if (!voteIcon || !voteText) return;

    // Check current vote status
    const hasVoted = voteIcon.innerHTML === '✓';

    // Disable button during API call
    btn.setAttribute('disabled', 'true');
    btn.style.opacity = '0.5';

    try {
      if (hasVoted) {
        // Remove vote
        const result = await communityPresetService.removeVote(this.selectedPreset.apiPresetId);
        if (result.success) {
          btn.classList.remove('bg-green-100', 'dark:bg-green-900/30', 'text-green-700', 'dark:text-green-300');
          btn.classList.add('bg-indigo-100', 'dark:bg-indigo-900/30', 'text-indigo-700', 'dark:text-indigo-300');
          voteIcon.innerHTML = '⭐';
          voteText.textContent = `Vote (${result.new_vote_count})`;
          // Update preset object
          if (this.selectedPreset) {
            this.selectedPreset.voteCount = result.new_vote_count;
          }
          ToastService.info('Vote removed');
        } else {
          ToastService.error(result.error || 'Failed to remove vote');
        }
      } else {
        // Add vote
        const result = await communityPresetService.voteForPreset(this.selectedPreset.apiPresetId);
        if (result.success) {
          btn.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/30', 'text-indigo-700', 'dark:text-indigo-300');
          btn.classList.add('bg-green-100', 'dark:bg-green-900/30', 'text-green-700', 'dark:text-green-300');
          voteIcon.innerHTML = '✓';
          voteText.textContent = `Voted (${result.new_vote_count})`;
          // Update preset object
          if (this.selectedPreset) {
            this.selectedPreset.voteCount = result.new_vote_count;
          }
          ToastService.success('Vote added!');
        } else if (result.already_voted) {
          ToastService.info('You already voted for this preset');
        } else {
          ToastService.error(result.error || 'Failed to vote');
        }
      }
    } catch (error) {
      console.error('Vote error:', error);
      ToastService.error('Failed to process vote');
    } finally {
      btn.removeAttribute('disabled');
      btn.style.opacity = '';
    }
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

    // Detail panel events (back, share, vote)
    if (this.detailPanel) {
      this.on(this.detailPanel, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Back button
        const backBtn = target.closest('[data-action="back"]') as HTMLElement;
        if (backBtn) {
          this.hidePresetDetail();
          return;
        }

        // Share button
        const shareBtn = target.closest('[data-action="share-preset"]') as HTMLElement;
        if (shareBtn) {
          const presetId = shareBtn.dataset.presetId;
          if (presetId) {
            const url = `${window.location.origin}/presets/${presetId}`;
            navigator.clipboard.writeText(url).then(() => {
              ToastService.success('Preset link copied to clipboard!');
            }).catch(() => {
              ToastService.error('Failed to copy link');
            });
          }
          return;
        }

        // Vote button
        const voteBtn = target.closest('[data-action="vote-preset"]') as HTMLElement;
        if (voteBtn) {
          this.handleVoteClick(voteBtn);
          return;
        }
      });
    }

    // Auth section events (submit button)
    this.bindAuthSectionEvents();

    // Tab events
    this.bindTabEvents();

    // Listen for navigate-to-preset events (e.g., from duplicate detection in submission form)
    this.navigateHandler = (e: Event) => {
      const customEvent = e as CustomEvent<{ presetId: string }>;
      const presetId = customEvent.detail?.presetId;
      if (presetId) {
        this.selectPresetById(presetId);
      }
    };
    window.addEventListener('navigate-to-preset', this.navigateHandler);
  }

  destroy(): void {
    // Clean up navigate-to-preset listener
    if (this.navigateHandler) {
      window.removeEventListener('navigate-to-preset', this.navigateHandler);
      this.navigateHandler = null;
    }

    // Unsubscribe from auth state changes
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }

    // Clean up auth button
    if (this.authButton) {
      this.authButton.destroy();
      this.authButton = null;
    }

    // Clean up my submissions panel
    if (this.mySubmissionsPanel) {
      this.mySubmissionsPanel.destroy();
      this.mySubmissionsPanel = null;
    }

    this.selectedCategory = null;
    this.selectedPreset = null;
    this.currentTab = 'browse';
    this.categories = [];
    this.presets = [];
    this.featuredPresets = [];
    this.authSection = null;
    this.tabContainer = null;
    this.browseContent = null;
    this.mySubmissionsContainer = null;
    super.destroy();
  }
}

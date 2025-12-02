import { BaseComponent } from './base-component';
import { LanguageService } from '@services/index';
import { Dye } from '@shared/types';
import { clearContainer } from '@shared/utils';
import { getEmptyStateHTML } from './empty-state';
import { ICON_SEARCH, ICON_PALETTE } from '@shared/empty-state-icons';

export interface DyeGridOptions {
  allowMultiple?: boolean;
  allowDuplicates?: boolean;
  maxSelections?: number;
  showCategories?: boolean;
}

export class DyeGrid extends BaseComponent {
  private dyes: Dye[] = [];
  private selectedDyes: Dye[] = [];
  private focusedIndex: number = -1;
  private gridColumns: number = 4;
  private options: DyeGridOptions;
  private emptyState: { type: 'search' | 'category'; query?: string } | null = null;

  constructor(container: HTMLElement, options: DyeGridOptions = {}) {
    super(container);
    this.options = {
      allowMultiple: options.allowMultiple ?? true,
      allowDuplicates: options.allowDuplicates ?? false,
      maxSelections: options.maxSelections ?? 4,
      showCategories: options.showCategories ?? true,
    };
  }

  public setDyes(dyes: Dye[], emptyState?: { type: 'search' | 'category'; query?: string }): void {
    this.dyes = dyes;
    this.emptyState = emptyState || null;
    this.update();
  }

  public setSelectedDyes(dyes: Dye[]): void {
    this.selectedDyes = dyes;
    this.updateSelectionVisuals();
  }

  render(): void {
    const wrapper = this.createElement('div', {
      className:
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto',
      attributes: {
        role: 'grid',
        'aria-label': LanguageService.t('dyeSelector.gridAriaLabel') || 'Dye color selection',
      },
    });

    if (this.dyes.length === 0 && this.emptyState) {
      // Render empty state
      const emptyHtml =
        this.emptyState.type === 'search'
          ? getEmptyStateHTML({
              icon: ICON_SEARCH,
              title:
                LanguageService.tInterpolate('dyeSelector.noResults', {
                  query: this.emptyState.query || '',
                }) || `No dyes match "${this.emptyState.query}"`,
              description:
                LanguageService.t('dyeSelector.noResultsHint') ||
                'Try checking your spelling or search for a category like "purple".',
            })
          : getEmptyStateHTML({
              icon: ICON_PALETTE,
              title:
                LanguageService.t('dyeSelector.noDyesInCategory') || 'No dyes in this category',
              description:
                LanguageService.t('dyeSelector.tryCategoryHint') ||
                'Try selecting a different category.',
            });
      wrapper.innerHTML = emptyHtml;
      wrapper.classList.remove(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4',
        'gap-3'
      );
      wrapper.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'p-8');
    } else {
      this.dyes.forEach((dye, i) => {
        const _isFocused = i === this.focusedIndex || (this.focusedIndex === -1 && i === 0);
        const isSelected = this.selectedDyes.some((d) => d.id === dye.id);

        const btn = this.createElement('button', {
          className: `dye-select-btn group relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
            isSelected
              ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 shadow-md transform scale-[1.02]'
              : 'bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-100 dark:border-gray-700'
          }`,
          attributes: {
            'data-dye-id': String(dye.id),
            'aria-label': dye.name,
            'aria-selected': isSelected ? 'true' : 'false',
            type: 'button',
          },
        });

        this.on(btn, 'click', (e) => {
          e.stopPropagation(); // Prevent bubbling if needed, or just let it bubble
          this.emit('dye-selected', dye);
        }); // Content
        const content = this.createElement('div', { className: 'space-y-1' });
        // Color div
        content.appendChild(
          this.createElement('div', {
            className: 'w-full h-12 rounded border border-gray-300 dark:border-gray-600',
            attributes: { style: `background-color: ${dye.hex}` },
          })
        );
        // Name
        content.appendChild(
          this.createElement('div', {
            textContent: LanguageService.getDyeName(dye.itemID) || dye.name,
            className: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
          })
        );
        // Hex
        content.appendChild(
          this.createElement('div', {
            textContent: dye.hex,
            className: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
          })
        );
        // Category
        if (this.options.showCategories) {
          content.appendChild(
            this.createElement('div', {
              textContent: LanguageService.getCategory(dye.category),
              className: 'text-xs text-gray-500 dark:text-gray-500',
            })
          );
        }

        btn.appendChild(content);
        wrapper.appendChild(btn);
      });
    }

    clearContainer(this.container);
    this.element = wrapper;
    this.container.appendChild(this.element);
  }

  bindEvents(): void {
    console.error('DyeGrid.bindEvents called', this.element);
    if (!this.element) return;

    // Click
    this.on(this.element, 'click', (e) => {
      console.error('DyeGrid click handler fired');
      const target = (e.target as HTMLElement).closest('.dye-select-btn');
      console.error('DyeGrid click target', target);
      if (target) {
        const id = parseInt(target.getAttribute('data-dye-id') || '0', 10);
        const dye = this.dyes.find((d) => d.id === id);
        console.error('DyeGrid click found', id, dye);
        if (dye) this.emit('dye-selected', dye);
      }
    });

    // Keydown
    this.on(this.element, 'keydown', (e) => this.handleKeydown(e as KeyboardEvent));
  }

  private updateSelectionVisuals(): void {
    const btns = this.container.querySelectorAll('.dye-select-btn');
    btns.forEach((btn) => {
      const id = parseInt(btn.getAttribute('data-dye-id') || '0', 10);
      const isSelected = this.selectedDyes.some((d) => d.id === id);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    const dyeButtons = this.container.querySelectorAll<HTMLButtonElement>('.dye-select-btn');
    if (dyeButtons.length === 0) return;

    this.updateGridColumns();

    const key = event.key;
    let newIndex = this.focusedIndex;

    switch (key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = Math.min(this.focusedIndex + 1, this.dyes.length - 1);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        newIndex = Math.max(this.focusedIndex - 1, 0);
        break;

      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(this.focusedIndex + this.gridColumns, this.dyes.length - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(this.focusedIndex - this.gridColumns, 0);
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = this.dyes.length - 1;
        break;

      case 'PageDown':
        event.preventDefault();
        newIndex = Math.min(this.focusedIndex + this.gridColumns * 3, this.dyes.length - 1);
        break;

      case 'PageUp':
        event.preventDefault();
        newIndex = Math.max(this.focusedIndex - this.gridColumns * 3, 0);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.focusedIndex >= 0 && this.focusedIndex < this.dyes.length) {
          this.emit('dye-selected', this.dyes[this.focusedIndex]);
        }
        return;

      case 'Escape':
        event.preventDefault();
        this.emit('escape-pressed', void 0);
        return;

      default:
        return;
    }

    if (newIndex !== this.focusedIndex) {
      this.setFocusedIndex(newIndex);
    }
  }

  private updateGridColumns(): void {
    const gridContainer = this.container.querySelector<HTMLElement>('div[role="grid"]');
    if (!gridContainer) return;

    const computedStyle = window.getComputedStyle(gridContainer);
    const gridTemplateColumns = computedStyle.gridTemplateColumns;

    if (gridTemplateColumns && gridTemplateColumns !== 'none') {
      const columns = gridTemplateColumns.split(' ').length;
      this.gridColumns = columns;
    } else {
      const width = window.innerWidth;
      if (width >= 1024) this.gridColumns = 4;
      else if (width >= 768) this.gridColumns = 3;
      else if (width >= 640) this.gridColumns = 2;
      else this.gridColumns = 1;
    }
  }

  private setFocusedIndex(index: number): void {
    const dyeButtons = this.container.querySelectorAll<HTMLButtonElement>('.dye-select-btn');
    if (index < 0 || index >= dyeButtons.length) return;

    if (this.focusedIndex >= 0 && this.focusedIndex < dyeButtons.length) {
      dyeButtons[this.focusedIndex].setAttribute('tabindex', '-1');
    }

    this.focusedIndex = index;
    const newFocusedBtn = dyeButtons[this.focusedIndex];
    newFocusedBtn.setAttribute('tabindex', '0');
    newFocusedBtn.focus();
    newFocusedBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/**
 * XIV Dye Tools v2.2.0 - Changelog Modal Component
 *
 * Shows "What's New" modal after version updates
 * Displays recent changes to returning users
 *
 * @module components/changelog-modal
 */

import { ModalService } from '@services/modal-service';
import { StorageService } from '@services/storage-service';
import { LanguageService } from '@services/language-service';
import { STORAGE_KEYS, APP_VERSION, APP_NAME } from '@shared/constants';

// ============================================================================
// Changelog Data Structure
// ============================================================================

interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
  isBreaking?: boolean;
}

/**
 * Changelog entries - most recent first
 * Only include user-facing changes, not internal refactors
 */
const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: '2.2.0',
    date: '2025-11-30',
    highlights: [
      'Welcome modal for first-time visitors',
      'What\'s New changelog for returning users',
      'Toast notification system for feedback',
      'Loading spinners with reduced motion support',
      'Keyboard navigation for dye selector (arrow keys, Home/End)',
      'Empty states when no results found',
    ],
  },
  {
    version: '2.1.3',
    date: '2025-11-30',
    highlights: [
      'New SVG harmony icons for better cross-platform display',
      'Visual representations of each harmony type on color wheel',
    ],
  },
  {
    version: '2.1.2',
    date: '2025-11-30',
    highlights: [
      'Fixed French, Korean, and Chinese localization terminology',
      'Corrected "Cosmic Fortunes" and dye filter translations',
    ],
  },
  {
    version: '2.1.1',
    date: '2025-11-28',
    highlights: [
      '80%+ branch coverage testing achieved',
      'Full 6-language internationalization support',
      'Browser language auto-detection',
    ],
  },
  {
    version: '2.0.7',
    date: '2025-12-26',
    highlights: [
      'Enhanced storage service test coverage',
      'Bug fixes and stability improvements',
    ],
  },
  {
    version: '2.0.6',
    date: '2025-11-25',
    highlights: [
      'New Cotton Candy and Sugar Riot themes',
      'Improved theme WCAG AA compliance',
      'Center-aligned UI elements',
    ],
  },
];

// ============================================================================
// Changelog Modal Class
// ============================================================================

/**
 * Changelog modal for returning users after updates
 */
export class ChangelogModal {
  private modalId: string | null = null;

  /**
   * Check if changelog modal should be shown
   * Shows when stored version differs from current version
   */
  static shouldShow(): boolean {
    const lastVersion = StorageService.getItem<string>(STORAGE_KEYS.LAST_VERSION_VIEWED, '');

    // Don't show if no last version (first visit - welcome modal handles that)
    if (!lastVersion) {
      return false;
    }

    // Show if version has changed
    return lastVersion !== APP_VERSION;
  }

  /**
   * Mark current version as viewed
   */
  static markAsViewed(): void {
    StorageService.setItem(STORAGE_KEYS.LAST_VERSION_VIEWED, APP_VERSION);
  }

  /**
   * Reset changelog modal (for testing or settings)
   */
  static reset(): void {
    StorageService.removeItem(STORAGE_KEYS.LAST_VERSION_VIEWED);
  }

  /**
   * Get the entries to display (current version + recent history)
   */
  private getRelevantEntries(): ChangelogEntry[] {
    // Find current version entry
    const currentEntry = CHANGELOG_ENTRIES.find((e) => e.version === APP_VERSION);

    // Get up to 3 previous versions for context
    const currentIndex = CHANGELOG_ENTRIES.findIndex((e) => e.version === APP_VERSION);
    const previousEntries = CHANGELOG_ENTRIES.slice(currentIndex + 1, currentIndex + 3);

    const entries: ChangelogEntry[] = [];
    if (currentEntry) {
      entries.push(currentEntry);
    }
    entries.push(...previousEntries);

    return entries;
  }

  /**
   * Show the changelog modal
   */
  show(): void {
    if (this.modalId) return; // Already showing

    const content = this.createContent();

    this.modalId = ModalService.showChangelog({
      title: `${LanguageService.t('changelog.title') || `What's New in v${APP_VERSION}`}`,
      content,
      size: 'md',
      closable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      onClose: () => {
        ChangelogModal.markAsViewed();
        this.modalId = null;
      },
    });
  }

  /**
   * Close the changelog modal
   */
  close(): void {
    if (this.modalId) {
      ModalService.dismiss(this.modalId);
      this.modalId = null;
    }
  }

  /**
   * Create modal content
   */
  private createContent(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'changelog-modal-content';

    const entries = this.getRelevantEntries();

    if (entries.length === 0) {
      // Fallback if no changelog data for current version
      const fallback = document.createElement('p');
      fallback.className = 'text-gray-600 dark:text-gray-300';
      fallback.textContent = LanguageService.t('changelog.noChanges') ||
        'Bug fixes and performance improvements.';
      container.appendChild(fallback);
    } else {
      // Current version highlights
      const currentEntry = entries[0];
      if (currentEntry) {
        const currentSection = this.createVersionSection(currentEntry, true);
        container.appendChild(currentSection);
      }

      // Previous versions (collapsed summary)
      if (entries.length > 1) {
        const previousSection = document.createElement('div');
        previousSection.className = 'mt-6 pt-4 border-t border-gray-200 dark:border-gray-700';

        const previousTitle = document.createElement('h4');
        previousTitle.className = 'text-sm font-medium text-gray-500 dark:text-gray-400 mb-3';
        previousTitle.textContent = LanguageService.t('changelog.previousUpdates') || 'Previous updates:';
        previousSection.appendChild(previousTitle);

        const previousList = document.createElement('div');
        previousList.className = 'space-y-2';

        entries.slice(1).forEach((entry) => {
          const item = document.createElement('div');
          item.className = 'text-sm text-gray-600 dark:text-gray-400';
          item.innerHTML = `<span class="font-medium">v${entry.version}</span> - ${entry.highlights[0]}`;
          previousList.appendChild(item);
        });

        previousSection.appendChild(previousList);
        container.appendChild(previousSection);
      }
    }

    // Action buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700';

    // View full changelog link
    const viewFullBtn = document.createElement('a');
    viewFullBtn.className = 'text-sm text-blue-600 dark:text-blue-400 hover:underline';
    viewFullBtn.href = 'https://github.com/FlashGalatine/xivdyetools-web-app/blob/main/docs/CHANGELOG.md';
    viewFullBtn.target = '_blank';
    viewFullBtn.rel = 'noopener noreferrer';
    viewFullBtn.textContent = LanguageService.t('changelog.viewFull') || 'View full changelog';

    // Got it button
    const gotItBtn = document.createElement('button');
    gotItBtn.className = `
      px-6 py-2 text-sm font-medium rounded-lg
      text-white bg-blue-600 hover:bg-blue-700 transition-colors
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
    `.replace(/\s+/g, ' ').trim();
    gotItBtn.textContent = LanguageService.t('changelog.gotIt') || 'Got it!';
    gotItBtn.addEventListener('click', () => {
      this.close();
    });

    buttonContainer.appendChild(viewFullBtn);
    buttonContainer.appendChild(gotItBtn);
    container.appendChild(buttonContainer);

    return container;
  }

  /**
   * Create a version section with highlights
   */
  private createVersionSection(entry: ChangelogEntry, isCurrent: boolean): HTMLElement {
    const section = document.createElement('div');
    section.className = isCurrent ? '' : 'mt-4';

    // Version header (only for non-current entries)
    if (!isCurrent) {
      const header = document.createElement('h4');
      header.className = 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2';
      header.textContent = `v${entry.version}`;
      section.appendChild(header);
    }

    // Highlights list
    const list = document.createElement('ul');
    list.className = 'space-y-2';

    entry.highlights.forEach((highlight) => {
      const item = document.createElement('li');
      item.className = 'flex items-start gap-2 text-gray-600 dark:text-gray-300';
      item.innerHTML = `
        <span class="text-green-500 dark:text-green-400 flex-shrink-0">★</span>
        <span>${highlight}</span>
      `;
      list.appendChild(item);
    });

    section.appendChild(list);

    return section;
  }
}

/**
 * Show changelog modal if version has changed
 */
export function showChangelogIfUpdated(): void {
  if (ChangelogModal.shouldShow()) {
    // Small delay to ensure app is fully loaded and welcome modal has had a chance
    setTimeout(() => {
      const modal = new ChangelogModal();
      modal.show();
    }, 1000);
  }
}

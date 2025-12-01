/**
 * XIV Dye Tools v2.1.0 - Welcome Modal Component
 *
 * First-time user welcome modal introducing app features
 * Shows only once unless reset by user
 *
 * @module components/welcome-modal
 */

import { ModalService } from '@services/modal-service';
import { StorageService } from '@services/storage-service';
import { LanguageService } from '@services/language-service';
import { STORAGE_KEYS, APP_NAME, APP_VERSION } from '@shared/constants';

// ============================================================================
// Tool Definitions
// ============================================================================

interface ToolInfo {
  id: string;
  icon: string;
  nameKey: string;
  descriptionKey: string;
}

const TOOLS: ToolInfo[] = [
  {
    id: 'harmony',
    icon: '🎨',
    nameKey: 'tools.harmony.name',
    descriptionKey: 'welcome.tools.harmony',
  },
  {
    id: 'matcher',
    icon: '🖼️',
    nameKey: 'tools.matcher.name',
    descriptionKey: 'welcome.tools.matcher',
  },
  {
    id: 'comparison',
    icon: '⚖️',
    nameKey: 'tools.comparison.name',
    descriptionKey: 'welcome.tools.comparison',
  },
  {
    id: 'mixer',
    icon: '🌈',
    nameKey: 'tools.mixer.name',
    descriptionKey: 'welcome.tools.mixer',
  },
  {
    id: 'accessibility',
    icon: '👁️',
    nameKey: 'tools.accessibility.name',
    descriptionKey: 'welcome.tools.accessibility',
  },
];

// ============================================================================
// Welcome Modal Class
// ============================================================================

/**
 * Welcome modal for first-time users
 */
export class WelcomeModal {
  private modalId: string | null = null;
  private dontShowAgain = false;

  /**
   * Check if welcome modal should be shown
   */
  static shouldShow(): boolean {
    return !StorageService.getItem<boolean>(STORAGE_KEYS.WELCOME_SEEN, false);
  }

  /**
   * Mark welcome as seen and set version to prevent changelog showing
   */
  static markAsSeen(): void {
    StorageService.setItem(STORAGE_KEYS.WELCOME_SEEN, true);
    // Also set version so changelog doesn't show for this version
    StorageService.setItem(STORAGE_KEYS.LAST_VERSION_VIEWED, APP_VERSION);
  }

  /**
   * Reset welcome modal (for testing or settings)
   */
  static reset(): void {
    StorageService.removeItem(STORAGE_KEYS.WELCOME_SEEN);
  }

  /**
   * Show the welcome modal
   */
  show(): void {
    if (this.modalId) return; // Already showing

    const content = this.createContent();

    this.modalId = ModalService.showWelcome({
      title: `✨ ${LanguageService.t('welcome.title') || `Welcome to ${APP_NAME}`}`,
      content,
      size: 'lg',
      closable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      onClose: () => {
        if (this.dontShowAgain) {
          WelcomeModal.markAsSeen();
        }
        this.modalId = null;
      },
    });
  }

  /**
   * Close the welcome modal
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
    container.className = 'welcome-modal-content';

    // Introduction text
    const intro = document.createElement('p');
    intro.className = 'text-gray-600 dark:text-gray-300 mb-6';
    intro.textContent =
      LanguageService.t('welcome.intro') ||
      'Find the perfect dyes for your FFXIV glamours! Explore our tools below:';
    container.appendChild(intro);

    // Tools grid
    const toolsGrid = document.createElement('div');
    toolsGrid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6';

    TOOLS.forEach((tool) => {
      const toolCard = this.createToolCard(tool);
      toolsGrid.appendChild(toolCard);
    });

    container.appendChild(toolsGrid);

    // Quick tips section
    const tipsSection = this.createTipsSection();
    container.appendChild(tipsSection);

    // Don't show again checkbox
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'flex items-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'welcome-dont-show';
    checkbox.className = 'w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500';
    checkbox.addEventListener('change', () => {
      this.dontShowAgain = checkbox.checked;
    });

    const label = document.createElement('label');
    label.htmlFor = 'welcome-dont-show';
    label.className = 'text-sm text-gray-600 dark:text-gray-400 cursor-pointer';
    label.textContent = LanguageService.t('welcome.dontShowAgain') || "Don't show this again";

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    container.appendChild(checkboxContainer);

    // Action buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end gap-3 mt-4';

    const getStartedBtn = document.createElement('button');
    getStartedBtn.className = `
      px-6 py-2 text-sm font-medium rounded-lg
      text-white bg-blue-600 hover:bg-blue-700 transition-colors
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
    `.replace(/\s+/g, ' ').trim();
    getStartedBtn.textContent = LanguageService.t('welcome.getStarted') || 'Get Started';
    getStartedBtn.addEventListener('click', () => {
      this.dontShowAgain = true; // Always mark as seen when clicking Get Started
      this.close();
      WelcomeModal.markAsSeen();
    });

    buttonContainer.appendChild(getStartedBtn);
    container.appendChild(buttonContainer);

    return container;
  }

  /**
   * Create a tool card
   */
  private createToolCard(tool: ToolInfo): HTMLElement {
    const card = document.createElement('div');
    card.className = `
      flex flex-col items-center p-3 rounded-lg
      bg-gray-50 dark:bg-gray-700/50
      hover:bg-gray-100 dark:hover:bg-gray-700
      transition-colors cursor-pointer
    `.replace(/\s+/g, ' ').trim();

    const icon = document.createElement('span');
    icon.className = 'text-2xl mb-2';
    icon.textContent = tool.icon;
    card.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'text-xs font-medium text-gray-700 dark:text-gray-200 text-center';
    name.textContent = LanguageService.t(tool.nameKey) || tool.id;
    card.appendChild(name);

    // Tooltip with description
    card.title = LanguageService.t(tool.descriptionKey) || '';

    return card;
  }

  /**
   * Create quick tips section
   */
  private createTipsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4';

    const title = document.createElement('h3');
    title.className = 'text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2';
    title.textContent = LanguageService.t('welcome.quickTips') || 'Quick Tips';
    section.appendChild(title);

    const tips = [
      LanguageService.t('welcome.tip1') || 'Click tool names in the header to switch between tools',
      LanguageService.t('welcome.tip2') || 'Prices are from Universalis (live market data)',
      LanguageService.t('welcome.tip3') || 'Your settings are saved locally in your browser',
    ];

    const list = document.createElement('ul');
    list.className = 'space-y-1';

    tips.forEach((tip) => {
      const item = document.createElement('li');
      item.className = 'text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2';
      item.innerHTML = `<span class="text-blue-500">•</span> ${tip}`;
      list.appendChild(item);
    });

    section.appendChild(list);

    return section;
  }
}

/**
 * Show welcome modal if first visit
 */
export function showWelcomeIfFirstVisit(): void {
  if (WelcomeModal.shouldShow()) {
    // Small delay to ensure app is fully loaded
    setTimeout(() => {
      const modal = new WelcomeModal();
      modal.show();
    }, 500);
  }
}

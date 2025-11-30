/**
 * XIV Dye Tools v2.0.0 - App Layout Component
 *
 * Phase 12: Architecture Refactor
 * Main application layout with header, content area, and footer
 *
 * @module components/app-layout
 */

import { BaseComponent } from './base-component';
import { ThemeSwitcher } from './theme-switcher';
import { LanguageSelector } from './language-selector';
import { ToastContainer } from './toast-container';
import { ThemeService, LanguageService } from '@services/index';
import { APP_VERSION } from '@shared/constants';
import { clearContainer } from '@shared/utils';

/**
 * Main application layout component
 * Manages overall page structure and component hierarchy
 */
export class AppLayout extends BaseComponent {
  private themeSwitcher: ThemeSwitcher | null = null;
  private languageSelector: LanguageSelector | null = null;
  private toastContainer: ToastContainer | null = null;
  private contentContainer: HTMLElement | null = null;

  /**
   * Render the application layout
   */
  render(): void {
    const app = this.createElement('div', {
      className: 'app-shell flex flex-col min-h-screen transition-colors',
    });

    // Header - sticky positioning for top navigation
    const header = this.renderHeader();
    header.classList.add('sticky', 'top-0', 'z-30'); // Sticky positioning, stays at top, above content
    app.appendChild(header);

    // Main content area
    const main = this.createElement('main', {
      className: 'flex-1 max-w-7xl mx-auto w-full px-4 py-8',
    });

    this.contentContainer = main;
    app.appendChild(main);

    // Footer
    const footer = this.renderFooter();
    app.appendChild(footer);

    // Toast container (for notifications)
    const toastContainerEl = this.createElement('div', {
      id: 'toast-root',
    });
    app.appendChild(toastContainerEl);

    clearContainer(this.container);
    this.element = app;
    this.container.appendChild(this.element);
  }

  /**
   * Render the header section
   */
  private renderHeader(): HTMLElement {
    const header = this.createElement('header', {
      className: 'app-header shadow-lg',
    });

    const nav = this.createElement('nav', {
      className: 'max-w-7xl mx-auto px-4 py-4 flex justify-between items-center',
    });

    // Logo/Title
    const titleDiv = this.createElement('div', {
      className: 'flex items-center gap-3',
    });

    // Logo image - responsive picture element with WebP support
    // Provides different image sizes for mobile, tablet, and desktop
    const picture = this.createElement('picture', {});

    // Mobile source (max-width: 640px)
    const sourceMobile = this.createElement('source', {
      attributes: {
        srcset: '/assets/icons/icon-40x40.webp',
        media: '(max-width: 640px)',
        type: 'image/webp',
      },
    });

    // Tablet source (max-width: 1024px)
    const sourceTablet = this.createElement('source', {
      attributes: {
        srcset: '/assets/icons/icon-60x60.webp',
        media: '(max-width: 1024px)',
        type: 'image/webp',
      },
    });

    // Desktop source (default)
    const sourceDesktop = this.createElement('source', {
      attributes: {
        srcset: '/assets/icons/icon-80x80.webp',
        type: 'image/webp',
      },
    });

    // Fallback PNG image (single size, browser will scale)
    const logo = this.createElement('img', {
      attributes: {
        src: '/assets/icons/icon-192x192.png',
        alt: 'XIV Dye Tools Logo',
        title: 'XIV Dye Tools',
        loading: 'eager',
        fetchpriority: 'high',
        width: '40',
        height: '40',
        onerror: "this.onerror=null; this.src='/assets/icons/icon-192x192.png';",
      },
      className: 'w-10 h-10 rounded',
    });

    picture.appendChild(sourceMobile);
    picture.appendChild(sourceTablet);
    picture.appendChild(sourceDesktop);
    picture.appendChild(logo);
    titleDiv.appendChild(picture);

    // Use --theme-text-header for header text
    const title = this.createElement('h1', {
      textContent: LanguageService.t('app.title'),
      className: 'text-2xl font-bold',
      attributes: {
        style: 'color: var(--theme-text-header);',
      },
    });

    const versionText = `v${APP_VERSION}`;
    const version = this.createElement('span', {
      textContent: versionText,
      className: 'text-sm font-mono',
      attributes: {
        'data-app-version': versionText,
        style: 'color: var(--theme-text-header); opacity: 0.8;',
      },
    });

    titleDiv.appendChild(title);
    titleDiv.appendChild(version);

    // Right side: Tools dropdown + Language selector + Theme switcher
    const rightContainer = this.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const toolsDropdownContainer = this.createElement('div', {
      id: 'tools-dropdown-container',
    });

    const languageSelectorContainer = this.createElement('div', {
      id: 'language-selector-container',
    });

    const themeSwitcherContainer = this.createElement('div', {
      id: 'theme-switcher-container',
    });

    rightContainer.appendChild(toolsDropdownContainer);
    rightContainer.appendChild(languageSelectorContainer);
    rightContainer.appendChild(themeSwitcherContainer);
    nav.appendChild(titleDiv);
    nav.appendChild(rightContainer);
    header.appendChild(nav);

    return header;
  }

  /**
   * Render the footer section
   */
  private renderFooter(): HTMLElement {
    const footer = this.createElement('footer', {
      className: 'app-footer mt-12',
      attributes: {
        style: 'min-height: 300px;', // Reserve space to prevent layout shift when fonts load (actual height ~298px)
      },
    });

    const footerContent = this.createElement('div', {
      className: 'max-w-7xl mx-auto px-4 py-8',
    });

    // Copyright info
    const copyright = this.createElement('div', {
      className: 'text-center text-sm text-gray-600 dark:text-gray-400 mb-6',
      innerHTML:
        `${LanguageService.t('app.title')} v${APP_VERSION}<br>Built with TypeScript, Vite, and Tailwind CSS`,
    });
    footerContent.appendChild(copyright);

    // Social links
    const socialLinks = this.createElement('div', {
      className: 'flex justify-center gap-4 flex-wrap mb-4',
    });

    const socialMedia = [
      { label: 'GitHub', url: 'https://github.com/FlashGalatine', icon: '🐙' },
      { label: 'X/Twitter', url: 'https://x.com/AsheJunius', icon: '𝕏' },
      { label: 'Twitch', url: 'https://www.twitch.tv/flashgalatine', icon: '📺' },
      { label: 'BlueSky', url: 'https://bsky.app/profile/projectgalatine.com', icon: '🌐' },
      { label: 'Discord', url: 'https://discord.gg/5VUSKTZCe5', icon: '💬' },
      { label: 'Patreon', url: 'https://patreon.com/ProjectGalatine', icon: '❤️' },
    ];

    socialMedia.forEach((social) => {
      const link = this.createElement('a', {
        className:
          'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm',
        attributes: {
          href: social.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          title: social.label,
        },
        innerHTML: `${social.icon} ${social.label}`,
      });
      socialLinks.appendChild(link);
    });

    footerContent.appendChild(socialLinks);

    // Creator info
    const creator = this.createElement('div', {
      className: 'text-center text-xs text-gray-500 dark:text-gray-500',
      innerHTML: `${LanguageService.t('footer.createdBy')} ✨`,
    });
    footerContent.appendChild(creator);

    // FFXIV Copyright disclaimer
    const disclaimer = this.createElement('div', {
      className:
        'text-center text-xs text-gray-500 dark:text-gray-500 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
      innerHTML:
        `${LanguageService.t('footer.disclaimer')}<br>${LanguageService.t('footer.notAffiliated')}`,
    });
    footerContent.appendChild(disclaimer);

    footer.appendChild(footerContent);

    return footer;
  }

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    // Event handlers for child components can be added here
  }

  /**
   * Initialize the layout and all child components
   */
  onMount(): void {
    // Initialize language selector
    const languageSelectorContainer = this.querySelector<HTMLElement>('#language-selector-container');
    if (languageSelectorContainer) {
      this.languageSelector = new LanguageSelector(languageSelectorContainer);
      this.languageSelector.init();
    }

    // Initialize theme switcher
    const themeSwitcherContainer = this.querySelector<HTMLElement>('#theme-switcher-container');
    if (themeSwitcherContainer) {
      this.themeSwitcher = new ThemeSwitcher(themeSwitcherContainer);
      this.themeSwitcher.init();
    }

    // Initialize toast container (for notifications)
    const toastRoot = this.querySelector<HTMLElement>('#toast-root');
    if (toastRoot) {
      this.toastContainer = new ToastContainer(toastRoot);
      this.toastContainer.init();
    }

    // Subscribe to theme changes to update header text colors (without re-rendering entire layout)
    ThemeService.subscribe(() => {
      this.updateHeaderColors();
    });

    // Subscribe to language changes to update text
    LanguageService.subscribe(() => {
      this.updateLocalizedText();
    });
  }

  /**
   * Update localized text when language changes (without re-rendering)
   */
  private updateLocalizedText(): void {
    // Update title text
    const title = this.querySelector<HTMLElement>('header h1');
    if (title) {
      title.textContent = LanguageService.t('app.title');
    }

    // Update footer text
    const footerCopyright = this.querySelector<HTMLElement>('footer .text-sm');
    if (footerCopyright) {
      footerCopyright.innerHTML = `${LanguageService.t('app.title')} v${APP_VERSION}<br>Built with TypeScript, Vite, and Tailwind CSS`;
    }

    const footerCreator = this.querySelector<HTMLElement>('footer .text-xs:not(.border-t)');
    if (footerCreator) {
      footerCreator.innerHTML = `${LanguageService.t('footer.createdBy')} ✨`;
    }

    const footerDisclaimer = this.querySelector<HTMLElement>('footer .border-t');
    if (footerDisclaimer) {
      footerDisclaimer.innerHTML = `${LanguageService.t('footer.disclaimer')}<br>${LanguageService.t('footer.notAffiliated')}`;
    }
  }

  /**
   * Update header text colors based on current theme (without re-rendering)
   */
  private updateHeaderColors(): void {
    // Update title text color using --theme-text-header
    const title = this.querySelector<HTMLElement>('header h1');
    if (title) {
      title.style.color = 'var(--theme-text-header)';
    }

    // Update version text color (muted version of header text)
    const version = this.querySelector<HTMLElement>('header span[data-app-version]');
    if (version) {
      // Use opacity to create muted effect
      version.style.color = 'var(--theme-text-header)';
      version.style.opacity = '0.8';
    }
  }

  /**
   * Get the main content container
   */
  getContentContainer(): HTMLElement | null {
    return this.contentContainer;
  }

  /**
   * Set the main content
   */
  setContent(content: HTMLElement | string): void {
    if (!this.contentContainer) return;

    clearContainer(this.contentContainer);

    if (typeof content === 'string') {
      this.contentContainer.textContent = content;
    } else {
      this.contentContainer.appendChild(content);
    }
  }

  /**
   * Get component state
   */
  protected getState(): Record<string, unknown> {
    return {
      themeSwitcherInitialized: this.themeSwitcher !== null,
    };
  }

  /**
   * Destroy the layout and all child components
   */
  destroy(): void {
    if (this.languageSelector) {
      this.languageSelector.destroy();
    }
    if (this.themeSwitcher) {
      this.themeSwitcher.destroy();
    }
    if (this.toastContainer) {
      this.toastContainer.destroy();
    }
    super.destroy();
  }
}

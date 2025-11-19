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
import { ThemeService } from '@services/index';
import { APP_VERSION } from '@shared/constants';

/**
 * Main application layout component
 * Manages overall page structure and component hierarchy
 */
export class AppLayout extends BaseComponent {
  private themeSwitcher: ThemeSwitcher | null = null;
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

    this.container.innerHTML = '';
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
    const picture = this.createElement('picture', {});
    
    // WebP sources for different screen sizes
    const sourceMobile = this.createElement('source', {
      attributes: {
        srcset: '/assets/icons/icon-40x40.webp',
        media: '(max-width: 640px)',
        type: 'image/webp',
      },
    });
    
    const sourceTablet = this.createElement('source', {
      attributes: {
        srcset: '/assets/icons/icon-80x80.webp',
        media: '(max-width: 1024px)',
        type: 'image/webp',
      },
    });
    
    const sourceDefault = this.createElement('source', {
      attributes: {
        srcset: '/assets/icons/icon-192x192.webp',
        type: 'image/webp',
      },
    });
    
    // Fallback PNG image
    const logo = this.createElement('img', {
      attributes: {
        src: '/assets/icons/icon-192x192.png',
        alt: 'XIV Dye Tools Logo',
        title: 'XIV Dye Tools',
        loading: 'eager',
        fetchpriority: 'high',
        onerror: "this.onerror=null; this.src='assets/icons/icon-192x192.png';",
      },
      className: 'w-10 h-10 rounded',
    });
    
    picture.appendChild(sourceMobile);
    picture.appendChild(sourceTablet);
    picture.appendChild(sourceDefault);
    picture.appendChild(logo);
    titleDiv.appendChild(picture);

    // Use --theme-text-header for header text
    const title = this.createElement('h1', {
      textContent: 'XIV Dye Tools',
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

    // Right side: Tools dropdown + Theme switcher
    const rightContainer = this.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const toolsDropdownContainer = this.createElement('div', {
      id: 'tools-dropdown-container',
    });

    const themeSwitcherContainer = this.createElement('div', {
      id: 'theme-switcher-container',
    });

    rightContainer.appendChild(toolsDropdownContainer);
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
    });

    const footerContent = this.createElement('div', {
      className: 'max-w-7xl mx-auto px-4 py-8',
    });

    // Copyright info
    const copyright = this.createElement('div', {
      className: 'text-center text-sm text-gray-600 dark:text-gray-400 mb-6',
      innerHTML:
        `XIV Dye Tools v${APP_VERSION} • Phase 12 Architecture Refactor<br>Built with TypeScript, Vite, and Tailwind CSS`,
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
      innerHTML: 'Created by Flash Galatine (Balmung) for the FFXIV community ✨',
    });
    footerContent.appendChild(creator);

    // FFXIV Copyright disclaimer
    const disclaimer = this.createElement('div', {
      className:
        'text-center text-xs text-gray-500 dark:text-gray-500 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
      innerHTML:
        'FINAL FANTASY XIV © 2013-2025 SQUARE ENIX. XIV Dye Tools is a fan-made application and is not affiliated with or endorsed by Square Enix.',
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
    // Initialize theme switcher
    const themeSwitcherContainer = this.querySelector<HTMLElement>('#theme-switcher-container');
    if (themeSwitcherContainer) {
      this.themeSwitcher = new ThemeSwitcher(themeSwitcherContainer);
      this.themeSwitcher.init();
    }
    
    // Subscribe to theme changes to update header text colors (without re-rendering entire layout)
    ThemeService.subscribe(() => {
      this.updateHeaderColors();
    });
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

    this.contentContainer.innerHTML = '';

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
    if (this.themeSwitcher) {
      this.themeSwitcher.destroy();
    }
    super.destroy();
  }
}

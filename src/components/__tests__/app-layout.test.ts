/**
 * XIV Dye Tools - AppLayout Component Tests
 *
 * Tests for the AppLayout component
 * Covers layout structure, header, footer, content management, and child components
 */

import { vi } from 'vitest';
import { AppLayout } from '../app-layout';
import { ThemeService, LanguageService } from '@services/index';
import {
  createTestContainer,
  cleanupTestContainer,
  cleanupComponent,
  expectElement,
} from './test-utils';

// ============================================================================
// Tests
// ============================================================================

describe('AppLayout', () => {
  let container: HTMLElement;
  let component: AppLayout;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    if (component) {
      cleanupComponent(component, container);
    } else {
      cleanupTestContainer(container);
    }
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('should render main app container with correct classes', () => {
      component = new AppLayout(container);
      component.init();

      const app = component['element'];
      expect(app).not.toBeNull();
      expectElement.toHaveClass(app, 'flex');
      expectElement.toHaveClass(app, 'flex-col');
      expectElement.toHaveClass(app, 'min-h-screen');
    });

    it('should render header element', () => {
      component = new AppLayout(container);
      component.init();

      const header = container.querySelector('header');
      expect(header).not.toBeNull();
    });

    it('should render sticky header', () => {
      component = new AppLayout(container);
      component.init();

      const header = container.querySelector('header') as HTMLElement;
      expectElement.toHaveClass(header, 'sticky');
      expectElement.toHaveClass(header, 'top-0');
      expectElement.toHaveClass(header, 'z-30');
    });

    it('should render main content area', () => {
      component = new AppLayout(container);
      component.init();

      const main = container.querySelector('main');
      expect(main).not.toBeNull();
      expectElement.toHaveClass(main, 'flex-1');
    });

    it('should render footer element', () => {
      component = new AppLayout(container);
      component.init();

      const footer = container.querySelector('footer');
      expect(footer).not.toBeNull();
    });
  });

  // ==========================================================================
  // Header Tests
  // ==========================================================================

  describe('Header', () => {
    it('should render logo image with responsive picture element', () => {
      component = new AppLayout(container);
      component.init();

      const picture = container.querySelector('picture');
      expect(picture).not.toBeNull();

      const logo = container.querySelector('img[alt="XIV Dye Tools Logo"]') as HTMLImageElement;
      expect(logo).not.toBeNull();
      expect(logo.src).toContain('assets/icons/icon-192x192.png');
      expect(logo.getAttribute('title')).toBe('XIV Dye Tools');
      expect(logo.getAttribute('fetchpriority')).toBe('high');

      const sources = picture?.querySelectorAll('source');
      expect(sources?.length).toBe(3); // mobile, tablet, default
    });

    it('should render title', () => {
      component = new AppLayout(container);
      component.init();

      const title = container.querySelector('h1');
      expect(title).not.toBeNull();
      expect(title?.textContent).toBe('XIV Dye Tools');
    });

    it('should render version', () => {
      component = new AppLayout(container);
      component.init();

      const version = container.querySelector('.font-mono');
      expect(version).not.toBeNull();
      // Version format: vX.Y.Z
      expect(version?.textContent).toMatch(/^v\d+\.\d+\.\d+$/);
    });

    it('should render tools dropdown container', () => {
      component = new AppLayout(container);
      component.init();

      const toolsContainer = container.querySelector('#tools-dropdown-container');
      expect(toolsContainer).not.toBeNull();
    });

    it('should render theme switcher container', () => {
      component = new AppLayout(container);
      component.init();

      const themeContainer = container.querySelector('#theme-switcher-container');
      expect(themeContainer).not.toBeNull();
    });

    it('should render tools dropdown and theme switcher in right container', () => {
      component = new AppLayout(container);
      component.init();

      const toolsContainer = container.querySelector('#tools-dropdown-container');
      const themeContainer = container.querySelector('#theme-switcher-container');

      // Both should be siblings in the right container
      expect(toolsContainer?.parentElement).toBe(themeContainer?.parentElement);
    });
  });

  // ==========================================================================
  // Footer Tests
  // ==========================================================================

  describe('Footer', () => {
    it('should render copyright info', () => {
      component = new AppLayout(container);
      component.init();

      const footer = container.querySelector('footer');
      // Check for localized app title and version
      expect(footer?.textContent).toContain('XIV Dye Tools');
      expect(footer?.textContent).toContain('v0.0.0'); // APP_VERSION defaults to '0.0.0' in test environment
      expect(footer?.textContent).toContain('Built with TypeScript, Vite, and Tailwind CSS');
    });

    it('should render build tools info', () => {
      component = new AppLayout(container);
      component.init();

      const footer = container.querySelector('footer');
      expect(footer?.textContent).toContain('Built with TypeScript, Vite, and Tailwind CSS');
    });

    it('should render social links', () => {
      component = new AppLayout(container);
      component.init();

      const footer = container.querySelector('footer') as HTMLElement;
      const socialLinks = footer.querySelectorAll('a[target="_blank"]');

      // Should have 6 social links
      expect(socialLinks.length).toBeGreaterThanOrEqual(6);
    });

    it('should render GitHub link', () => {
      component = new AppLayout(container);
      component.init();

      const githubLink = container.querySelector('a[href*="github.com"]') as HTMLAnchorElement;
      expect(githubLink).not.toBeNull();
      expect(githubLink.getAttribute('target')).toBe('_blank');
      expect(githubLink.getAttribute('rel')).toBe('noopener noreferrer');
      expect(githubLink.textContent).toContain('GitHub');
    });

    it('should render X/Twitter link', () => {
      component = new AppLayout(container);
      component.init();

      const twitterLink = container.querySelector('a[href*="x.com"]') as HTMLAnchorElement;
      expect(twitterLink).not.toBeNull();
      expect(twitterLink.textContent).toContain('X/Twitter');
    });

    it('should render Twitch link', () => {
      component = new AppLayout(container);
      component.init();

      const twitchLink = container.querySelector('a[href*="twitch.tv"]') as HTMLAnchorElement;
      expect(twitchLink).not.toBeNull();
      expect(twitchLink.textContent).toContain('Twitch');
    });

    it('should render BlueSky link', () => {
      component = new AppLayout(container);
      component.init();

      const blueskyLink = container.querySelector('a[href*="bsky.app"]') as HTMLAnchorElement;
      expect(blueskyLink).not.toBeNull();
      expect(blueskyLink.textContent).toContain('BlueSky');
    });

    it('should render Discord link', () => {
      component = new AppLayout(container);
      component.init();

      const discordLink = container.querySelector('a[href*="discord.gg"]') as HTMLAnchorElement;
      expect(discordLink).not.toBeNull();
      expect(discordLink.textContent).toContain('Discord');
    });

    it('should render Patreon link', () => {
      component = new AppLayout(container);
      component.init();

      const patreonLink = container.querySelector('a[href*="patreon.com"]') as HTMLAnchorElement;
      expect(patreonLink).not.toBeNull();
      expect(patreonLink.textContent).toContain('Patreon');
    });

    it('should render all social links with noopener noreferrer', () => {
      component = new AppLayout(container);
      component.init();

      const socialLinks = container.querySelectorAll('footer a[target="_blank"]');
      socialLinks.forEach((link) => {
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });

    it('should render creator info', () => {
      component = new AppLayout(container);
      component.init();

      const footer = container.querySelector('footer');
      expect(footer?.textContent).toContain('Created by Flash Galatine');
      expect(footer?.textContent).toContain('Balmung');
    });

    it('should render FFXIV copyright disclaimer', () => {
      component = new AppLayout(container);
      component.init();

      const footer = container.querySelector('footer');
      expect(footer?.textContent).toContain('FINAL FANTASY XIV');
      expect(footer?.textContent).toContain('SQUARE ENIX');
      expect(footer?.textContent).toContain('not affiliated with or endorsed by Square Enix');
    });
  });

  // ==========================================================================
  // Content Management Tests
  // ==========================================================================

  describe('Content Management', () => {
    it('should get content container', () => {
      component = new AppLayout(container);
      component.init();

      const contentContainer = component.getContentContainer();
      expect(contentContainer).not.toBeNull();
      expect(contentContainer?.tagName).toBe('MAIN');
    });

    it('should set content with HTMLElement', () => {
      component = new AppLayout(container);
      component.init();

      const testElement = document.createElement('div');
      testElement.id = 'test-content';
      testElement.textContent = 'Test Content';

      component.setContent(testElement);

      const contentContainer = component.getContentContainer();
      const addedElement = contentContainer?.querySelector('#test-content');
      expect(addedElement).not.toBeNull();
      expect(addedElement?.textContent).toBe('Test Content');
    });

    it('should set content with string', () => {
      component = new AppLayout(container);
      component.init();

      component.setContent('Hello World');

      const contentContainer = component.getContentContainer();
      expect(contentContainer?.textContent).toBe('Hello World');
    });

    it('should clear previous content when setting new content', () => {
      component = new AppLayout(container);
      component.init();

      // Set first content
      component.setContent('First Content');

      // Set second content
      component.setContent('Second Content');

      const contentContainer = component.getContentContainer();
      expect(contentContainer?.textContent).toBe('Second Content');
      expect(contentContainer?.textContent).not.toContain('First Content');
    });

    it('should handle setting content multiple times', () => {
      component = new AppLayout(container);
      component.init();

      component.setContent('Content 1');
      component.setContent('Content 2');
      component.setContent('Content 3');

      const contentContainer = component.getContentContainer();
      expect(contentContainer?.textContent).toBe('Content 3');
    });

    it('should handle setting empty string content', () => {
      component = new AppLayout(container);
      component.init();

      component.setContent('Initial Content');
      component.setContent('');

      const contentContainer = component.getContentContainer();
      expect(contentContainer?.textContent).toBe('');
    });

    it('should handle setting content with complex HTML element', () => {
      component = new AppLayout(container);
      component.init();

      const complexElement = document.createElement('div');
      complexElement.innerHTML = '<h2>Title</h2><p>Paragraph</p><button>Click Me</button>';

      component.setContent(complexElement);

      const contentContainer = component.getContentContainer();
      expect(contentContainer?.querySelector('h2')).not.toBeNull();
      expect(contentContainer?.querySelector('p')).not.toBeNull();
      expect(contentContainer?.querySelector('button')).not.toBeNull();
    });
  });

  // ==========================================================================
  // Child Component Management Tests
  // ==========================================================================

  describe('Child Component Management', () => {
    it('should initialize theme switcher in onMount', () => {
      component = new AppLayout(container);
      component.init();

      // ThemeSwitcher should be initialized
      expect(component['themeSwitcher']).not.toBeNull();
    });

    it('should render theme switcher component', () => {
      component = new AppLayout(container);
      component.init();

      // ThemeSwitcher renders a button with ID theme-switcher-btn
      const themeSwitcherBtn = container.querySelector('#theme-switcher-btn');
      expect(themeSwitcherBtn).not.toBeNull();
    });

    it('should destroy theme switcher when component is destroyed', () => {
      component = new AppLayout(container);
      component.init();

      const themeSwitcher = component['themeSwitcher'];
      expect(themeSwitcher).not.toBeNull();

      const destroySpy = vi.spyOn(themeSwitcher!, 'destroy');

      component.destroy();

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should handle destroy when theme switcher is null', () => {
      component = new AppLayout(container);

      // Don't call init, so themeSwitcher remains null
      expect(() => {
        component.destroy();
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // State Management Tests
  // ==========================================================================

  describe('State Management', () => {
    it('should return themeSwitcherInitialized as true after init', () => {
      component = new AppLayout(container);
      component.init();

      const state = component['getState']();

      expect(state.themeSwitcherInitialized).toBe(true);
    });

    it('should return themeSwitcherInitialized as false before init', () => {
      component = new AppLayout(container);

      const state = component['getState']();

      expect(state.themeSwitcherInitialized).toBe(false);
    });
  });

  // ==========================================================================
  // Lifecycle Tests
  // ==========================================================================

  describe('Lifecycle', () => {
    it('should initialize component correctly', () => {
      component = new AppLayout(container);
      expect(component['isInitialized']).toBe(false);

      component.init();

      expect(component['isInitialized']).toBe(true);
    });

    it('should clean up event listeners on destroy', () => {
      component.destroy();

      // After destroy, listeners should be cleared (or remain at 0 if none were added)
      expect(component['listeners'].size).toBe(0);
      // Also verify the component is marked as destroyed
      expect(component['isDestroyed']).toBe(true);
    });

    it('should update component correctly', () => {
      component = new AppLayout(container);
      component.init();

      component.setContent('Initial Content');

      // Update component
      component.update();

      // After update, elements should still exist
      const header = container.querySelector('header');
      const main = container.querySelector('main');
      const footer = container.querySelector('footer');

      expect(header).not.toBeNull();
      expect(main).not.toBeNull();
      expect(footer).not.toBeNull();
    });

    it('should preserve content after update', () => {
      component = new AppLayout(container);
      component.init();

      component.setContent('Test Content');

      // Update component
      component.update();

      // Content should be preserved (it's in private field contentContainer reference)
      const contentContainer = component.getContentContainer();
      expect(contentContainer).not.toBeNull();
    });
  });

  // ==========================================================================
  // Subscription Callbacks (Branch Coverage)
  // ==========================================================================

  describe('Subscription Callbacks', () => {
    it('should update header colors when theme changes', () => {
      component = new AppLayout(container);
      component.init();

      const title = container.querySelector('header h1') as HTMLElement;
      const version = container.querySelector('header span[data-app-version]') as HTMLElement;

      // Trigger theme change
      ThemeService.setTheme('standard-dark');

      // Verify styles were applied
      expect(title.style.color).toBe('var(--theme-text-header)');
      expect(version.style.color).toBe('var(--theme-text-header)');
      expect(version.style.opacity).toBe('0.8');
    });

    it('should update localized text when language changes', () => {
      component = new AppLayout(container);
      component.init();

      const title = container.querySelector('header h1') as HTMLElement;

      // Trigger language change
      LanguageService.setLocale('ja');

      // Verify text was updated (title should be translated)
      expect(title.textContent).toBeTruthy();
    });

    it('should handle updateHeaderColors when title element is not found', () => {
      component = new AppLayout(container);
      component.init();

      // Remove the title element
      const title = container.querySelector('header h1');
      title?.parentNode?.removeChild(title);

      // Trigger theme change - should not throw
      expect(() => {
        ThemeService.setTheme('standard-light');
      }).not.toThrow();
    });

    it('should handle updateHeaderColors when version element is not found', () => {
      component = new AppLayout(container);
      component.init();

      // Remove the version element
      const version = container.querySelector('header span[data-app-version]');
      version?.parentNode?.removeChild(version);

      // Trigger theme change - should not throw
      expect(() => {
        ThemeService.setTheme('standard-dark');
      }).not.toThrow();
    });

    it('should handle updateLocalizedText when title element is not found', () => {
      component = new AppLayout(container);
      component.init();

      // Remove the title element
      const title = container.querySelector('header h1');
      title?.parentNode?.removeChild(title);

      // Trigger language change - should not throw
      expect(() => {
        LanguageService.setLocale('de');
      }).not.toThrow();
    });

    it('should handle updateLocalizedText when footer copyright is not found', () => {
      component = new AppLayout(container);
      component.init();

      // Remove the footer copyright element
      const footerCopyright = container.querySelector('footer .text-sm');
      footerCopyright?.parentNode?.removeChild(footerCopyright);

      // Trigger language change - should not throw
      expect(() => {
        LanguageService.setLocale('fr');
      }).not.toThrow();
    });

    it('should handle updateLocalizedText when footer creator is not found', () => {
      component = new AppLayout(container);
      component.init();

      // Remove the footer creator element
      const footerCreator = container.querySelector('footer .text-xs:not(.border-t)');
      footerCreator?.parentNode?.removeChild(footerCreator);

      // Trigger language change - should not throw
      expect(() => {
        LanguageService.setLocale('ko');
      }).not.toThrow();
    });

    it('should handle updateLocalizedText when footer disclaimer is not found', () => {
      component = new AppLayout(container);
      component.init();

      // Remove the footer disclaimer element
      const footerDisclaimer = container.querySelector('footer .border-t');
      footerDisclaimer?.parentNode?.removeChild(footerDisclaimer);

      // Trigger language change - should not throw
      expect(() => {
        LanguageService.setLocale('zh');
      }).not.toThrow();
    });

    it('should handle updateLocalizedText when all footer elements are missing', () => {
      component = new AppLayout(container);
      component.init();

      // Remove all targeted footer elements
      const footerCopyright = container.querySelector('footer .text-sm');
      const footerCreator = container.querySelector('footer .text-xs:not(.border-t)');
      const footerDisclaimer = container.querySelector('footer .border-t');

      footerCopyright?.parentNode?.removeChild(footerCopyright);
      footerCreator?.parentNode?.removeChild(footerCreator);
      footerDisclaimer?.parentNode?.removeChild(footerDisclaimer);

      // Trigger language change - should not throw
      expect(() => {
        LanguageService.setLocale('en');
      }).not.toThrow();
    });

    it('should handle updateHeaderColors when both title and version are missing', () => {
      component = new AppLayout(container);
      component.init();

      // Remove both title and version
      const title = container.querySelector('header h1');
      const version = container.querySelector('header span[data-app-version]');

      title?.parentNode?.removeChild(title);
      version?.parentNode?.removeChild(version);

      // Trigger theme change - should not throw
      expect(() => {
        ThemeService.setTheme('standard-light');
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle setContent when contentContainer is null', () => {
      component = new AppLayout(container);

      // Don't call init, so contentContainer remains null
      expect(() => {
        component.setContent('Test');
      }).not.toThrow();
    });

    it('should handle getContentContainer before init', () => {
      component = new AppLayout(container);

      const contentContainer = component.getContentContainer();
      expect(contentContainer).toBeNull();
    });

    it('should handle multiple init calls gracefully', () => {
      component = new AppLayout(container);
      component.init();

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Try to init again
      component.init();

      expect(consoleSpy).toHaveBeenCalledWith('Component already initialized');
      consoleSpy.mockRestore();
    });

    it('should handle setting content with element containing script tags', () => {
      component = new AppLayout(container);
      component.init();

      const elementWithScript = document.createElement('div');
      elementWithScript.innerHTML = '<p>Content</p><script>alert("test")</script>';

      // Should not throw
      expect(() => {
        component.setContent(elementWithScript);
      }).not.toThrow();

      const contentContainer = component.getContentContainer();
      expect(contentContainer?.querySelector('p')).not.toBeNull();
    });

    it('should render all layout sections in correct order', () => {
      component = new AppLayout(container);
      component.init();

      const app = component['element'];
      const children = Array.from(app?.children || []);

      // Order should be: header, main, footer
      expect(children[0]?.tagName).toBe('HEADER');
      expect(children[1]?.tagName).toBe('MAIN');
      expect(children[2]?.tagName).toBe('FOOTER');
    });

    it('should maintain sticky header positioning through updates', () => {
      component = new AppLayout(container);
      component.init();

      component.update();

      const header = container.querySelector('header') as HTMLElement;
      expectElement.toHaveClass(header, 'sticky');
      expectElement.toHaveClass(header, 'top-0');
    });
  });
});

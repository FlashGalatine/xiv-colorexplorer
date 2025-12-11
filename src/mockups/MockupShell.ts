/**
 * XIV Dye Tools v3.0.0 - Mockup Shell Component
 *
 * Two-panel layout shell for the v3.0.0 UI mockups.
 * Desktop: Left sidebar + Right content
 * Mobile: Full-width content + Drawer trigger
 *
 * @module mockups/MockupShell
 */

import { BaseComponent } from '@components/base-component';
import { StorageService, LanguageService } from '@services/index';
import { MockupNav } from './MockupNav';
import { IconRail } from './IconRail';
import { MobileDrawer } from './MobileDrawer';

export type MockupToolId = 'harmony' | 'matcher' | 'accessibility' | 'comparison' | 'mixer' | 'presets';

export interface MockupShellOptions {
  initialTool?: MockupToolId;
  onToolChange?: (toolId: MockupToolId) => void;
}

/**
 * Main shell component for the two-panel mockup layout
 */
export class MockupShell extends BaseComponent {
  private options: MockupShellOptions;
  private isCollapsed: boolean = false;
  private isMobile: boolean = false;
  private activeToolId: MockupToolId;

  // Child components
  private mockupNav: MockupNav | null = null;
  private iconRail: IconRail | null = null;
  private mobileDrawer: MobileDrawer | null = null;

  // DOM references
  private leftPanel: HTMLElement | null = null;
  private rightPanel: HTMLElement | null = null;
  private leftPanelContent: HTMLElement | null = null;
  private rightPanelContent: HTMLElement | null = null;
  private mobileMenuBtn: HTMLElement | null = null;

  constructor(container: HTMLElement, options: MockupShellOptions = {}) {
    super(container);
    this.options = options;
    this.activeToolId = options.initialTool ?? 'harmony';

    // Load collapsed state from storage
    const storedCollapsed = StorageService.get<boolean>('mockup_sidebar_collapsed');
    this.isCollapsed = storedCollapsed ?? false;

    // Check if mobile
    this.isMobile = window.innerWidth < 768;
  }

  render(): void {
    const shell = this.createElement('div', {
      className: 'mockup-shell flex flex-col md:flex-row h-full min-h-[calc(100vh-200px)]',
      attributes: {
        style: 'background: var(--theme-background);',
      },
    });

    // Left Panel (Desktop only - hidden on mobile)
    this.leftPanel = this.createElement('aside', {
      className: 'hidden md:flex flex-shrink-0 transition-all duration-300',
      attributes: {
        style: this.isCollapsed
          ? 'width: var(--panel-collapsed-width);'
          : 'width: var(--panel-left-width);',
      },
    });

    // Navigation container (will hold MockupNav or IconRail)
    const navContainer = this.createElement('div', {
      className: 'nav-container h-full',
    });
    this.leftPanel.appendChild(navContainer);

    shell.appendChild(this.leftPanel);

    // Right Panel (Main content area)
    this.rightPanel = this.createElement('main', {
      className: 'flex-1 flex flex-col min-w-0',
      attributes: {
        style: 'background: var(--theme-background-secondary);',
      },
    });

    // Mobile header with menu button
    const mobileHeader = this.createElement('div', {
      className: 'md:hidden flex items-center gap-3 px-4 py-3 border-b',
      attributes: {
        style: 'border-color: var(--theme-border); background: var(--theme-card-background);',
      },
    });

    this.mobileMenuBtn = this.createElement('button', {
      className: 'p-2 rounded-lg transition-colors hover:brightness-90',
      attributes: {
        style: 'background: var(--theme-background-secondary); color: var(--theme-text);',
        'aria-label': 'Open configuration menu',
        type: 'button',
      },
      innerHTML: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>`,
    });

    const mobileTitle = this.createElement('h1', {
      className: 'text-lg font-semibold',
      textContent: 'v3.0.0 Layout Mockup',
      attributes: {
        style: 'color: var(--theme-text);',
      },
    });

    mobileHeader.appendChild(this.mobileMenuBtn);
    mobileHeader.appendChild(mobileTitle);
    this.rightPanel.appendChild(mobileHeader);

    // Right panel content area (two sections: tool config on left, results on right for desktop)
    const contentWrapper = this.createElement('div', {
      className: 'flex-1 flex flex-col lg:flex-row overflow-hidden',
    });

    // Left content area (tool-specific config) - visible on desktop when sidebar shows nav
    this.leftPanelContent = this.createElement('div', {
      className: 'lg:w-80 xl:w-96 flex-shrink-0 border-r overflow-y-auto',
      attributes: {
        style: 'border-color: var(--theme-border); background: var(--theme-card-background);',
        'data-panel': 'left-config',
      },
    });

    // Right content area (results/visualizations)
    this.rightPanelContent = this.createElement('div', {
      className: 'flex-1 overflow-y-auto p-4 lg:p-6',
      attributes: {
        style: 'background: var(--theme-background-secondary);',
        'data-panel': 'right-results',
      },
    });

    contentWrapper.appendChild(this.leftPanelContent);
    contentWrapper.appendChild(this.rightPanelContent);
    this.rightPanel.appendChild(contentWrapper);

    shell.appendChild(this.rightPanel);

    this.element = shell;
    this.container.appendChild(this.element);

    // Initialize child components
    this.initializeNavigation(navContainer);
    this.initializeMobileDrawer();
  }

  private initializeNavigation(navContainer: HTMLElement): void {
    if (this.isCollapsed) {
      this.iconRail = new IconRail(navContainer, {
        activeToolId: this.activeToolId,
        onToolSelect: (toolId) => this.handleToolSelect(toolId as MockupToolId),
        onExpand: () => this.toggleCollapse(),
      });
      this.iconRail.init();
    } else {
      this.mockupNav = new MockupNav(navContainer, {
        activeToolId: this.activeToolId,
        onToolSelect: (toolId) => this.handleToolSelect(toolId as MockupToolId),
        onCollapse: () => this.toggleCollapse(),
      });
      this.mockupNav.init();
    }
  }

  private initializeMobileDrawer(): void {
    // Create drawer in a temporary container (it appends to body)
    const drawerContainer = document.createElement('div');
    this.mobileDrawer = new MobileDrawer(drawerContainer);
    this.mobileDrawer.init();
  }

  bindEvents(): void {
    // Mobile menu button
    if (this.mobileMenuBtn) {
      this.on(this.mobileMenuBtn, 'click', () => {
        this.mobileDrawer?.open();
      });
    }

    // Resize handler for responsive behavior
    this.on(window, 'resize', this.handleResize);
  }

  private handleResize = (): void => {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    // If transitioning between mobile/desktop, update layout
    if (wasMobile !== this.isMobile) {
      // Close mobile drawer when switching to desktop
      if (!this.isMobile && this.mobileDrawer?.getIsOpen()) {
        this.mobileDrawer.close();
      }
    }
  };

  private handleToolSelect(toolId: MockupToolId): void {
    this.activeToolId = toolId;

    // Update nav/rail active state
    this.mockupNav?.setActiveToolId(toolId);
    this.iconRail?.setActiveToolId(toolId);

    // Close mobile drawer after selection
    if (this.isMobile) {
      this.mobileDrawer?.close();
    }

    // Notify parent
    this.options.onToolChange?.(toolId);

    // Emit event for tool change
    this.emit('tool-change', { toolId });
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;

    // Persist state
    StorageService.set('mockup_sidebar_collapsed', this.isCollapsed);

    // Update left panel width
    if (this.leftPanel) {
      this.leftPanel.style.width = this.isCollapsed
        ? 'var(--panel-collapsed-width)'
        : 'var(--panel-left-width)';
    }

    // Swap navigation components
    const navContainer = this.leftPanel?.querySelector('.nav-container');
    if (navContainer) {
      // Destroy current nav
      this.mockupNav?.destroy();
      this.iconRail?.destroy();
      this.mockupNav = null;
      this.iconRail = null;

      // Clear container
      navContainer.innerHTML = '';

      // Create new nav
      if (this.isCollapsed) {
        this.iconRail = new IconRail(navContainer as HTMLElement, {
          activeToolId: this.activeToolId,
          onToolSelect: (toolId) => this.handleToolSelect(toolId as MockupToolId),
          onExpand: () => this.toggleCollapse(),
        });
        this.iconRail.init();
      } else {
        this.mockupNav = new MockupNav(navContainer as HTMLElement, {
          activeToolId: this.activeToolId,
          onToolSelect: (toolId) => this.handleToolSelect(toolId as MockupToolId),
          onCollapse: () => this.toggleCollapse(),
        });
        this.mockupNav.init();
      }
    }
  }

  /**
   * Get the left panel content container (for tool-specific config)
   */
  getLeftPanelContent(): HTMLElement | null {
    return this.leftPanelContent;
  }

  /**
   * Get the right panel content container (for results/visualizations)
   */
  getRightPanelContent(): HTMLElement | null {
    return this.rightPanelContent;
  }

  /**
   * Get the mobile drawer content container
   */
  getMobileDrawerContent(): HTMLElement | null {
    return this.mobileDrawer?.getContentContainer() ?? null;
  }

  /**
   * Get current active tool ID
   */
  getActiveToolId(): MockupToolId {
    return this.activeToolId;
  }

  /**
   * Set active tool programmatically
   */
  setActiveToolId(toolId: MockupToolId): void {
    this.handleToolSelect(toolId);
  }

  /**
   * Check if sidebar is collapsed
   */
  getIsCollapsed(): boolean {
    return this.isCollapsed;
  }

  /**
   * Check if currently in mobile view
   */
  getIsMobile(): boolean {
    return this.isMobile;
  }

  onMount(): void {
    // Subscribe to language changes
    LanguageService.subscribe(() => {
      this.mockupNav?.updateTools();
    });
  }

  destroy(): void {
    this.mockupNav?.destroy();
    this.iconRail?.destroy();
    this.mobileDrawer?.destroy();
    super.destroy();
  }
}

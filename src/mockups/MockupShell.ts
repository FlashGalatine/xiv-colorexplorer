/**
 * XIV Dye Tools v3.0.0 - Mockup Shell Component
 *
 * Two-panel layout shell for the v3.0.0 UI mockups.
 * Desktop (≥768px): Left sidebar (nav + config) | Right content (results)
 * Mobile (<768px): Full-width content + Drawer trigger
 *
 * @module mockups/MockupShell
 */

import { BaseComponent } from '@components/base-component';
import { StorageService, LanguageService } from '@services/index';
import { MobileDrawer } from './MobileDrawer';
import { getLocalizedMockupTools } from './MockupNav';

export type MockupToolId = 'harmony' | 'matcher' | 'accessibility' | 'comparison' | 'mixer' | 'presets';

// Tool icons for the navigation
const TOOL_ICONS: Record<MockupToolId, string> = {
  harmony: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a10 10 0 0 1 0 20"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>`,
  matcher: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M3 12h6m6 0h6"/>
  </svg>`,
  accessibility: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="12" cy="12" r="1"/>
  </svg>`,
  comparison: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>`,
  mixer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16v16H4z"/>
    <path d="M4 12h16"/>
    <circle cx="8" cy="8" r="2"/>
    <circle cx="16" cy="16" r="2"/>
  </svg>`,
  presets: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"/>
    <path d="M9 9h6v6H9z"/>
  </svg>`,
};

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
  private mobileDrawer: MobileDrawer | null = null;

  // DOM references
  private leftPanel: HTMLElement | null = null;
  private rightPanel: HTMLElement | null = null;
  private leftPanelContent: HTMLElement | null = null;
  private rightPanelContent: HTMLElement | null = null;
  private toolNavContainer: HTMLElement | null = null;
  private mobileMenuBtn: HTMLElement | null = null;
  private collapseBtn: HTMLElement | null = null;

  constructor(container: HTMLElement, options: MockupShellOptions = {}) {
    super(container);
    this.options = options;
    this.activeToolId = options.initialTool ?? 'harmony';

    // Load collapsed state from storage
    const storedCollapsed = StorageService.getItem<boolean>('mockup_sidebar_collapsed');
    this.isCollapsed = storedCollapsed ?? false;

    // Check if mobile
    this.isMobile = window.innerWidth < 768;
  }

  render(): void {
    const shell = this.createElement('div', {
      className: 'mockup-shell flex flex-col md:flex-row min-h-[600px]',
      attributes: {
        style: 'background: var(--theme-background);',
      },
    });

    // ========================
    // LEFT PANEL (Desktop sidebar)
    // ========================
    this.leftPanel = this.createElement('aside', {
      className: 'hidden md:flex flex-col flex-shrink-0 border-r transition-all duration-300',
      attributes: {
        style: `
          width: ${this.isCollapsed ? 'var(--panel-collapsed-width)' : 'var(--panel-left-width)'};
          border-color: var(--theme-border);
          background: var(--theme-card-background);
        `.replace(/\s+/g, ' '),
      },
    });

    // Tool navigation (icons + labels or just icons when collapsed)
    this.toolNavContainer = this.createElement('nav', {
      className: 'flex-shrink-0 border-b',
      attributes: {
        style: 'border-color: var(--theme-border);',
        'aria-label': 'Tool navigation',
      },
    });
    this.renderToolNav();
    this.leftPanel.appendChild(this.toolNavContainer);

    // Left panel content area (tool-specific config)
    this.leftPanelContent = this.createElement('div', {
      className: 'flex-1 overflow-y-auto',
      attributes: {
        'data-panel': 'left-config',
        style: this.isCollapsed ? 'display: none;' : '',
      },
    });
    this.leftPanel.appendChild(this.leftPanelContent);

    // Collapse toggle button at bottom
    const collapseContainer = this.createElement('div', {
      className: 'flex-shrink-0 border-t p-2',
      attributes: { style: 'border-color: var(--theme-border);' },
    });
    this.collapseBtn = this.createElement('button', {
      className: 'w-full flex items-center justify-center gap-2 p-2 rounded-lg transition-colors hover:brightness-90',
      attributes: {
        style: 'background: var(--theme-background-secondary); color: var(--theme-text);',
        'aria-label': this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
        type: 'button',
      },
    });
    this.updateCollapseButton();
    collapseContainer.appendChild(this.collapseBtn);
    this.leftPanel.appendChild(collapseContainer);

    shell.appendChild(this.leftPanel);

    // ========================
    // RIGHT PANEL (Main content)
    // ========================
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

    // Active tool display in mobile header
    const mobileToolDisplay = this.createElement('div', {
      className: 'flex items-center gap-2 flex-1',
    });
    const tools = getLocalizedMockupTools();
    const activeTool = tools.find(t => t.id === this.activeToolId);
    mobileToolDisplay.innerHTML = `
      <span class="w-5 h-5" style="color: var(--theme-primary);">${TOOL_ICONS[this.activeToolId]}</span>
      <span class="font-medium" style="color: var(--theme-text);">${activeTool?.name ?? this.activeToolId}</span>
    `;

    mobileHeader.appendChild(this.mobileMenuBtn);
    mobileHeader.appendChild(mobileToolDisplay);
    this.rightPanel.appendChild(mobileHeader);

    // Right panel content area (results/visualizations)
    this.rightPanelContent = this.createElement('div', {
      className: 'flex-1 overflow-y-auto p-4 md:p-6',
      attributes: {
        'data-panel': 'right-results',
      },
    });
    this.rightPanel.appendChild(this.rightPanelContent);

    shell.appendChild(this.rightPanel);

    this.element = shell;
    this.container.appendChild(this.element);

    // Initialize mobile drawer
    this.initializeMobileDrawer();
  }

  private renderToolNav(): void {
    if (!this.toolNavContainer) return;

    const tools = getLocalizedMockupTools();

    if (this.isCollapsed) {
      // Icon-only mode
      this.toolNavContainer.className = 'flex-shrink-0 border-b flex flex-col items-center py-2 gap-1';
      this.toolNavContainer.innerHTML = '';

      tools.forEach(tool => {
        const isActive = this.activeToolId === tool.id;
        const btn = this.createElement('button', {
          className: 'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
          attributes: {
            style: isActive
              ? 'background: var(--theme-primary); color: var(--theme-text-header);'
              : 'background: transparent; color: var(--theme-text);',
            'aria-label': tool.name,
            ...(isActive && { 'aria-current': 'page' }),
            title: tool.name,
            type: 'button',
          },
          innerHTML: `<span class="w-5 h-5">${TOOL_ICONS[tool.id as MockupToolId]}</span>`,
        });

        btn.addEventListener('click', () => this.handleToolSelect(tool.id as MockupToolId));
        this.toolNavContainer!.appendChild(btn);
      });
    } else {
      // Full mode with icons + labels
      this.toolNavContainer.className = 'flex-shrink-0 border-b p-2 space-y-1';
      this.toolNavContainer.innerHTML = '';

      tools.forEach(tool => {
        const isActive = this.activeToolId === tool.id;
        const btn = this.createElement('button', {
          className: 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm',
          attributes: {
            style: isActive
              ? 'background: var(--theme-primary); color: var(--theme-text-header);'
              : 'background: transparent; color: var(--theme-text);',
            ...(isActive && { 'aria-current': 'page' }),
            type: 'button',
          },
        });

        const icon = this.createElement('span', {
          className: 'w-5 h-5 flex-shrink-0',
          innerHTML: TOOL_ICONS[tool.id as MockupToolId],
        });
        const name = this.createElement('span', {
          className: 'truncate',
          textContent: tool.name,
        });

        btn.appendChild(icon);
        btn.appendChild(name);
        btn.addEventListener('click', () => this.handleToolSelect(tool.id as MockupToolId));
        this.toolNavContainer!.appendChild(btn);
      });
    }
  }

  private updateCollapseButton(): void {
    if (!this.collapseBtn) return;

    const chevronLeft = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
    </svg>`;
    const chevronRight = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>`;

    if (this.isCollapsed) {
      this.collapseBtn.innerHTML = chevronRight;
      this.collapseBtn.setAttribute('aria-label', 'Expand sidebar');
    } else {
      this.collapseBtn.innerHTML = `${chevronLeft}<span class="text-sm">Collapse</span>`;
      this.collapseBtn.setAttribute('aria-label', 'Collapse sidebar');
    }
  }

  private initializeMobileDrawer(): void {
    const drawerContainer = document.createElement('div');
    this.mobileDrawer = new MobileDrawer(drawerContainer);
    this.mobileDrawer.init();

    // Add tool navigation to drawer content
    this.updateMobileDrawerNav();
  }

  private updateMobileDrawerNav(): void {
    const drawerContent = this.mobileDrawer?.getContentContainer();
    if (!drawerContent) return;

    // Create navigation section at top of drawer
    const navSection = document.createElement('div');
    navSection.className = 'p-3 border-b';
    navSection.setAttribute('style', 'border-color: var(--theme-border);');

    const tools = getLocalizedMockupTools();
    tools.forEach(tool => {
      const isActive = this.activeToolId === tool.id;
      const btn = document.createElement('button');
      btn.className = 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm mb-1';
      btn.setAttribute('style', isActive
        ? 'background: var(--theme-primary); color: var(--theme-text-header);'
        : 'background: transparent; color: var(--theme-text);');
      btn.innerHTML = `
        <span class="w-5 h-5 flex-shrink-0">${TOOL_ICONS[tool.id as MockupToolId]}</span>
        <span class="truncate">${tool.name}</span>
      `;
      btn.addEventListener('click', () => {
        this.handleToolSelect(tool.id as MockupToolId);
        this.mobileDrawer?.close();
      });
      navSection.appendChild(btn);
    });

    // Insert nav at the beginning of drawer content
    const existingNav = drawerContent.querySelector('[data-drawer-nav]');
    if (existingNav) {
      existingNav.replaceWith(navSection);
    } else {
      navSection.setAttribute('data-drawer-nav', '');
      drawerContent.insertBefore(navSection, drawerContent.firstChild);
    }
  }

  bindEvents(): void {
    // Mobile menu button
    if (this.mobileMenuBtn) {
      this.on(this.mobileMenuBtn, 'click', () => {
        this.mobileDrawer?.open();
      });
    }

    // Collapse button
    if (this.collapseBtn) {
      this.on(this.collapseBtn, 'click', () => {
        this.toggleCollapse();
      });
    }

    // Resize handler
    this.on(window, 'resize', this.handleResize);
  }

  private handleResize = (): void => {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    if (wasMobile !== this.isMobile) {
      if (!this.isMobile && this.mobileDrawer?.getIsOpen()) {
        this.mobileDrawer.close();
      }
    }
  };

  private handleToolSelect(toolId: MockupToolId): void {
    this.activeToolId = toolId;

    // Update navigation
    this.renderToolNav();
    this.updateMobileDrawerNav();

    // Update mobile header
    const mobileToolDisplay = this.rightPanel?.querySelector('.md\\:hidden .flex-1');
    if (mobileToolDisplay) {
      const tools = getLocalizedMockupTools();
      const activeTool = tools.find(t => t.id === toolId);
      mobileToolDisplay.innerHTML = `
        <span class="w-5 h-5" style="color: var(--theme-primary);">${TOOL_ICONS[toolId]}</span>
        <span class="font-medium" style="color: var(--theme-text);">${activeTool?.name ?? toolId}</span>
      `;
    }

    // Notify parent
    this.options.onToolChange?.(toolId);

    // Emit event
    this.emit('tool-change', { toolId });
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;

    // Persist state
    StorageService.setItem('mockup_sidebar_collapsed', this.isCollapsed);

    // Update left panel width
    if (this.leftPanel) {
      this.leftPanel.style.width = this.isCollapsed
        ? 'var(--panel-collapsed-width)'
        : 'var(--panel-left-width)';
    }

    // Toggle config content visibility
    if (this.leftPanelContent) {
      this.leftPanelContent.style.display = this.isCollapsed ? 'none' : '';
    }

    // Update navigation
    this.renderToolNav();
    this.updateCollapseButton();
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
    LanguageService.subscribe(() => {
      this.renderToolNav();
      this.updateMobileDrawerNav();
    });
  }

  destroy(): void {
    this.mobileDrawer?.destroy();
    super.destroy();
  }
}

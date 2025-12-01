/**
 * XIV Dye Tools v2.0.0 - Main Application Entry Point
 *
 * Phase 12: Architecture Refactor
 * Transforms from monolithic vanilla HTML/JS to modern TypeScript + Vite application
 *
 * @module main
 */

// Import global styles
import '@/styles/themes.css';
import '@/styles/tailwind.css';

// Import services
import { initializeServices, getServicesStatus, LanguageService } from '@services/index';
import { ErrorHandler } from '@shared/error-handler';
import { APP_VERSION } from '@shared/constants';
import { logger } from '@shared/logger';

// Import components (non-tool components only - tools are lazy-loaded)
import {
  AppLayout,
  BaseComponent,
  MobileBottomNav,
  type MobileToolDef,
  ToolsDropdown,
  type ToolDef,
  showWelcomeIfFirstVisit,
  showChangelogIfUpdated,
} from '@components/index';

// Import inline SVG icons for theme color inheritance
import {
  ICON_TOOL_HARMONY,
  ICON_TOOL_MATCHER,
  ICON_TOOL_ACCESSIBILITY,
  ICON_TOOL_COMPARISON,
  ICON_TOOL_MIXER,
} from '@shared/tool-icons';

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  // Declare variables that will be used in the app
  let mobileNav: MobileBottomNav | null = null;
  let toolsDropdownInstance: ToolsDropdown | null = null;

  try {
    // Log startup info
    logger.info(`🚀 XIV Dye Tools v${APP_VERSION}`);
    logger.info('📋 Phase 12: Architecture Refactor');
    logger.info('🏗️ Build System: Vite 5.x + TypeScript 5.x');

    // Get or create app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container (#app) not found in HTML');
    }

    // Initialize all services
    logger.info('🔧 Initializing services...');
    await initializeServices();

    // Initialize language service (must be done before rendering components)
    logger.info('🌐 Initializing language service...');
    await LanguageService.initialize();

    // Log service status
    const status = await getServicesStatus();
    logger.info({
      'Theme Service': status.theme.current,
      'Storage Service': status.storage.available ? 'Available' : 'Unavailable',
      'API Service': status.api.available ? `Available (${status.api.latency}ms)` : 'Unavailable',
    });

    // Initialize application layout
    logger.info('🎨 Initializing app layout...');
    const appLayout = new AppLayout(appContainer);
    appLayout.init();

    // Get content container and initialize tools
    const contentContainer = appLayout.getContentContainer();
    if (!contentContainer) {
      throw new Error('Content container not found');
    }

    // Initialize tools dropdown in header (desktop navigation)
    const toolsDropdownContainer = document.getElementById('tools-dropdown-container');
    if (!toolsDropdownContainer) {
      throw new Error('Tools dropdown container not found');
    }

    // Define available tools with lazy-loaded components
    interface ToolDefinition {
      id: string;
      name: string;
      shortName: string; // For mobile navigation display
      icon: string;
      description: string;
      loadComponent: () => Promise<new (container: HTMLElement) => BaseComponent>;
    }

    // Helper function to get localized tool definitions
    // Uses inline SVG icons for theme color inheritance
    const getLocalizedTools = (): ToolDefinition[] => [
      {
        id: 'harmony',
        name: LanguageService.t('tools.harmony.title'),
        shortName: LanguageService.t('tools.harmony.shortName'),
        icon: ICON_TOOL_HARMONY,
        description: LanguageService.t('tools.harmony.description'),
        loadComponent: async () => {
          const { HarmonyGeneratorTool } = await import('@components/harmony-generator-tool');
          return HarmonyGeneratorTool;
        },
      },
      {
        id: 'matcher',
        name: LanguageService.t('tools.matcher.title'),
        shortName: LanguageService.t('tools.matcher.shortName'),
        icon: ICON_TOOL_MATCHER,
        description: LanguageService.t('tools.matcher.description'),
        loadComponent: async () => {
          const { ColorMatcherTool } = await import('@components/color-matcher-tool');
          return ColorMatcherTool;
        },
      },
      {
        id: 'accessibility',
        name: LanguageService.t('tools.accessibility.title'),
        shortName: LanguageService.t('tools.accessibility.shortName'),
        icon: ICON_TOOL_ACCESSIBILITY,
        description: LanguageService.t('tools.accessibility.description'),
        loadComponent: async () => {
          const { AccessibilityCheckerTool } = await import(
            '@components/accessibility-checker-tool'
          );
          return AccessibilityCheckerTool;
        },
      },
      {
        id: 'comparison',
        name: LanguageService.t('tools.comparison.title'),
        shortName: LanguageService.t('tools.comparison.shortName'),
        icon: ICON_TOOL_COMPARISON,
        description: LanguageService.t('tools.comparison.description'),
        loadComponent: async () => {
          const { DyeComparisonTool } = await import('@components/dye-comparison-tool');
          return DyeComparisonTool;
        },
      },
      {
        id: 'mixer',
        name: LanguageService.t('tools.mixer.title'),
        shortName: LanguageService.t('tools.mixer.shortName'),
        icon: ICON_TOOL_MIXER,
        description: LanguageService.t('tools.mixer.description'),
        loadComponent: async () => {
          const { DyeMixerTool } = await import('@components/dye-mixer-tool');
          return DyeMixerTool;
        },
      },
    ];

    let tools = getLocalizedTools();

    // Create tools dropdown for header (desktop only)
    const toolsDropdownDefs: ToolDef[] = tools.map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      description: t.description,
    }));
    toolsDropdownInstance = new ToolsDropdown(toolsDropdownContainer, toolsDropdownDefs);
    toolsDropdownInstance.init();

    // Listen for tools dropdown selection
    toolsDropdownContainer.addEventListener('tool-selected', (e: Event) => {
      const customEvent = e as CustomEvent<{ toolId: string }>;
      void loadTool(customEvent.detail.toolId);
    });

    // Create tool navigation (desktop only)
    const navContainer = document.createElement('div');
    navContainer.className = 'hidden md:block border-b border-gray-200 dark:border-gray-700 mb-6';

    const toolButtonsContainer = document.createElement('div');
    toolButtonsContainer.className = 'flex flex-wrap gap-2 pb-4 justify-center';

    let currentTool: InstanceType<typeof BaseComponent> | null = null;
    let currentToolContainer: HTMLElement | null = null;
    let currentToolId: string = 'harmony';
    let isLoadingTool = false;

    const loadTool = async (toolId: string): Promise<void> => {
      // Prevent concurrent loading
      if (isLoadingTool) {
        logger.warn(`⚠️ Tool loading in progress, ignoring request for: ${toolId}`);
        return;
      }

      // Track the current tool ID
      currentToolId = toolId;

      try {
        isLoadingTool = true;

        // Clean up current tool
        if (currentTool) {
          currentTool.destroy();
          currentTool = null;
        }

        // Clear container and show loading spinner
        if (currentToolContainer) {
          currentToolContainer.remove();
        }

        // Find tool definition
        const toolDef = tools.find((t) => t.id === toolId);
        if (!toolDef) {
          logger.error(`Tool not found: ${toolId}`);
          return;
        }

        // Create loading container
        currentToolContainer = document.createElement('div');
        currentToolContainer.innerHTML = `
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">${LanguageService.t('app.loading')}</p>
            </div>
          </div>
        `;
        contentContainer!.appendChild(currentToolContainer);

        // Dynamically import tool component
        logger.info(`📦 Loading tool: ${toolDef.name}...`);
        const ComponentClass = await toolDef.loadComponent();

        // Clear loading spinner
        currentToolContainer.innerHTML = '';

        // Create tool instance
        currentTool = new ComponentClass(currentToolContainer);
        currentTool.init();

        // Update button styles
        document.querySelectorAll<HTMLButtonElement>('[data-tool-id]').forEach((btn) => {
          const isSelected = btn.getAttribute('data-tool-id') === toolId;

          // Apply theme-aware styling
          if (isSelected) {
            btn.style.backgroundColor = 'var(--theme-primary)';
            btn.style.color = 'var(--theme-text-header)';
          } else {
            btn.style.backgroundColor = 'var(--theme-background-secondary)';
            btn.style.color = 'var(--theme-text)';
          }
        });

        // Update mobile nav active state if it exists
        if (mobileNav) {
          mobileNav.setActiveToolId(toolId);
        }

        logger.info(`✅ Loaded tool: ${toolDef.name}`);
      } catch (error) {
        logger.error(`❌ Failed to load tool:`, error);

        // Show error message to user
        if (currentToolContainer) {
          currentToolContainer.innerHTML = `
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="text-red-600 dark:text-red-400 text-4xl mb-4">⚠️</div>
                <p class="text-red-600 dark:text-red-400 font-medium mb-2">${LanguageService.t('app.error')}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${LanguageService.t('app.retry')}</p>
                <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  ${LanguageService.t('app.reload')}
                </button>
              </div>
            </div>
          `;
        }
      } finally {
        isLoadingTool = false;
      }
    };

    // Create tool buttons
    tools.forEach((tool) => {
      const btn = document.createElement('button');
      btn.setAttribute('data-tool-id', tool.id);
      const isActive = tool.id === 'harmony';

      // Base classes
      btn.className = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';

      // Apply theme-aware styling
      if (isActive) {
        btn.style.backgroundColor = 'var(--theme-primary)';
        btn.style.color = 'var(--theme-text-header)';
      } else {
        btn.style.backgroundColor = 'var(--theme-background-secondary)';
        btn.style.color = 'var(--theme-text)';
      }

      // Add hover effect with brightness filter
      btn.addEventListener('mouseenter', () => {
        btn.style.filter = 'brightness(0.9)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.filter = '';
      });
      btn.addEventListener('mousedown', () => {
        btn.style.filter = 'brightness(0.8)';
      });
      btn.addEventListener('mouseup', () => {
        btn.style.filter = 'brightness(0.9)';
      });

      // Use inline SVG for theme color inheritance
      btn.innerHTML = `<span class="inline-block w-5 h-5" aria-hidden="true">${tool.icon}</span> ${tool.name}`;
      btn.title = tool.description;
      btn.addEventListener('click', () => {
        void loadTool(tool.id);
      });
      toolButtonsContainer.appendChild(btn);
    });

    navContainer.appendChild(toolButtonsContainer);
    contentContainer.appendChild(navContainer);

    // Create mobile bottom navigation
    const mobileNavContainer = document.createElement('div');
    const mobileNavTools: MobileToolDef[] = tools.map((t) => ({
      id: t.id,
      name: t.shortName, // Use shortName for mobile display (single word labels)
      icon: t.icon,
      description: t.description,
    }));
    mobileNav = new MobileBottomNav(mobileNavContainer, mobileNavTools);
    mobileNav.init();
    contentContainer.appendChild(mobileNavContainer);

    // Listen for mobile nav tool selection
    mobileNavContainer.addEventListener('tool-selected', (e: Event) => {
      const customEvent = e as CustomEvent<{ toolId: string }>;
      void loadTool(customEvent.detail.toolId);
    });

    // Listen for navigateToTool events (from Harmony "Add to Comparison/Mixer" actions)
    window.addEventListener('navigateToTool', ((e: CustomEvent) => {
      const { tool, dye } = e.detail as { tool: string; dye: unknown };
      if (tool && dye) {
        // Store the pending dye in sessionStorage for the target tool to pick up
        sessionStorage.setItem('pendingDye', JSON.stringify(dye));
        void loadTool(tool);
        logger.info(`🔄 Navigating to ${tool} tool with pre-selected dye`);
      }
    }) as EventListener);

    // Add bottom padding to content on mobile to account for fixed bottom nav
    const updateContentPadding = (): void => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        contentContainer!.style.paddingBottom = '4rem'; // h-16 = 4rem
      } else {
        contentContainer!.style.paddingBottom = '0';
      }
    };

    updateContentPadding();
    window.addEventListener('resize', updateContentPadding);

    // Subscribe to language changes to update tool names
    LanguageService.subscribe(() => {
      // Update tools array with new localized strings
      tools = getLocalizedTools();

      // Update tool buttons in content area
      const toolButtons = document.querySelectorAll<HTMLButtonElement>('[data-tool-id]');
      toolButtons.forEach((btn) => {
        const toolId = btn.getAttribute('data-tool-id');
        const tool = tools.find((t) => t.id === toolId);
        if (tool) {
          // Use inline SVG for theme color inheritance
          btn.innerHTML = `<span class="inline-block w-5 h-5" aria-hidden="true">${tool.icon}</span> ${tool.name}`;
          btn.title = tool.description;
        }
      });

      // Recreate tools dropdown with new localized strings
      if (toolsDropdownInstance) {
        toolsDropdownInstance.destroy();
      }
      const newToolsDropdownDefs: ToolDef[] = tools.map((t) => ({
        id: t.id,
        name: t.name,
        icon: t.icon,
        description: t.description,
      }));
      toolsDropdownInstance = new ToolsDropdown(toolsDropdownContainer, newToolsDropdownDefs);
      toolsDropdownInstance.init();

      // Recreate mobile nav with new localized strings
      if (mobileNav) {
        mobileNav.destroy();
      }
      const newMobileNavTools: MobileToolDef[] = tools.map((t) => ({
        id: t.id,
        name: t.shortName,
        icon: t.icon,
        description: t.description,
      }));
      mobileNav = new MobileBottomNav(mobileNavContainer, newMobileNavTools);
      mobileNav.init();

      // Reload the current tool to update its localized content
      if (currentToolId) {
        void loadTool(currentToolId);
      }

      logger.info('🌐 UI updated for language change');
    });

    // Load the default tool (harmony)
    void loadTool('harmony');

    logger.info('✅ Application initialized successfully');
    logger.info('📦 Phase 12: All 5 tools integrated and ready');

    // Show welcome modal for first-time visitors, or changelog for returning users
    showWelcomeIfFirstVisit();
    showChangelogIfUpdated();
  } catch (error) {
    const appError = ErrorHandler.log(error);
    logger.error('❌ Failed to initialize application:', appError);

    // Show error to user
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
              Application Error
            </h1>
            <p class="text-red-700 dark:text-red-200 mb-4">
              Failed to initialize XIV Dye Tools
            </p>
            <p class="text-sm text-red-600 dark:text-red-300">
              ${ErrorHandler.createUserMessage(appError)}
            </p>
            <button onclick="location.reload()" class="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Reload Page
            </button>
          </div>
        </div>
      `;
    }

    throw error;
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void initializeApp();
  });
} else {
  void initializeApp();
}

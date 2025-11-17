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
import { initializeServices, getServicesStatus } from '@services/index';
import { ErrorHandler } from '@shared/error-handler';

// Import components
import {
  AppLayout,
  BaseComponent,
  HarmonyGeneratorTool,
  DyeComparisonTool,
  DyeMixerTool,
  AccessibilityCheckerTool,
  ColorMatcherTool,
  MobileBottomNav,
  type MobileToolDef,
} from '@components/index';

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  try {
    // Log startup info
    console.info('🚀 XIV Dye Tools v2.0.0');
    console.info('📋 Phase 12: Architecture Refactor');
    console.info('🏗️ Build System: Vite 5.x + TypeScript 5.x');

    // Get or create app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container (#app) not found in HTML');
    }

    // Initialize all services
    console.info('🔧 Initializing services...');
    initializeServices();

    // Log service status
    const status = await getServicesStatus();
    console.info({
      'Theme Service': status.theme.current,
      'Storage Service': status.storage.available ? 'Available' : 'Unavailable',
      'API Service': status.api.available ? `Available (${status.api.latency}ms)` : 'Unavailable',
    });

    // Initialize application layout
    console.info('🎨 Initializing app layout...');
    const appLayout = new AppLayout(appContainer);
    appLayout.init();

    // Get content container and initialize tools
    const contentContainer = appLayout.getContentContainer();
    if (!contentContainer) {
      throw new Error('Content container not found');
    }

    // Define available tools
    interface ToolDefinition {
      id: string;
      name: string;
      icon: string;
      description: string;
      component: new (container: HTMLElement) => BaseComponent;
    }

    const tools: ToolDefinition[] = [
      {
        id: 'harmony',
        name: 'Color Harmony',
        icon: '🎨',
        description: 'Generate harmonious color palettes',
        component: HarmonyGeneratorTool,
      },
      {
        id: 'matcher',
        name: 'Color Matcher',
        icon: '🎯',
        description: 'Match colors from images',
        component: ColorMatcherTool,
      },
      {
        id: 'accessibility',
        name: 'Accessibility',
        icon: '👁️',
        description: 'Simulate colorblindness',
        component: AccessibilityCheckerTool,
      },
      {
        id: 'comparison',
        name: 'Dye Comparison',
        icon: '📊',
        description: 'Compare up to 4 dyes',
        component: DyeComparisonTool,
      },
      {
        id: 'mixer',
        name: 'Dye Mixer',
        icon: '🎭',
        description: 'Find intermediate dyes',
        component: DyeMixerTool,
      },
    ];

    // Create tool navigation (desktop only)
    const navContainer = document.createElement('div');
    navContainer.className = 'hidden md:block border-b border-gray-200 dark:border-gray-700 mb-6';

    const toolButtonsContainer = document.createElement('div');
    toolButtonsContainer.className = 'flex flex-wrap gap-2 pb-4';

    let currentTool: InstanceType<typeof BaseComponent> | null = null;
    let currentToolContainer: HTMLElement | null = null;
    let mobileNav: MobileBottomNav | null = null;

    const loadTool = (toolId: string): void => {
      // Clean up current tool
      if (currentTool) {
        currentTool.destroy();
        currentTool = null;
      }

      // Clear container
      if (currentToolContainer) {
        currentToolContainer.innerHTML = '';
      }

      // Find tool definition
      const toolDef = tools.find((t) => t.id === toolId);
      if (!toolDef) {
        console.error(`Tool not found: ${toolId}`);
        return;
      }

      // Create tool instance
      currentToolContainer = document.createElement('div');
      currentTool = new toolDef.component(currentToolContainer);
      currentTool.init();
      contentContainer!.appendChild(currentToolContainer);

      // Update button styles
      document.querySelectorAll('[data-tool-id]').forEach((btn) => {
        const isSelected = btn.getAttribute('data-tool-id') === toolId;
        // Remove all style classes
        btn.classList.remove(
          'bg-blue-600',
          'text-white',
          'bg-gray-200',
          'dark:bg-gray-700',
          'text-gray-900',
          'dark:text-white',
          'hover:bg-gray-300',
          'dark:hover:bg-gray-600'
        );
        // Add appropriate classes for current state
        if (isSelected) {
          btn.classList.add('bg-blue-600', 'text-white');
        } else {
          btn.classList.add(
            'bg-gray-200',
            'dark:bg-gray-700',
            'text-gray-900',
            'dark:text-white',
            'hover:bg-gray-300',
            'dark:hover:bg-gray-600'
          );
        }
      });

      // Update mobile nav active state if it exists
      if (mobileNav) {
        mobileNav.setActiveToolId(toolId);
      }

      console.info(`📌 Loaded tool: ${toolDef.name}`);
    };

    // Create tool buttons
    tools.forEach((tool) => {
      const btn = document.createElement('button');
      btn.setAttribute('data-tool-id', tool.id);
      btn.className =
        'px-4 py-2 rounded-lg font-medium transition-colors ' +
        (tool.id === 'harmony'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600');
      btn.innerHTML = `${tool.icon} ${tool.name}`;
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
      name: t.name,
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

    // Load the default tool (harmony)
    void loadTool('harmony');

    console.info('✅ Application initialized successfully');
    console.info('📦 Phase 12: All 5 tools integrated and ready');
  } catch (error) {
    const appError = ErrorHandler.log(error);
    console.error('❌ Failed to initialize application:', appError);

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

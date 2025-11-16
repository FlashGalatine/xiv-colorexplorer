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
import { AppLayout } from '@components/index';

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
    console.table({
      'Theme Service': status.theme.current,
      'Storage Service': status.storage.available ? 'Available' : 'Unavailable',
      'API Service': status.api.available ? `Available (${status.api.latency}ms)` : 'Unavailable',
    });

    // Initialize application layout
    console.info('🎨 Initializing app layout...');
    const appLayout = new AppLayout(appContainer);
    appLayout.init();

    // Get content container and add placeholder
    const contentContainer = appLayout.getContentContainer();
    if (contentContainer) {
      const placeholder = document.createElement('div');
      placeholder.className = 'text-center py-16';
      placeholder.innerHTML = `
        <div class="space-y-4">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome to XIV Dye Tools</h2>
          <p class="text-gray-600 dark:text-gray-300">Phase 12 Architecture Refactor - Component System Ready</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Tools will be loaded in Phase 12.4</p>
        </div>
      `;
      contentContainer.appendChild(placeholder);
    }

    console.info('✅ Application initialized successfully');
    console.info('📦 Phase 12.3 components integrated • Phase 12.4 tools ready to integrate');
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

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

    // Set up basic app structure
    appContainer.innerHTML = `
      <div id="app-content" class="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <header class="bg-white dark:bg-gray-800 shadow">
          <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              XIV Dye Tools v2.0.0
            </h1>
            <div id="theme-container" class="flex gap-4"></div>
          </nav>
        </header>
        <main class="max-w-7xl mx-auto px-4 py-8">
          <div id="main-content" class="space-y-8">
            <section id="tools-section" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Tools will be loaded here in Phase 12.4 -->
              <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                Tools coming soon...
              </div>
            </section>
          </div>
        </main>
        <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div class="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>XIV Dye Tools v2.0.0 • Phase 12 Architecture Refactor</p>
            <p class="mt-2">Build System: Vite 5.x • Framework: TypeScript 5.x • Storage: localStorage</p>
          </div>
        </footer>
      </div>
    `;

    // Initialize theme system (this loads saved theme from storage)
    console.info('✅ Application initialized successfully');
    console.info('📦 Ready for Phase 12.3 components and Phase 12.4 tools');
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

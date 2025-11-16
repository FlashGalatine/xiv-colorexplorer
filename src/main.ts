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

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  try {
    console.info('🚀 XIV Dye Tools v2.0.0 - Initializing application...');
    console.info('📋 Phase 12: Architecture Refactor');
    console.info('🏗️ Build System: Vite 5.x + TypeScript 5.x');

    // Application will be initialized here during Phase 12.1-12.7
    // TODO: Implement app initialization once services are in place

    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }

    console.info('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    // Proper error handling will be implemented in Phase 12.2
    throw error;
  }
}

// Start the application
void initializeApp();

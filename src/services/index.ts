/**
 * XIV Dye Tools v2.0.0 - Services Export
 *
 * Phase 12: Architecture Refactor
 * Centralized export of all service modules
 *
 * @module services
 */

// Import service classes for internal use
import { ColorService } from './color-service';
import { DyeService } from './dye-service';
import { StorageService } from './storage-service';
import { ThemeService } from './theme-service';
import { APIService } from './api-service';

// Export service classes
export { ColorService };
export { DyeService, dyeService } from './dye-service';
export { StorageService, appStorage, NamespacedStorage } from './storage-service';
export { ThemeService };
export { APIService, apiService } from './api-service';

// Re-export commonly used types
export type { Dye, VisionType, ThemeName, PriceData } from '@shared/types';

// Re-export commonly used utilities
export { ErrorHandler, withErrorHandling, withAsyncErrorHandling } from '@shared/error-handler';

/**
 * Initialize all services
 */
export function initializeServices(): void {
  console.info('🔧 Initializing all services...');

  try {
    // Theme service auto-initializes on module load
    console.info('✅ ThemeService ready');

    // DyeService initializes on first getInstance
    console.info('✅ DyeService ready');

    // StorageService checks availability
    console.info(`✅ StorageService: ${StorageService.isAvailable() ? 'Available' : 'Not available'}`);

    // APIService initializes on first getInstance
    console.info('✅ APIService ready');

    console.info('🚀 All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Get service status
 */
export async function getServicesStatus(): Promise<{
  theme: { current: string; available: boolean };
  storage: { available: boolean; size: number };
  api: { available: boolean; latency: number };
}> {
  return {
    theme: {
      current: ThemeService.getCurrentTheme(),
      available: true,
    },
    storage: {
      available: StorageService.isAvailable(),
      size: StorageService.getItemCount(),
    },
    api: await APIService.getInstance().getAPIStatus(),
  };
}

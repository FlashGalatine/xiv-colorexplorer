/**
 * XIV Dye Tools v2.0.0 - Services Export
 *
 * Phase 12: Architecture Refactor
 * Centralized export of all service modules
 *
 * @module services
 */

// Import service classes for internal use
// ColorService now from xivdyetools-core;
import { StorageService } from './storage-service';
import { ThemeService } from './theme-service';
import { LanguageService } from './language-service';
import { APIService } from './api-service-wrapper';
import { cameraService } from './camera-service';
// APIService now from wrapper;

// Export service classes
export { ColorService } from 'xivdyetools-core';
export { DyeService, dyeService } from './dye-service-wrapper';
export { StorageService, appStorage, NamespacedStorage, SecureStorage } from './storage-service';
export { ThemeService };
export { LanguageService };
export { APIService, apiService } from './api-service-wrapper';
export { ToastService } from './toast-service';
export type { Toast, ToastType, ToastOptions } from './toast-service';
export { ModalService } from './modal-service';
export type { Modal, ModalType, ModalConfig } from './modal-service';
export { TooltipService } from './tooltip-service';
export type { TooltipConfig, TooltipPosition } from './tooltip-service';
export { AnnouncerService } from './announcer-service';
export type { AnnouncementPriority } from './announcer-service';
export { PaletteService } from './palette-service';
export type { SavedPalette, PaletteExportData } from './palette-service';
export { CameraService, cameraService } from './camera-service';
export type { CameraDevice, CaptureResult } from './camera-service';

// Re-export commonly used types
export type { Dye, VisionType, ThemeName, PriceData } from '@shared/types';

// Re-export commonly used utilities
export { ErrorHandler, withErrorHandling, withAsyncErrorHandling } from '@shared/error-handler';
import { logger } from '@shared/logger';

/**
 * Initialize all services
 */
export async function initializeServices(): Promise<void> {
  logger.info('🔧 Initializing all services...');

  try {
    // Theme service auto-initializes on module load
    logger.info('✅ ThemeService ready');

    // Initialize LanguageService (async - loads translations)
    await LanguageService.initialize();
    logger.info('✅ LanguageService ready');

    // DyeService initializes on first getInstance
    logger.info('✅ DyeService ready');

    // StorageService checks availability
    logger.info(
      `✅ StorageService: ${StorageService.isAvailable() ? 'Available' : 'Not available'}`
    );

    // APIService initializes on first getInstance
    logger.info('✅ APIService ready');

    // ToastService is static singleton, always ready
    logger.info('✅ ToastService ready');

    // ModalService is static singleton, always ready
    logger.info('✅ ModalService ready');

    // TooltipService is static singleton, always ready
    logger.info('✅ TooltipService ready');

    // Initialize CameraService (async - detects cameras)
    await cameraService.initialize();
    cameraService.startDeviceChangeListener();
    logger.info(
      `✅ CameraService: ${cameraService.hasCameraAvailable() ? 'Camera available' : 'No camera detected'}`
    );

    logger.info('🚀 All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
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

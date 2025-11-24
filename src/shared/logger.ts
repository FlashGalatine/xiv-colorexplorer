/**
 * XIV Dye Tools v2.0.4 - Centralized Logger
 *
 * Opus45: Security & Performance Audit
 * Centralized logging that only outputs in development mode
 *
 * @module shared/logger
 */

/**
 * Check if we're in development mode
 */
const isDev = (): boolean => {
  if (typeof import.meta === 'undefined') {
    return false;
  }
  // Vite-specific: import.meta.env.DEV
  const meta = import.meta as { env?: { DEV?: boolean } };
  return meta.env?.DEV === true;
};

/**
 * Centralized logger that only outputs in development mode
 * Prevents information disclosure and performance overhead in production
 */
export const logger = {
  /**
   * Log debug information (only in dev)
   */
  debug(...args: unknown[]): void {
    if (isDev()) {
      console.debug(...args);
    }
  },

  /**
   * Log informational messages (only in dev)
   */
  info(...args: unknown[]): void {
    if (isDev()) {
      console.info(...args);
    }
  },

  /**
   * Log warnings (always logged, but can be filtered in production)
   */
  warn(...args: unknown[]): void {
    if (isDev()) {
      console.warn(...args);
    }
    // In production, warnings could be sent to error tracking service
  },

  /**
   * Log errors (always logged for debugging)
   */
  error(...args: unknown[]): void {
    // Errors are always logged, even in production
    console.error(...args);
    // In production, errors should be sent to error tracking service
  },

  /**
   * Log general messages (only in dev)
   */
  log(...args: unknown[]): void {
    if (isDev()) {
      console.log(...args);
    }
  },
};


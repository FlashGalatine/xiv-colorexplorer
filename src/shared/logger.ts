/**
 * XIV Dye Tools v2.0.4 - Centralized Logger
 *
 * Opus45: Security & Performance Audit
 * Centralized logging with:
 * - Dev-mode filtering
 * - Error tracking integration (Sentry-ready)
 * - Performance monitoring
 *
 * @module shared/logger
 */

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if we're in development mode
 */
const isDev = (): boolean => {
  if (typeof import.meta === 'undefined') {
    return false;
  }
  // Vite-specific: import.meta.env.DEV
  const meta = import.meta as { env?: { DEV?: boolean; PROD?: boolean } };
  return meta.env?.DEV === true;
};

/**
 * Check if we're in production mode
 */
const isProd = (): boolean => {
  if (typeof import.meta === 'undefined') {
    return true; // Default to production for safety
  }
  const meta = import.meta as { env?: { PROD?: boolean } };
  return meta.env?.PROD === true;
};

// ============================================================================
// Error Tracking Integration (Sentry-ready)
// ============================================================================

/**
 * Sentry-like error tracking interface
 * Replace with actual Sentry SDK when installed:
 *   npm install @sentry/browser
 *   import * as Sentry from '@sentry/browser';
 */
interface ErrorTracker {
  captureException: (error: unknown, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  setTag: (key: string, value: string) => void;
  setUser: (user: { id?: string; email?: string } | null) => void;
}

/**
 * Stub error tracker (no-op until Sentry is configured)
 * To enable: Install @sentry/browser and initialize in main.ts
 */
let errorTracker: ErrorTracker | null = null;

/**
 * Initialize error tracking service (call from main.ts with Sentry instance)
 *
 * @example
 * // In main.ts:
 * import * as Sentry from '@sentry/browser';
 * Sentry.init({ dsn: 'your-dsn' });
 * initErrorTracking({
 *   captureException: Sentry.captureException,
 *   captureMessage: Sentry.captureMessage,
 *   setTag: Sentry.setTag,
 *   setUser: Sentry.setUser,
 * });
 */
export function initErrorTracking(tracker: ErrorTracker): void {
  errorTracker = tracker;
  logger.info('Error tracking initialized');
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Performance metrics storage
 */
interface PerformanceMetrics {
  [key: string]: {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    lastTime: number;
  };
}

const performanceMetrics: PerformanceMetrics = {};
const activeTimers: Map<string, number> = new Map();

/**
 * Performance monitoring utilities
 */
export const perf = {
  /**
   * Start a performance timer
   * @param label - Unique label for this timer
   */
  start(label: string): void {
    activeTimers.set(label, performance.now());
  },

  /**
   * End a performance timer and record the metric
   * @param label - Label of the timer to end
   * @returns Duration in milliseconds, or -1 if timer not found
   */
  end(label: string): number {
    const startTime = activeTimers.get(label);
    if (startTime === undefined) {
      logger.warn(`Performance timer "${label}" not found`);
      return -1;
    }

    const duration = performance.now() - startTime;
    activeTimers.delete(label);

    // Record metric
    if (!performanceMetrics[label]) {
      performanceMetrics[label] = {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        lastTime: 0,
      };
    }

    const metric = performanceMetrics[label];
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.lastTime = duration;

    if (isDev()) {
      console.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  },

  /**
   * Measure execution time of an async function
   * @param label - Label for this measurement
   * @param fn - Async function to measure
   * @returns Result of the function
   */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.end(label);
    }
  },

  /**
   * Measure execution time of a sync function
   * @param label - Label for this measurement
   * @param fn - Function to measure
   * @returns Result of the function
   */
  measureSync<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      return fn();
    } finally {
      this.end(label);
    }
  },

  /**
   * Get metrics for a specific label
   * @param label - Label to get metrics for
   */
  getMetrics(
    label: string
  ): { count: number; avgTime: number; minTime: number; maxTime: number; lastTime: number } | null {
    const metric = performanceMetrics[label];
    if (!metric) return null;

    return {
      count: metric.count,
      avgTime: metric.count > 0 ? metric.totalTime / metric.count : 0,
      minTime: metric.minTime === Infinity ? 0 : metric.minTime,
      maxTime: metric.maxTime,
      lastTime: metric.lastTime,
    };
  },

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): Record<
    string,
    { count: number; avgTime: number; minTime: number; maxTime: number; lastTime: number }
  > {
    const result: Record<
      string,
      { count: number; avgTime: number; minTime: number; maxTime: number; lastTime: number }
    > = {};

    for (const [label, metric] of Object.entries(performanceMetrics)) {
      result[label] = {
        count: metric.count,
        avgTime: metric.count > 0 ? metric.totalTime / metric.count : 0,
        minTime: metric.minTime === Infinity ? 0 : metric.minTime,
        maxTime: metric.maxTime,
        lastTime: metric.lastTime,
      };
    }

    return result;
  },

  /**
   * Log all metrics to console (dev mode only)
   */
  logMetrics(): void {
    if (!isDev()) return;

    const metrics = this.getAllMetrics();
    const entries = Object.entries(metrics);

    if (entries.length === 0) {
      console.info('📊 No performance metrics recorded');
      return;
    }

    console.group('📊 Performance Metrics');
    for (const [label, data] of entries) {
      console.info(
        `${label}: avg=${data.avgTime.toFixed(2)}ms, ` +
          `min=${data.minTime.toFixed(2)}ms, max=${data.maxTime.toFixed(2)}ms, ` +
          `count=${data.count}`
      );
    }
    console.groupEnd();
  },

  /**
   * Clear all recorded metrics
   */
  clearMetrics(): void {
    for (const key of Object.keys(performanceMetrics)) {
      delete performanceMetrics[key];
    }
    activeTimers.clear();
  },
};

// ============================================================================
// Main Logger
// ============================================================================

/**
 * Centralized logger with dev-mode filtering and error tracking
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
   * Log warnings (only in dev, but tracked in production)
   */
  warn(...args: unknown[]): void {
    if (isDev()) {
      console.warn(...args);
    }

    // Send warnings to error tracking in production
    if (isProd() && errorTracker) {
      const message = args.map((arg) => String(arg)).join(' ');
      errorTracker.captureMessage(message, 'warning');
    }
  },

  /**
   * Log errors (always logged, sent to error tracking in production)
   */
  error(...args: unknown[]): void {
    // Errors are always logged
    console.error(...args);

    // Send to error tracking in production
    if (isProd() && errorTracker) {
      const firstArg = args[0];
      if (firstArg instanceof Error) {
        errorTracker.captureException(firstArg, {
          extra: args.slice(1),
        });
      } else {
        const message = args.map((arg) => String(arg)).join(' ');
        errorTracker.captureMessage(message, 'error');
      }
    }
  },

  /**
   * Log general messages (only in dev)
   */
  log(...args: unknown[]): void {
    if (isDev()) {
      console.log(...args);
    }
  },

  /**
   * Create a group of related logs (dev only)
   */
  group(label: string): void {
    if (isDev()) {
      console.group(label);
    }
  },

  /**
   * End a log group (dev only)
   */
  groupEnd(): void {
    if (isDev()) {
      console.groupEnd();
    }
  },

  /**
   * Log a table (dev only)
   */
  table(data: unknown): void {
    if (isDev()) {
      console.table(data);
    }
  },
};

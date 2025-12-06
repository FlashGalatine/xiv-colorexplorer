/**
 * Preset Submission Service
 * Handles submitting community presets from the web app
 *
 * @module services/preset-submission-service
 */

import { logger } from '@shared/logger';
import { authService } from './auth-service';
import type { PresetCategory } from 'xivdyetools-core';
import type { CommunityPreset, PresetStatus } from './community-preset-service';

// ============================================
// Types
// ============================================

export interface PresetSubmission {
  name: string;
  description: string;
  category_id: PresetCategory;
  dyes: number[];
  tags: string[];
}

export interface SubmissionResult {
  success: boolean;
  preset?: CommunityPreset;
  duplicate?: CommunityPreset;
  vote_added?: boolean;
  moderation_status?: 'approved' | 'pending';
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface MySubmissionsResponse {
  presets: CommunityPreset[];
  total: number;
}

// ============================================
// Configuration
// ============================================

/**
 * Presets API URL
 */
const PRESETS_API_URL =
  import.meta.env.VITE_PRESETS_API_URL || 'https://presets-api.xivdyetools.workers.dev';

/**
 * Valid categories for submissions
 */
const VALID_CATEGORIES: PresetCategory[] = [
  'jobs',
  'grand-companies',
  'seasons',
  'events',
  'aesthetics',
  'community',
];

/**
 * Request timeout in milliseconds
 */
const REQUEST_TIMEOUT = 15000;

// ============================================
// Validation
// ============================================

/**
 * Validate preset submission before sending to API
 * Returns array of validation errors (empty if valid)
 */
export function validateSubmission(submission: PresetSubmission): ValidationError[] {
  const errors: ValidationError[] = [];

  // Name validation (2-50 characters)
  if (!submission.name || submission.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (submission.name.length > 50) {
    errors.push({ field: 'name', message: 'Name must be 50 characters or less' });
  }

  // Description validation (10-200 characters)
  if (!submission.description || submission.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  } else if (submission.description.length > 200) {
    errors.push({ field: 'description', message: 'Description must be 200 characters or less' });
  }

  // Category validation
  if (!submission.category_id || !VALID_CATEGORIES.includes(submission.category_id)) {
    errors.push({ field: 'category_id', message: 'Please select a valid category' });
  }

  // Dyes validation (2-5 dyes)
  if (!Array.isArray(submission.dyes) || submission.dyes.length < 2) {
    errors.push({ field: 'dyes', message: 'Must include at least 2 dyes' });
  } else if (submission.dyes.length > 5) {
    errors.push({ field: 'dyes', message: 'Maximum 5 dyes allowed' });
  } else if (!submission.dyes.every((id) => typeof id === 'number' && id > 0)) {
    errors.push({ field: 'dyes', message: 'Invalid dye selection' });
  }

  // Tags validation (0-10 tags, max 30 chars each)
  if (!Array.isArray(submission.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array' });
  } else if (submission.tags.length > 10) {
    errors.push({ field: 'tags', message: 'Maximum 10 tags allowed' });
  } else if (submission.tags.some((tag) => typeof tag !== 'string' || tag.length > 30)) {
    errors.push({ field: 'tags', message: 'Each tag must be 30 characters or less' });
  }

  return errors;
}

// ============================================
// Service
// ============================================

class PresetSubmissionServiceImpl {
  /**
   * Submit a new preset
   * Requires authentication
   */
  async submitPreset(submission: PresetSubmission): Promise<SubmissionResult> {
    if (!authService.isAuthenticated()) {
      return {
        success: false,
        error: 'You must be logged in to submit presets',
      };
    }

    // Client-side validation
    const validationErrors = validateSubmission(submission);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.map((e) => e.message).join('. '),
      };
    }

    logger.info('Submitting preset:', submission.name);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${PRESETS_API_URL}/api/v1/presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          name: submission.name.trim(),
          description: submission.description.trim(),
          category_id: submission.category_id,
          dyes: submission.dyes,
          tags: submission.tags.map((t) => t.trim()).filter(Boolean),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const result = await response.json();

      if (!response.ok) {
        logger.error('Preset submission failed:', result);
        return {
          success: false,
          error: result.message || 'Submission failed',
        };
      }

      logger.info('Preset submitted successfully:', result);

      // Handle duplicate detection
      if (result.duplicate) {
        return {
          success: true,
          duplicate: result.duplicate,
          vote_added: result.vote_added,
        };
      }

      return {
        success: true,
        preset: result.preset,
        moderation_status: result.moderation_status,
      };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.error('Preset submission timed out');
        return {
          success: false,
          error: 'Request timed out. Please try again.',
        };
      }

      logger.error('Preset submission error:', err);
      return {
        success: false,
        error: 'Failed to submit preset. Please try again.',
      };
    }
  }

  /**
   * Get user's own submissions
   * Requires authentication
   */
  async getMySubmissions(): Promise<MySubmissionsResponse> {
    if (!authService.isAuthenticated()) {
      return { presets: [], total: 0 };
    }

    logger.info('Fetching user submissions...');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${PRESETS_API_URL}/api/v1/presets/mine`, {
        headers: {
          ...authService.getAuthHeaders(),
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        logger.error('Failed to fetch user submissions:', response.status);
        return { presets: [], total: 0 };
      }

      const result = await response.json();
      logger.info(`Fetched ${result.presets?.length || 0} user submissions`);

      return {
        presets: result.presets || [],
        total: result.total || result.presets?.length || 0,
      };
    } catch (err) {
      logger.error('Error fetching user submissions:', err);
      return { presets: [], total: 0 };
    }
  }

  /**
   * Get submission status label and color
   */
  getStatusInfo(status: PresetStatus): { label: string; color: string; icon: string } {
    switch (status) {
      case 'approved':
        return { label: 'Approved', color: '#57f287', icon: '✓' };
      case 'pending':
        return { label: 'Pending Review', color: '#fee75c', icon: '⏳' };
      case 'rejected':
        return { label: 'Rejected', color: '#ed4245', icon: '✗' };
      case 'flagged':
        return { label: 'Flagged', color: '#ffa500', icon: '⚠' };
      default:
        return { label: 'Unknown', color: '#99aab5', icon: '?' };
    }
  }

  /**
   * Get remaining submissions for today
   */
  async getRemainingSubmissions(): Promise<{ remaining: number; limit: number; resetAt: Date | null }> {
    if (!authService.isAuthenticated()) {
      return { remaining: 10, limit: 10, resetAt: null };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${PRESETS_API_URL}/api/v1/presets/rate-limit`, {
        headers: {
          ...authService.getAuthHeaders(),
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        logger.warn('Failed to fetch rate limit:', response.status);
        return { remaining: 10, limit: 10, resetAt: null };
      }

      const result = await response.json();
      return {
        remaining: result.remaining,
        limit: result.limit,
        resetAt: result.reset_at ? new Date(result.reset_at) : null,
      };
    } catch (err) {
      logger.error('Error fetching rate limit:', err);
      return { remaining: 10, limit: 10, resetAt: null };
    }
  }
}

// ============================================
// Export Singleton
// ============================================

export const presetSubmissionService = new PresetSubmissionServiceImpl();
export { PresetSubmissionServiceImpl as PresetSubmissionService };

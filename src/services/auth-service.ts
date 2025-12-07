/**
 * Discord OAuth Authentication Service
 * Handles login, logout, and token management for web app authentication
 *
 * Uses PKCE (Proof Key for Code Exchange) for secure OAuth flow in SPAs
 *
 * @module services/auth-service
 */

import { logger } from '@shared/logger';

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  avatar_url: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  expiresAt: number | null;
}

export type AuthStateListener = (state: AuthState) => void;

interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  iss: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  expires_at?: number;
  error?: string;
}

// ============================================
// Configuration
// ============================================

/**
 * OAuth Worker URL - handles Discord OAuth flow
 */
const OAUTH_WORKER_URL =
  import.meta.env.VITE_OAUTH_WORKER_URL || 'https://xivdyetools-oauth.ashejunius.workers.dev';

/**
 * Presets API URL - handles preset operations
 */
const PRESETS_API_URL =
  import.meta.env.VITE_PRESETS_API_URL || 'https://xivdyetools-presets-api.ashejunius.workers.dev';

/**
 * Storage key for auth token
 */
const TOKEN_STORAGE_KEY = 'xivdyetools_auth_token';

/**
 * Storage key for token expiry
 */
const EXPIRY_STORAGE_KEY = 'xivdyetools_auth_expires';

/**
 * Session storage keys for OAuth flow
 */
const PKCE_VERIFIER_KEY = 'xivdyetools_pkce_verifier';
const OAUTH_STATE_KEY = 'xivdyetools_oauth_state';
const OAUTH_RETURN_PATH_KEY = 'xivdyetools_oauth_return_path';
const OAUTH_RETURN_TOOL_KEY = 'xivdyetools_oauth_return_tool';

// ============================================
// Auth Service
// ============================================

class AuthServiceImpl {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    expiresAt: null,
  };

  private listeners: Set<AuthStateListener> = new Set();
  private initialized = false;

  /**
   * Initialize auth service - restore session from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Use console.log directly for production debugging
    console.log('🔐 [AuthService] Initializing...', { url: window.location.href });

    try {
      this.loadFromStorage();

      // Check if we're handling an OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      console.log('🔐 [AuthService] URL params:', { hasToken: !!token, hasError: !!error });

      if (token) {
        console.log('🔐 [AuthService] Token found in URL, processing callback...');
        await this.handleCallbackToken(token, urlParams.get('expires_at'));
        // Get return path before cleaning URL, default to home
        const returnPath = urlParams.get('return_path') || sessionStorage.getItem(OAUTH_RETURN_PATH_KEY) || '/';
        console.log(`🔐 [AuthService] Navigating to return path: ${returnPath}`);
        sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
        // Clean up URL and navigate to return path
        this.navigateAfterAuth(returnPath);
      } else if (error) {
        console.error('🔐 [AuthService] OAuth error:', error);
        // Get return path before cleaning URL
        const returnPath = urlParams.get('return_path') || sessionStorage.getItem(OAUTH_RETURN_PATH_KEY) || '/';
        sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
        // Clean up URL and navigate back (even on error)
        this.navigateAfterAuth(returnPath);
      }

      this.initialized = true;
      console.log(
        `✅ [AuthService] Initialized: ${this.state.isAuthenticated ? 'Logged in as ' + this.state.user?.username : 'Not logged in'}`
      );
    } catch (err) {
      console.error('🔐 [AuthService] Failed to initialize:', err);
      this.initialized = true;
    }
  }

  /**
   * Load auth state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const expiresAtStr = localStorage.getItem(EXPIRY_STORAGE_KEY);

      console.log(`🔐 [AuthService] loadFromStorage: token=${token ? 'present' : 'missing'}, expiry=${expiresAtStr || 'missing'}`);

      if (!token || !expiresAtStr) {
        logger.info('🔐 No stored auth found, clearing state');
        this.clearState();
        return;
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Math.floor(Date.now() / 1000);

      // Check if token is expired
      if (expiresAt < now) {
        logger.info('Stored token has expired, clearing session');
        this.clearStorage();
        this.clearState();
        return;
      }

      // Decode token to get user info
      const payload = this.decodeJWT(token);
      if (!payload) {
        this.clearStorage();
        this.clearState();
        return;
      }

      this.state = {
        isAuthenticated: true,
        token,
        expiresAt,
        user: {
          id: payload.sub,
          username: payload.username,
          global_name: payload.global_name,
          avatar: payload.avatar,
          avatar_url: this.getAvatarUrl(payload.sub, payload.avatar),
        },
      };
    } catch (err) {
      logger.error('Error loading auth from storage:', err);
      this.clearStorage();
      this.clearState();
    }
  }

  /**
   * Handle token received from OAuth callback
   */
  private async handleCallbackToken(token: string, expiresAtStr: string | null): Promise<void> {
    console.log('🔐 [AuthService] handleCallbackToken: Processing token...', { tokenLength: token?.length });
    const payload = this.decodeJWT(token);
    if (!payload) {
      console.error('🔐 [AuthService] Invalid token - decode failed. Token preview:', token?.substring(0, 50) + '...');
      return;
    }
    console.log(`🔐 [AuthService] Token decoded for user: ${payload.username} (${payload.sub})`);

    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : payload.exp;

    // Store token
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(EXPIRY_STORAGE_KEY, expiresAt.toString());
    logger.info(`🔐 Token stored to localStorage, expires: ${new Date(expiresAt * 1000).toISOString()}`);

    // Update state
    this.state = {
      isAuthenticated: true,
      token,
      expiresAt,
      user: {
        id: payload.sub,
        username: payload.username,
        global_name: payload.global_name,
        avatar: payload.avatar,
        avatar_url: this.getAvatarUrl(payload.sub, payload.avatar),
      },
    };

    this.notifyListeners();
    logger.info(`Logged in as ${this.state.user?.global_name || this.state.user?.username}`);

    // Refresh author name on all user's presets (fire-and-forget)
    // This keeps preset attribution in sync with the user's current Discord display name
    this.refreshAuthorName().catch((err) => {
      logger.warn('Failed to refresh author name on presets:', err);
    });
  }

  /**
   * Refresh the author name on all presets submitted by this user
   * Called on login to sync with the user's current Discord display name
   */
  private async refreshAuthorName(): Promise<void> {
    if (!this.state.token) return;

    try {
      const response = await fetch(`${PRESETS_API_URL}/api/v1/presets/refresh-author`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.updated > 0) {
          logger.info(`Updated author name on ${result.updated} preset(s)`);
        }
      }
    } catch (err) {
      // Non-blocking - don't throw, just log
      logger.warn('Error refreshing author name:', err);
    }
  }

  /**
   * Navigate to the return path after OAuth callback
   * This handles both successful login and error cases
   */
  private navigateAfterAuth(returnPath: string): void {
    // Use replaceState to avoid adding callback URL to history
    // Then navigate to the return path
    const targetUrl = new URL(window.location.origin + returnPath);
    window.history.replaceState({}, '', targetUrl.toString());
    // Force page reload to re-render with new auth state
    // This ensures all components see the updated auth state
    window.location.reload();
  }

  /**
   * Clear auth state
   */
  private clearState(): void {
    this.state = {
      isAuthenticated: false,
      user: null,
      token: null,
      expiresAt: null,
    };
  }

  /**
   * Clear stored tokens
   */
  private clearStorage(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(EXPIRY_STORAGE_KEY);
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // Also check expiry
    if (this.state.expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      if (this.state.expiresAt < now) {
        this.logout();
        return false;
      }
    }
    return this.state.isAuthenticated;
  }

  /**
   * Get current auth state
   */
  getState(): Readonly<AuthState> {
    return { ...this.state };
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.state.user;
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    if (this.state.token && this.isAuthenticated()) {
      return { Authorization: `Bearer ${this.state.token}` };
    }
    return {};
  }

  /**
   * Initiate Discord OAuth login
   * @param returnPath - Path to return to after login
   * @param returnTool - Tool ID to return to after login (e.g., 'presets')
   */
  async login(returnPath?: string, returnTool?: string): Promise<void> {
    logger.info('Initiating Discord OAuth login...');

    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = this.generateRandomString(64);
      const codeChallenge = await this.sha256Base64Url(codeVerifier);
      const state = this.generateRandomString(32);

      // Store for callback verification
      sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
      sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, returnPath || window.location.pathname);
      // Store return tool if provided
      if (returnTool) {
        sessionStorage.setItem(OAUTH_RETURN_TOOL_KEY, returnTool);
      }

      // Build auth URL
      const authUrl = new URL(`${OAUTH_WORKER_URL}/auth/discord`);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      authUrl.searchParams.set('code_verifier', codeVerifier); // Pass verifier for worker to include in state
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
      if (returnPath) {
        authUrl.searchParams.set('return_path', returnPath);
      }

      // Redirect to OAuth
      window.location.href = authUrl.toString();
    } catch (err) {
      logger.error('Failed to initiate OAuth login:', err);
      throw err;
    }
  }

  /**
   * Logout - clear tokens and notify listeners
   */
  async logout(): Promise<void> {
    logger.info('Logging out...');

    // Try to revoke token on server (non-blocking)
    if (this.state.token) {
      try {
        await fetch(`${OAUTH_WORKER_URL}/auth/revoke`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.state.token}`,
          },
        });
      } catch {
        // Ignore revoke errors
      }
    }

    this.clearStorage();
    this.clearState();
    this.notifyListeners();

    logger.info('Logged out successfully');
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getState());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        logger.error('Auth listener error:', err);
      }
    });
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Decode JWT without verification (for reading payload)
   */
  private decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Decode payload (second part)
      const payload = parts[1];
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padding = base64.length % 4;
      if (padding) {
        base64 += '='.repeat(4 - padding);
      }

      const decoded = atob(base64);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Get Discord avatar URL
   */
  private getAvatarUrl(userId: string, avatarHash: string | null): string | null {
    if (!avatarHash) return null;
    const format = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}`;
  }

  /**
   * Generate cryptographically random string
   */
  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * SHA-256 hash and base64url encode
   */
  private async sha256Base64Url(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    const base64 = btoa(String.fromCharCode(...bytes));
    // Convert to base64url
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// ============================================
// Export Singleton
// ============================================

export const authService = new AuthServiceImpl();
export { AuthServiceImpl as AuthService };

/**
 * Get and consume the return tool ID stored during login
 * Returns the tool ID and removes it from sessionStorage
 */
export function consumeReturnTool(): string | null {
  const tool = sessionStorage.getItem(OAUTH_RETURN_TOOL_KEY);
  if (tool) {
    sessionStorage.removeItem(OAUTH_RETURN_TOOL_KEY);
  }
  return tool;
}

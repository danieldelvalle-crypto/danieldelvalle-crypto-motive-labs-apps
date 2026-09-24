/**
 * MotiveAuth - Handles authentication with Motive Dashboard via postMessage
 *
 * Authentication flow:
 * 1. App loads as a publicly accessible shell
 * 2. Motive Dashboard embeds app in iframe
 * 3. Dashboard sends JWT via postMessage: { type: 'SET_TOKEN', token: '<jwt>' }
 * 4. App validates token against Motive JWKS endpoint
 * 5. App uses token for Motive Public API calls
 *
 * Token properties:
 * - RS256 signed
 * - Audience-bound
 * - Short-lived (typically 1 hour)
 * - Scoped to fleet data for authenticated user
 *
 * Reference: Motive Labs Embedded App Authentication TDD
 */

export interface MotiveAuthToken {
  token: string;
  expiresAt: number;
}

export type AuthStatus = 'pending' | 'authenticated' | 'error' | 'demo';

export class MotiveAuth {
  private token: MotiveAuthToken | null = null;
  private listeners: Set<(status: AuthStatus, token: MotiveAuthToken | null) => void> = new Set();
  private messageListener: ((event: MessageEvent) => void) | null = null;

  constructor(
    private options: {
      jwksUrl?: string;
      expectedAudience?: string;
      demoMode?: boolean;
    } = {}
  ) {
    // Default to demo mode in development
    if (options.demoMode === undefined) {
      this.options.demoMode = import.meta.env.DEV;
    }
  }

  /**
   * Start listening for authentication messages from Motive Dashboard
   */
  start(): void {
    if (this.options.demoMode) {
      this.notifyListeners('demo', null);
      return;
    }

    this.messageListener = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageListener);
    this.notifyListeners('pending', null);

    // Signal ready to parent window
    this.signalReady();
  }

  /**
   * Signal to parent that app is ready to receive authentication
   */
  private signalReady(): void {
    if (window.parent && window.parent !== window) {
      const allowedOrigins = [
        'https://app.gomotive.com',
        'https://dashboard.gomotive.com',
        'https://dashboard.keeptruckin.com',
      ];

      // Send ready signal to each allowed parent origin
      allowedOrigins.forEach((origin) => {
        window.parent.postMessage({ type: 'ready' }, origin);
      });
    }
  }

  /**
   * Stop listening for messages and clear token
   */
  stop(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    this.token = null;
    this.notifyListeners('pending', null);
  }

  /**
   * Subscribe to authentication status changes
   */
  subscribe(callback: (status: AuthStatus, token: MotiveAuthToken | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current token (null if not authenticated)
   */
  getToken(): string | null {
    if (!this.token) return null;
    if (Date.now() >= this.token.expiresAt) {
      this.token = null;
      this.notifyListeners('error', null);
      return null;
    }
    return this.token.token;
  }

  private handleMessage(event: MessageEvent): void {
    // SECURITY: Strict origin validation required
    // Only accept messages from Motive Dashboard
    const allowedOrigins = [
      'https://app.gomotive.com',              // Motive Labs primary origin
      'https://dashboard.gomotive.com',
      'https://dashboard.keeptruckin.com',
      // Development/staging origins
      ...(import.meta.env.DEV ? ['http://localhost:3000', 'http://localhost:5173'] : [])
    ];

    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Rejected postMessage from unauthorized origin:', event.origin);
      return;
    }

    // Validate message structure
    if (!event.data || typeof event.data !== 'object') {
      return;
    }

    // Expected format: { type: 'SET_TOKEN', token: '<jwt>' }
    if (event.data.type === 'SET_TOKEN' && typeof event.data.token === 'string') {
      this.handleTokenMessage(event.data.token);
    }
  }

  private async handleTokenMessage(token: string): Promise<void> {
    try {
      // Decode and validate JWT claims
      const payload = this.decodeJWT(token);

      // Validate required claims
      if (!payload.exp) {
        throw new Error('Token missing expiration');
      }

      // Validate issuer - Motive uses auth.gomotive.com
      const expectedIssuer = 'https://auth.gomotive.com';
      if (payload.iss && payload.iss !== expectedIssuer) {
        throw new Error(`Invalid token issuer: ${payload.iss}`);
      }

      // Validate token not expired
      if (payload.exp * 1000 < Date.now()) {
        throw new Error('Token already expired');
      }

      // NOTE: Full RS256 signature validation requires JWKS endpoint
      // For production, implement JWKS-based validation per Motive Labs TDD

      this.token = {
        token,
        expiresAt: payload.exp * 1000, // Convert to milliseconds
      };

      this.notifyListeners('authenticated', this.token);
    } catch (error) {
      console.error('Token validation failed:', error);
      this.notifyListeners('error', null);
    }
  }

  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Failed to decode JWT');
    }
  }

  private notifyListeners(status: AuthStatus, token: MotiveAuthToken | null): void {
    this.listeners.forEach((listener) => listener(status, token));
  }
}

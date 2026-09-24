import { useState, useEffect } from 'react';
import { MotiveAuth, type AuthStatus, type MotiveAuthToken } from '../services/MotiveAuth';

export interface AuthState {
  status: AuthStatus;
  token: string | null;
  isDemoMode: boolean;
}

let authService: MotiveAuth | null = null;

/**
 * React hook for Motive authentication
 *
 * Manages postMessage authentication flow with Motive Dashboard:
 * - Listens for SET_TOKEN messages from parent iframe
 * - Validates and stores JWT
 * - Provides auth status and token to components
 * - Falls back to demo mode in development
 *
 * Usage:
 *   const { status, token, isDemoMode } = useMotiveAuth();
 *
 *   if (status === 'pending') return <LoadingSpinner />;
 *   if (status === 'error') return <AuthError />;
 *
 *   const adapter = isDemoMode
 *     ? new MockDataAdapter()
 *     : new MotiveDataAdapter().setAuthToken(token);
 */
export function useMotiveAuth(options: { demoMode?: boolean } = {}): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    status: 'pending',
    token: null,
    isDemoMode: options.demoMode ?? import.meta.env.DEV,
  });

  useEffect(() => {
    // Initialize auth service once
    if (!authService) {
      authService = new MotiveAuth({ demoMode: authState.isDemoMode });
    }

    // Subscribe to auth status changes
    const unsubscribe = authService.subscribe(
      (status: AuthStatus, tokenData: MotiveAuthToken | null) => {
        setAuthState({
          status,
          token: tokenData?.token || null,
          isDemoMode: status === 'demo',
        });
      }
    );

    // Start listening for messages
    authService.start();

    return () => {
      unsubscribe();
    };
  }, [authState.isDemoMode]);

  return authState;
}

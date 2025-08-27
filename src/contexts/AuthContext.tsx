'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/auth/auth.service';
import type { Profile } from '@/services/auth/auth.types';
import { useToast } from '@/components/ui/use-toast';

export class AuthErrorBoundary extends ErrorBoundary {
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h3 className="font-bold">Authentication Error</h3>
          <p className="text-sm">Something went wrong with authentication. Please try again.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type AuthOperation = 
  | 'signIn' 
  | 'signUp' 
  | 'signOut' 
  | 'signInWithOAuth' 
  | 'sendPasswordResetEmail' 
  | 'updatePassword'
  | 'refreshSession';

type LoadingState = {
  [key in AuthOperation]?: boolean;
};

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  loadingStates: LoadingState;
  error: AuthError | null;
  lastActivity: number | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: AuthError | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ error: AuthError | null }>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: { operation: AuthOperation; isLoading: boolean } }
  | { type: 'SET_SESSION'; payload: { session: Session | null; user: User | null } }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LAST_ACTIVITY'; payload: number };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { 
        ...state, 
        loadingStates: {
          ...state.loadingStates,
          [action.payload.operation]: action.payload.isLoading
        },
        isLoading: action.payload.isLoading
      };
    case 'SET_SESSION':
      return { 
        ...state, 
        session: action.payload.session, 
        user: action.payload.user,
        error: null,
        lastActivity: Date.now()
      };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loadingStates: Object.keys(state.loadingStates).reduce(
          (acc, key) => ({ ...acc, [key]: false }), 
          {}
        ) as LoadingState,
        isLoading: false 
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LAST_ACTIVITY':
      return { ...state, lastActivity: action.payload };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  loadingStates: {},
  error: null,
  lastActivity: null,
};

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    signIn: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithOAuth: () => Promise.resolve({ error: null }),
    sendPasswordResetEmail: () => Promise.resolve({ error: null }),
    updatePassword: () => Promise.resolve({ error: null }),
    refreshSession: () => Promise.resolve({ error: null }),
    clearError: () => {},
  });
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 second
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Handle session refresh with exponential backoff
  const refreshSessionWithRetry = useCallback(async (): Promise<{ error: AuthError | null }> => {
    if (retryCountRef.current >= MAX_RETRIES) {
      retryCountRef.current = 0;
      const error = new Error('Max retry attempts reached') as AuthError;
      dispatch({ type: 'SET_ERROR', payload: error });
      return { error };
    }

    try {
      dispatch({ 
        type: 'SET_LOADING', 
        payload: { operation: 'refreshSession', isLoading: true } 
      });

      const { data, error } = await authService.refreshSession();
      
      if (error) throw error;

      dispatch({ 
        type: 'SET_SESSION', 
        payload: { 
          session: data.session, 
          user: data.user 
        } 
      });
      
      retryCountRef.current = 0;
      return { error: null };
    } catch (error) {
      retryCountRef.current++;
      const delay = BASE_DELAY * Math.pow(2, retryCountRef.current - 1);
      
      return new Promise((resolve) => {
        refreshTimeoutRef.current = setTimeout(async () => {
          const result = await refreshSessionWithRetry();
          resolve(result);
        }, delay);
      });
    } finally {
      dispatch({ 
        type: 'SET_LOADING', 
        payload: { operation: 'refreshSession', isLoading: false } 
      });
    }
  }, []);

  // Handle auth state changes
  useEffect(() => {
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { session: null, user: null } 
        });
      } else if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
        // Session expired, try to refresh
        await refreshSessionWithRetry();
      } else {
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { 
            session, 
            user: session?.user ?? null 
          } 
        });
      }
    };

    // Set up auth state subscription
    const setupAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await authService.getSession();
        
        if (error) throw error;
        
        if (isMounted) {
          dispatch({ 
            type: 'SET_SESSION', 
            payload: { 
              session, 
              user: session?.user ?? null 
            } 
          });
          
          // Set up subscription after initial session is loaded
          const { data } = authService.onAuthStateChange(handleAuthStateChange);
          authSubscription = data;
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: error as AuthError 
          });
        }
      } finally {
        if (isMounted) {
          dispatch({ 
            type: 'SET_LOADING', 
            payload: { operation: 'initial', isLoading: false } 
          });
        }
      }
    };

    setupAuth();

    // Set up activity tracking for session timeout
    const handleActivity = () => {
      if (isMounted) {
        dispatch({ 
          type: 'SET_LAST_ACTIVITY', 
          payload: Date.now() 
        });
      }
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Cleanup function
    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
      clearTimeout(refreshTimeoutRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [refreshSessionWithRetry, router, pathname]);

  // Memoize context value to prevent unnecessary re-renders
  const handleError = useCallback((error: AuthError | null, defaultMessage: string, operation: AuthOperation) => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message || defaultMessage,
        variant: 'destructive',
      });
      
      // Special handling for OAuth errors
      if (operation === 'signInWithOAuth' && error.message.includes('OAuth')) {
        router.push('/auth/error?code=oauth_failed');
      }
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error 
      });
    }
    return { error };
  }, [toast, router]);

  const setLoading = useCallback((operation: AuthOperation, isLoading: boolean) => {
    dispatch({ 
      type: 'SET_LOADING', 
      payload: { operation, isLoading } 
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const operation: AuthOperation = 'signIn';
    setLoading(operation, true);
    try {
      const { error } = await authService.signIn(email, password);
      return handleError(error, 'Failed to sign in', operation);
    } finally {
      setLoading(operation, false);
    }
  }, [handleError, setLoading]);

  const signUp = useCallback(async (email: string, password: string, userData?: Partial<Profile>) => {
    const operation: AuthOperation = 'signUp';
    setLoading(operation, true);
    try {
      const { error } = await authService.signUp(email, password, userData?.full_name || '');
      return handleError(error, 'Failed to sign up', operation);
    } finally {
      setLoading(operation, false);
    }
  }, [handleError, setLoading]);

  const signOut = useCallback(async () => {
    const operation: AuthOperation = 'signOut';
    setLoading(operation, true);
    try {
      const { error } = await authService.signOut();
      dispatch({ 
        type: 'SET_SESSION', 
        payload: { session: null, user: null } 
      });
      return handleError(error, 'Failed to sign out', operation);
    } finally {
      setLoading(operation, false);
    }
  }, [handleError, setLoading]);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    const operation: AuthOperation = 'signInWithOAuth';
    setLoading(operation, true);
    try {
      // Store the current path to redirect back after OAuth
      const redirectTo = window.location.pathname;
      sessionStorage.setItem('preAuthRoute', redirectTo);
      
      const { error } = await authService.signInWithOAuth(provider);
      return handleError(error, `Failed to sign in with ${provider}`, operation);
    } finally {
      setLoading(operation, false);
    }
  }, [handleError, setLoading]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    const operation: AuthOperation = 'sendPasswordResetEmail';
    setLoading(operation, true);
    try {
      const { error } = await authService.resetPassword(email);
      if (!error) {
        toast({
          title: 'Email sent',
          description: 'Check your email for the password reset link',
        });
      }
      return handleError(error, 'Failed to send password reset email', operation);
    } finally {
      setLoading(operation, false);
    }
  }, [handleError, setLoading, toast]);

  const updatePassword = useCallback(async (newPassword: string) => {
    const operation: AuthOperation = 'updatePassword';
    setLoading(operation, true);
    try {
      const { error } = await authService.updatePassword(newPassword);
      if (!error) {
        toast({
          title: 'Success',
          description: 'Your password has been updated',
        });
      }
      return handleError(error, 'Failed to update password', operation);
    } finally {
      setLoading(operation, false);
    }
  }, [handleError, setLoading, toast]);

  const refreshSession = useCallback(async (): Promise<{ error: AuthError | null }> => {
    return refreshSessionWithRetry();
  }, [refreshSessionWithRetry]);

  const { user, session, isLoading, loadingStates, error, lastActivity } = state;

  const isSessionAboutToExpire = useMemo(() => {
    if (!session?.expires_at) return false;
    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const fiveMinutes = 5 * 60 * 1000;
    return (expiresAt - Date.now()) < fiveMinutes;
  }, [session]);

  useEffect(() => {
    if (isSessionAboutToExpire && !loadingStates.refreshSession) {
      refreshSession();
    }
  }, [isSessionAboutToExpire, refreshSession, loadingStates.refreshSession]);

  const value = useMemo(() => ({
    user,
    session,
    isLoading,
    loadingStates,
    error,
    lastActivity,
    isSessionAboutToExpire,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    sendPasswordResetEmail,
    updatePassword,
    refreshSession,
    clearError,
  }), [
    user,
    session,
    isLoading,
    loadingStates,
    error,
    lastActivity,
    isSessionAboutToExpire,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    sendPasswordResetEmail,
    updatePassword,
    refreshSession,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for auth protection
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { redirectTo?: string } = {}
) {
  const WithAuth: React.FC<P> = (props) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push(options.redirectTo || '/login');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>; // Or your custom loading component
    }

    if (!user) {
      return null; // or a redirect component
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
}

export { AuthProvider, AuthErrorBoundary };

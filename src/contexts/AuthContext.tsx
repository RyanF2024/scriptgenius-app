'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/auth/auth.service';
import type { Profile } from '@/services/auth/auth.types';
import { useToast } from '@/components/ui/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: AuthError | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: { session: Session | null; user: User | null } }
  | { type: 'SET_ERROR'; payload: AuthError | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SESSION':
      return { 
        ...state, 
        session: action.payload.session, 
        user: action.payload.user,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  error: null,
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
    refreshSession: () => Promise.resolve(),
  });
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const pathname = usePathname();

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange(
      async (_, session) => {
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { 
            session, 
            user: session?.user ?? null 
          } 
        });
      }
    );

    // Initial session check
    const getSession = async () => {
      try {
        const { data, error } = await authService.getSession();
        
        if (error) throw error;
        
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { 
            session: data.session, 
            user: data.session?.user ?? null 
          } 
        });
      } catch (err) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: err as AuthError 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getSession();
    return () => subscription.unsubscribe();
  }, [router, pathname]);

  // Memoize context value to prevent unnecessary re-renders
  const handleError = useCallback((error: AuthError | null, defaultMessage: string) => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message || defaultMessage,
        variant: 'destructive',
      });
    }
    return { error };
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await authService.signIn(email, password);
    dispatch({ type: 'SET_LOADING', payload: false });
    return handleError(error, 'Failed to sign in');
  }, [handleError]);

  const signUp = useCallback(async (email: string, password: string, userData?: Partial<Profile>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await authService.signUp(email, password, userData);
    dispatch({ type: 'SET_LOADING', payload: false });
    return handleError(error, 'Failed to sign up');
  }, [handleError]);

  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await authService.signOut();
    dispatch({ type: 'SET_SESSION', payload: { session: null, user: null } });
    dispatch({ type: 'SET_LOADING', payload: false });
    return handleError(error, 'Failed to sign out');
  }, [handleError]);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await authService.signInWithOAuth(provider);
    dispatch({ type: 'SET_LOADING', payload: false });
    return handleError(error, `Failed to sign in with ${provider}`);
  }, [handleError]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await authService.sendPasswordResetEmail(email);
    dispatch({ type: 'SET_LOADING', payload: false });
    return handleError(error, 'Failed to send password reset email');
  }, [handleError]);

  const updatePassword = useCallback(async (newPassword: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await authService.updatePassword(newPassword);
    dispatch({ type: 'SET_LOADING', payload: false });
    return handleError(error, 'Failed to update password');
  }, [handleError]);

  const refreshSession = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { session, user, error } = await authService.getSession();
    
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error });
    } else {
      dispatch({ type: 'SET_SESSION', payload: { session, user } });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      session: state.session,
      isLoading: state.isLoading,
      error: state.error,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      sendPasswordResetEmail,
      updatePassword,
      refreshSession,
    }),
    [
      state.user,
      state.session,
      state.isLoading,
      state.error,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      sendPasswordResetEmail,
      updatePassword,
      refreshSession,
    ]
  );

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

export { AuthProvider };

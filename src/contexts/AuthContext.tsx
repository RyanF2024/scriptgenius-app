'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

// Define Profile type inline since we're having issues with the import
type Profile = {
  id: string;
  updated_at?: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  created_at?: string;
};

type AuthErrorResponse = {
  error: AuthError | null;
  message?: string;
};

type AuthSuccessResponse = {
  error: null;
  data?: any;
};

type AuthResult = AuthErrorResponse | AuthSuccessResponse;

type OAuthProvider = 'google' | 'github' | 'gitlab' | 'bitbucket' | 'discord';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    profile,
    isLoading,
    error,
    signIn: async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { error: null };
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        toast.error(authError.message || 'Failed to sign in');
        return { error: authError };
      }
    },
    signUp: async (email: string, password: string, fullName: string) => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success('Check your email for the confirmation link!');
        return { error: null };
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        toast.error(authError.message || 'Failed to sign up');
        return { error: authError };
      }
    },
    signInWithOAuth: async (provider: OAuthProvider) => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        return { error: null };
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        toast.error(`Failed to sign in with ${provider}`);
        return { error: authError };
      }
    },
    signInWithMagicLink: async (email: string) => {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success('Check your email for the magic link!');
        return { error: null };
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        toast.error('Failed to send magic link');
        return { error: authError };
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        toast.error('Failed to sign out');
        return { error: authError };
      }
    },
    resetPassword: async (email: string) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent!');
        return { error: null };
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        toast.error('Failed to send password reset email');
        return { error: authError };
      }
    },
    updatePassword: async (newPassword: string) => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        toast.success('Password updated successfully!');
        return { error: null };
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        toast.error('Failed to update password');
        return { error: authError };
      }
    },
    refreshSession: async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        setSession(data.session);
        setUser(data.user);
      } catch (err) {
        console.error('Failed to refresh session:', err);
        setError(err as AuthError);
      }
    },
  }), [user, session, profile, isLoading, error, router, pathname]);

  // Fetch user profile with retry logic
  const fetchProfile = useCallback(async (userId: string) => {
    const maxRetries = 3;
    let retryCount = 0;

    const attemptFetch = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        
        setProfile(data);
        setError(null);
      } catch (err) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptFetch();
        }
        
        console.error('Error fetching profile after retries:', err);
        setError(err as AuthError);
        setProfile(null);
      }
    };

    await attemptFetch();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        try {
          if (session?.user) {
            await fetchProfile(session.user.id);
            
            // Handle specific auth events
            switch (event) {
              case 'SIGNED_IN':
                // Create or update user profile
                const { error } = await supabase.from('profiles').upsert({
                  id: session.user.id,
                  email: session.user.email,
                  updated_at: new Date().toISOString(),
                });

                if (error) {
                  console.error('Error updating profile:', error);
                  toast.error('Failed to update profile');
                } else {
                  await fetchProfile(session.user.id);
                }
                
                // Redirect to dashboard if not already there
                if (!pathname.startsWith('/dashboard')) {
                  router.push('/dashboard');
                }
                break;

              case 'USER_UPDATED':
                await fetchProfile(session.user.id);
                break;
            }
          } else {
            setProfile(null);
            // Handle sign out
            if (event === 'SIGNED_OUT' && 
                !pathname.startsWith('/login') && 
                !pathname.startsWith('/signup')) {
              router.push('/login');
            }
          }

          // Handle password recovery
          if (event === 'PASSWORD_RECOVERY') {
            router.push('/reset-password');
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setError(err as AuthError);
        }
      }
    );

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error getting session:', err);
        setError(err as AuthError);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, pathname, fetchProfile]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }, []);

  // All context values are now included in the useMemo hook above

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

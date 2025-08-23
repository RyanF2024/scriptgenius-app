import { supabase } from '@/lib/supabase/client';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';

type AuthResponse = {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | null;
};

type ProfileResponse = {
  data: Profile | null;
  error: Error | null;
};

export const authService = {
  // Authentication methods
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  async signInWithOAuth(provider: 'google' | 'github' | 'gitlab' | 'bitbucket' | 'discord'): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  },

  async signInWithMagicLink(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    return await supabase.auth.signOut();
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },

  async getSession(): Promise<{ data: { session: Session | null }; error: AuthError | null }> {
    return await supabase.auth.getSession();
  },

  async refreshSession(): Promise<{ data: { session: Session | null; user: User | null }; error: AuthError | null }> {
    return await supabase.auth.refreshSession();
  },

  // Profile methods
  async getProfile(userId: string): Promise<ProfileResponse> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<ProfileResponse> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  },

  // Helper methods
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

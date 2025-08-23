import type { User, Session, AuthError } from '@supabase/supabase-js';

export type OAuthProvider = 'google' | 'github' | 'gitlab' | 'bitbucket' | 'discord';

export interface Profile {
  id: string;
  updated_at?: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  created_at?: string;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | null;
}

export interface ProfileResponse {
  data: Profile | null;
  error: Error | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
}

export interface UserProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: { session: Session | null; user: User | null } }
  | { type: 'SET_ERROR'; payload: AuthError | null };

export type ProfileAction =
  | { type: 'SET_PROFILE_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: Profile | null }
  | { type: 'SET_PROFILE_ERROR'; payload: Error | null };

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
}

export interface UserProfileContextType extends UserProfileState {
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

import { supabase } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/profile';
import type { ProfileUpdate } from '@/types/profile';
import { v4 as uuidv4 } from 'uuid';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as Profile, error: null };
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<ProfileResponse> {
    try {
      // If there's an avatar update, handle file upload first
      if (updates.avatar_url && updates.avatar_url instanceof File) {
        const file = updates.avatar_url as File;
        
        // Validate file
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        }
        
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }

// Generate unique file path
        const originalFileName = file.name;
        const fileExt = originalFileName.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(filePath);

        // Update profile with new avatar URL and path
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({
            ...updates,
            avatar_url: publicUrl,
            avatar_path: filePath,
          })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) throw new Error(updateError.message);
        return { data: data as Profile, error: null };
      } else {
        // Regular profile update without avatar change
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return { data: data as Profile, error: null };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to update profile') 
      };
    }
  },

  async deleteProfilePicture(userId: string, avatarPath: string): Promise<{ error: Error | null }> {
    try {
      if (!avatarPath) return { error: null };
      
      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([avatarPath]);

      if (deleteError) throw deleteError;

      // Update profile to remove avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          avatar_path: null 
        })
        .eq('id', userId);

      if (updateError) throw updateError;
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return { 
        error: error instanceof Error ? error : new Error('Failed to delete profile picture') 
      };
    }
  },

  // Helper methods
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

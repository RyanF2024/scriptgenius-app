import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const storageService = {
  // Upload a file to storage
  async uploadFile(file: File, userId: string): Promise<{ path: string; error: Error | null }> {
    try {
      // Validate file
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

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

      return { path: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { path: '', error: error instanceof Error ? error : new Error('Failed to upload file') };
    }
  },

  // Delete a file from storage
  async deleteFile(filePath: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([filePath]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { error: error instanceof Error ? error : new Error('Failed to delete file') };
    }
  },

  // Extract file path from URL
  getFilePathFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname.split(`${AVATAR_BUCKET}/`).pop() || '';
  }
};

export default storageService;

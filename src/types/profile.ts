import { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  avatar_path?: string | null;
};

export type ProfileUpdate = {
  full_name?: string | null;
  username?: string | null;
  website?: string | null;
  bio?: string | null;
  avatar_url?: string | File | null;
  avatar_path?: string | null;
};

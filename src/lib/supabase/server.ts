import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './client';
import { env } from '../env';

export const createClient = () => {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
      },
    }
  );
};

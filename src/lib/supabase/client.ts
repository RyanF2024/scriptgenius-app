import { createBrowserClient } from '@supabase/ssr';

// Define basic Database type to avoid external dependencies
type Database = any; // Replace with actual database types if needed

// Create a single supabase client for client-side use
export function createClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
}

// Create a single supabase client for client-side use
export const supabase = createClient();

// Server-side client for use in API routes
export function createServerClient(cookies: { get: (name: string) => { value: string } | undefined }) {
  const { createServerClient: createSupaServerClient } = require('@supabase/ssr');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupaServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// Admin client for server-side operations (use with caution)
export function createServiceRoleClient() {
  const { createServerClient } = require('@supabase/ssr');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase service role environment variables');
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at?: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
          website?: string;
        };
        Insert: {
          id: string;
          updated_at?: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
          website?: string;
        };
        Update: {
          id?: string;
          updated_at?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          website?: string;
        };
      };
      // Add more tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

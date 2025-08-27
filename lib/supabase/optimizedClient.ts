import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Environment variables with type safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables for Supabase');
}

// Client-side only createClient
function createSupabaseClient() {
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        // Configure fetch to use the native fetch API
        fetch: (input, init) => 
          fetch(input, {
            ...init,
            // Add any default headers or options here
            headers: {
              ...init?.headers,
              'X-Client-Info': 'scriptgenius-web',
            },
          }),
      },
    }
  );
}

// This creates a singleton instance of the Supabase client
const supabase = createSupabaseClient();

// Export a hook to use the Supabase client with React
// This ensures we only create one instance of the client
// and can be used with React's concurrent rendering
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function useSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: return a new instance for each request
    return createSupabaseClient();
  }
  
  // Client-side: return singleton instance
  if (!clientInstance) {
    clientInstance = createSupabaseClient();
  }
  
  return clientInstance;
}

export default supabase;

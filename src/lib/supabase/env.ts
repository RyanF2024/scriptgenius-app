// This file contains environment variable validation

// Server-side environment variables are validated at runtime
const requiredServerEnv = {
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

// Client-side environment variables are validated at build time
type EnvKey = keyof typeof requiredServerEnv;

// Validate required environment variables
Object.entries(requiredServerEnv).forEach(([key, value]) => {
  // Only validate required variables that don't have default values
  if (value === undefined && !['sentryDsn'].includes(key)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Export validated environment variables
export const env = {
  ...requiredServerEnv,
  isProduction: requiredServerEnv.nodeEnv === 'production',
  isDevelopment: requiredServerEnv.nodeEnv === 'development',
  isTest: requiredServerEnv.nodeEnv === 'test',
} as const;

// Type-safe environment variable access
export function getEnv() {
  return env;
}

// Runtime environment variable validation
type RequiredServerEnv = {
  [K in keyof typeof requiredServerEnv]: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends RequiredServerEnv {}
  }
}

// This makes the module a module (and not a script)
export {};

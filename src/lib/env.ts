export const env = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  
  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY!,
  
  // Stripe
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  
  // Optional: Sentry
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

// Validate required environment variables in development and production
type EnvKey = keyof typeof env;

const requiredEnvVars: EnvKey[] = [
  'supabaseUrl',
  'supabaseAnonKey',
  'supabaseServiceRoleKey',
  'openaiApiKey',
  'stripePublishableKey',
  'stripeSecretKey',
  'stripeWebhookSecret',
];

if (typeof window === 'undefined') {
  // Server-side validation
  requiredEnvVars.forEach((key) => {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

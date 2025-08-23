import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local')
});

// Verify required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Supabase client
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Test authentication
async function testAuth() {
  console.log('Testing authentication...');
  
  // Get a test user
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1);
    
  if (error) {
    console.error('Error fetching test user:', error);
    return null;
  }
  
  if (!users || users.length === 0) {
    console.log('No test users found. Please create a user first.');
    return null;
  }
  
  return users[0];
}

// Test payment methods API
async function testPaymentMethods(userId: string) {
  console.log('\nTesting payment methods API...');
  
  // Get a session for the user
  const { data: { session } } = await supabase.auth.admin.createUser({
    email: `test-${Date.now()}@example.com`,
    password: 'test-password',
    email_confirm: true,
  });
  
  if (!session) {
    console.error('Failed to create test session');
    return;
  }
  
  // Test getting payment methods
  const paymentMethodsRes = await fetch('http://localhost:3000/api/billing/payment-methods', {
    headers: {
      'Cookie': `sb-access-token=${session.access_token}; sb-refresh-token=${session.refresh_token}`
    }
  });
  
  const paymentMethods = await paymentMethodsRes.json();
  console.log('Payment methods:', JSON.stringify(paymentMethods, null, 2));
  
  // Test creating a setup intent
  const setupIntentRes = await fetch('http://localhost:3000/api/billing/payment-methods', {
    method: 'POST',
    headers: {
      'Cookie': `sb-access-token=${session.access_token}; sb-refresh-token=${session.refresh_token}`
    }
  });
  
  const setupIntent = await setupIntentRes.json();
  console.log('\nSetup intent:', JSON.stringify(setupIntent, null, 2));
}

// Main test function
async function runTests() {
  console.log('Starting API tests...');
  
  try {
    // Test authentication
    const user = await testAuth();
    if (!user) return;
    
    // Test payment methods
    await testPaymentMethods(user.id);
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();

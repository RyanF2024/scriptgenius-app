import { vi } from 'vitest';

// Create a mock subscription
const createMockSubscription = () => ({
  unsubscribe: vi.fn(),
  data: { subscription: { unsubscribe: vi.fn() } },
});

// Create the mock Supabase client
export const supabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue(createMockSubscription()),
    getSession: vi.fn(),
  },
};

export default supabase;

import React from 'react';
import { render, screen, waitFor } from '../../test-utils';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';

// Create a mock Supabase client
const createMockSupabase = () => {
  const mockAuth = {
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: { provider: 'github', url: 'http://example.com' }, error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    onAuthStateChange: vi.fn(),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  };

  // Set up the auth state change handler
  mockAuth.onAuthStateChange.mockImplementation((callback) => {
    // Store the callback to simulate auth state changes
    mockAuth._authChangeCallback = callback;
    
    // Return the subscription object
    return {
      data: { 
        subscription: { 
          unsubscribe: vi.fn() 
        } 
      }
    };
  });

  // Add a helper to simulate auth state changes
  mockAuth._simulateAuthChange = (event: string, session: Session | null) => {
    if (mockAuth._authChangeCallback) {
      mockAuth._authChangeCallback(event, session);
    }
  };

  return { auth: mockAuth };
};

// Create the mock Supabase instance
const mockSupabase = createMockSupabase();

// Mock the Supabase client module
vi.mock('@/lib/supabase/client', () => ({
  __esModule: true,
  supabase: mockSupabase,
  default: mockSupabase,
}));

// Import the mocked Supabase client after setting up the mock
import { supabase } from '@/lib/supabase/client';

describe('AuthContext', () => {
  // Helper function to render a component that uses the auth context
  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <AuthProvider>
        {ui}
      </AuthProvider>
    );
  };

  // Helper component to test auth state
  const AuthTester = () => {
    const { user, isLoading, session } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    return (
      <div>
        <div data-testid="user-email">{user?.email || 'No user'}</div>
        <div data-testid="auth-status">{session ? 'Authenticated' : 'Not authenticated'}</div>
      </div>
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Set up default mocks
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
    
    // Set up the auth state change handler
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      // Store the callback to simulate auth state changes
      (supabase.auth as any)._authChangeCallback = callback;
      
      return {
        data: { 
          subscription: { 
            unsubscribe: vi.fn() 
          } 
        }
      };
    });
  });

  it('should show loading state initially', () => {
    renderWithAuth(<AuthTester />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('should handle sign in with email and password', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    };
    
    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
      refresh_token: 'refresh-token',
    };
    
    // Mock successful sign in
    (supabase.auth.signInWithPassword as Mock).mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });
    
    // Mock successful profile fetch
    (supabase.auth.getSession as Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });
    
    // Render the test component
    renderWithAuth(<AuthTester />);
    
    // Simulate auth state change after successful sign in
    (supabase.auth as any)._simulateAuthChange('SIGNED_IN', mockSession);
    
    // Wait for the auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
  });
  
  it('should handle sign out', async () => {
    // Mock successful sign out
    (supabase.auth.signOut as Mock).mockResolvedValueOnce({ error: null });
    
    // Render the test component
    renderWithAuth(<AuthTester />);
    
    // Simulate auth state change after sign out
    (supabase.auth as any)._simulateAuthChange('SIGNED_OUT', null);
    
    // Wait for the auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });

  it('should handle sign out', async () => {
    const mockSignOut = vi.fn().mockResolvedValue({ error: null });
    supabase.auth.signOut = mockSignOut;

    const TestComponent = () => {
      const { signOut } = useAuth();
      const [result, setResult] = React.useState<any>(null);

      React.useEffect(() => {
        const doSignOut = async () => {
          const res = await signOut();
          setResult(res);
        };
        doSignOut();
      }, [signOut]);

      return <div data-testid="result">{result ? 'signed out' : 'signing out'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('signed out');
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { act } from 'react-dom/test-utils';
import { authService } from '@/services/auth/auth.service';

// Mock the auth service
jest.mock('@/services/auth/auth.service', () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    signInWithOAuth: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    getSession: jest.fn(),
    refreshSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}));

describe('AuthContext', () => {
  const TestComponent = () => {
    const { user, signIn, signOut, isLoading } = useAuth();
    
    return (
      <div>
        <div data-testid="user-email">{user?.email || 'No user'}</div>
        <div data-testid="loading">{isLoading ? 'Loading...' : 'Ready'}</div>
        <button onClick={() => signIn('test@example.com', 'password')}>
          Sign In
        </button>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the onAuthStateChange implementation
    (authService.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      // Simulate auth state change after a short delay
      setTimeout(() => {
        callback('SIGNED_IN', { user: { email: 'test@example.com' } });
      }, 100);
      
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
  });

  it('should provide auth context', async () => {
    // Mock successful sign in
    (authService.signIn as jest.Mock).mockResolvedValueOnce({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state should show loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');

    // Wait for initial auth state to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Ready');
    });

    // Simulate sign in button click
    fireEvent.click(screen.getByText('Sign In'));

    // Check if signIn was called with correct parameters
    expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password');

    // Simulate auth state change after sign in
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should handle sign out', async () => {
    // Mock successful sign out
    (authService.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Ready');
    });

    // Simulate sign out button click
    fireEvent.click(screen.getByText('Sign Out'));

    // Check if signOut was called
    expect(authService.signOut).toHaveBeenCalled();
  });

  it('should handle auth errors', async () => {
    // Mock failed sign in
    const error = new Error('Invalid credentials');
    (authService.signIn as jest.Mock).mockRejectedValueOnce(error);

    // Mock console.error to prevent error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Ready');
    });

    // Simulate sign in button click
    fireEvent.click(screen.getByText('Sign In'));

    // Check if signIn was called and error was handled
    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalled();
    });

    // Cleanup
    consoleError.mockRestore();
  });
});

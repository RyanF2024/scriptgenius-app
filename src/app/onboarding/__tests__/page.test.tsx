import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OnboardingPage from '../page';

// Mock next-auth
vi.mock('next-auth/react');

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
}));

describe('Onboarding Page', () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  
  const mockPush = vi.fn();
  
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    
    // Reset all mocks
    vi.clearAllMocks();
  });
  
  it('redirects to login if user is not authenticated', async () => {
    // Mock unauthenticated session
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
    
    render(<OnboardingPage />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
  });
  
  it('shows loading state while checking authentication', () => {
    // Mock loading session
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    });
    
    render(<OnboardingPage />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
  
  it('renders the onboarding flow when user is authenticated', async () => {
    // Mock authenticated session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });
    
    render(<OnboardingPage />);
    
    // Verify the onboarding flow is rendered
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument();
    });
  });
  
  it('redirects to dashboard if user has already completed onboarding', async () => {
    // Mock authenticated session with completed onboarding
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          onboardingCompleted: true,
        },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });
    
    render(<OnboardingPage />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});

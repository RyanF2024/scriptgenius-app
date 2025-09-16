import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CompletionStep } from '../CompletionStep';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const mockOnComplete = vi.fn();
const mockOnBack = vi.fn();

const mockUserData = {
  fullName: 'John Doe',
  displayName: 'johndoe',
  email: 'john@example.com',
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'en',
  },
  goals: ['improve-scripting', 'grow-audience'],
};

describe('CompletionStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (onComplete = mockOnComplete) => {
    render(
      <OnboardingProvider initialData={mockUserData}>
        <CompletionStep onComplete={onComplete} onBack={mockOnBack} />
      </OnboardingProvider>
    );
  };

  it('renders the completion message with user data', () => {
    renderComponent();
    
    expect(screen.getByText(/congratulations, john!/i)).toBeInTheDocument();
    expect(screen.getByText(/you've successfully completed the onboarding process/i)).toBeInTheDocument();
    expect(screen.getByText(/johndoe/i)).toBeInTheDocument();
    expect(screen.getByText(/light theme/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications enabled/i)).toBeInTheDocument();
    expect(screen.getByText(/english/i)).toBeInTheDocument();
    expect(screen.getByText(/improve my scripting skills/i)).toBeInTheDocument();
    expect(screen.getByText(/grow my audience/i)).toBeInTheDocument();
  });

  it('calls onComplete when the Get Started button is clicked', async () => {
    renderComponent();
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(getStartedButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onBack when the Back button is clicked', () => {
    renderComponent();
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('displays a success message with the user\'s email', () => {
    renderComponent();
    
    expect(screen.getByText(/a confirmation email has been sent to/i)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.email)).toBeInTheDocument();
  });

  it('shows a loading state when the form is submitting', async () => {
    // Mock a slow onComplete function
    const slowOnComplete = vi.fn(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    renderComponent(slowOnComplete);
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(getStartedButton);
    
    // Button should be disabled and show loading state
    expect(getStartedButton).toBeDisabled();
    expect(screen.getByText(/completing setup.../i)).toBeInTheDocument();
    
    // Wait for the promise to resolve
    await waitFor(() => {
      expect(slowOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <OnboardingProvider initialData={mockUserData}>
        <CompletionStep onComplete={mockOnComplete} onBack={mockOnBack} />
      </OnboardingProvider>
    );
    
    expect(container).toMatchSnapshot();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WelcomeStep } from '../WelcomeStep';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const mockOnNext = vi.fn();

describe('WelcomeStep', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <OnboardingProvider>
        <WelcomeStep onNext={mockOnNext} />
      </OnboardingProvider>
    );
  };

  it('renders the welcome message and instructions', () => {
    renderComponent();
    
    expect(screen.getByText('Welcome to ScriptGenius!')).toBeInTheDocument();
    expect(screen.getByText(/Let's get started with setting up your account/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('calls onNext when the Get Started button is clicked', async () => {
    renderComponent();
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(getStartedButton);
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('displays the app logo', () => {
    renderComponent();
    
    const logo = screen.getByRole('img', { name: /scriptgenius logo/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo.svg');
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <OnboardingProvider>
        <WelcomeStep onNext={mockOnNext} />
      </OnboardingProvider>
    );
    
    expect(container).toMatchSnapshot();
  });
});

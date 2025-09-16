import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileStep } from '../ProfileStep';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const mockOnNext = vi.fn();
const mockOnBack = vi.fn();

describe('ProfileStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialData = {}) => {
    render(
      <OnboardingProvider initialData={initialData}>
        <ProfileStep onNext={mockOnNext} onBack={mockOnBack} />
      </OnboardingProvider>
    );
  };

  it('renders the profile form with all fields', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('pre-fills the form with initial data', () => {
    const initialData = {
      fullName: 'John Doe',
      displayName: 'johndoe',
      timezone: 'America/New_York',
    };
    
    renderComponent(initialData);
    
    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/display name/i)).toHaveValue('johndoe');
    expect(screen.getByLabelText(/timezone/i)).toHaveValue('America/New_York');
  });

  it('validates required fields', async () => {
    renderComponent();
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Display name is required')).toBeInTheDocument();
      expect(screen.getByText('Please select a timezone')).toBeInTheDocument();
    });
    
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('calls onNext with form data when form is submitted', async () => {
    renderComponent();
    
    // Fill in the form
    fireEvent.input(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });
    
    fireEvent.input(screen.getByLabelText(/display name/i), {
      target: { value: 'johndoe' },
    });
    
    fireEvent.change(screen.getByLabelText(/timezone/i), {
      target: { value: 'America/New_York' },
    });
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        fullName: 'John Doe',
        displayName: 'johndoe',
        timezone: 'America/New_York',
      });
    });
  });

  it('calls onBack when back button is clicked', () => {
    renderComponent();
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('displays avatar upload component', () => {
    renderComponent();
    
    expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <OnboardingProvider>
        <ProfileStep onNext={mockOnNext} onBack={mockOnBack} />
      </OnboardingProvider>
    );
    
    expect(container).toMatchSnapshot();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreferencesStep } from '../PreferencesStep';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const mockOnNext = vi.fn();
const mockOnBack = vi.fn();

const defaultPreferences = {
  theme: 'light',
  notifications: true,
  language: 'en',
};

describe('PreferencesStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialData = {}) => {
    render(
      <OnboardingProvider initialData={{ preferences: defaultPreferences, ...initialData }}>
        <PreferencesStep onNext={mockOnNext} onBack={mockOnBack} />
      </OnboardingProvider>
    );
  };

  it('renders the preferences form with all fields', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('pre-fills the form with initial data', () => {
    const initialData = {
      preferences: {
        theme: 'dark',
        notifications: false,
        language: 'es',
      },
    };
    
    renderComponent(initialData);
    
    expect(screen.getByLabelText(/theme/i)).toHaveValue('dark');
    expect(screen.getByLabelText(/notifications/i)).not.toBeChecked();
    expect(screen.getByLabelText(/language/i)).toHaveValue('es');
  });

  it('updates form fields when changed', async () => {
    renderComponent();
    
    // Change theme
    fireEvent.change(screen.getByLabelText(/theme/i), {
      target: { value: 'dark' },
    });
    
    // Toggle notifications
    fireEvent.click(screen.getByLabelText(/notifications/i));
    
    // Change language
    fireEvent.change(screen.getByLabelText(/language/i), {
      target: { value: 'es' },
    });
    
    expect(screen.getByLabelText(/theme/i)).toHaveValue('dark');
    expect(screen.getByLabelText(/notifications/i)).not.toBeChecked();
    expect(screen.getByLabelText(/language/i)).toHaveValue('es');
  });

  it('calls onNext with updated preferences when form is submitted', async () => {
    renderComponent();
    
    // Make some changes
    fireEvent.change(screen.getByLabelText(/theme/i), { target: { value: 'dark' } });
    fireEvent.click(screen.getByLabelText(/notifications/i));
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        preferences: {
          theme: 'dark',
          notifications: false, // Toggled from default true to false
          language: 'en', // Default value
        },
      });
    });
  });

  it('calls onBack when back button is clicked', () => {
    renderComponent();
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('shows a preview of the selected theme', () => {
    renderComponent();
    
    // Check that the preview container exists
    const previewContainer = screen.getByTestId('theme-preview');
    expect(previewContainer).toBeInTheDocument();
    
    // Change theme and verify the preview updates
    fireEvent.change(screen.getByLabelText(/theme/i), { target: { value: 'dark' } });
    expect(previewContainer).toHaveClass('dark-theme-preview');
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <OnboardingProvider>
        <PreferencesStep onNext={mockOnNext} onBack={mockOnBack} />
      </OnboardingProvider>
    );
    
    expect(container).toMatchSnapshot();
  });
});

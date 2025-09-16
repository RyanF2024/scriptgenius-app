import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoalsStep } from '../GoalsStep';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const mockOnNext = vi.fn();
const mockOnBack = vi.fn();

const availableGoals = [
  { id: 'improve-scripting', label: 'Improve my scripting skills' },
  { id: 'increase-engagement', label: 'Increase audience engagement' },
  { id: 'grow-audience', label: 'Grow my audience' },
  { id: 'monetize', label: 'Monetize my content' },
];

describe('GoalsStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialData = {}) => {
    render(
      <OnboardingProvider initialData={initialData}>
        <GoalsStep 
          onNext={mockOnNext} 
          onBack={mockOnBack} 
          availableGoals={availableGoals} 
        />
      </OnboardingProvider>
    );
  };

  it('renders the goals selection with all available options', () => {
    renderComponent();
    
    availableGoals.forEach(goal => {
      expect(screen.getByLabelText(goal.label)).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('pre-selects previously selected goals', () => {
    const initialData = {
      goals: ['improve-scripting', 'grow-audience']
    };
    
    renderComponent(initialData);
    
    expect(screen.getByLabelText('Improve my scripting skills')).toBeChecked();
    expect(screen.getByLabelText('Grow my audience')).toBeChecked();
    expect(screen.getByLabelText('Increase audience engagement')).not.toBeChecked();
    expect(screen.getByLabelText('Monetize my content')).not.toBeChecked();
  });

  it('validates that at least one goal is selected', async () => {
    renderComponent();
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please select at least one goal')).toBeInTheDocument();
    });
    
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('calls onNext with selected goals when form is submitted', async () => {
    renderComponent();
    
    // Select some goals
    fireEvent.click(screen.getByLabelText('Improve my scripting skills'));
    fireEvent.click(screen.getByLabelText('Grow my audience'));
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        goals: ['improve-scripting', 'grow-audience'],
      });
    });
  });

  it('calls onBack when back button is clicked', () => {
    renderComponent();
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('allows selecting and deselecting goals', () => {
    renderComponent();
    
    const goalCheckbox = screen.getByLabelText('Improve my scripting skills');
    
    // Select the goal
    fireEvent.click(goalCheckbox);
    expect(goalCheckbox).toBeChecked();
    
    // Deselect the goal
    fireEvent.click(goalCheckbox);
    expect(goalCheckbox).not.toBeChecked();
  });

  it('displays a custom goal input when "Other" is selected', () => {
    const customGoals = [
      ...availableGoals,
      { id: 'other', label: 'Other (please specify)' },
    ];
    
    render(
      <OnboardingProvider>
        <GoalsStep 
          onNext={mockOnNext} 
          onBack={mockOnBack} 
          availableGoals={customGoals} 
        />
      </OnboardingProvider>
    );
    
    // Select the "Other" option
    fireEvent.click(screen.getByLabelText('Other (please specify)'));
    
    expect(screen.getByPlaceholderText('Please specify your goal')).toBeInTheDocument();
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <OnboardingProvider>
        <GoalsStep 
          onNext={mockOnNext} 
          onBack={mockOnBack} 
          availableGoals={availableGoals} 
        />
      </OnboardingProvider>
    );
    
    expect(container).toMatchSnapshot();
  });
});

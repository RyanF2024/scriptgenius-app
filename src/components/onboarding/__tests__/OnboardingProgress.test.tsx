import { render, screen } from '@testing-library/react';
import { OnboardingProgress } from '../OnboardingProgress';

describe('OnboardingProgress', () => {
  const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'profile', title: 'Profile' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'goals', title: 'Goals' },
    { id: 'complete', title: 'Complete' },
  ];

  it('renders all step indicators', () => {
    render(
      <OnboardingProgress 
        steps={steps} 
        currentStep="profile" 
        onStepClick={vi.fn()} 
      />
    );

    steps.forEach(step => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });

  it('highlights the current step', () => {
    const currentStep = 'preferences';
    render(
      <OnboardingProgress 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={vi.fn()} 
      />
    );

    const currentStepElement = screen.getByText('Preferences').closest('div');
    expect(currentStepElement).toHaveClass('current');
  });

  it('marks completed steps as completed', () => {
    const currentStep = 'goals';
    const completedSteps = ['welcome', 'profile', 'preferences'];
    
    render(
      <OnboardingProgress 
        steps={steps} 
        currentStep={currentStep} 
        completedSteps={completedSteps} 
        onStepClick={vi.fn()} 
      />
    );

    // Check completed steps
    completedSteps.forEach(stepId => {
      const stepTitle = steps.find(step => step.id === stepId)?.title || '';
      const stepElement = screen.getByText(stepTitle).closest('div');
      expect(stepElement).toHaveClass('completed');
    });

    // Current step should not be marked as completed
    const currentStepTitle = steps.find(step => step.id === currentStep)?.title || '';
    const currentStepElement = screen.getByText(currentStepTitle).closest('div');
    expect(currentStepElement).toHaveClass('current');
    expect(currentStepElement).not.toHaveClass('completed');
  });

  it('calls onStepClick when a step is clicked', () => {
    const handleStepClick = vi.fn();
    render(
      <OnboardingProgress 
        steps={steps} 
        currentStep="profile" 
        onStepClick={handleStepClick} 
      />
    );

    const stepToClick = screen.getByText('Complete');
    fireEvent.click(stepToClick);

    expect(handleStepClick).toHaveBeenCalledWith('complete');
  });

  it('does not allow clicking on future steps when allowClickingFutureSteps is false', () => {
    const handleStepClick = vi.fn();
    render(
      <OnboardingProgress 
        steps={steps} 
        currentStep="profile" 
        onStepClick={handleStepClick} 
        allowClickingFutureSteps={false}
      />
    );

    // Try to click on a future step
    const futureStep = screen.getByText('Complete');
    fireEvent.click(futureStep);

    expect(handleStepClick).not.toHaveBeenCalled();
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <OnboardingProgress 
        steps={steps} 
        currentStep="profile" 
        completedSteps={['welcome']} 
        onStepClick={vi.fn()} 
      />
    );
    
    expect(container).toMatchSnapshot();
  });
});

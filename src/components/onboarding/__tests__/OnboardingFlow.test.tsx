import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingFlow } from '../OnboardingFlow';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

// Mock the step components
jest.mock('../steps/WelcomeStep', () => ({
  WelcomeStep: () => <div data-testid="welcome-step">Welcome Step</div>,
}));

jest.mock('../steps/ProfileStep', () => ({
  ProfileStep: () => <div data-testid="profile-step">Profile Step</div>,
}));

jest.mock('../steps/PreferencesStep', () => ({
  PreferencesStep: () => <div data-testid="preferences-step">Preferences Step</div>,
}));

jest.mock('../steps/GoalsStep', () => ({
  GoalsStep: () => <div data-testid="goals-step">Goals Step</div>,
}));

describe('OnboardingFlow', () => {
  const renderComponent = () => {
    return render(
      <OnboardingProvider>
        <OnboardingFlow />
      </OnboardingProvider>
    );
  };

  it('should render the welcome step by default', () => {
    renderComponent();
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
  });

  it('should navigate between steps when context updates', () => {
    // Mock the useOnboarding hook to control the currentStep
    jest.mock('@/contexts/OnboardingContext', () => ({
      ...jest.requireActual('@/contexts/OnboardingContext'),
      useOnboarding: () => ({
        currentStep: 'profile',
        data: {},
        updateData: jest.fn(),
        goToStep: jest.fn(),
        saveProgress: jest.fn(),
        completeOnboarding: jest.fn(),
        isSubmitting: false,
        error: null,
        isLoading: false,
        steps: [
          { id: 'welcome', title: 'Welcome' },
          { id: 'profile', title: 'Profile' },
          { id: 'preferences', title: 'Preferences' },
          { id: 'goals', title: 'Goals' },
          { id: 'complete', title: 'Complete' },
        ],
      }),
    }));

    renderComponent();
    
    // Now the profile step should be rendered
    expect(screen.getByTestId('profile-step')).toBeInTheDocument();
  });
});

describe('OnboardingSteps', () => {
  it('should render the correct step component based on currentStep', () => {
    // We need to mock the OnboardingSteps component separately
    const { OnboardingSteps } = require('../OnboardingFlow');
    
    // Test welcome step
    const { rerender } = render(
      <OnboardingProvider>
        <OnboardingSteps />
      </OnboardingProvider>
    );
    
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
    
    // Test profile step
    jest.spyOn(require('@/contexts/OnboardingContext'), 'useOnboarding')
      .mockImplementation(() => ({
        currentStep: 'profile',
        data: { currentStep: 'profile' },
      }));
    
    rerender(
      <OnboardingProvider>
        <OnboardingSteps />
      </OnboardingProvider>
    );
    
    expect(screen.getByTestId('profile-step')).toBeInTheDocument();
  });
});

import React from 'react';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { GoalsStep } from './steps/GoalsStep';
import { CompleteStep } from './steps/CompleteStep';

// This component handles the step rendering
const OnboardingSteps: React.FC = () => {
  const { currentStep } = useOnboarding();

  switch (currentStep) {
    case 'welcome':
      return <WelcomeStep />;
    case 'profile':
      return <ProfileStep />;
    case 'preferences':
      return <PreferencesStep />;
    case 'goals':
      return <GoalsStep />;
    case 'complete':
      return <CompleteStep />;
    default:
      return <WelcomeStep />;
  }
};

// Main export that wraps everything in the provider
export const OnboardingFlow: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingSteps />
    </OnboardingProvider>
  );
};

export default OnboardingFlow;

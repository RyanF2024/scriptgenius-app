import React from 'react';
import { OnboardingLayout } from '../OnboardingLayout';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

export const WelcomeStep: React.FC = () => {
  const { goToStep } = useOnboarding();

  return (
    <OnboardingLayout
      hideBackButton
      nextButtonText="Get Started"
      onNext={() => goToStep('profile')}
    >
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Welcome to ScriptGenius</h2>
        <p className="text-muted-foreground mb-8">
          Let's set up your account to get the most out of ScriptGenius. This will only take a few minutes.
        </p>
        
        <div className="space-y-4 text-left max-w-md mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-primary">✓</div>
            <div className="ml-3">
              <h3 className="font-medium">Personalized Experience</h3>
              <p className="text-sm text-muted-foreground">Get recommendations tailored to your writing style and goals.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-primary">✓</div>
            <div className="ml-3">
              <h3 className="font-medium">Track Your Progress</h3>
              <p className="text-sm text-muted-foreground">Monitor your writing improvements over time.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-primary">✓</div>
            <div className="ml-3">
              <h3 className="font-medium">Expert Guidance</h3>
              <p className="text-sm text-muted-foreground">Access tools and insights used by professional writers.</p>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

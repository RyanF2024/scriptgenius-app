import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  canProceed?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  hideBackButton?: boolean;
  nextButtonText?: string;
  isLoading?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  canProceed = true,
  onNext,
  onBack,
  hideBackButton = false,
  nextButtonText = 'Continue',
  isLoading = false,
}) => {
  const { steps, currentStep, goToStep } = useOnboarding();
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        goToStep(nextStep.id);
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        goToStep(prevStep.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium">{steps[currentStepIndex]?.title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step content */}
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          {children}
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <div>
            {!hideBackButton && currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          
          <div>
            <Button
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {nextButtonText}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;

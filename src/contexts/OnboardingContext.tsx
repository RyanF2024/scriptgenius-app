import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/services/onboardingService';
import { OnboardingData, OnboardingContextType } from '@/types/onboarding';

const defaultData: OnboardingData = {
  fullName: '',
  displayName: '',
  role: 'writer',
  genres: [],
  experience: 'beginner',
  goals: [],
  receiveTips: true,
  subscribeNewsletter: true,
  currentStep: 'welcome',
};

const steps = [
  { id: 'welcome' as const, title: 'Welcome' },
  { id: 'profile' as const, title: 'Your Profile' },
  { id: 'preferences' as const, title: 'Preferences' },
  { id: 'goals' as const, title: 'Your Goals' },
  { id: 'complete' as const, title: 'Complete' },
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingData['currentStep']>('welcome');
  const [data, setData] = useState<Partial<OnboardingData>>(defaultData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const savedData = await onboardingService.getOnboardingData();
        if (savedData) {
          setData(prev => ({
            ...defaultData,
            ...savedData,
            currentStep: savedData.currentStep || 'welcome',
          }));
          setCurrentStep(savedData.currentStep || 'welcome');
        }
      } catch (err) {
        console.error('Error loading onboarding data:', err);
        setError('Failed to load your progress. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProgress();
  }, []);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({
      ...prev,
      ...newData,
    }));
  }, []);

  const saveProgress = useCallback(async (): Promise<boolean> => {
    try {
      await onboardingService.saveOnboardingData({
        ...data,
        currentStep,
      } as OnboardingData);
      return true;
    } catch (err) {
      console.error('Error saving progress:', err);
      setError('Failed to save your progress. Please try again.');
      return false;
    }
  }, [data, currentStep]);

  const goToStep = useCallback(async (step: OnboardingData['currentStep']) => {
    // Save progress before changing steps
    await saveProgress();
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [saveProgress]);

  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Save the final state before marking as complete
      await onboardingService.completeOnboarding({
        ...data,
        currentStep: 'complete',
      } as OnboardingData);

      // Mark as complete in local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingComplete', 'true');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setError('Failed to save your information. Please try again.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, router]);

  // Auto-save progress when data changes
  useEffect(() => {
    if (!isLoading && currentStep !== 'welcome' && currentStep !== 'complete') {
      const timer = setTimeout(() => {
        saveProgress().catch(console.error);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timer);
    }
  }, [data, currentStep, isLoading, saveProgress]);

  const value = {
    currentStep,
    data,
    steps,
    goToStep,
    updateData,
    saveProgress,
    completeOnboarding,
    isSubmitting,
    error,
    isLoading,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Helper hook to check if onboarding is needed
export const useOnboardingStatus = (): { isOnboardingComplete: boolean } => {
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState<boolean>(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const savedData = await onboardingService.getOnboardingData();
        const localComplete = typeof window !== 'undefined' && 
          localStorage.getItem('onboardingComplete') === 'true';
        
        setIsOnboardingComplete(!!(savedData?.completedAt || localComplete));
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        const localComplete = typeof window !== 'undefined' && 
          localStorage.getItem('onboardingComplete') === 'true';
        setIsOnboardingComplete(localComplete);
      }
    };

    checkStatus();
  }, []);

  return { isOnboardingComplete };
};

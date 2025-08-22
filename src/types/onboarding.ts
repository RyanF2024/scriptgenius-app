export type UserRole = 'writer' | 'producer' | 'director' | 'student' | 'other';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface OnboardingData {
  // Profile
  fullName: string;
  displayName: string;
  role: UserRole;
  
  // Preferences
  genres: string[];
  experience: ExperienceLevel;
  
  // Goals
  goals: string[];
  receiveTips: boolean;
  subscribeNewsletter: boolean;
  
  // System
  currentStep: 'welcome' | 'profile' | 'preferences' | 'goals' | 'complete';
  completedAt?: string;
  updatedAt?: string;
}

export interface OnboardingStepProps {
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface OnboardingContextType {
  currentStep: OnboardingData['currentStep'];
  data: Partial<OnboardingData>;
  steps: { id: OnboardingData['currentStep']; title: string }[];
  goToStep: (step: OnboardingData['currentStep']) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  saveProgress: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  isLoading: boolean;
}

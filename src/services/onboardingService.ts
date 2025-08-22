import { OnboardingData } from '@/types/onboarding';

export const onboardingService = {
  async saveOnboardingData(data: Partial<OnboardingData> & { currentStep: string }) {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save onboarding data');
    }

    return response.json();
  },

  async getOnboardingData() {
    const response = await fetch('/api/onboarding');
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No onboarding data exists yet
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch onboarding data');
    }

    const { data } = await response.json();
    return data;
  },

  async deleteOnboardingData() {
    const response = await fetch('/api/onboarding', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete onboarding data');
    }
  },

  async completeOnboarding(data: OnboardingData) {
    return this.saveOnboardingData({
      ...data,
      currentStep: 'complete',
    });
  },
};

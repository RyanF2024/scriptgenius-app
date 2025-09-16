import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { OnboardingProvider, useOnboarding } from '../OnboardingContext';
import { OnboardingData } from '@/types/onboarding';

// Mock the onboarding service
jest.mock('@/services/onboardingService', () => ({
  onboardingService: {
    saveOnboardingData: jest.fn().mockResolvedValue({}),
    getOnboardingData: jest.fn().mockResolvedValue(null),
    completeOnboarding: jest.fn().mockResolvedValue({}),
  },
}));

const mockOnboardingData: Partial<OnboardingData> = {
  fullName: 'John Doe',
  displayName: 'johndoe',
  role: 'writer',
  genres: ['action', 'comedy'],
  experience: 'intermediate',
  goals: ['improve-dialogue', 'better-structure'],
  receiveTips: true,
  subscribeNewsletter: true,
  currentStep: 'profile',
};

describe('OnboardingContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <OnboardingProvider>{children}</OnboardingProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial context values', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });

    expect(result.current).toMatchObject({
      currentStep: 'welcome',
      data: expect.any(Object),
      steps: expect.any(Array),
      isSubmitting: false,
      error: null,
      isLoading: false,
    });
  });

  it('should update data when updateData is called', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.updateData({ fullName: 'John Doe' });
    });

    expect(result.current.data.fullName).toBe('John Doe');
  });

  it('should change current step when goToStep is called', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.goToStep('profile');
    });

    expect(result.current.currentStep).toBe('profile');
    expect(result.current.data.currentStep).toBe('profile');
  });

  it('should save progress when saveProgress is called', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    const { saveProgress } = result.current;

    // Mock the saveOnboardingData function
    const { onboardingService } = require('@/services/onboardingService');
    onboardingService.saveOnboardingData.mockResolvedValueOnce({});

    await act(async () => {
      await saveProgress();
    });

    expect(onboardingService.saveOnboardingData).toHaveBeenCalled();
  });

  it('should complete onboarding when completeOnboarding is called', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    const { completeOnboarding } = result.current;

    // Mock the completeOnboarding function
    const { onboardingService } = require('@/services/onboardingService');
    onboardingService.completeOnboarding.mockResolvedValueOnce({});

    await act(async () => {
      await completeOnboarding();
    });

    expect(onboardingService.completeOnboarding).toHaveBeenCalled();
    expect(result.current.currentStep).toBe('complete');
  });

  it('should handle errors when saving progress fails', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    const { saveProgress } = result.current;

    // Mock the saveOnboardingData function to reject
    const { onboardingService } = require('@/services/onboardingService');
    const errorMessage = 'Failed to save progress';
    onboardingService.saveOnboardingData.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      await saveProgress();
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should load saved onboarding data on mount', async () => {
    // Mock getOnboardingData to return data
    const { onboardingService } = require('@/services/onboardingService');
    onboardingService.getOnboardingData.mockResolvedValueOnce(mockOnboardingData);

    const { result, waitForNextUpdate } = renderHook(() => useOnboarding(), { wrapper });

    // Wait for the effect to complete
    await act(async () => {
      await waitForNextUpdate();
    });

    expect(onboardingService.getOnboardingData).toHaveBeenCalled();
    expect(result.current.data).toMatchObject(mockOnboardingData);
    expect(result.current.currentStep).toBe(mockOnboardingData.currentStep);
  });
});

describe('useOnboarding hook', () => {
  it('should throw an error if used outside of OnboardingProvider', () => {
    // Suppress the expected error message in the test output
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      renderHook(() => useOnboarding());
    }).toThrow('useOnboarding must be used within an OnboardingProvider');
    
    // Restore the original console.error
    console.error = originalError;
  });
});

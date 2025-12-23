/**
 * useOnboarding Hook
 * 
 * Manages onboarding state and checks if user has completed onboarding
 */

import { useState, useEffect, useCallback } from 'react';

export interface OnboardingState {
  isCompleted: boolean;
  completedAt: number | null;
  data: {
    categories: string[];
    reminderEnabled: boolean;
    reminderTime: string;
    reminderTone: string;
  } | null;
}

export function useOnboarding(storage?: any) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isCompleted: false,
    completedAt: null,
    data: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from storage
  useEffect(() => {
    if (!storage) {
      setIsLoading(false);
      return;
    }

    const loadOnboardingState = async () => {
      try {
        const completed = await storage.get('onboardingCompleted');
        const completedAt = await storage.get('onboardingCompletedAt');
        const data = await storage.get('onboardingData');

        setOnboardingState({
          isCompleted: completed === true,
          completedAt: completedAt || null,
          data: data || null,
        });
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, [storage]);

  const markAsCompleted = useCallback(async (data?: any) => {
    if (!storage) return;

    try {
      await storage.set('onboardingCompleted', true);
      await storage.set('onboardingCompletedAt', Date.now());
      if (data) {
        await storage.set('onboardingData', data);
      }

      setOnboardingState(prev => ({
        ...prev,
        isCompleted: true,
        completedAt: Date.now(),
        data: data || prev.data,
      }));
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
    }
  }, [storage]);

  const resetOnboarding = useCallback(async () => {
    if (!storage) return;

    try {
      await storage.remove('onboardingCompleted');
      await storage.remove('onboardingCompletedAt');
      await storage.remove('onboardingData');

      setOnboardingState({
        isCompleted: false,
        completedAt: null,
        data: null,
      });
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  }, [storage]);

  return {
    ...onboardingState,
    isLoading,
    markAsCompleted,
    resetOnboarding,
  };
}


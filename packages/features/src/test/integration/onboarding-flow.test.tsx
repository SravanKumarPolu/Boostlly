/**
 * Integration Tests for Onboarding Flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickOnboarding } from '../../components/onboarding/QuickOnboarding';
import { StorageService } from '@boostlly/platform-web';

describe('Onboarding Flow Integration', () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService();
    vi.clearAllMocks();
  });

  it('should complete full onboarding flow', async () => {
    const onComplete = vi.fn();
    
    render(
      <QuickOnboarding
        storage={storage as any}
        onComplete={onComplete}
      />
    );

    // Step 1: Welcome
    expect(screen.getByText(/Welcome to Boostlly/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Get Started/i));

    // Step 2: Theme
    await waitFor(() => {
      expect(screen.getByText(/Choose Your Theme/i)).toBeInTheDocument();
    });
    const lightButton = screen.getByText(/Light/i).closest('button');
    if (lightButton) fireEvent.click(lightButton);
    fireEvent.click(screen.getByText(/Next/i));

    // Step 3: Categories
    await waitFor(() => {
      expect(screen.getByText(/Choose Your Categories/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 4: Reminder
    await waitFor(() => {
      expect(screen.getByText(/Set Daily Reminder/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Complete/i));

    // Verify completion
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should save onboarding data to storage', async () => {
    const onComplete = vi.fn();
    
    render(
      <QuickOnboarding
        storage={storage as any}
        onComplete={onComplete}
      />
    );

    // Skip through onboarding
    fireEvent.click(screen.getByText(/Skip/i));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });

    // Verify data was saved
    const completed = await storage.get('onboardingCompleted');
    expect(completed).toBe(true);
  });
});


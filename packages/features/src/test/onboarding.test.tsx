/**
 * Tests for QuickOnboarding Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickOnboarding } from '../components/onboarding/QuickOnboarding';

// Mock storage
const mockStorage = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

describe('QuickOnboarding', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome step', () => {
    render(
      <QuickOnboarding
        storage={mockStorage}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByText(/Welcome to Boostlly/i)).toBeInTheDocument();
  });

  it('should advance to theme step on next', async () => {
    render(
      <QuickOnboarding
        storage={mockStorage}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    const nextButton = screen.getByText(/Get Started/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Choose Your Theme/i)).toBeInTheDocument();
    });
  });

  it('should allow theme selection', async () => {
    render(
      <QuickOnboarding
        storage={mockStorage}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Advance to theme step
    fireEvent.click(screen.getByText(/Get Started/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Light/i)).toBeInTheDocument();
    });

    const lightButton = screen.getByText(/Light/i).closest('button');
    if (lightButton) {
      fireEvent.click(lightButton);
    }
  });

  it('should allow skipping', async () => {
    render(
      <QuickOnboarding
        storage={mockStorage}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    const skipButton = screen.getByText(/Skip/i);
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  it('should save onboarding data on complete', async () => {
    render(
      <QuickOnboarding
        storage={mockStorage}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Skip through all steps
    const skipButton = screen.getByText(/Skip/i);
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockStorage.set).toHaveBeenCalledWith('onboardingCompleted', true);
    });
  });
});


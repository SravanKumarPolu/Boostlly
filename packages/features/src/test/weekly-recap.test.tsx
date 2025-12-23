/**
 * Tests for WeeklyRecap Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WeeklyRecap } from '../components/weekly-recap/WeeklyRecap';

// Mock storage
const mockStorage = {
  get: vi.fn(async (key: string) => {
    if (key === 'gentleStreakData') {
      return {
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: new Date().toISOString().split('T')[0],
        gracePeriodUsed: false,
        weeklyHistory: [],
        totalDaysActive: 5,
        totalQuotesSaved: 10,
        totalQuotesViewed: 15,
      };
    }
    if (key === 'savedQuotes') {
      return [];
    }
    return null;
  }),
  set: vi.fn(),
  remove: vi.fn(),
};

describe('WeeklyRecap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<WeeklyRecap storage={mockStorage} />);
    expect(screen.getByText(/Loading recap/i)).toBeInTheDocument();
  });

  it('should render recap data after loading', async () => {
    render(<WeeklyRecap storage={mockStorage} />);

    await waitFor(() => {
      expect(screen.getByText(/Your Week in Review/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/5/)).toBeInTheDocument(); // Current streak
  });

  it('should display encouraging message', async () => {
    render(<WeeklyRecap storage={mockStorage} />);

    await waitFor(() => {
      const message = screen.getByText(/You're doing amazing/i);
      expect(message).toBeInTheDocument();
    });
  });

  it('should handle close callback', async () => {
    const onClose = vi.fn();
    render(<WeeklyRecap storage={mockStorage} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText(/Close/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByText(/Close/i);
    closeButton.click();

    expect(onClose).toHaveBeenCalled();
  });
});


/**
 * Tests for Gentle Streak System
 */

import { describe, it, expect } from 'vitest';
import {
  updateGentleStreak,
  getWeeklyRecap,
  getStreakMessage,
  createGentleStreakData,
  type GentleStreakData,
} from '../utils/gentle-streaks';

describe('Gentle Streak System', () => {
  describe('updateGentleStreak', () => {
    it('should start streak on first use', () => {
      const data = createGentleStreakData();
      const updated = updateGentleStreak(data);
      
      expect(updated.currentStreak).toBe(1);
      expect(updated.lastActiveDate).toBeTruthy();
      expect(updated.gracePeriodUsed).toBe(false);
    });

    it('should continue streak on consecutive day', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const data: GentleStreakData = {
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: yesterday.toISOString().split('T')[0],
        gracePeriodUsed: false,
        weeklyHistory: [],
        totalDaysActive: 5,
        totalQuotesSaved: 0,
        totalQuotesViewed: 0,
      };
      
      const updated = updateGentleStreak(data, today);
      
      expect(updated.currentStreak).toBe(6);
      expect(updated.gracePeriodUsed).toBe(false);
    });

    it('should use grace period for one missed day', () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const data: GentleStreakData = {
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: twoDaysAgo.toISOString().split('T')[0],
        gracePeriodUsed: false,
        weeklyHistory: [],
        totalDaysActive: 5,
        totalQuotesSaved: 0,
        totalQuotesViewed: 0,
      };
      
      const updated = updateGentleStreak(data, today);
      
      expect(updated.currentStreak).toBe(6); // Continues with grace period
      expect(updated.gracePeriodUsed).toBe(true);
    });

    it('should gently reset after missing multiple days', () => {
      const today = new Date();
      const fourDaysAgo = new Date(today);
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      
      const data: GentleStreakData = {
        currentStreak: 10,
        longestStreak: 10,
        lastActiveDate: fourDaysAgo.toISOString().split('T')[0],
        gracePeriodUsed: false,
        weeklyHistory: [],
        totalDaysActive: 10,
        totalQuotesSaved: 0,
        totalQuotesViewed: 0,
      };
      
      const updated = updateGentleStreak(data, today);
      
      expect(updated.currentStreak).toBe(1); // Gentle reset
      expect(updated.longestStreak).toBe(10); // Preserves longest
      expect(updated.gracePeriodUsed).toBe(false);
    });

    it('should not update if already updated today', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const data: GentleStreakData = {
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: todayStr,
        gracePeriodUsed: false,
        weeklyHistory: [],
        totalDaysActive: 5,
        totalQuotesSaved: 0,
        totalQuotesViewed: 0,
      };
      
      const updated = updateGentleStreak(data, today);
      
      expect(updated.currentStreak).toBe(5); // Unchanged
    });
  });

  describe('getStreakMessage', () => {
    it('should return encouraging message for 0 streak', () => {
      const message = getStreakMessage(0);
      expect(message).toContain('Start');
    });

    it('should return encouraging message for 1 day', () => {
      const message = getStreakMessage(1);
      expect(message).toContain('start');
    });

    it('should return encouraging message for week streak', () => {
      const message = getStreakMessage(7);
      expect(message).toContain('7');
      expect(message).not.toContain('failed');
    });

    it('should return encouraging message for month streak', () => {
      const message = getStreakMessage(30);
      expect(message).toContain('30');
      expect(message).not.toContain('failed');
    });
  });

  describe('getWeeklyRecap', () => {
    it('should generate weekly recap', () => {
      const data: GentleStreakData = {
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: new Date().toISOString().split('T')[0],
        gracePeriodUsed: false,
        weeklyHistory: [],
        totalDaysActive: 5,
        totalQuotesSaved: 10,
        totalQuotesViewed: 15,
      };
      
      const recap = getWeeklyRecap(data, 10, 15);
      
      expect(recap.currentStreak).toBe(5);
      expect(recap.quotesSaved).toBe(10);
      expect(recap.quotesViewed).toBe(15);
      expect(recap.weekStart).toBeTruthy();
    });
  });
});


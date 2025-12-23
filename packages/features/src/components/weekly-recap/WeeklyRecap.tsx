/**
 * Weekly Recap Component
 * 
 * Shows gentle, encouraging weekly summary:
 * - Days active
 * - Quotes saved
 * - Current streak
 * - No pressure language
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@boostlly/ui';
import { 
  Calendar, 
  BookOpen, 
  Flame, 
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  getWeeklyRecap,
  getStreakMessage,
  type GentleStreakData,
  type WeeklyRecap as WeeklyRecapType,
} from '@boostlly/core';

interface WeeklyRecapProps {
  storage: any;
  onClose?: () => void;
}

export function WeeklyRecap({ storage, onClose }: WeeklyRecapProps) {
  const [recap, setRecap] = useState<WeeklyRecapType | null>(null);
  const [streakData, setStreakData] = useState<GentleStreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecap();
  }, []);

  const loadRecap = async () => {
    try {
      // Load streak data
      const savedStreakData = await storage?.get('gentleStreakData');
      const currentStreakData: GentleStreakData = savedStreakData || {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        gracePeriodUsed: false,
        weeklyHistory: [],
        totalDaysActive: 0,
        totalQuotesSaved: 0,
        totalQuotesViewed: 0,
      };

      // Load saved quotes count
      const savedQuotes = await storage?.get('savedQuotes') || [];
      const quotesSaved = savedQuotes.length;

      // Estimate quotes viewed (simplified - would track this properly)
      const quotesViewed = currentStreakData.totalQuotesViewed || currentStreakData.totalDaysActive * 3;

      // Get weekly recap
      const weeklyRecap = getWeeklyRecap(
        currentStreakData,
        quotesSaved,
        quotesViewed
      );

      setStreakData(currentStreakData);
      setRecap(weeklyRecap);
    } catch (error) {
      console.error('Failed to load weekly recap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading recap...</div>
      </div>
    );
  }

  if (!recap || !streakData) {
    return null;
  }

  const streakMessage = getStreakMessage(recap.currentStreak);

  return (
    <Card className="w-full max-w-2xl shadow-lg border-2">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Your Week in Review</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          A gentle look at your progress
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Streak Display */}
        <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="text-3xl font-bold text-primary">{recap.currentStreak}</span>
          </div>
          <p className="text-lg font-medium">{streakMessage}</p>
          {recap.longestStreak > recap.currentStreak && (
            <p className="text-sm text-muted-foreground mt-2">
              Your best: {recap.longestStreak} days
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{recap.daysActive}</div>
            <div className="text-xs text-muted-foreground">Days Active</div>
          </div>

          <div className="p-4 rounded-lg border bg-card text-center">
            <BookOpen className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{recap.quotesSaved}</div>
            <div className="text-xs text-muted-foreground">Quotes Saved</div>
          </div>

          <div className="p-4 rounded-lg border bg-card text-center col-span-2 md:col-span-1">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{recap.quotesViewed}</div>
            <div className="text-xs text-muted-foreground">Quotes Viewed</div>
          </div>
        </div>

        {/* Encouraging Message */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-center text-muted-foreground">
            {recap.daysActive >= 5
              ? "You're doing amazing! Keep up the great work! 🌟"
              : recap.daysActive >= 3
              ? "You're building a great habit! Every day counts. 💪"
              : "Every journey starts with a single step. You've got this! 🌱"
            }
          </p>
        </div>

        {/* Actions */}
        {onClose && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


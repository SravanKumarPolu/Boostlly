/**
 * Gentle Streak System
 * 
 * Non-punishing streak tracking that:
 * - Allows grace period (missing one day doesn't reset)
 * - Tracks weekly activity
 * - Provides encouraging, non-pressure language
 */

export interface WeeklyRecap {
  weekStart: string; // ISO date string
  daysActive: number; // 0-7
  quotesSaved: number;
  currentStreak: number;
  longestStreak: number;
  quotesViewed: number;
}

export interface GentleStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // ISO date string
  gracePeriodUsed: boolean; // Whether grace period was used this cycle
  weeklyHistory: WeeklyRecap[];
  totalDaysActive: number;
  totalQuotesSaved: number;
  totalQuotesViewed: number;
}

const GRACE_PERIOD_DAYS = 1; // Allow missing 1 day without breaking streak

/**
 * Update streak with gentle logic
 * Missing one day doesn't reset - uses grace period
 */
export function updateGentleStreak(
  currentData: GentleStreakData,
  today: Date = new Date()
): GentleStreakData {
  const todayStr = today.toISOString().split('T')[0];
  const todayTime = today.setHours(0, 0, 0, 0);
  
  // If already updated today, return as-is
  if (currentData.lastActiveDate === todayStr) {
    return currentData;
  }

  const lastActive = currentData.lastActiveDate
    ? new Date(currentData.lastActiveDate).setHours(0, 0, 0, 0)
    : null;

  const daysSinceLastActive = lastActive
    ? Math.floor((todayTime - lastActive) / (1000 * 60 * 60 * 24))
    : null;

  let newStreak = currentData.currentStreak;
  let gracePeriodUsed = currentData.gracePeriodUsed;

  if (!lastActive) {
    // First time - start streak
    newStreak = 1;
    gracePeriodUsed = false;
  } else if (daysSinceLastActive === 1) {
    // Consecutive day - continue streak
    newStreak = currentData.currentStreak + 1;
    gracePeriodUsed = false; // Reset grace period on consecutive day
  } else if (daysSinceLastActive === 2 && !currentData.gracePeriodUsed) {
    // Missed one day but grace period available
    newStreak = currentData.currentStreak + 1; // Continue streak
    gracePeriodUsed = true; // Mark grace period as used
  } else if (daysSinceLastActive && daysSinceLastActive > 2) {
    // Missed more than grace period allows - gentle reset
    newStreak = 1; // Start fresh, don't punish
    gracePeriodUsed = false;
  }

  return {
    ...currentData,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, currentData.longestStreak),
    lastActiveDate: todayStr,
    gracePeriodUsed,
    totalDaysActive: currentData.totalDaysActive + 1,
  };
}

/**
 * Get current week's recap
 */
export function getWeeklyRecap(
  streakData: GentleStreakData,
  quotesSaved: number,
  quotesViewed: number
): WeeklyRecap {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Calculate days active this week
  let daysActive = 0;
  const weekStartTime = weekStart.getTime();
  const todayTime = today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= dayOfWeek; i++) {
    const checkDate = new Date(weekStartTime + i * 24 * 60 * 60 * 1000);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    // Check if there's activity on this day (simplified - would need activity log)
    if (streakData.lastActiveDate && checkDateStr <= streakData.lastActiveDate) {
      daysActive++;
    }
  }

  return {
    weekStart: weekStartStr,
    daysActive: Math.min(daysActive, 7),
    quotesSaved,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    quotesViewed,
  };
}

/**
 * Get encouraging streak message (no pressure language)
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return "Start your journey today! 🌱";
  } else if (streak === 1) {
    return "Great start! Keep it going! ✨";
  } else if (streak < 7) {
    return `You're on a ${streak}-day streak! Keep it up! 🔥`;
  } else if (streak < 30) {
    return `Amazing! ${streak} days strong! 💪`;
  } else {
    return `Incredible! ${streak} days of inspiration! 🌟`;
  }
}

/**
 * Initialize gentle streak data
 */
export function createGentleStreakData(): GentleStreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    gracePeriodUsed: false,
    weeklyHistory: [],
    totalDaysActive: 0,
    totalQuotesSaved: 0,
    totalQuotesViewed: 0,
  };
}


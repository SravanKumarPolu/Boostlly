/**
 * Centralized Constants for Boostlly
 * 
 * This file contains all hardcoded values and configuration constants
 * used across the application to reduce duplication and improve maintainability.
 */

// ==============================================
// TIME CONSTANTS
// ==============================================
export const TIME_CONSTANTS = {
  // Cache durations
  CACHE_24_HOURS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  CACHE_1_HOUR: 60 * 60 * 1000, // 1 hour in milliseconds
  CACHE_30_MINUTES: 30 * 60 * 1000, // 30 minutes in milliseconds
  
  // Timeout durations
  API_TIMEOUT: 5000, // 5 seconds
  LONG_API_TIMEOUT: 10000, // 10 seconds
  
  // Rate limiting
  RATE_LIMIT_PER_MINUTE: 30,
  RATE_LIMIT_PER_HOUR: 1000,
} as const;

// ==============================================
// API CONFIGURATION
// ==============================================
export const API_CONFIG = {
  // Base URLs
  QUOTABLE_BASE_URL: 'https://api.quotable.io',
  ZENQUOTES_BASE_URL: 'https://zenquotes.io/api',
  PROGRAMMING_QUOTES_BASE_URL: 'https://programming-quotesapi.vercel.app/api',
  QUOTEGARDEN_BASE_URL: 'https://type.fit/api',
  FAVQS_BASE_URL: 'https://favqs.com/api',
  THEYSAIDSO_BASE_URL: 'https://quotes.rest',
  
  // Default configurations
  DEFAULT_TIMEOUT: TIME_CONSTANTS.API_TIMEOUT,
  DEFAULT_RATE_LIMIT: TIME_CONSTANTS.RATE_LIMIT_PER_MINUTE,
  DEFAULT_CACHE_DURATION: TIME_CONSTANTS.CACHE_24_HOURS,
} as const;

// ==============================================
// QUOTE CATEGORIES
// ==============================================
export const QUOTE_CATEGORIES = [
  'motivation',
  'success',
  'leadership',
  'happiness',
  'wisdom',
  'creativity',
  'advice',
  'inspiration',
  'productivity',
  'growth',
  'learning',
  'mindset',
  'positivity',
  'courage',
  'confidence',
  'peace',
  'simplicity',
  'calm',
  'discipline',
  'focus',
  'love',
  'kindness',
  'compassion',
  'purpose',
  'life',
  'resilience',
  'vision',
  'innovation',
  'gratitude',
  'mindfulness',
  'change',
  'adaptability',
  'faith',
  'hope',
] as const;

// ==============================================
// BADGE CONFIGURATION
// ==============================================
export const BADGE_CONFIG = {
  FIRST_QUOTE: {
    id: 'first-quote',
    name: 'First Quote',
    description: 'Read your first quote',
    icon: '🌟',
    maxProgress: 1,
  },
  WEEK_STREAK: {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Read quotes for 7 days in a row',
    icon: '🔥',
    maxProgress: 7,
  },
  MONTH_STREAK: {
    id: 'month-streak',
    name: 'Monthly Master',
    description: 'Read quotes for 30 days in a row',
    icon: '👑',
    maxProgress: 30,
  },
  QUOTE_COLLECTOR: {
    id: 'quote-collector',
    name: 'Quote Collector',
    description: 'Save 10 quotes',
    icon: '📚',
    maxProgress: 10,
  },
  SHARING_CHAMPION: {
    id: 'sharing-champion',
    name: 'Sharing Champion',
    description: 'Share 5 quotes',
    icon: '📤',
    maxProgress: 5,
  },
} as const;

// ==============================================
// SOURCE WEIGHTS
// ==============================================
export const SOURCE_WEIGHTS = {
  ZenQuotes: 0.25,
  Quotable: 0.2,
  FavQs: 0.15,
  'Type.fit': 0.15,
  'Stoic Quotes': 0.15,
  'Programming Quotes': 0.1,
  'They Said So': 0.0,
  DummyJSON: 0.0,
} as const;

// ==============================================
// DEFAULT USER PREFERENCES
// ==============================================
export const DEFAULT_USER_PREFERENCES = {
  theme: 'auto' as const,
  notifications: true,
  dailyReminder: true,
  categories: ['motivation', 'productivity'] as string[],
  language: 'en' as const,
};

// ==============================================
// APP CONFIGURATION
// ==============================================
export const APP_CONFIG = {
  NAME: 'Boostlly',
  VERSION: '0.1.0',
  DESCRIPTION: 'Daily motivation app - Web PWA and Chrome Extension',
  DEFAULT_USER_ID: 'default-user',
  DEFAULT_USER_NAME: 'User',
} as const;

// ==============================================
// FEATURE FLAGS
// ==============================================
export const FEATURE_FLAGS = {
  ENABLE_VOICE: true,
  ENABLE_ANALYTICS: false,
  ENABLE_SOCIAL: false,
  ENABLE_API: false,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_SW: true,
} as const;

export interface Quote {
  id: string; // stable uid
  text: string;
  author?: string;
  categories?: string[];
  source?: string; // e.g., book/site
  addedBy?: "bundle" | "user";
  // Legacy fields for backward compatibility
  category?: string;
  tags?: string[];
  isLiked?: boolean;
  isUserAdded?: boolean;
  createdAt?: Date;
}

export type Source =
  | "ZenQuotes"
  | "Quotable"
  | "FavQs"
  | "They Said So"
  | "QuoteGarden"
  | "Stoic Quotes"
  | "Programming Quotes"
  | "DummyJSON";

export interface SourceWeights {
  ZenQuotes: number;
  Quotable: number;
  FavQs: number;
  "They Said So": number;
  QuoteGarden: number;
  "Stoic Quotes": number;
  "Programming Quotes": number;
  DummyJSON: number;
}

export interface QuoteCollection {
  id: string;
  name: string;
  description?: string;
  quoteIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  // Enhanced visual organization
  color?: string; // Hex color code for collection
  icon?: string; // Icon name for collection
  category?: string; // Category type (Work, Personal, Inspiration, etc.)
  priority?: "high" | "medium" | "low"; // Priority level
  tags?: string[]; // Additional tags for filtering
  // Smart features and metadata
  metadata?: {
    reminder?: {
      type: "daily" | "weekly" | "monthly";
      time: string; // HH:MM format
      enabled: boolean;
      message?: string;
    };
    analytics?: {
      lastViewed?: Date;
      viewCount?: number;
      favoriteCount?: number;
    };
    archived?: boolean;
    archivedAt?: Date;
    [key: string]: any; // Allow for future metadata
  };
}

export interface User {
  id: string;
  name: string;
  email?: string;
  preferences: UserPreferences;
  stats: UserStats;
}

// Core Settings interface matching the specification
export interface Settings {
  themeMode: "auto" | "light" | "dark";
  fontScale: number;
  showAuthor: boolean;
  showCategories: boolean;
  showSource: boolean;
  enableBackgrounds: boolean;
  alarmTime: string | null; // 'HH:mm' local time
  soundId: string; // 'off' | preset | 'custom-*'
}

export interface UserPreferences {
  theme?: Theme;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontSize?: "small" | "medium" | "large";
  animations?: boolean;
  compactMode?: boolean;
  textToSpeech?: boolean;
  speechRate?: number;
  speechVolume?: number;
  notificationSounds?: boolean;
  soundVolume?: number;
  dataSharing?: boolean;
  analyticsEnabled?: boolean;
  profileVisibility?: "public" | "private" | "friends";
  highContrast?: boolean;
  screenReader?: boolean;
  reducedMotion?: boolean;
  pushNotifications?: boolean;
  dailyReminders?: boolean;
  achievementAlerts?: boolean;
  autoSync?: boolean;
  offlineMode?: boolean;
  cacheEnabled?: boolean;
  notifications: boolean;
  dailyReminder: boolean;
  categories: string[];
  language: string;
}

export interface UserStats {
  totalQuotes: number;
  savedQuotes: number;
  streak: number;
  lastSeen: Date;
  favoriteCategories: string[];
}

export interface QuoteServiceConfig {
  apiUrl?: string;
  cacheEnabled: boolean;
  maxCacheAge: number;
  categories: string[];
}

export interface StorageData {
  quotes: Quote[];
  user: User;
  settings: QuoteServiceConfig;
  feedback: Record<string, any>;
  collections: QuoteCollection[];
}

// New API Features

export interface SearchFilters {
  category?: string;
  author?: string;
  minLength?: number;
  maxLength?: number;
  source?: Source;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
}

// Social Ecosystem Types
export interface Comment {
  id: string;
  quoteId: string;
  userId: string;
  userName: string;
  username?: string; // Alias for userName
  content: string;
  timestamp: number;
  createdAt?: number; // Alias for timestamp
  likes: number;
  replies: Comment[];
  parentId?: string;
  edited?: boolean;
  isEdited?: boolean; // Alias for edited
  deleted?: boolean;
  userAvatar?: string;
  isLiked?: boolean;
  moderationStatus?: "pending" | "approved" | "flagged" | "rejected";
}

export interface SocialMetrics {
  totalUsers: number;
  totalComments: number;
  totalLikes: number;
  totalShares: number;
  activeUsers: number;
  dailyActiveUsers?: number; // Alias for activeUsers
  totalQuotes?: number;
  totalInteractions?: number;
  engagementRate?: number;
  weeklyGrowth?: number;
  topContributors: Array<{
    userId: string;
    userName: string;
    commentCount: number;
    likeCount: number;
  }>;
  trendingHashtags: Array<{
    tag: string;
    count: number;
    growth: number;
  }>;
  viralQuotes: Array<{
    id?: string;
    quoteId: string;
    quote?: string;
    text?: string; // Alias for quote
    author: string;
    shareCount: number;
    commentCount: number;
    tags: string[];
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  engagementBreakdown?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  userRetention?: {
    newUsers: number;
    returningUsers: number;
    churnRate: number;
  };
}

// Enhanced collection search and filtering
export interface CollectionFilters {
  category?: string;
  priority?: "high" | "medium" | "low";
  hasQuotes?: boolean;
  isDefault?: boolean;
  dateCreated?: { start: Date; end: Date };
  quoteCount?: { min: number; max: number };
  tags?: string[];
  search?: string; // Search in name, description, and tags
}

export interface QuoteSearchFilters {
  author?: string;
  content?: string; // Search in quote text
  tags?: string[];
  dateAdded?: { start: Date; end: Date };
  isLiked?: boolean;
  length?: { min: number; max: number };
}

// Collection categories and icons
export const COLLECTION_CATEGORIES = [
  "Work",
  "Personal",
  "Inspiration",
  "Motivation",
  "Wisdom",
  "Creativity",
  "Leadership",
  "Success",
  "Health",
  "Relationships",
  "Learning",
  "Spirituality",
] as const;

export const COLLECTION_ICONS = [
  "folder",
  "heart",
  "star",
  "bookmark",
  "lightbulb",
  "target",
  "trophy",
  "crown",
  "zap",
  "sparkles",
  "gem",
  "diamond",
  "fire",
  "leaf",
  "mountain",
  "ocean",
  "sun",
  "moon",
  "rocket",
  "compass",
] as const;

export const COLLECTION_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F43F5E", // Rose
] as const;

export interface BulkQuoteOptions {
  count: number;
  sources?: Source[];
  categories?: string[];
  filters?: SearchFilters;
  includeLocal?: boolean;
}

export interface QuoteAnalytics {
  totalQuotes: number;
  sourceDistribution: Record<Source, number>;
  categoryDistribution: Record<string, number>;
  averageRating: number;
  mostLikedQuotes: Quote[];
  recentlyViewed: Quote[];
  searchHistory: string[];
}

export interface APIHealthStatus {
  source: Source;
  status: "healthy" | "degraded" | "down";
  responseTime: number;
  successRate: number;
  lastCheck: number;
  errorCount: number;
}

export interface QuoteSearchResult {
  quotes: Quote[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  sources: Source[];
  searchTime: number;
}

export interface QuoteRecommendation {
  quote: Quote;
  score: number;
  reason: string;
  similarQuotes: Quote[];
}

// Theme types
export type Theme = "light" | "dark" | "auto";

export interface DynamicTheme {
  isDark: boolean;
  accent: string;
  brightness: number;
  dominantColor: string;
  isAnalyzing: boolean;
}

// Article types for blog functionality
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: Date;
  updatedAt?: Date;
  category: string;
  tags: string[];
  featured: boolean;
  slug: string;
  readingTime: number; // in minutes
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  articleCount: number;
}

// Email subscription types
export interface EmailSubscription {
  id: string;
  email: string;
  subscribedAt: Date;
  preferences: EmailPreferences;
  status: 'active' | 'unsubscribed' | 'bounced';
  lastSent?: Date;
  unsubscribeToken: string;
}

export interface EmailPreferences {
  frequency: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  timezone: string;
  format: 'html' | 'text';
  includeArticles: boolean;
  includeTips: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  scheduledAt: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: string[];
  sentCount: number;
  openCount: number;
  clickCount: number;
}

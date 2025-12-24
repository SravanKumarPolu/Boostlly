"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  QuoteService, 
  getContrastRatio, 
  ensureContrast, 
  ContrastLevel, 
  getLuminance, 
  UserAnalyticsService,
  updateGentleStreak,
  getWeeklyRecap,
  getStreakMessage,
  createGentleStreakData,
  type GentleStreakData,
  type WeeklyRecap as WeeklyRecapType,
} from "@boostlly/core";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@boostlly/ui";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Search,
  Heart,
  Eye,
  Zap,
  Database,
  RefreshCw,
  Calendar,
  Tag,
  Home,
  Volume2,
  Flame,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { StorageLike } from "../unified-app/types";
import type { Quote, QuoteAnalytics, Source, APIHealthStatus } from "@boostlly/core";
import { StatAreaChart, StatBarChart, StatPieChart } from "./ChartComponents";
import { WeeklyRecap } from "../weekly-recap/WeeklyRecap";

interface StatisticsProps {
  storage: StorageLike | null;
  variant?: "web" | "popup" | "mobile";
  palette?: {
    bg?: string;
    fg?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    muted?: string;
  };
}

interface StatsData {
  analytics: QuoteAnalytics;
  performanceMetrics: Record<
    Source,
    { totalCalls: number; successCalls: number; avgResponseTime: number }
  >;
  healthStatus: APIHealthStatus[];
  savedQuotes: any[];
  quoteHistory: any[];
}

// Modern color palette for charts
const CHART_COLORS = [
  "#7C3AED", // Purple
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#8B5CF6", // Violet
  "#F97316", // Orange
  "#14B8A6", // Teal
];

const COLORS = {
  primary: "#7C3AED",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

// Tab button component with proper contrast and hover states
interface TabButtonProps {
  isActive: boolean;
  label: string;
  icon: LucideIcon;
  activeText: string;
  inactiveText: string;
  hoverText: string;
  activeBorder: string;
  inactiveBorder: string;
  onClick: () => void;
}

function TabButton({
  isActive,
  label,
  icon: Icon,
  activeText,
  inactiveText,
  hoverText,
  activeBorder,
  inactiveBorder,
  onClick,
}: TabButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const textColor = isActive 
    ? activeText 
    : (isHovered ? hoverText : inactiveText);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-2 px-4 py-3 border-b-2 transition-all font-medium rounded-t-lg relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      style={{
        color: textColor,
        borderBottomColor: isActive ? activeBorder : inactiveBorder,
        borderBottomWidth: isActive ? "3px" : "2px",
        fontWeight: isActive ? "600" : "500",
      }}
      aria-current={isActive ? "page" : undefined}
      aria-label={`${label} tab${isActive ? " (active)" : ""}`}
    >
      <Icon 
        className="w-4 h-4 flex-shrink-0 transition-colors duration-200" 
        strokeWidth={isActive ? 2.5 : 2}
        style={{ 
          color: textColor 
        }}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export function Statistics({ storage, variant = "web", palette }: StatisticsProps) {
  const [quoteService, setQuoteService] = useState<QuoteService | null>(null);
  const [userAnalyticsService, setUserAnalyticsService] = useState<UserAnalyticsService | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<{
    homepageVisits: Array<{ date: string; visits: number }>;
    readButtonClicks: Array<{ date: string; clicks: number }>;
    summary: {
      totalHomepageVisits: number;
      totalReadButtonClicks: number;
      todayHomepageVisits: number;
      todayReadButtonClicks: number;
      averageDailyVisits: number;
      averageDailyClicks: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [activeView, setActiveView] = useState<"overview" | "sources" | "performance" | "engagement" | "user">("overview");
  const [gentleStreakData, setGentleStreakData] = useState<GentleStreakData | null>(null);
  const [weeklyRecap, setWeeklyRecap] = useState<WeeklyRecapType | null>(null);
  const [showWeeklyRecap, setShowWeeklyRecap] = useState(false);

  useEffect(() => {
    if (!storage) {
      setIsLoading(false);
      return;
    }

    try {
      // QuoteService expects StorageService, but we have StorageLike
      // Cast it as any since the interface is compatible for our use case
      const service = new QuoteService(storage as any);
      setQuoteService(service);
      
      // Initialize UserAnalyticsService - always try to initialize even if it might fail
      try {
        const analyticsService = new UserAnalyticsService(storage as any);
        setUserAnalyticsService(analyticsService);
      } catch (analyticsError) {
        console.error("Failed to initialize UserAnalyticsService:", analyticsError);
        // Continue without analytics service - tab will still be visible but show empty state
      }
    } catch (error) {
      console.error("Failed to initialize QuoteService:", error);
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    if (!quoteService || !storage) return;

    const loadStats = async () => {
      setIsLoading(true);
      try {
        let analytics = quoteService.getAnalytics();
        const performanceMetrics = quoteService.getPerformanceMetrics();
        const healthStatus = quoteService.getHealthStatus();
        
        // Get saved quotes and quote history
        const savedQuotes = (await storage.get("savedQuotes")) || [];
        
        // Try to get quote history - use getSync if available, otherwise use async get
        let quoteHistory: any[] = [];
        try {
          if (typeof (storage as any).getSync === 'function') {
            quoteHistory = (storage as any).getSync("quoteHistory") || [];
          } else {
            quoteHistory = (await storage.get("quoteHistory")) || [];
          }
        } catch (err) {
          // Fallback to empty array if history can't be loaded
          quoteHistory = [];
        }

        // If analytics source distribution is empty, try to populate from quote history and saved quotes
        const hasSourceData = analytics.sourceDistribution && 
          Object.values(analytics.sourceDistribution).some((v: any) => v > 0);
        
        if (!hasSourceData && (quoteHistory.length > 0 || (Array.isArray(savedQuotes) && savedQuotes.length > 0))) {
          // Create a temporary source distribution map
          const tempSourceDist: Record<string, number> = { ...(analytics.sourceDistribution || {}) };
          
          // Count sources from quote history
          if (Array.isArray(quoteHistory)) {
            quoteHistory.forEach((quote: any) => {
              if (quote && quote.source && typeof quote.source === 'string') {
                const source = quote.source;
                tempSourceDist[source] = (tempSourceDist[source] || 0) + 1;
              }
            });
          }
          
          // Count sources from saved quotes
          if (Array.isArray(savedQuotes)) {
            savedQuotes.forEach((quote: any) => {
              if (quote && quote.source && typeof quote.source === 'string') {
                const source = quote.source;
                tempSourceDist[source] = (tempSourceDist[source] || 0) + 1;
              }
            });
          }
          
          // If we found sources, update analytics and persist to storage
          if (Object.values(tempSourceDist).some(v => v > 0)) {
            analytics = {
              ...analytics,
              sourceDistribution: tempSourceDist as Record<Source, number>,
            };
            
            // Persist the updated analytics to storage so it's available for future loads
            try {
              if (typeof (storage as any).setSync === 'function') {
                (storage as any).setSync("quoteAnalytics", analytics);
              } else {
                await storage.set("quoteAnalytics", analytics);
              }
              console.log("✅ Populated source distribution from quote history and saved quotes");
            } catch (error) {
              console.warn("⚠️ Failed to persist populated analytics:", error);
            }
          }
        }

        // Enhance analytics with fallback data for engagement metrics
        let enhancedAnalytics = { ...analytics };
        
        // Helper function to extract quote data from various formats
        const extractQuoteData = (q: any): Quote | null => {
          const text = q.text || q.quote || q.content || '';
          const author = q.author || q.authorName || 'Unknown';
          const category = q.category || q.tag || q.tags?.[0];
          const source = q.source || q.provider || 'Unknown';
          const id = q.id || q._id || Math.random().toString(36).slice(2, 10);
          
          if (!text || text.trim() === '') return null;
          
          return {
            id,
            text: text.trim(),
            author: author.trim() || undefined,
            category: category || undefined,
            categories: category ? [category] : undefined,
            source: source || undefined,
          };
        };
        
        // If mostLikedQuotes is empty, try to populate from saved quotes and liked quotes
        if ((!enhancedAnalytics.mostLikedQuotes || enhancedAnalytics.mostLikedQuotes.length === 0)) {
          const likedQuotesList: any[] = [];
          
          // Try to get liked quotes from storage
          try {
            let likedQuotes: any[] = [];
            if (typeof (storage as any).getSync === 'function') {
              likedQuotes = (storage as any).getSync("likedQuotes") || [];
            } else {
              likedQuotes = (await storage.get("likedQuotes")) || [];
            }
            if (Array.isArray(likedQuotes) && likedQuotes.length > 0) {
              likedQuotesList.push(...likedQuotes);
            }
          } catch (err) {
            // Ignore errors
          }
          
          // Also check saved quotes (assuming saved = liked)
          if (Array.isArray(savedQuotes) && savedQuotes.length > 0) {
            likedQuotesList.push(...savedQuotes);
          }
          
          if (likedQuotesList.length > 0) {
            const extracted = likedQuotesList
              .map(extractQuoteData)
              .filter((q): q is Quote => q !== null)
              .slice(0, 10);
            
            if (extracted.length > 0) {
              enhancedAnalytics.mostLikedQuotes = extracted;
              if (process.env.NODE_ENV === "development") {
                console.log("✅ Populated mostLikedQuotes from saved/liked quotes:", extracted.length);
              }
            }
          }
        }
        
        // If recentlyViewed is empty, try to populate from quote history (most recent)
        if ((!enhancedAnalytics.recentlyViewed || enhancedAnalytics.recentlyViewed.length === 0)) {
          const viewedQuotesList: any[] = [];
          
          // Check quote history
          if (Array.isArray(quoteHistory) && quoteHistory.length > 0) {
            viewedQuotesList.push(...quoteHistory);
          }
          
          // Also check saved quotes as recently viewed (reverse order for most recent first)
          if (Array.isArray(savedQuotes) && savedQuotes.length > 0) {
            // Sort by timestamp if available, otherwise use reverse order
            const sorted = [...savedQuotes].sort((a: any, b: any) => {
              const aTs = a._ts || a.createdAt || a.timestamp || 0;
              const bTs = b._ts || b.createdAt || b.timestamp || 0;
              return bTs - aTs;
            });
            viewedQuotesList.push(...sorted);
          }
          
          if (viewedQuotesList.length > 0) {
            // Remove duplicates by id or text, and sort by timestamp
            const uniqueQuotes = new Map();
            viewedQuotesList.forEach((q: any) => {
              const extracted = extractQuoteData(q);
              if (extracted) {
                const key = extracted.id || extracted.text;
                if (!uniqueQuotes.has(key)) {
                  uniqueQuotes.set(key, extracted);
                }
              }
            });
            
            const extracted = Array.from(uniqueQuotes.values())
              .slice(0, 10);
            
            if (extracted.length > 0) {
              enhancedAnalytics.recentlyViewed = extracted;
              if (process.env.NODE_ENV === "development") {
                console.log("✅ Populated recentlyViewed from quote history/saved quotes:", extracted.length);
              }
            }
          }
        }

        setStatsData({
          analytics: enhancedAnalytics,
          performanceMetrics,
          healthStatus,
          savedQuotes: Array.isArray(savedQuotes) ? savedQuotes : [],
          quoteHistory: Array.isArray(quoteHistory) ? quoteHistory : [],
        });

        // Load user analytics data if service is available
        if (userAnalyticsService) {
          try {
            console.log("📊 Loading user analytics data...");
            const [chartData, summary] = await Promise.all([
              userAnalyticsService.getDailyChartData(timeRange),
              userAnalyticsService.getSummary(),
            ]);
            
            console.log("📊 User analytics loaded:", { summary, chartDataLength: chartData.homepageVisits.length });
            
            setUserAnalytics({
              homepageVisits: chartData.homepageVisits,
              readButtonClicks: chartData.readButtonClicks,
              summary,
            });
          } catch (error) {
            console.error("❌ Failed to load user analytics:", error);
            setUserAnalytics({
              homepageVisits: [],
              readButtonClicks: [],
              summary: {
                totalHomepageVisits: 0,
                totalReadButtonClicks: 0,
                todayHomepageVisits: 0,
                todayReadButtonClicks: 0,
                averageDailyVisits: 0,
                averageDailyClicks: 0,
              },
            });
          }
        } else {
          console.log("⚠️ UserAnalyticsService not available, showing empty state");
          // Set empty data if service not available - tab will still be visible
          setUserAnalytics({
            homepageVisits: [],
            readButtonClicks: [],
            summary: {
              totalHomepageVisits: 0,
              totalReadButtonClicks: 0,
              todayHomepageVisits: 0,
              todayReadButtonClicks: 0,
              averageDailyVisits: 0,
              averageDailyClicks: 0,
            },
          });
        }
      } catch (error) {
        console.error("Failed to load statistics:", error);
        // Set empty data on error to prevent crashes
        setStatsData({
          analytics: {
            totalQuotes: 0,
            sourceDistribution: {} as Record<Source, number>,
            categoryDistribution: {},
            averageRating: 0,
            mostLikedQuotes: [],
            recentlyViewed: [],
            searchHistory: [],
          },
          performanceMetrics: {} as Record<Source, { totalCalls: number; successCalls: number; avgResponseTime: number }>,
          healthStatus: [],
          savedQuotes: [],
          quoteHistory: [],
        });
        setUserAnalytics({
          homepageVisits: [],
          readButtonClicks: [],
          summary: {
            totalHomepageVisits: 0,
            totalReadButtonClicks: 0,
            todayHomepageVisits: 0,
            todayReadButtonClicks: 0,
            averageDailyVisits: 0,
            averageDailyClicks: 0,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [quoteService, storage, userAnalyticsService, timeRange]);

  const chartData = useMemo(() => {
    if (!statsData) {
      return {
        sourceDistribution: [],
        categoryDistribution: [],
        performanceData: [],
        dailyActivity: [],
        searchHistory: [],
      };
    }

    // Source distribution data for pie chart
    // First try from analytics, then fallback to quote history
    let sourceDistributionMap: Record<string, number> = { ...(statsData.analytics.sourceDistribution || {}) };
    
    // If analytics is empty, try to populate from quote history
    const hasSourceData = Object.values(sourceDistributionMap).some(v => v > 0);
    if (!hasSourceData && statsData.quoteHistory && Array.isArray(statsData.quoteHistory) && statsData.quoteHistory.length > 0) {
      // Count sources from quote history
      statsData.quoteHistory.forEach((quote: any) => {
        if (quote && quote.source) {
          const source = quote.source as string;
          sourceDistributionMap[source] = (sourceDistributionMap[source] || 0) + 1;
        }
      });
    }
    
    // Also check saved quotes as a fallback
    if (!hasSourceData && statsData.savedQuotes && Array.isArray(statsData.savedQuotes) && statsData.savedQuotes.length > 0) {
      statsData.savedQuotes.forEach((quote: any) => {
        if (quote && quote.source) {
          const source = quote.source as string;
          sourceDistributionMap[source] = (sourceDistributionMap[source] || 0) + 1;
        }
      });
    }
    
    const sourceDistEntries = Object.entries(sourceDistributionMap)
      .filter(([_, value]) => value > 0);
    const sourceDistribution = sourceDistEntries.map(([name, value], index) => ({
      name: name.replace(/([A-Z])/g, " $1").trim(),
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

    // Category distribution data for bar chart
    // First try from analytics, then fallback to quote history and saved quotes
    let categoryDistributionMap: Record<string, number> = { ...(statsData.analytics.categoryDistribution || {}) };
    
    // If analytics is empty, try to populate from quote history and saved quotes
    const hasCategoryData = Object.values(categoryDistributionMap).some(v => v > 0);
    if (!hasCategoryData) {
      // Count categories from quote history
      if (statsData.quoteHistory && Array.isArray(statsData.quoteHistory)) {
        statsData.quoteHistory.forEach((quote: any) => {
          if (quote && quote.category && typeof quote.category === 'string') {
            const category = quote.category;
            categoryDistributionMap[category] = (categoryDistributionMap[category] || 0) + 1;
          }
        });
      }
      
      // Count categories from saved quotes
      if (statsData.savedQuotes && Array.isArray(statsData.savedQuotes)) {
        statsData.savedQuotes.forEach((quote: any) => {
          if (quote && quote.category && typeof quote.category === 'string') {
            const category = quote.category;
            categoryDistributionMap[category] = (categoryDistributionMap[category] || 0) + 1;
          }
        });
      }
    }
    
    const categoryDistribution = Object.entries(categoryDistributionMap)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value,
        fullName: name,
      }));

    // Performance metrics data
    const performanceData = Object.entries(statsData.performanceMetrics || {})
      .filter(([_, metrics]) => metrics && metrics.totalCalls > 0)
      .map(([source, metrics]) => ({
        name: source.replace(/([A-Z])/g, " $1").trim(),
        successRate: metrics.totalCalls > 0 
          ? Math.round((metrics.successCalls / metrics.totalCalls) * 100) 
          : 0,
        avgResponseTime: Math.round(metrics.avgResponseTime || 0),
        totalCalls: metrics.totalCalls,
      }));

    // Daily activity from quote history, saved quotes, and analytics
    const dailyActivityMap = new Map<string, number>();
    const now = new Date();
    const daysToShow = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    
    // Process quote history
    if (statsData.quoteHistory && Array.isArray(statsData.quoteHistory)) {
      statsData.quoteHistory.forEach((entry: any) => {
        if (entry) {
          let entryDate: Date | null = null;
          
          // Try different date field formats
          if (entry.date) {
            entryDate = new Date(entry.date);
          } else if (entry.createdAt) {
            entryDate = new Date(entry.createdAt);
          } else if (entry._ts) {
            entryDate = new Date(entry._ts);
          } else if (entry.timestamp) {
            entryDate = new Date(entry.timestamp);
          }
          
          if (entryDate && !isNaN(entryDate.getTime())) {
            const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 0 && daysDiff < daysToShow) {
              const dateKey = entryDate.toISOString().split("T")[0];
              dailyActivityMap.set(dateKey, (dailyActivityMap.get(dateKey) || 0) + 1);
            }
          }
        }
      });
    }
    
    // Also process saved quotes if they have timestamps
    if (statsData.savedQuotes && Array.isArray(statsData.savedQuotes)) {
      statsData.savedQuotes.forEach((quote: any) => {
        if (quote) {
          let entryDate: Date | null = null;
          
          // Try different date field formats
          if (quote._ts) {
            entryDate = new Date(quote._ts);
          } else if (quote.createdAt) {
            entryDate = new Date(quote.createdAt);
          } else if (quote.date) {
            entryDate = new Date(quote.date);
          } else if (quote.timestamp) {
            entryDate = new Date(quote.timestamp);
          }
          
          if (entryDate && !isNaN(entryDate.getTime())) {
            const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 0 && daysDiff < daysToShow) {
              const dateKey = entryDate.toISOString().split("T")[0];
              dailyActivityMap.set(dateKey, (dailyActivityMap.get(dateKey) || 0) + 1);
            }
          }
        }
      });
    }

    // Fill in missing dates with 0
    const dailyActivity: { date: string; quotes: number }[] = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      dailyActivity.push({
        date: dateKey,
        quotes: dailyActivityMap.get(dateKey) || 0,
      });
    }

    // Search history data
    const searchHistory = (statsData.analytics.searchHistory || []).slice(0, 10);

    return {
      sourceDistribution,
      categoryDistribution,
      performanceData,
      dailyActivity,
      searchHistory,
    };
  }, [statsData, timeRange]);

  const summaryStats = useMemo(() => {
    if (!statsData) return null;

    const totalQuotes = statsData.analytics.totalQuotes || statsData.savedQuotes.length || 0;
    const totalSources = Object.values(statsData.analytics.sourceDistribution || {}).filter(v => v > 0).length;
    const totalCategories = Object.keys(statsData.analytics.categoryDistribution || {}).length;
    const totalSearches = (statsData.analytics.searchHistory || []).length;
    const mostLikedCount = statsData.analytics.mostLikedQuotes?.length || 0;
    const recentlyViewedCount = statsData.analytics.recentlyViewed?.length || 0;

    // Use gentle streak data if available, otherwise calculate from quote history
    let streak = 0;
    let longestStreak = 0;
    
    if (gentleStreakData) {
      // Use gentle streak (with grace period)
      streak = gentleStreakData.currentStreak;
      longestStreak = gentleStreakData.longestStreak;
    } else {
      // Fallback: Calculate streak from quote history (harsh - no grace period)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];
      const hasQuote = statsData.quoteHistory.some((entry: any) => 
        entry.date === dateKey
      );
      if (hasQuote && (i === 0 || streak > 0)) {
        streak++;
      } else if (i > 0) {
        break;
      }
      }
      longestStreak = streak;
    }

    // Calculate average response time
    const performanceMetricsEntries = Object.values(statsData.performanceMetrics || {})
      .filter(m => m && m.totalCalls > 0);
    const avgResponseTime = performanceMetricsEntries.length > 0
      ? performanceMetricsEntries.reduce((sum, m) => sum + (m.avgResponseTime || 0), 0) / performanceMetricsEntries.length
      : 0;

    return {
      totalQuotes,
      totalSources,
      totalCategories,
      totalSearches,
      mostLikedCount,
      recentlyViewedCount,
      streak,
      longestStreak,
      avgResponseTime: Math.round(avgResponseTime),
    };
  }, [statsData, gentleStreakData]);

  // Calculate contrast-adjusted colors for tabs
  // IMPORTANT: This hook must be called before any conditional returns to follow Rules of Hooks
  // The tab container has a backdrop that adapts to the background image
  // We calculate contrast against the backdrop color (dark for dark bg, light for light bg)
  const tabColors = useMemo(() => {
    if (!palette?.bg) {
      // Fallback: use high-contrast colors that work on light backgrounds
      return {
        activeText: COLORS.primary,
        inactiveText: "#374151", // Dark gray with excellent contrast on light
        hoverText: "#1F2937", // Darker for hover
        activeBorder: COLORS.primary,
        inactiveBorder: "transparent",
        activeContrast: 4.5,
        inactiveContrast: 12.0,
      };
    }

    const bgColor = palette.bg;
    const bgLuminance = getLuminance(bgColor);
    const isDarkBg = bgLuminance < 0.5;
    
    // Tab backdrop color: dark overlay for dark backgrounds, light overlay for light backgrounds
    // This ensures tabs have a consistent, high-contrast background
    const tabBackdropColor = isDarkBg ? "#1F2937" : "#FFFFFF"; // Dark gray or white
    
    // Active tab: use primary/accent color with excellent contrast
    let activeText = palette?.primary || palette?.accent || COLORS.primary;
    let activeContrast = getContrastRatio(activeText, tabBackdropColor);
    
    // Ensure active tab meets WCAG AA normal text (4.5:1) - prefer even higher for visibility
    if (activeContrast < ContrastLevel.AA_NORMAL) {
      const { fg: adjustedActive } = ensureContrast(
        activeText, 
        tabBackdropColor, 
        ContrastLevel.AA_NORMAL,
        true
      );
      activeText = adjustedActive;
      activeContrast = getContrastRatio(activeText, tabBackdropColor);
    }
    
    // Inactive tabs: high contrast color that's clearly visible and distinguishable
    // Must meet WCAG AA for UI components (3:1), prefer 4.5:1 for better visibility
    let inactiveText: string;
    
    if (isDarkBg) {
      // Dark backdrop: use light gray for excellent contrast
      inactiveText = "#D1D5DB"; // Light gray
      let inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      
      // Ensure it meets minimum (should easily meet 4.5:1)
      if (inactiveContrast < ContrastLevel.AA_NORMAL) {
        const { fg: adjustedInactive } = ensureContrast(
          inactiveText,
          tabBackdropColor,
          ContrastLevel.AA_NORMAL,
          true
        );
        inactiveText = adjustedInactive;
        inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      }
    } else {
      // Light backdrop: use dark gray for excellent contrast
      inactiveText = "#4B5563"; // Dark gray
      let inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      
      // Ensure it meets minimum (should easily meet 4.5:1)
      if (inactiveContrast < ContrastLevel.AA_NORMAL) {
        const { fg: adjustedInactive } = ensureContrast(
          inactiveText,
          tabBackdropColor,
          ContrastLevel.AA_NORMAL,
          true
        );
        inactiveText = adjustedInactive;
        inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      }
    }
    
    // Hover state: provide clear visual feedback
    let hoverText: string;
    if (isDarkBg) {
      hoverText = "#F3F4F6"; // Very light gray for dark backdrop
    } else {
      hoverText = "#1F2937"; // Very dark gray for light backdrop
    }
    
    // Verify hover contrast meets minimum
    const hoverContrast = getContrastRatio(hoverText, tabBackdropColor);
    if (hoverContrast < ContrastLevel.AA_LARGE) {
      hoverText = inactiveText; // Fallback to inactive if contrast insufficient
    }
    
    // Final verification
    const finalActiveContrast = getContrastRatio(activeText, tabBackdropColor);
    const finalInactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
    const finalHoverContrast = getContrastRatio(hoverText, tabBackdropColor);
    
    return {
      activeText,
      inactiveText,
      hoverText,
      activeBorder: activeText,
      inactiveBorder: "transparent",
      activeContrast: finalActiveContrast,
      inactiveContrast: finalInactiveContrast,
    };
  }, [palette]);

  // Now we can safely check loading and data states after all hooks are called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-foreground/80 font-medium">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-foreground/80 font-semibold text-lg">No statistics data available.</p>
          <p className="text-sm text-foreground/60 font-medium">
            Start using the app to see your statistics here.
          </p>
        </div>
      </div>
    );
  }

  const isCompact = variant === "popup" || variant === "mobile";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 
            className={`${isCompact ? "text-xl" : "text-3xl"} font-bold mb-2 text-foreground`}
            style={palette?.fg ? { color: palette.fg } : undefined}
          >
            Statistics & Analytics
          </h2>
          <p className="text-foreground/70 text-sm font-medium">
            Insights into your quote journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (quoteService && storage && userAnalyticsService) {
                setIsLoading(true);
                try {
                  // Reload stats data
                  const analytics = quoteService.getAnalytics();
                  const performanceMetrics = quoteService.getPerformanceMetrics();
                  const healthStatus = quoteService.getHealthStatus();
                  const savedQuotes = (await storage.get("savedQuotes")) || [];
                  
                  let quoteHistory: any[] = [];
                  try {
                    if (typeof (storage as any).getSync === 'function') {
                      quoteHistory = (storage as any).getSync("quoteHistory") || [];
                    } else {
                      quoteHistory = (await storage.get("quoteHistory")) || [];
                    }
                  } catch (err) {
                    quoteHistory = [];
                  }

                  setStatsData({
                    analytics,
                    performanceMetrics,
                    healthStatus,
                    savedQuotes: Array.isArray(savedQuotes) ? savedQuotes : [],
                    quoteHistory: Array.isArray(quoteHistory) ? quoteHistory : [],
                  });

                  // Reload user analytics
                  try {
                    const [chartData, summary] = await Promise.all([
                      userAnalyticsService.getDailyChartData(timeRange),
                      userAnalyticsService.getSummary(),
                    ]);
                    
                    setUserAnalytics({
                      homepageVisits: chartData.homepageVisits,
                      readButtonClicks: chartData.readButtonClicks,
                      summary,
                    });
                  } catch (error) {
                    console.error("Failed to reload user analytics:", error);
                  }
                } catch (error) {
                  console.error("Failed to refresh statistics:", error);
                } finally {
                  setIsLoading(false);
                }
              }
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Total Quotes</p>
                  <p className="text-3xl font-bold text-foreground">{summaryStats.totalQuotes}</p>
                </div>
                <Database 
                  className="w-10 h-10 flex-shrink-0" 
                  style={{ color: COLORS.primary }}
                  strokeWidth={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Streak</p>
                  <p className="text-3xl font-bold text-foreground">{summaryStats.streak} days</p>
                  {gentleStreakData && gentleStreakData.gracePeriodUsed && (
                    <p className="text-xs text-foreground/60 mt-1">✨ Grace period used</p>
                  )}
                  {summaryStats.longestStreak > summaryStats.streak && (
                    <p className="text-xs text-foreground/60 mt-1">Best: {summaryStats.longestStreak} days</p>
                  )}
                </div>
                <Flame 
                  className="w-10 h-10 flex-shrink-0" 
                  style={{ color: COLORS.secondary }}
                  strokeWidth={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Categories</p>
                  <p className="text-3xl font-bold text-foreground">{summaryStats.totalCategories}</p>
                </div>
                <Tag 
                  className="w-10 h-10 flex-shrink-0" 
                  style={{ color: COLORS.accent }}
                  strokeWidth={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Searches</p>
                  <p className="text-3xl font-bold text-foreground">{summaryStats.totalSearches}</p>
                </div>
                <Search 
                  className="w-10 h-10 flex-shrink-0" 
                  style={{ color: COLORS.info }}
                  strokeWidth={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Tabs - WCAG AA compliant with proper contrast */}
      <div 
        className="flex flex-wrap gap-2 border-b -mx-4 md:-mx-6 px-4 md:px-6 pt-2"
        style={{
          // Create a high-contrast backdrop for tabs
          // Use a darker/lighter overlay based on background luminance to ensure text visibility
          backgroundColor: palette?.bg 
            ? (() => {
                const bgLum = getLuminance(palette.bg);
                // For dark backgrounds, use a darker overlay; for light, use lighter
                // This ensures the backdrop provides good contrast for tab text
                if (bgLum < 0.5) {
                  // Dark background: use dark overlay with high opacity
                  return `rgba(0, 0, 0, 0.7)`;
                } else {
                  // Light background: use light overlay with high opacity
                  return `rgba(255, 255, 255, 0.85)`;
                }
              })()
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderColor: palette?.bg 
            ? (() => {
                const bgLum = getLuminance(palette.bg);
                return bgLum < 0.5 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
              })()
            : 'rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "user", label: "User Activity", icon: Activity },
          { id: "sources", label: "Sources", icon: Database },
          { id: "performance", label: "Performance", icon: Zap },
          { id: "engagement", label: "Engagement", icon: Heart },
        ].map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <TabButton
              key={id}
              isActive={isActive}
              label={label}
              icon={Icon}
              activeText={tabColors.activeText}
              inactiveText={tabColors.inactiveText}
              hoverText={tabColors.hoverText}
              activeBorder={tabColors.activeBorder}
              inactiveBorder={tabColors.inactiveBorder}
              onClick={() => setActiveView(id as any)}
            />
          );
        })}
      </div>

      {/* Weekly Recap Card */}
      {weeklyRecap && activeView === "overview" && (
        <Card className="border-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.primary }} />
                <span className="font-semibold">Weekly Recap</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWeeklyRecap(!showWeeklyRecap)}
              >
                {showWeeklyRecap ? "Hide" : "View Full Recap"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showWeeklyRecap ? (
              <WeeklyRecap storage={storage} onClose={() => setShowWeeklyRecap(false)} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-card/50 border border-border/50">
                  <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{weeklyRecap.daysActive}</div>
                  <div className="text-xs text-muted-foreground">Days Active</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50 border border-border/50">
                  <Flame className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{weeklyRecap.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50 border border-border/50">
                  <Heart className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{weeklyRecap.quotesSaved}</div>
                  <div className="text-xs text-muted-foreground">Quotes Saved</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50 border border-border/50">
                  <Eye className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{weeklyRecap.quotesViewed}</div>
                  <div className="text-xs text-muted-foreground">Quotes Viewed</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts Content */}
      <div className="space-y-6">
        {activeView === "overview" && (
          <>
            {/* Daily Activity Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.primary }} />
                  <span className="font-semibold">Daily Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.dailyActivity.length > 0 && chartData.dailyActivity.some(d => d.quotes > 0) ? (
                  <StatAreaChart
                    data={chartData.dailyActivity}
                    dataKey="quotes"
                    color={COLORS.primary}
                    height={isCompact ? 250 : 300}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-foreground/60">
                    <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">Daily Activity</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center max-w-md">
                      This feature is currently in beta and will be updated in a future release.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution Bar Chart */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.secondary }} />
                    <span className="font-semibold">Top Categories</span>
                  </CardTitle>
                  <p className="text-sm text-foreground/70 font-normal">
                    Shows the most popular quote categories based on your saved quotes and viewing history. Categories like "motivation", "success", "wisdom", etc.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.categoryDistribution.length > 0 ? (
                  <StatBarChart
                    data={chartData.categoryDistribution}
                    dataKey="value"
                    color={COLORS.secondary}
                    height={isCompact ? 250 : 300}
                    layout="vertical"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-foreground/60">
                    <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">Top Categories</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center max-w-md">
                      This feature is currently in beta and will be updated in a future release.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Source Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.info }} />
                  <span className="font-semibold">Source Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.sourceDistribution.length > 0 ? (
                  <StatPieChart
                    data={chartData.sourceDistribution}
                    height={isCompact ? 250 : 300}
                    outerRadius={isCompact ? 80 : 100}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-foreground/60">
                    <Activity className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">Source Distribution</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center max-w-md">
                      This feature is currently in beta and will be updated in a future release.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeView === "user" && (
          <>
            {!userAnalytics ? (
              <Card>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[400px] text-foreground/60">
                    <Activity className="w-16 h-16 mb-4 opacity-50 animate-pulse" />
                    <p className="font-medium text-lg mb-2">Loading user activity data...</p>
                    <p className="text-sm text-foreground/50">Please wait while we load your analytics.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Cards for User Activity */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Homepage Visits</p>
                      <p className="text-3xl font-bold text-foreground">{userAnalytics.summary.totalHomepageVisits}</p>
                      <p className="text-xs text-foreground/60 mt-1">Today: {userAnalytics.summary.todayHomepageVisits}</p>
                    </div>
                    <Home 
                      className="w-10 h-10 flex-shrink-0" 
                      style={{ color: COLORS.primary }}
                      strokeWidth={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Read Clicks</p>
                      <p className="text-3xl font-bold text-foreground">{userAnalytics.summary.totalReadButtonClicks}</p>
                      <p className="text-xs text-foreground/60 mt-1">Today: {userAnalytics.summary.todayReadButtonClicks}</p>
                    </div>
                    <Volume2 
                      className="w-10 h-10 flex-shrink-0" 
                      style={{ color: COLORS.secondary }}
                      strokeWidth={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Avg Daily Visits</p>
                      <p className="text-3xl font-bold text-foreground">{userAnalytics.summary.averageDailyVisits}</p>
                      <p className="text-xs text-foreground/60 mt-1">Last 30 days</p>
                    </div>
                    <TrendingUp 
                      className="w-10 h-10 flex-shrink-0" 
                      style={{ color: COLORS.accent }}
                      strokeWidth={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wide">Avg Daily Clicks</p>
                      <p className="text-3xl font-bold text-foreground">{userAnalytics.summary.averageDailyClicks}</p>
                      <p className="text-xs text-foreground/60 mt-1">Last 30 days</p>
                    </div>
                    <Activity 
                      className="w-10 h-10 flex-shrink-0" 
                      style={{ color: COLORS.info }}
                      strokeWidth={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Homepage Visits Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Home className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.primary }} />
                  <span className="font-semibold">Homepage Visits Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userAnalytics && userAnalytics.homepageVisits && userAnalytics.homepageVisits.some(d => d.visits > 0) ? (
                  <StatAreaChart
                    data={userAnalytics.homepageVisits.map(d => ({ date: d.date, visits: d.visits }))}
                    dataKey="visits"
                    color={COLORS.primary}
                    height={isCompact ? 250 : 300}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-foreground/60">
                    <Home className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">No homepage visit data available</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center">Visit the homepage (Today tab) to start tracking your visits!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Read Button Clicks Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Volume2 className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.secondary }} />
                  <span className="font-semibold">Read Button Clicks Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userAnalytics && userAnalytics.readButtonClicks && userAnalytics.readButtonClicks.some(d => d.clicks > 0) ? (
                  <StatAreaChart
                    data={userAnalytics.readButtonClicks.map(d => ({ date: d.date, clicks: d.clicks }))}
                    dataKey="clicks"
                    color={COLORS.secondary}
                    height={isCompact ? 250 : 300}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-foreground/60">
                    <Volume2 className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">No read button click data available</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center">Click the "Read" button on quotes to start tracking your reading activity!</p>
                  </div>
                )}
              </CardContent>
            </Card>
              </>
            )}
          </>
        )}

        {activeView === "sources" && (
          <>
            {/* Source Distribution Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Database className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.primary }} />
                  <span className="font-semibold">Quote Sources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.sourceDistribution.length > 0 ? (
                  <StatBarChart
                    data={chartData.sourceDistribution}
                    dataKey="value"
                    color={COLORS.primary}
                    height={isCompact ? 250 : 300}
                    xAxisAngle={-45}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-foreground/60">
                    <Database className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">Source Distribution</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center max-w-md">
                      This feature is currently in beta and will be updated in a future release.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.accent }} />
                  <span className="font-semibold">API Health Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsData.healthStatus.length > 0 ? (
                  <div className="space-y-3">
                    {statsData.healthStatus.map((health) => (
                      <div
                        key={health.source}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3.5 h-3.5 rounded-full shadow-sm ${
                              health.status === "healthy"
                                ? "bg-green-500"
                                : health.status === "degraded"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="font-semibold text-foreground">{health.source}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-foreground/80">
                          <span>Success: {health.successRate || 0}%</span>
                          <span>
                            {health.responseTime && health.responseTime > 0
                              ? `${health.responseTime}ms`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-foreground/60">
                    <p className="font-medium">No health status data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeView === "performance" && (
          <>
            {/* Performance Metrics */}
            {chartData.performanceData.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Zap className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.secondary }} />
                      <span className="font-semibold">API Success Rates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatBarChart
                      data={chartData.performanceData}
                      dataKey="successRate"
                      color={COLORS.secondary}
                      height={isCompact ? 250 : 300}
                      xAxisAngle={-45}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Clock className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.accent }} />
                      <span className="font-semibold">Average Response Times</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatBarChart
                      data={chartData.performanceData}
                      dataKey="avgResponseTime"
                      color={COLORS.accent}
                      height={isCompact ? 250 : 300}
                      xAxisAngle={-45}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px] text-foreground/60">
                    <p className="font-medium">No performance data available.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeView === "engagement" && (
          <>
            {/* Most Liked Quotes */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Heart className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.danger }} />
                    <span className="font-semibold">Most Liked Quotes</span>
                  </CardTitle>
                  <p className="text-sm text-foreground/70 font-normal">
                    Your favorite quotes that you've liked or saved. These are the quotes that resonated most with you.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {statsData.analytics.mostLikedQuotes && statsData.analytics.mostLikedQuotes.length > 0 ? (
                  <div className="space-y-4">
                    {statsData.analytics.mostLikedQuotes.slice(0, 5).map((quote, index) => (
                      <div
                        key={quote.id || index}
                        className="p-4 rounded-lg border bg-card/50 hover:shadow-md transition-shadow hover:bg-card/70"
                      >
                        <p className="text-sm mb-2 line-clamp-3 text-foreground font-medium">"{quote.text}"</p>
                        {quote.author && (
                          <p className="text-xs text-foreground/70 font-medium">— {quote.author}</p>
                        )}
                        {quote.category && (
                          <Badge variant="secondary" className="mt-2 font-medium text-foreground/80 border-foreground/20">
                            {quote.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-foreground/60">
                    <Heart className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">No liked quotes yet</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center max-w-md">
                      Like or save quotes to see them appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Viewed */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Eye className="w-5 h-5" strokeWidth={2} style={{ color: COLORS.info }} />
                    <span className="font-semibold">Recently Viewed</span>
                  </CardTitle>
                  <p className="text-sm text-foreground/70 font-normal">
                    Quotes you've recently viewed or interacted with. This helps you rediscover quotes you've seen before.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {statsData.analytics.recentlyViewed && statsData.analytics.recentlyViewed.length > 0 ? (
                  <div className="space-y-4">
                    {statsData.analytics.recentlyViewed.slice(0, 5).map((quote, index) => (
                      <div
                        key={quote.id || index}
                        className="p-4 rounded-lg border bg-card/50 hover:shadow-md transition-shadow hover:bg-card/70"
                      >
                        <p className="text-sm mb-2 line-clamp-3 text-foreground font-medium">"{quote.text}"</p>
                        {quote.author && (
                          <p className="text-xs text-foreground/70 font-medium">— {quote.author}</p>
                        )}
                        {quote.category && (
                          <Badge variant="secondary" className="mt-2 font-medium text-foreground/80 border-foreground/20">
                            {quote.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-foreground/60">
                    <Eye className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">No recently viewed quotes</p>
                    <p className="text-sm mt-2 text-foreground/50 text-center max-w-md">
                      View quotes to see your recent activity here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </>
        )}
      </div>
    </div>
  );
}


/**
 * Navigation Component
 * 
 * Tab navigation with all tabs and proper styling
 */

import React from 'react';
import {
  Home,
  Search,
  FolderOpen,
  Globe,
  Heart,
  BarChart3,
  Volume2,
  Settings as SettingsIcon,
  Plus,
  BookOpen,
  Mail,
} from 'lucide-react';
import { Variant, NavigationTab } from '../types';

interface NavigationProps {
  variant: Variant;
  tabs: NavigationTab[];
  activeTab: string;
  simpleMode: boolean;
  onTabChange: (tabId: string, todayTabRef?: any, forceRefreshLists?: () => Promise<void>, setSavedFilter?: (filter: "all" | "saved" | "liked") => void) => void;
  todayTabRef?: React.RefObject<{
    getStatus?: () => any;
  }>;
  forceRefreshLists?: () => Promise<void>;
  setSavedFilter?: (filter: "all" | "saved" | "liked") => void;
}

export function Navigation({
  variant,
  tabs,
  activeTab,
  simpleMode,
  onTabChange,
  todayTabRef,
  forceRefreshLists,
  setSavedFilter,
}: NavigationProps) {
  const handleTabClick = async (tabId: string) => {
    if (tabId === "saved") {
      // Fallback: inject current TodayTab quote if already saved/liked
      try {
        const status = todayTabRef?.current?.getStatus?.();
        if (status?.quote && status?.isSaved) {
          // This will be handled by the parent component
          window.dispatchEvent(
            new CustomEvent("boostlly:injectSavedQuote", {
              detail: { quote: status.quote },
            }),
          );
        }
        if (status?.quote && status?.isLiked) {
          window.dispatchEvent(
            new CustomEvent("boostlly:injectLikedQuote", {
              detail: { quote: status.quote },
            }),
          );
        }
      } catch {}
      if (forceRefreshLists) {
        await forceRefreshLists();
        // slight delay to allow pending writes to land
        setTimeout(() => {
          if (forceRefreshLists) forceRefreshLists();
        }, 50);
      }
      if (setSavedFilter) {
        setSavedFilter("all");
      }
    }
    onTabChange(tabId, todayTabRef, forceRefreshLists, setSavedFilter);
  };

  return (
    <nav
      className={
        variant === "popup" ? "mb-4" : "w-full mb-6 sm:mb-8 md:mb-10"
      }
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className={
          variant === "popup"
            ? "flex items-center gap-1 bg-card/60 backdrop-blur-sm rounded-lg p-1 border border-border overflow-x-auto elevation-1 hover-soft scrollbar-hide snap-x snap-mandatory"
            : "flex items-center gap-1.5 sm:gap-2 bg-background/20 backdrop-blur-sm rounded-2xl p-1.5 sm:p-2 border border-border/20 overflow-x-auto shadow-2xl snap-x snap-mandatory scrollbar-hide mx-2 sm:mx-4"
        }
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon as any;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => e.key === "Enter" && handleTabClick(tab.id)}
              aria-label={`Navigate to ${tab.label} tab`}
              aria-selected={activeTab === tab.id}
              role="tab"
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={
                activeTab === tab.id
                  ? variant === "popup"
                    ? "flex items-center justify-center gap-1.5 px-3 py-2 rounded-md shadow-md text-xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background transition-all duration-200 backdrop-blur-md border-2 min-h-[44px] min-w-[60px] sm:min-w-[auto] flex-shrink-0 snap-start"
                    : "group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl shadow-lg whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-transparent transition-all duration-200 font-semibold backdrop-blur-md border-2 min-h-[44px] min-w-[60px] sm:min-w-[auto] flex-shrink-0 snap-start text-xs sm:text-sm"
                  : variant === "popup"
                    ? "flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background transition-all duration-200 backdrop-blur-sm hover:backdrop-blur-md hover:scale-[1.02] min-h-[44px] min-w-[60px] sm:min-w-[auto] flex-shrink-0 snap-start"
                    : "group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-transparent transition-all duration-200 font-medium backdrop-blur-sm hover:backdrop-blur-md hover:scale-[1.02] min-h-[44px] min-w-[60px] sm:min-w-[auto] flex-shrink-0 snap-start text-xs sm:text-sm"
              }
              style={
                activeTab === tab.id
                  ? {
                      backgroundColor: "hsl(var(--bg-hsl) / 0.6)",
                      color: "hsl(var(--fg-hsl))",
                      borderColor: "hsl(var(--fg-hsl) / 0.6)",
                      textShadow:
                        "0 1px 3px rgba(0,0,0,0.4), 0 0 12px rgba(0,0,0,0.3)",
                    }
                  : {
                      backgroundColor: "transparent",
                      // Use full opacity for WCAG AA compliance (4.5:1 minimum)
                      // The text shadow helps with readability on varying backgrounds
                      color: "hsl(var(--fg-hsl))",
                      borderColor: "transparent",
                      textShadow:
                        "0 1px 2px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.4)",
                    }
              }
            >
              <Icon
                className={variant === "popup" ? "w-4 h-4 flex-shrink-0" : "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"}
                style={{
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                }}
                aria-hidden="true"
              />
              {/* Show abbreviated text on mobile, full text on larger screens */}
              <span className="font-medium hidden sm:inline truncate">
                {tab.label}
              </span>
              <span className="font-medium sm:hidden">
                {tab.label === "Today" ? "Today" :
                 tab.label === "Search" ? "Search" :
                 tab.label === "Collections" ? "Collections" :
                 tab.label === "Saved" ? "Saved" :
                 tab.label === "Your Quotes" ? "Quotes" :
                 tab.label === "Stats" ? "Stats" :
                 tab.label === "Voice" ? "Voice" :
                 tab.label === "Settings" ? "Settings" :
                 tab.label.length > 8 ? tab.label.substring(0, 8) : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

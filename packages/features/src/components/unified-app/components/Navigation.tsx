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
        variant === "popup" ? "mb-4" : "container mx-auto px-4 mb-8"
      }
    >
      <div
        className={
          variant === "popup"
            ? "flex items-center gap-1 bg-card/60 backdrop-blur-sm rounded-lg p-1 border border-border overflow-x-auto elevation-1 hover-soft scrollbar-hide"
            : "flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-2xl p-2 border border-border/20 overflow-x-auto shadow-2xl"
        }
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
                    ? "flex items-center gap-1 px-2 py-1.5 rounded-md shadow-md text-xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors backdrop-blur-md border-2"
                    : "group relative flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-colors font-semibold backdrop-blur-md border-2"
                  : variant === "popup"
                    ? "flex items-center gap-1 px-2 py-1.5 rounded-md text-xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors backdrop-blur-sm hover:backdrop-blur-md"
                    : "group relative flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-colors font-medium backdrop-blur-sm hover:backdrop-blur-md"
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
                className={variant === "popup" ? "w-3 h-3" : "w-4 h-4"}
                style={{
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                }}
              />
              <span className={variant === "popup" ? "" : "font-medium"}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

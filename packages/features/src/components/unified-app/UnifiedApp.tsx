/**
 * Unified App Component - Main Entry Point
 * 
 * This is the main unified app component that orchestrates all features.
 * It has been refactored to be more modular and maintainable.
 */

import React, { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from '@boostlly/ui';
import { useAppState } from '../../hooks/useAppState';
import { useOnboarding } from '../../hooks/useOnboarding';
import { Navigation } from '../navigation/Navigation';
import { TabContent } from './TabContent';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { UnifiedAppProps } from './types';
import { QuickOnboarding } from '../onboarding';
import { Home, Search, FolderOpen, Settings } from 'lucide-react';
import { createPlatformStorage } from './utils/storage-utils';
import { useAutoTheme, QuoteService, DailyNotificationScheduler } from '@boostlly/core';

/**
 * Main Unified App Component
 * 
 * This component provides a unified interface for both web and extension
 * environments with proper error handling and performance optimization.
 */
export function UnifiedApp({
  variant = 'web',
}: UnifiedAppProps) {
  const [platformStorage, setPlatformStorage] = useState<any>(null);
  const { appState, setActiveTab } = useAppState(platformStorage);
  const { isCompleted: onboardingCompleted, isLoading: onboardingLoading, markAsCompleted } = useOnboarding(platformStorage);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notificationScheduler, setNotificationScheduler] = useState<DailyNotificationScheduler | null>(null);
  
  // Auto-theme for daily background images - adapts colors based on background
  const { palette } = useAutoTheme();

  // Initialize platform storage if not provided
  useEffect(() => {
    if (!platformStorage) {
      createPlatformStorage()
        .then(setPlatformStorage)
        .catch(console.error);
    }
  }, [platformStorage]);

  // Initialize notification scheduler when storage is available
  useEffect(() => {
    if (platformStorage && !notificationScheduler) {
      const quoteService = new QuoteService(platformStorage);
      const scheduler = new DailyNotificationScheduler({
        storage: platformStorage,
        quoteService,
        onNotificationClick: () => {
          window.focus();
        },
      });
      
      scheduler.initialize().catch(console.error);
      setNotificationScheduler(scheduler);
    }
  }, [platformStorage, notificationScheduler]);

  // Show onboarding for first-time users
  useEffect(() => {
    if (!onboardingLoading && platformStorage && !onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [onboardingLoading, platformStorage, onboardingCompleted]);

  // Handle URL parameters for PWA shortcuts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const actionParam = urlParams.get('action');
    const randomParam = urlParams.get('random');
    
    if (tabParam) {
      // Set the active tab from URL parameter
      setActiveTab(tabParam);
      
      // Handle special actions
      if (actionParam === 'share' && tabParam === 'today') {
        // Trigger share action - this will be handled by the TodayTab component
        window.dispatchEvent(new CustomEvent('boostlly:share-quote'));
      }
      
      if (randomParam === 'true' && tabParam === 'today') {
        // Trigger random quote - this will be handled by the TodayTab component
        window.dispatchEvent(new CustomEvent('boostlly:random-quote'));
      }
      
      // Clean up URL parameters after handling
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [setActiveTab]);

  const handleOnboardingComplete = async (data: any) => {
    await markAsCompleted(data);
    
    // Initialize notification scheduler if reminders are enabled
    if (data.reminderEnabled && notificationScheduler) {
      try {
        await notificationScheduler.updateSchedule();
      } catch (error) {
        console.error('Failed to initialize notification scheduler after onboarding:', error);
      }
    }
    
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = async () => {
    await markAsCompleted({
      categories: [],
      reminderEnabled: false,
      reminderTime: '09:00',
      reminderTone: 'gentle',
    });
    setShowOnboarding(false);
  };

  // Show onboarding overlay if needed
  if (showOnboarding && platformStorage) {
    return (
      <ErrorBoundary>
        <QuickOnboarding
          storage={platformStorage}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`flex flex-col h-full ${variant === 'popup' ? 'min-h-0' : 'min-h-screen'} bg-background`}>
        {/* Skip to main content link for accessibility */}
        {variant === 'web' && (
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Skip to main content"
          >
            Skip to main content
          </a>
        )}
        <AppHeader variant={variant} />
        
        <main id="main-content" className="flex-1 flex flex-col overflow-hidden" role="main" aria-label="Main content">
          <Navigation
            tabs={getNavigationTabs(variant)}
            activeTab={appState.activeTab}
            onTabChange={setActiveTab}
            variant={variant}
          />
          
          <div className="flex-1 overflow-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            }>
              <TabContent
                activeTab={appState.activeTab}
                variant={variant}
                storage={platformStorage}
                savedQuotes={[]}
                likedQuotes={[]}
                collections={[]}
                savedFilter="all"
                savedSearch=""
                savedSort="recent"
                filteredSavedQuotes={[]}
                simpleMode={appState.simpleMode}
                palette={palette || undefined}
                onRemoveQuote={() => {}}
                onAddToCollection={() => {}}
                onSetSavedFilter={() => {}}
                onSetSavedSearch={() => {}}
                onSetSavedSort={() => {}}
                onSetShowCreate={() => {}}
                onSetShowAddToCollection={() => {}}
                onSetSelectedQuoteForCollection={() => {}}
                onSetActiveTab={setActiveTab}
              />
            </Suspense>
          </div>
        </main>
        
        <AppFooter variant={variant} />
      </div>
    </ErrorBoundary>
  );
}

/**
 * Get navigation tabs based on variant
 */
function getNavigationTabs(variant: 'web' | 'popup') {
  // Only core features - no advanced features
  const baseTabs = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return baseTabs;
}

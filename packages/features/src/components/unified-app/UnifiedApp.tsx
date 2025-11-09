/**
 * Unified App Component - Main Entry Point
 * 
 * This is the main unified app component that orchestrates all features.
 * It has been refactored to be more modular and maintainable.
 */

import React, { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from '@boostlly/ui';
import { useAppState } from '../../hooks/useAppState';
import { Navigation } from '../navigation/Navigation';
import { TabContent } from './TabContent';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { UnifiedAppProps } from './types';
import { Home, Search, FolderOpen, Settings } from 'lucide-react';
import { createPlatformStorage } from './utils/storage-utils';

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

  // Initialize platform storage if not provided
  useEffect(() => {
    if (!platformStorage) {
      createPlatformStorage()
        .then(setPlatformStorage)
        .catch(console.error);
    }
  }, [platformStorage]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full min-h-screen bg-background">
        <AppHeader variant={variant} />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Navigation
            tabs={getNavigationTabs(variant)}
            activeTab={appState.activeTab}
            onTabChange={setActiveTab}
            variant={variant}
          />
          
          <div className="flex-1 overflow-auto">
            <Suspense fallback={<div>Loading...</div>}>
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

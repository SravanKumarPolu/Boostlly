/**
 * Tab Content Component
 * 
 * Handles rendering of different tab content with lazy loading
 * and proper error boundaries for each tab.
 */

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@boostlly/ui';
import { UnifiedAppProps } from './types';

// Lazy load tab components for better performance
const TodayTab = React.lazy(() => import('../today-tab').then(m => ({ default: m.TodayTab })));
const CollectionsTab = React.lazy(() => import('../collections-tab').then(m => ({ default: m.CollectionsTab })));
const AdvancedSearch = React.lazy(() => import('../advanced-search').then(m => ({ default: m.AdvancedSearch })));
const APIExplorer = React.lazy(() => import('../api-explorer').then(m => ({ default: m.APIExplorer })));

interface TabContentProps extends UnifiedAppProps {
  activeTab: string;
}

/**
 * Tab Content Component
 * 
 * Renders the appropriate content based on the active tab.
 * Uses lazy loading to improve initial bundle size.
 */
export function TabContent({
  activeTab,
  variant,
  storage,
  savedQuotes,
  collections,
  onRemoveQuote,
  onSpeakQuote,
  onSaveAsImage,
  onAddToCollection,
}: TabContentProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <Suspense fallback={<div>Loading today's quote...</div>}>
            <TodayTab storage={storage} />
          </Suspense>
        );

      case 'search':
        return (
          <Suspense fallback={<div>Loading search...</div>}>
            <AdvancedSearch 
              savedQuotes={savedQuotes || []}
              collections={collections || []}
              onRemoveQuote={onRemoveQuote}
              onSpeakQuote={onSpeakQuote}
              onSaveAsImage={onSaveAsImage}
              onAddToCollection={onAddToCollection}
            />
          </Suspense>
        );

      case 'collections':
        return (
          <Suspense fallback={<div>Loading collections...</div>}>
            <CollectionsTab
              storage={storage}
              savedQuotes={savedQuotes}
            />
          </Suspense>
        );

      case 'api':
        return (
          <Suspense fallback={<div>Loading API explorer...</div>}>
            <APIExplorer storage={storage} />
          </Suspense>
        );

      case 'analytics':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-muted-foreground">
              Analytics features coming soon...
            </p>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-muted-foreground">
              Settings panel coming soon...
            </p>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground">
              The requested page could not be found.
            </p>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      {renderTabContent()}
    </ErrorBoundary>
  );
}

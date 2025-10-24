import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from '@boostlly/ui';
import { useAppState } from '../../hooks/useAppState';
import { Navigation } from '../navigation/Navigation';
import { SearchContainer } from '../search/SearchContainer';
import { TodayTab } from '../today-tab';
import { CollectionsTab } from '../collections-tab';
import { APIExplorer } from '../api-explorer';
import {
  Home,
  Search,
  FolderOpen,
  Globe,
  Heart,
  BarChart3,
  TrendingUp,
  Volume2,
  Settings as SettingsIcon,
  Plus,
} from 'lucide-react';

interface UnifiedAppRefactoredProps {
  variant?: 'web' | 'popup';
  storage?: any;
  savedQuotes?: any[];
  collections?: any[];
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: any) => void;
  onSaveAsImage?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
}

/**
 * Refactored UnifiedApp component
 * 
 * This component is much smaller and more focused than the original.
 * It uses custom hooks for state management and smaller, focused components.
 */
export function UnifiedAppRefactored({
  variant = 'web',
  storage,
  savedQuotes = [],
  collections = [],
  onRemoveQuote,
  onSpeakQuote,
  onSaveAsImage,
  onAddToCollection,
}: UnifiedAppRefactoredProps) {
  const { appState, setActiveTab } = useAppState(storage);

  // Define navigation tabs based on variant and simple mode
  const allTabs = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'api', label: 'API', icon: Globe },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'create', label: 'Your Quotes', icon: Plus },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'smart', label: 'Smart AI', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'categorization', label: 'Categories', icon: FolderOpen },
    { id: 'patterns', label: 'Patterns', icon: TrendingUp },
    { id: 'voice', label: 'Voice', icon: Volume2 },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const navigationTabs = appState.simpleMode
    ? allTabs.filter(tab => 
        ['today', 'search', 'collections', 'saved', 'create', 'voice', 'settings'].includes(tab.id)
      )
    : allTabs;

  // Render content based on active tab
  const renderContent = () => {
    switch (appState.activeTab) {
      case 'today':
        return (
          <TodayTab
            storage={storage}
            onRemoveLikedImmediate={onRemoveQuote}
          />
        );
      
      case 'search':
        return (
          <SearchContainer
            savedQuotes={savedQuotes}
            collections={collections}
            onRemoveQuote={onRemoveQuote}
            onSpeakQuote={onSpeakQuote}
            onSaveAsImage={onSaveAsImage}
            onAddToCollection={onAddToCollection}
          />
        );
      
      case 'collections':
        return (
          <CollectionsTab
            storage={storage}
          />
        );
      
      case 'api':
        return <APIExplorer storage={storage} />;
      
      case 'saved':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Saved Quotes</h2>
            <p className="text-muted-foreground">
              Your saved quotes will appear here.
            </p>
          </div>
        );
      
      case 'create':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Your Quotes</h2>
            <p className="text-muted-foreground">
              Create and manage your own quotes here.
            </p>
          </div>
        );
      
      case 'stats':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <p className="text-muted-foreground">
              View your quote statistics and insights.
            </p>
          </div>
        );
      
      case 'smart':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Smart AI</h2>
            <p className="text-muted-foreground">
              AI-powered recommendations and insights.
            </p>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-muted-foreground">
              Advanced analytics and insights.
            </p>
          </div>
        );
      
      case 'categorization':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <p className="text-muted-foreground">
              Intelligent categorization features.
            </p>
          </div>
        );
      
      case 'patterns':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Patterns</h2>
            <p className="text-muted-foreground">
              Pattern recognition and analysis.
            </p>
          </div>
        );
      
      case 'voice':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Voice Commands</h2>
            <p className="text-muted-foreground">
              Voice control features.
            </p>
          </div>
        );
      
      case 'predictions':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Predictions</h2>
            <p className="text-muted-foreground">
              AI-powered predictions and forecasts.
            </p>
          </div>
        );
      
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-muted-foreground">
              Application settings and preferences.
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
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        {/* Navigation */}
        <Navigation
          tabs={navigationTabs}
          activeTab={appState.activeTab}
          onTabChange={setActiveTab}
          variant={variant}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>

        {/* Global Voice Listener - placeholder for future implementation */}
        {appState.voiceEnabled && (
          <div className="sr-only">Voice listener active</div>
        )}
      </ErrorBoundary>
    </div>
  );
}

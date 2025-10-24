import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary, Section } from '@boostlly/ui';
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
          <Section
            title="Saved Quotes"
            description="Your saved quotes will appear here."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'create':
        return (
          <Section
            title="Your Quotes"
            description="Create and manage your own quotes here."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'stats':
        return (
          <Section
            title="Statistics"
            description="View your quote statistics and insights."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'smart':
        return (
          <Section
            title="Smart AI"
            description="AI-powered recommendations and insights."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'analytics':
        return (
          <Section
            title="Analytics"
            description="Advanced analytics and insights."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'categorization':
        return (
          <Section
            title="Categories"
            description="Intelligent categorization features."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'patterns':
        return (
          <Section
            title="Patterns"
            description="Pattern recognition and analysis."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'voice':
        return (
          <Section
            title="Voice Commands"
            description="Voice control features."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'predictions':
        return (
          <Section
            title="Predictions"
            description="AI-powered predictions and forecasts."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      case 'settings':
        return (
          <Section
            title="Settings"
            description="Application settings and preferences."
          >
            <div>Coming soon...</div>
          </Section>
        );
      
      default:
        return (
          <Section
            title="Page Not Found"
            description="The requested page could not be found."
          >
            <div>Coming soon...</div>
          </Section>
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

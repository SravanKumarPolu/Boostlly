import React from 'react';
import { Button, Badge } from '@boostlly/ui';
import { LucideIcon } from 'lucide-react';

export interface NavigationTab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  badge?: string;
  disabled?: boolean;
}

interface NavigationProps {
  tabs: NavigationTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'web' | 'popup' | 'mobile';
  className?: string;
}

/**
 * Unified navigation component for all platforms
 * 
 * This component provides a consistent navigation experience across
 * web, popup, and mobile variants with proper accessibility.
 */
export function Navigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'web',
  className = '',
}: NavigationProps) {
  const getNavigationClasses = () => {
    switch (variant) {
      case 'popup':
        return 'flex flex-wrap gap-1 p-2';
      case 'mobile':
        return 'grid grid-cols-2 gap-2 p-4';
      default:
        return 'flex flex-wrap gap-2 p-4';
    }
  };

  const getTabClasses = (tab: NavigationTab) => {
    const baseClasses = 'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors';
    const activeClasses = 'bg-primary text-primary-foreground';
    const inactiveClasses = 'text-muted-foreground hover:text-foreground hover:bg-accent';
    const disabledClasses = 'opacity-50 cursor-not-allowed';
    
    let classes = baseClasses;
    
    if (tab.disabled) {
      classes += ` ${disabledClasses}`;
    } else if (activeTab === tab.id) {
      classes += ` ${activeClasses}`;
    } else {
      classes += ` ${inactiveClasses}`;
    }
    
    return classes;
  };

  return (
    <nav className={`${getNavigationClasses()} ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-disabled={tab.disabled}
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          className={getTabClasses(tab)}
        >
          <tab.icon className="w-4 h-4" />
          <span className="font-medium">{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <Badge variant="secondary" className="ml-1">
              {tab.count}
            </Badge>
          )}
          {tab.badge && (
            <Badge variant="outline" className="ml-1">
              {tab.badge}
            </Badge>
          )}
        </button>
      ))}
    </nav>
  );
}

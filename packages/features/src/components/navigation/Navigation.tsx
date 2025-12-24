import React from 'react';
import { Button, Badge, NavigationButton } from '@boostlly/ui';
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

  // Removed getTabClasses - now using NavigationButton component

  return (
    <nav 
      className={`${getNavigationClasses()} ${className}`} 
      role="navigation"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => (
        <NavigationButton
          key={tab.id}
          isActive={activeTab === tab.id}
          isDisabled={tab.disabled}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          icon={<tab.icon className="w-4 h-4" aria-hidden="true" />}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {tab.count}
            </Badge>
          )}
          {tab.badge && (
            <Badge variant="outline" className="ml-1 text-xs">
              {tab.badge}
            </Badge>
          )}
        </NavigationButton>
      ))}
    </nav>
  );
}

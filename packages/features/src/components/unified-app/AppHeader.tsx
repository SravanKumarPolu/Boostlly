/**
 * App Header Component
 * 
 * Provides a consistent header across all app variants
 * with proper branding and navigation controls.
 */

import React from 'react';
import { Button } from '@boostlly/ui';
import { Settings, Menu } from 'lucide-react';

interface AppHeaderProps {
  variant: 'web' | 'popup';
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

/**
 * App Header Component
 * 
 * Renders the application header with appropriate controls
 * based on the variant (web vs popup).
 */
export function AppHeader({ 
  variant, 
  onMenuClick, 
  onSettingsClick 
}: AppHeaderProps) {
  if (variant === 'popup') {
    return (
      <header className="flex items-center justify-between p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground">Boostlly</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="h-9 w-9 p-0"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between p-4 md:p-6 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Boostlly</h1>
        <span className="hidden sm:inline-flex text-sm text-muted-foreground font-medium">
          Daily Motivation
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden h-9 w-9"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="gap-2"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </div>
    </header>
  );
}

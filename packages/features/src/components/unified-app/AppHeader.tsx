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
      <header className="flex items-center justify-between p-3 border-b bg-background">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">Boostlly</h1>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Boostlly</h1>
        <span className="text-sm text-muted-foreground">
          Daily Motivation
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          onClick={onSettingsClick}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </header>
  );
}

/**
 * Theme Hook
 * 
 * Manages theme application (light/dark/auto) and applies it to document root.
 * Reads theme from storage and applies it immediately.
 */

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@boostlly/core';

export type Theme = 'light' | 'dark' | 'auto';

/**
 * Hook to manage and apply theme
 * 
 * This hook:
 * 1. Loads theme from storage (settings slice or onboarding data)
 * 2. Applies theme to document root (adds/removes 'dark' class)
 * 3. Handles 'auto' theme by following system preference
 * 4. Listens for system preference changes when in 'auto' mode
 */
export function useTheme(storage?: any) {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [mounted, setMounted] = useState(false);
  
  // Try to get theme from Zustand store first
  const storeTheme = useStore((state: any) => state.settings?.theme as Theme | undefined);
  const setStoreTheme = useStore((state: any) => state.setTheme);

  // Load theme from storage on mount
  useEffect(() => {
    if (!storage) {
      setMounted(true);
      return;
    }

    const loadTheme = async () => {
      try {
        // Try multiple sources for theme preference
        let savedTheme: Theme | null = null;

        // 1. Try Zustand store first (most up-to-date)
        if (storeTheme) {
          savedTheme = storeTheme;
        }
        
        // 2. Try settings from storage
        if (!savedTheme) {
          const settings = await storage.get('settings');
          if (settings?.theme) {
            savedTheme = settings.theme;
            // Update store to keep in sync
            if (setStoreTheme && typeof setStoreTheme === 'function') {
              setStoreTheme(savedTheme);
            }
          }
        }
        
        // 3. Try onboarding data
        if (!savedTheme) {
          const onboardingData = await storage.get('onboardingData');
          if (onboardingData?.theme) {
            savedTheme = onboardingData.theme;
            // Update store and settings to keep in sync
            if (setStoreTheme && typeof setStoreTheme === 'function') {
              setStoreTheme(savedTheme);
            }
            // Also save to settings for future reference
            const existingSettings = await storage.get('settings') || {};
            await storage.set('settings', {
              ...existingSettings,
              theme: savedTheme,
            });
          }
        }
        
        // 4. Try user preferences
        if (!savedTheme) {
          const prefs = await storage.get('userPreferences');
          if (prefs?.theme) {
            savedTheme = prefs.theme;
            // Update store and settings
            if (setStoreTheme && typeof setStoreTheme === 'function') {
              setStoreTheme(savedTheme);
            }
            const existingSettings = await storage.get('settings') || {};
            await storage.set('settings', {
              ...existingSettings,
              theme: savedTheme,
            });
          }
        }

        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setMounted(true);
      }
    };

    loadTheme();
  }, [storage, storeTheme, setStoreTheme]);

  // Apply theme to document root
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    if (newTheme === 'auto') {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
  }, [theme, mounted, applyTheme]);

  // Listen for system preference changes when in 'auto' mode
  useEffect(() => {
    if (!mounted || theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, mounted]);

  // Set theme function that updates both state and storage
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Update Zustand store
    if (setStoreTheme && typeof setStoreTheme === 'function') {
      setStoreTheme(newTheme);
    }
    
    // Save to storage
    if (storage) {
      try {
        // Update settings
        const existingSettings = await storage.get('settings') || {};
        await storage.set('settings', {
          ...existingSettings,
          theme: newTheme,
        });
        
        // Also update userPreferences for consistency
        const existingPrefs = await storage.get('userPreferences') || {};
        await storage.set('userPreferences', {
          ...existingPrefs,
          theme: newTheme,
        });
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
    
    // Apply immediately
    applyTheme(newTheme);
  }, [storage, setStoreTheme, applyTheme]);

  return {
    theme: mounted ? theme : 'auto', // Return 'auto' during SSR to avoid hydration mismatch
    setTheme,
    mounted,
  };
}


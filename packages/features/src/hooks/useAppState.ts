import { useState, useEffect, useCallback } from 'react';

interface AppState {
  activeTab: string;
  simpleMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
}

interface UseAppStateReturn {
  appState: AppState;
  setActiveTab: (tab: string) => void;
  setSimpleMode: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

/**
 * Custom hook for managing application state
 * 
 * This hook centralizes all app-level state management, reducing
 * the complexity of components that need to manage multiple state variables.
 */
export function useAppState(storage?: any): UseAppStateReturn {
  const [appState, setAppState] = useState<AppState>({
    activeTab: 'today',
    simpleMode: false,
    theme: 'auto',
    soundEnabled: true,
    voiceEnabled: false,
    notificationsEnabled: true,
  });

  // Load app state from storage on mount
  useEffect(() => {
    if (!storage) return;

    const loadAppState = async () => {
      try {
        const savedState = await storage.get('appState');
        if (savedState) {
          setAppState(savedState);
        }
      } catch (error) {
        console.error('Failed to load app state:', error);
      }
    };

    loadAppState();
  }, [storage]);

  // Save app state to storage whenever it changes
  useEffect(() => {
    if (!storage) return;

    const saveAppState = async () => {
      try {
        await storage.set('appState', appState);
      } catch (error) {
        console.error('Failed to save app state:', error);
      }
    };

    saveAppState();
  }, [appState, storage]);

  // State setters
  const setActiveTab = useCallback((tab: string) => {
    setAppState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setSimpleMode = useCallback((enabled: boolean) => {
    setAppState(prev => ({ ...prev, simpleMode: enabled }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    setAppState(prev => ({ ...prev, theme }));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setAppState(prev => ({ ...prev, soundEnabled: enabled }));
  }, []);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setAppState(prev => ({ ...prev, voiceEnabled: enabled }));
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setAppState(prev => ({ ...prev, notificationsEnabled: enabled }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setAppState({
      activeTab: 'today',
      simpleMode: false,
      theme: 'auto',
      soundEnabled: true,
      voiceEnabled: false,
      notificationsEnabled: true,
    });
  }, []);

  return {
    appState,
    setActiveTab,
    setSimpleMode,
    setTheme,
    setSoundEnabled,
    setVoiceEnabled,
    setNotificationsEnabled,
    resetToDefaults,
  };
}

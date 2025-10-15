import { logError, logDebug, logWarning } from "../utils/logger";
import { useState, useEffect, useCallback } from "react";
import {
  SoundManagerSettings,
  SoundId,
  getSoundManager,
} from "../utils/sound-manager";

/**
 * Hook for managing sound settings and playback
 * Integrates with SoundManager and persists settings
 */
export function useSoundManager() {
  const [settings, setSettings] = useState<SoundManagerSettings>({
    enabled: true,
    volume: 70,
    soundId: "crystal-chime",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sound manager
  useEffect(() => {
    const initializeSound = async () => {
      try {
        const manager = getSoundManager();
        await manager.initialize();
        setIsInitialized(true);
        logDebug("Sound Hook: Sound manager initialized");
      } catch (error) {
        logWarning("Sound Hook: Failed to initialize sound manager", { error });
      }
    };

    initializeSound();
  }, []);

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("boostlly-sound-settings");
          if (stored) {
            const parsedSettings = JSON.parse(stored);
            setSettings((prev: SoundManagerSettings) => ({ ...prev, ...parsedSettings }));
          }
        }
      } catch (error) {
        logWarning("Sound Hook: Failed to load settings from storage", {
          error,
        });
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage
  const saveSettings = useCallback(
    (newSettings: Partial<SoundManagerSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "boostlly-sound-settings",
            JSON.stringify(updatedSettings),
          );
        }
      } catch (error) {
        logWarning("Sound Hook: Failed to save settings to storage", { error });
      }
    },
    [settings],
  );

  // Play sound
  const playSound = useCallback(
    async (soundId?: SoundId, volume?: number) => {
      if (!isInitialized) return;

      try {
        const manager = getSoundManager();
        await manager.playSound(
          soundId || settings.soundId,
          volume || settings.volume,
        );
      } catch (error) {
        logWarning("Sound Hook: Failed to play sound", { error });
      }
    },
    [isInitialized, settings.soundId, settings.volume],
  );

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<SoundManagerSettings>) => {
      saveSettings(newSettings);

      // Update the global sound manager
      if (isInitialized) {
        const manager = getSoundManager();
        manager.updateSettings(newSettings);
      }
    },
    [saveSettings, isInitialized],
  );

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);

  // Set volume
  const setVolume = useCallback(
    (volume: number) => {
      updateSettings({ volume });
    },
    [updateSettings],
  );

  // Set sound type
  const setSoundId = useCallback(
    (soundId: SoundId) => {
      updateSettings({ soundId });
    },
    [updateSettings],
  );

  return {
    settings,
    isInitialized,
    playSound,
    updateSettings,
    toggleSound,
    setVolume,
    setSoundId,
    availableSounds: isInitialized
      ? getSoundManager().getAvailableSounds()
      : [],
  };
}

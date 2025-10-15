import { logError, logDebug, logWarning } from "./logger";
/**
 * Sound Manager for Quote of the Day app
 * Uses Howler.js with WebAudio fallback
 */

export type SoundId =
  | "off"
  | "crystal-chime"
  | "gentle-bell"
  | "soft-notification"
  | "success-chime"
  | "custom-beep";

export interface SoundManagerSettings {
  enabled: boolean;
  volume: number; // 0-100
  soundId: SoundId;
}

/**
 * Sound Manager class
 * Handles all sound playback with Howler.js integration
 */
export class SoundManager {
  private settings: SoundManagerSettings;
  private howler: any = null;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor(settings: Partial<SoundManagerSettings> = {}) {
    this.settings = {
      enabled: true,
      volume: 70,
      soundId: "crystal-chime",
      ...settings,
    };
  }

  /**
   * Initialize the sound manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Try to load Howler.js
      if (typeof window !== "undefined") {
        const { Howl } = await import("howler");
        this.howler = Howl;
        logDebug("Sound Manager: Howler.js loaded successfully");
      }
    } catch (error) {
      logWarning(
        "Sound Manager: Howler.js not available, using WebAudio fallback",
      );
    }

    // Initialize WebAudio context as fallback
    if (typeof window !== "undefined" && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (error) {
        logWarning("Sound Manager: WebAudio not available");
      }
    }

    this.isInitialized = true;
  }

  /**
   * Play a sound
   */
  async playSound(
    soundId: SoundId = this.settings.soundId,
    volume: number = this.settings.volume,
  ): Promise<void> {
    if (!this.settings.enabled || soundId === "off") {
      return;
    }

    await this.initialize();

    try {
      if (this.howler && soundId !== "custom-beep") {
        await this.playHowlerSound(soundId, volume);
      } else {
        await this.synthesizeBeep(volume);
      }
    } catch (error) {
      logWarning("Sound Manager: Failed to play sound", { error: error });
    }
  }

  /**
   * Play sound using Howler.js
   */
  private async playHowlerSound(
    soundId: SoundId,
    volume: number,
  ): Promise<void> {
    if (!this.howler) return;

    const soundConfig = this.getSoundConfig(soundId);
    if (!soundConfig) return;

    const sound = new this.howler.Howl({
      src: [soundConfig.url],
      volume: volume / 100,
      onload: () => {
        sound.play();
      },
      onloaderror: (_id: any, error: any) => {
        logWarning("Sound Manager: Failed to load sound", { error: error });
        // Fallback to synthesized beep
        this.synthesizeBeep(volume);
      },
    });
  }

  /**
   * Synthesize a beep sound using WebAudio
   */
  async synthesizeBeep(volume: number = 70): Promise<void> {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Create a pleasant chime sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1200,
        this.audioContext.currentTime + 0.1,
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        600,
        this.audioContext.currentTime + 0.3,
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        (volume / 100) * 0.3,
        this.audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.5,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      logWarning("Sound Manager: Failed to synthesize beep", { error: error });
    }
  }

  /**
   * Get sound configuration
   */
  private getSoundConfig(
    soundId: SoundId,
  ): { url: string; name: string } | null {
    const soundConfigs: Record<
      Exclude<SoundId, "off" | "custom-beep">,
      { url: string; name: string }
    > = {
      "crystal-chime": {
        url: "/assets/sounds/crystal-chime.mp3",
        name: "Crystal Chime",
      },
      "gentle-bell": {
        url: "/assets/sounds/gentle-bell.mp3",
        name: "Gentle Bell",
      },
      "soft-notification": {
        url: "/assets/sounds/soft-notification.mp3",
        name: "Soft Notification",
      },
      "success-chime": {
        url: "/assets/sounds/success-chime.mp3",
        name: "Success Chime",
      },
    };

    return soundConfigs[soundId as keyof typeof soundConfigs] || null;
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    if (this.howler) {
      this.howler.Howl.stop();
    }
  }

  /**
   * Check if sound is available
   */
  isSoundAvailable(): boolean {
    return (
      this.isInitialized && (this.howler !== null || this.audioContext !== null)
    );
  }

  /**
   * Get available sounds
   */
  getAvailableSounds(): Array<{ id: SoundId; name: string }> {
    return [
      { id: "off", name: "Off" },
      { id: "crystal-chime", name: "Crystal Chime" },
      { id: "gentle-bell", name: "Gentle Bell" },
      { id: "soft-notification", name: "Soft Notification" },
      { id: "success-chime", name: "Success Chime" },
      { id: "custom-beep", name: "Custom Beep" },
    ];
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(100, volume));
  }

  /**
   * Get current settings
   */
  getSettings(): SoundManagerSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<SoundManagerSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
}

// Global sound manager instance
let globalSoundManager: SoundManager | null = null;

/**
 * Get or create global sound manager
 */
export function getSoundManager(): SoundManager {
  if (!globalSoundManager) {
    globalSoundManager = new SoundManager();
  }
  return globalSoundManager;
}

/**
 * Play sound using global manager
 */
export async function playSound(
  soundId: SoundId = "crystal-chime",
  volume: number = 70,
): Promise<void> {
  const manager = getSoundManager();
  await manager.playSound(soundId, volume);
}

/**
 * Stop all sounds
 */
export function stopAllSounds(): void {
  const manager = getSoundManager();
  manager.stopAll();
}

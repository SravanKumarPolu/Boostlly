/**
 * Accessibility Utilities
 *
 * Provides utilities for enhancing accessibility across the application
 * including ARIA announcements, focus management, and contrast checking.
 */

/**
 * Create a screen reader announcement
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
  duration: number = 3000,
): void {
  if (typeof document === "undefined") return;

  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Clean up after specified duration
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, duration);
}

/**
 * Enhanced button props for accessibility
 */
export interface AccessibilityButtonProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  title?: string;
  className?: string;
}

/**
 * Generate accessibility props for buttons
 */
export function getAccessibilityButtonProps(
  action: string,
  state?: { pressed?: boolean; expanded?: boolean },
  description?: string,
): AccessibilityButtonProps {
  const baseProps: AccessibilityButtonProps = {
    ariaLabel: `${action} button`,
    title: description || `Click to ${action.toLowerCase()}`,
    className:
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  };

  if (state?.pressed !== undefined) {
    baseProps.ariaPressed = state.pressed;
    baseProps.ariaLabel = `${state.pressed ? "Un" : ""}${action.toLowerCase()}`;
  }

  if (state?.expanded !== undefined) {
    baseProps.ariaExpanded = state.expanded;
    baseProps.ariaLabel = `${action} ${state.expanded ? "collapse" : "expand"}`;
  }

  if (description) {
    baseProps.ariaDescribedBy = `${action.toLowerCase()}-description`;
  }

  return baseProps;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-contrast: high)").matches;
}

/**
 * Check if user prefers reduced contrast (not commonly used, but for completeness)
 */
export function prefersReducedContrast(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-contrast: less)").matches;
}

/**
 * Get user's contrast preference
 * Returns 'high', 'normal', or 'low'
 */
export function getContrastPreference(): 'high' | 'normal' | 'low' {
  if (typeof window === "undefined") return 'normal';
  
  if (prefersHighContrast()) return 'high';
  if (prefersReducedContrast()) return 'low';
  return 'normal';
}

/**
 * Check if user prefers dark color scheme
 */
export function prefersDarkColorScheme(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Manage focus for modal dialogs and dropdowns
 */
export class FocusManager {
  private currentFocus: HTMLElement | null = null;

  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    container.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Focus the first element
    firstElement.focus();
  }

  /**
   * Save current focus and move to new element
   */
  saveAndFocus(newElement: HTMLElement): void {
    this.currentFocus = document.activeElement as HTMLElement;
    newElement.focus();
  }

  /**
   * Restore previous focus
   */
  restoreFocus(): void {
    if (this.currentFocus) {
      this.currentFocus.focus();
      this.currentFocus = null;
    }
  }
}

/**
 * Enhanced TTS with accessibility features
 */
export class AccessibleTTS {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private cachedVoices: SpeechSynthesisVoice[] | null = null;
  private voicesReady = false;
  private voicesInitialized = false;

  /**
   * Initialize voices eagerly - call this on page load or first interaction
   * This ensures voices are loaded before speaking
   * Enhanced for production builds with code splitting
   */
  private initializeVoices(): void {
    if (this.voicesInitialized || typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Even if initialized, check for cached voices from pre-initialization
      if (!this.cachedVoices || this.cachedVoices.length === 0) {
        const cached = (window as any).__boostlly_tts_voices;
        if (cached && Array.isArray(cached) && cached.length > 0) {
          this.cachedVoices = cached;
          this.voicesReady = true;
        }
      }
      return;
    }

    this.voicesInitialized = true;

    // Check for pre-cached voices from monitoring bootstrap
    const preCached = (window as any).__boostlly_tts_voices;
    if (preCached && Array.isArray(preCached) && preCached.length > 0) {
      this.cachedVoices = preCached;
      this.voicesReady = true;
    }

    // Set up voiceschanged event listener to cache voices when they load
    const onVoicesChanged = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.cachedVoices = voices;
          this.voicesReady = true;
          // Also store globally for other instances
          (window as any).__boostlly_tts_voices = voices;
        }
      } catch (error) {
        console.warn("Error loading voices:", error);
      }
    };

    // Set up the event listener (only if not already set)
    if (!window.speechSynthesis.onvoiceschanged) {
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    }

    // Try to get voices immediately (may be empty on first call)
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.cachedVoices = voices;
        this.voicesReady = true;
        (window as any).__boostlly_tts_voices = voices;
      } else {
        // Trigger voice loading by calling getVoices and a dummy speak/cancel
        // Some browsers need this to initialize voices
        try {
          const dummyUtterance = new SpeechSynthesisUtterance("");
          dummyUtterance.volume = 0;
          window.speechSynthesis.speak(dummyUtterance);
          window.speechSynthesis.cancel();
        } catch (e) {
          // Ignore errors from dummy utterance
        }
      }
    } catch (error) {
      console.warn("Error getting voices:", error);
    }
  }

  /**
   * Wait for voices to be ready (with timeout and retries)
   * More aggressive in production to handle code splitting delays
   * Optimized for desktop browsers that require user interaction
   */
  private async waitForVoices(maxWaitMs: number = 1500): Promise<boolean> {
    if (this.voicesReady && this.cachedVoices && this.cachedVoices.length > 0) {
      return true;
    }

    // Check global cache first (from pre-initialization or warmup)
    const globalCache = (window as any).__boostlly_tts_voices;
    if (globalCache && Array.isArray(globalCache) && globalCache.length > 0) {
      this.cachedVoices = globalCache;
      this.voicesReady = true;
      return true;
    }

    // Try multiple strategies to get voices
    const strategies = [
      // Strategy 1: Check immediately (voices might be ready from warmup)
      async () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.cachedVoices = voices;
          this.voicesReady = true;
          (window as any).__boostlly_tts_voices = voices;
          return true;
        }
        return false;
      },
      // Strategy 2: Wait and check frequently (desktop browsers may need a moment)
      async () => {
        const startTime = Date.now();
        const checkInterval = 25; // Check more frequently for desktop browsers
        while (Date.now() - startTime < maxWaitMs) {
          try {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              this.cachedVoices = voices;
              this.voicesReady = true;
              (window as any).__boostlly_tts_voices = voices;
              return true;
            }
            // Check global cache on each iteration
            const cached = (window as any).__boostlly_tts_voices;
            if (cached && Array.isArray(cached) && cached.length > 0) {
              this.cachedVoices = cached;
              this.voicesReady = true;
              return true;
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
          } catch (error) {
            break;
          }
        }
        return false;
      },
      // Strategy 3: Trigger voiceschanged event by speaking/canceling a dummy utterance
      async () => {
        try {
          // Some browsers need this to trigger voice loading
          const dummyUtterance = new SpeechSynthesisUtterance("");
          dummyUtterance.volume = 0;
          window.speechSynthesis.speak(dummyUtterance);
          window.speechSynthesis.cancel();
          
          // Wait a bit for voices to load (desktop browsers may need this)
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            this.cachedVoices = voices;
            this.voicesReady = true;
            (window as any).__boostlly_tts_voices = voices;
            return true;
          }
        } catch (e) {
          // Ignore errors
        }
        return false;
      },
    ];

    // Try each strategy
    for (const strategy of strategies) {
      const result = await strategy();
      if (result) {
        return true;
      }
    }

    // Final check: use cached if available (from any source)
    if (this.cachedVoices && this.cachedVoices.length > 0) {
      this.voicesReady = true;
      return true;
    }

    // Last resort: check global cache one more time
    const finalCache = (window as any).__boostlly_tts_voices;
    if (finalCache && Array.isArray(finalCache) && finalCache.length > 0) {
      this.cachedVoices = finalCache;
      this.voicesReady = true;
      return true;
    }

    return false;
  }

  /**
   * Get the best available voice for text-to-speech
   * Prioritizes high-quality, natural-sounding voices
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return null;
    }

    // Initialize voices if not already done
    this.initializeVoices();

    // Always get fresh voices list (voices may load asynchronously)
    let voices: SpeechSynthesisVoice[] = [];
    try {
      voices = window.speechSynthesis.getVoices();
    } catch (error) {
      // If getVoices fails, use cached voices or return null
      if (this.cachedVoices && this.cachedVoices.length > 0) {
        return this.selectBestVoiceFromList(this.cachedVoices);
      }
      return null;
    }
    
    // If no voices yet, use cached voices
    if (voices.length === 0) {
        if (this.cachedVoices && this.cachedVoices.length > 0) {
          voices = this.cachedVoices;
      } else {
        return null;
      }
    }

    // Cache voices for future use
    if (voices.length > 0 && (!this.cachedVoices || this.cachedVoices.length === 0)) {
      this.cachedVoices = voices;
      this.voicesReady = true;
    }

    return this.selectBestVoiceFromList(voices);
    }

  /**
   * Select the best voice from a list of voices
   */
  private selectBestVoiceFromList(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (voices.length === 0) {
      return null;
    }

    // Priority order for voice selection (best to worst)
    const voicePreferences = [
      // 1. Premium/Neural voices (highest quality)
      (v: SpeechSynthesisVoice) => 
        v.name.toLowerCase().includes("neural") || 
        v.name.toLowerCase().includes("premium") ||
        v.name.toLowerCase().includes("enhanced"),
      
      // 2. Natural-sounding voices
      (v: SpeechSynthesisVoice) => 
        v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("daniel") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("zira"),
      
      // 3. English voices (prefer US English)
      (v: SpeechSynthesisVoice) => 
        v.lang.startsWith("en-US") || v.lang.startsWith("en-GB"),
      
      // 4. Any English voice
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
    ];

    // Try to find a voice matching each preference level
    for (const preference of voicePreferences) {
      const matchingVoice = voices.find(preference);
      if (matchingVoice) {
        return matchingVoice;
      }
    }

    // Fallback: return first available voice
    return voices[0] || null;
  }

  /**
   * Warm up voices using the current user interaction context
   * Desktop browsers require user interaction before voices are available
   * This should be called from a user interaction handler (click, touch, etc.)
   * Returns true if voices are immediately available
   */
  private warmupVoicesWithUserInteraction(): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    try {
      // Strategy 1: Check immediately - user interaction might have unlocked voices
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.cachedVoices = voices;
        this.voicesReady = true;
        (window as any).__boostlly_tts_voices = voices;
        return true;
      }

      // Strategy 2: Trigger voice loading with a dummy utterance
      // This works because we're in a user interaction context
      // Desktop browsers (Chrome/Edge) need this to unlock voices
      try {
        const dummyUtterance = new SpeechSynthesisUtterance("");
        dummyUtterance.volume = 0;
        dummyUtterance.rate = 10; // Very fast, won't be heard
        window.speechSynthesis.speak(dummyUtterance);
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore errors
      }

      // Strategy 3: Check again immediately (some browsers unlock instantly)
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.cachedVoices = voices;
        this.voicesReady = true;
        (window as any).__boostlly_tts_voices = voices;
        return true;
      }

      // Strategy 4: Set up async check for voices that load after a brief delay
      // Store in global cache for waitForVoices to pick up
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.cachedVoices = voices;
          this.voicesReady = true;
          (window as any).__boostlly_tts_voices = voices;
        }
      }, 10);

      return false; // Voices not immediately available, will need to wait
    } catch (error) {
      console.warn("Error warming up voices with user interaction:", error);
      return false;
    }
  }

  /**
   * Speak text with accessibility announcements and high-quality voice
   * Now waits for voices to be ready before speaking with aggressive initialization
   * Handles desktop browser requirement for user interaction
   */
  async speak(
    text: string,
    options: {
      rate?: number;
      volume?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    } = {},
  ): Promise<void> {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      announceToScreenReader("Speech synthesis not supported", "assertive");
      return;
    }

    // CRITICAL: Warm up voices using the current user interaction
    // Desktop browsers (Chrome/Edge) require user interaction before voices are available
    // The button click IS the user interaction, so we use it here
    const voicesImmediatelyReady = this.warmupVoicesWithUserInteraction();

    // Initialize voices aggressively
    this.initializeVoices();
    
    // Desktop browsers may need a brief moment after user interaction to load voices
    // Give them a small delay if voices aren't immediately ready
    if (!voicesImmediatelyReady) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // If voices are immediately ready, we can proceed faster
    // Otherwise, wait with longer timeout for production/code splitting
    const waitTime = voicesImmediatelyReady ? 200 : 1500;
    const voicesReady = await this.waitForVoices(waitTime);
    
    // Final check: if still no voices, try one more aggressive attempt
    if (!voicesReady && (!this.cachedVoices || this.cachedVoices.length === 0)) {
      // Last resort: try triggering voices again (user interaction context still valid)
      try {
        const dummyUtterance = new SpeechSynthesisUtterance("");
        dummyUtterance.volume = 0;
        dummyUtterance.rate = 10; // Very fast, won't be heard
        window.speechSynthesis.speak(dummyUtterance);
        window.speechSynthesis.cancel();
        
        // Wait a bit more
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.cachedVoices = voices;
          this.voicesReady = true;
          (window as any).__boostlly_tts_voices = voices;
        }
      } catch (e) {
        // Ignore errors
      }
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice quality settings - ensure we have a good voice
    const bestVoice = this.getBestVoice();
    if (bestVoice) {
      this.utterance.voice = bestVoice;
      this.utterance.lang = bestVoice.lang;
    } else {
      // Fallback: set language even if no voice selected
      // But try to get voices one more time
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const fallbackVoice = this.selectBestVoiceFromList(voices);
        if (fallbackVoice) {
          this.utterance.voice = fallbackVoice;
          this.utterance.lang = fallbackVoice.lang;
        } else {
          this.utterance.lang = "en-US";
        }
      } else {
        this.utterance.lang = "en-US";
      }
    }
    
    // Use optimal settings for natural speech
    this.utterance.rate = options.rate || 1.0; // Default to 1.0 for more natural pace
    this.utterance.volume = options.volume ?? 0.9; // Slightly higher default volume
    this.utterance.pitch = options.pitch || 1.0; // Neutral pitch for clarity

    this.utterance.onstart = () => {
      this.isSpeaking = true;
      announceToScreenReader("Speaking text aloud", "polite", 1000);
      options.onStart?.();
    };

    this.utterance.onend = () => {
      this.isSpeaking = false;
      announceToScreenReader("Finished speaking", "polite", 1000);
      options.onEnd?.();
    };

    this.utterance.onerror = (event) => {
      this.isSpeaking = false;
      const errorMessage = `Speech error: ${event.error}`;
      announceToScreenReader(errorMessage, "assertive", 3000);
      options.onError?.(event.error);
    };

    window.speechSynthesis.speak(this.utterance);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (this.isSpeaking) {
        announceToScreenReader("Speech stopped", "polite", 1000);
      }
      this.isSpeaking = false;
    }
  }

  /**
   * Check if currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

/**
 * Global focus manager instance
 */
export const focusManager = new FocusManager();

/**
 * Global accessible TTS instance
 */
export const accessibleTTS = new AccessibleTTS();

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

  /**
   * Get the best available voice for text-to-speech
   * Prioritizes high-quality, natural-sounding voices
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return null;
    }

    // Always get fresh voices list (voices may load asynchronously)
    let voices: SpeechSynthesisVoice[] = [];
    try {
      voices = window.speechSynthesis.getVoices();
    } catch (error) {
      // If getVoices fails, use cached voices or return null
      if (this.cachedVoices && this.cachedVoices.length > 0) {
        return this.cachedVoices[0];
      }
      return null;
    }
    
    // If no voices yet, try to trigger loading
    if (voices.length === 0) {
      // Try to load voices by triggering the voiceschanged event
      // Note: Some browsers require a user interaction before voices are available
      try {
        // Trigger voice loading by setting up the event handler if not already set
        if (!window.speechSynthesis.onvoiceschanged) {
          window.speechSynthesis.onvoiceschanged = () => {
            this.cachedVoices = window.speechSynthesis.getVoices();
          };
        }
        // Try getting voices again (may still be empty if not loaded yet)
        voices = window.speechSynthesis.getVoices();
      } catch (error) {
        // Silently fail and use cached voices if available
        if (this.cachedVoices && this.cachedVoices.length > 0) {
          voices = this.cachedVoices;
        }
      }
    }

    // Cache voices for future use
    if (voices.length > 0 && !this.cachedVoices) {
      this.cachedVoices = voices;
    }

    // Use cached voices if fresh list is empty
    if (voices.length === 0 && this.cachedVoices && this.cachedVoices.length > 0) {
      voices = this.cachedVoices;
    }

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
   * Speak text with accessibility announcements and high-quality voice
   */
  speak(
    text: string,
    options: {
      rate?: number;
      volume?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    } = {},
  ): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      announceToScreenReader("Speech synthesis not supported", "assertive");
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice quality settings
    const bestVoice = this.getBestVoice();
    if (bestVoice) {
      this.utterance.voice = bestVoice;
    }
    
    // Use optimal settings for natural speech
    this.utterance.rate = options.rate || 1.0; // Default to 1.0 for more natural pace
    this.utterance.volume = options.volume ?? 0.9; // Slightly higher default volume
    this.utterance.pitch = options.pitch || 1.0; // Neutral pitch for clarity
    
    // Set language to match voice or default to en-US
    this.utterance.lang = bestVoice?.lang || "en-US";

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

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

  /**
   * Speak text with accessibility announcements
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
    this.utterance.rate = options.rate || 0.8;
    this.utterance.volume = options.volume || 0.8;
    this.utterance.pitch = options.pitch || 1;

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

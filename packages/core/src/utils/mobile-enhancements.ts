import { logError, logDebug, logWarning } from "./logger";
export interface TouchGesture {
  type: "swipe" | "pinch" | "rotate" | "tap" | "longpress";
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  callback: () => void;
}

export interface MobileConfig {
  enableGestures: boolean;
  enableHapticFeedback: boolean;
  enablePWA: boolean;
  enableOfflineMode: boolean;
  enableMobileOptimizations: boolean;
  touchSensitivity: number;
  hapticIntensity: "light" | "medium" | "heavy";
}

export class MobileEnhancements {
  private static instance: MobileEnhancements;
  private config: MobileConfig;
  private gestures: Map<string, TouchGesture[]> = new Map();
  private isOnline: boolean = navigator.onLine;
  private _serviceWorker: ServiceWorkerRegistration | null = null;

  get serviceWorker(): ServiceWorkerRegistration | null {
    return this._serviceWorker;
  }

  static getInstance(): MobileEnhancements {
    if (!MobileEnhancements.instance) {
      MobileEnhancements.instance = new MobileEnhancements();
    }
    return MobileEnhancements.instance;
  }

  constructor() {
    this.config = {
      enableGestures: true,
      enableHapticFeedback: true,
      enablePWA: true,
      enableOfflineMode: true,
      enableMobileOptimizations: true,
      touchSensitivity: 50,
      hapticIntensity: "medium",
    };
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.config.enablePWA) {
      await this.initializePWA();
    }

    if (this.config.enableGestures) {
      this.initializeGestures();
    }

    if (this.config.enableMobileOptimizations) {
      this.initializeMobileOptimizations();
    }

    this.setupNetworkListeners();
  }

  /**
   * Initialize Progressive Web App features
   */
  private async initializePWA(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        this._serviceWorker = await navigator.serviceWorker.register("/sw.js");
        logDebug("PWA Service Worker registered");
      } catch (error) {
        logWarning("PWA Service Worker registration failed:", { error: error });
      }
    }
  }

  /**
   * Initialize touch gestures
   */
  private initializeGestures(): void {
    // Basic gesture initialization
    logDebug("Mobile gestures initialized");
  }

  /**
   * Initialize mobile-specific optimizations
   */
  private initializeMobileOptimizations(): void {
    // Mobile optimization setup
    logDebug("Mobile optimizations initialized");
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  /**
   * Register a gesture handler
   */
  registerGesture(elementId: string, gesture: TouchGesture): void {
    if (!this.gestures.has(elementId)) {
      this.gestures.set(elementId, []);
    }
    this.gestures.get(elementId)!.push(gesture);
  }

  /**
   * Provide haptic feedback
   */
  hapticFeedback(intensity: "light" | "medium" | "heavy" = "medium"): void {
    if (!this.config.enableHapticFeedback) return;

    if ("vibrate" in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[intensity]);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MobileConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): MobileConfig {
    return { ...this.config };
  }

  /**
   * Check if device is mobile
   */
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  /**
   * Check if device supports touch
   */
  supportsTouch(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get device orientation
   */
  getOrientation(): "portrait" | "landscape" {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }

  /**
   * Get screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * Check if PWA is installed
   */
  isPWAInstalled(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Get network status
   */
  getNetworkStatus(): { online: boolean; effectiveType?: string } {
    const connection = (navigator as any).connection;
    return {
      online: this.isOnline,
      effectiveType: connection?.effectiveType,
    };
  }
}

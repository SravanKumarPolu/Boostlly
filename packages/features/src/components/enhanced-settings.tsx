import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@boostlly/ui";
import { 
  useAutoTheme, 
  logError, 
  logDebug, 
  logWarning,
  getContrastRatio,
  ensureContrast,
  ContrastLevel,
  getLuminance,
  getOptimalForeground,
  ColorPalette,
} from "@boostlly/core";
import {
  Palette,
  Volume2,
  Shield,
  Eye,
  Bell,
  Zap,
  Download,
  RefreshCw,
  Settings,
  LucideIcon,
} from "lucide-react";

interface EnhancedSettingsProps {
  storage: any;
  palette?: ColorPalette;
}

interface UserPreferences {
  // Mode & Experience
  simpleMode: boolean;

  // Theme & Appearance
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontSize: "small" | "medium" | "large";
  animations: boolean;
  compactMode: boolean;
  showAuthor?: boolean;
  showBackground?: boolean;
  showTimeDate?: boolean;

  // Audio & Speech
  textToSpeech: boolean;
  speechRate: number;
  speechVolume: number;
  notificationSounds: boolean;
  soundVolume: number;

  // Privacy & Security
  dataSharing: boolean;
  analyticsEnabled: boolean;
  profileVisibility: "public" | "private" | "friends";

  // Accessibility
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;

  // Notifications
  pushNotifications: boolean;
  dailyReminders: boolean;
  achievementAlerts: boolean;

  // Performance
  autoSync: boolean;
  offlineMode: boolean;
  cacheEnabled: boolean;

  // Networking
  apiProxy?: boolean;
}

export function EnhancedSettings({ storage, palette: propPalette }: EnhancedSettingsProps) {
  // Use auto-theme palette for dynamic contrast (fallback if prop not provided)
  const { palette: autoPalette } = useAutoTheme();
  const palette = propPalette || autoPalette;

  const defaultPalette = {
    primary: "#7C3AED", // Purple
    secondary: "#A78BFA", // Light Purple
    accent: "#9333EA", // Purple
  } as const;
  const [preferences, setPreferences] = useState<UserPreferences>({
    simpleMode: true, // Always true - advanced features removed
    customColors: { ...defaultPalette },
    fontSize: "medium",
    animations: true,
    compactMode: false,
    showAuthor: true,
    showBackground: true,
    textToSpeech: true,
    speechRate: 0.8,
    speechVolume: 80,
    notificationSounds: true,
    soundVolume: 70,
    dataSharing: false,
    analyticsEnabled: true,
    profileVisibility: "public",
    highContrast: false,
    screenReader: false,
    reducedMotion: false,
    pushNotifications: true,
    dailyReminders: true,
    achievementAlerts: true,
    autoSync: true,
    offlineMode: false,
    cacheEnabled: true,
    apiProxy: true,
  });

  const [activeTab, setActiveTab] = useState<
    | "general"
    | "appearance"
    | "audio"
    | "privacy"
    | "accessibility"
    | "notifications"
    | "performance"
  >("general");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  // Keep UI in sync with voice-driven changes without causing save loops
  useEffect(() => {
    const onSettingsUpdate = (e: any) => {
      const detail = e?.detail || {};
      setPreferences((prev) => {
        let next = { ...prev } as UserPreferences;
        if (typeof detail.speechRate === "number") {
          next.speechRate = detail.speechRate;
        } else if (
          detail.speechRate === "INCREMENT" ||
          detail.speechRate === "DECREMENT"
        ) {
          const delta = detail.speechRate === "INCREMENT" ? 0.1 : -0.1;
          next.speechRate = Math.max(
            0.5,
            Math.min(2, Number((next.speechRate + delta).toFixed(1))),
          );
        }
        if (typeof detail.speechVolume === "number") {
          next.speechVolume = Math.max(
            0,
            Math.min(100, detail.speechVolume as number),
          );
        } else if (
          detail.speechVolume === "INCREMENT" ||
          detail.speechVolume === "DECREMENT"
        ) {
          const delta = detail.speechVolume === "INCREMENT" ? 10 : -10;
          next.speechVolume = Math.max(
            0,
            Math.min(100, (next.speechVolume as number) + delta),
          );
        }
        if (typeof detail.textToSpeech === "boolean") {
          next.textToSpeech = detail.textToSpeech;
        }
        return next;
      });
    };
    window.addEventListener(
      "boostlly:settings:update",
      onSettingsUpdate as any,
    );
    return () =>
      window.removeEventListener(
        "boostlly:settings:update",
        onSettingsUpdate as any,
      );
  }, []);

  // Apply custom colors to CSS variables whenever they change
  useEffect(() => {
    try {
      applyCustomColors(preferences.customColors);
    } catch {}
  }, [preferences.customColors]);

  const loadPreferences = async () => {
    try {
      const saved = await storage.get("userPreferences");
      const flatTextToSpeech = (await storage.get("textToSpeech")) as
        | boolean
        | null
        | undefined;
      const flatSpeechRate = (await storage.get("speechRate")) as
        | number
        | null
        | undefined;
      const flatSpeechVolume = (await storage.get("speechVolume")) as
        | number
        | null
        | undefined;
      const flatSimpleMode = (await storage.get("simpleMode")) as
        | boolean
        | null
        | undefined;
      const flatShowTimeDate = (await storage.get("showTimeDate")) as
        | boolean
        | null
        | undefined;
      const merged = {
        ...preferences,
        ...(saved || {}),
      } as UserPreferences;
      const flatApiProxy = (await storage.get("apiProxy")) as
        | boolean
        | null
        | undefined;
      if (typeof flatTextToSpeech === "boolean")
        merged.textToSpeech = flatTextToSpeech;
      if (typeof flatSpeechRate === "number")
        merged.speechRate = flatSpeechRate;
      if (typeof flatSpeechVolume === "number")
        merged.speechVolume = flatSpeechVolume;
      if (typeof flatSimpleMode === "boolean") {
        merged.simpleMode = flatSimpleMode;
      } else {
        merged.simpleMode = true; // default to simple mode
      }
      if (typeof flatApiProxy === "boolean") merged.apiProxy = flatApiProxy;
      if (typeof flatShowTimeDate === "boolean") merged.showTimeDate = flatShowTimeDate;
      setPreferences(merged);
      // Apply loaded custom colors immediately
      try {
        applyCustomColors(merged.customColors);
      } catch {}
    } catch (error) {
      logError("Failed to load preferences:", { error: error });
    }
  };

  const savePreferences = async (newPrefs: Partial<UserPreferences>) => {
    setIsLoading(true);
    try {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      await storage.set("userPreferences", updated);
      // Keep flat keys in sync for legacy consumers
      if (Object.prototype.hasOwnProperty.call(newPrefs, "textToSpeech")) {
        await storage.set("textToSpeech", updated.textToSpeech);
      }
      if (Object.prototype.hasOwnProperty.call(newPrefs, "speechRate")) {
        await storage.set("speechRate", updated.speechRate);
      }
      if (Object.prototype.hasOwnProperty.call(newPrefs, "speechVolume")) {
        await storage.set("speechVolume", updated.speechVolume);
      }
      // Simple mode is now permanently enabled - always save as true
      await storage.set("simpleMode", true);
      if (Object.prototype.hasOwnProperty.call(newPrefs, "apiProxy")) {
        await storage.set("apiProxy", updated.apiProxy ?? true);
        try {
          (window as any).__BOOSTLLY_PROXY__ = updated.apiProxy ?? true;
        } catch {}
      }
      if (Object.prototype.hasOwnProperty.call(newPrefs, "showAuthor")) {
        await storage.set("showAuthor", updated.showAuthor ?? true);
      }
      if (Object.prototype.hasOwnProperty.call(newPrefs, "showBackground")) {
        await storage.set("showBackground", updated.showBackground ?? true);
      }
      if (Object.prototype.hasOwnProperty.call(newPrefs, "showTimeDate")) {
        await storage.set("showTimeDate", updated.showTimeDate ?? true);
      }

      // Broadcast changes so other UIs (Voice tab, global listener) stay in sync
      try {
        const detail: any = {};
        if (Object.prototype.hasOwnProperty.call(newPrefs, "speechRate")) {
          detail.speechRate = updated.speechRate;
        }
        if (Object.prototype.hasOwnProperty.call(newPrefs, "speechVolume")) {
          detail.speechVolume = updated.speechVolume;
        }
        if (Object.prototype.hasOwnProperty.call(newPrefs, "textToSpeech")) {
          detail.textToSpeech = updated.textToSpeech;
        }
        if (Object.keys(detail).length > 0) {
          window.dispatchEvent(
            new CustomEvent("boostlly:settings:update", { detail }),
          );
        }

        // Simple mode is now permanently enabled - no need to broadcast changes

        // Broadcast general preferences that other screens consume
        const prefDetail: any = {};
        if (Object.prototype.hasOwnProperty.call(newPrefs, "showAuthor")) {
          prefDetail.showAuthor = updated.showAuthor;
        }
        if (Object.prototype.hasOwnProperty.call(newPrefs, "showBackground")) {
          prefDetail.showBackground = updated.showBackground;
        }
        if (Object.keys(prefDetail).length > 0) {
          window.dispatchEvent(
            new CustomEvent("boostlly:preferences:update", {
              detail: prefDetail,
            }),
          );
        }
      } catch {}

      // Theme changes are now handled by the dynamic theme provider

      // Apply custom colors immediately
      if (newPrefs.customColors) {
        applyCustomColors(updated.customColors);
      }

      // Apply compact density if toggled
      if (typeof newPrefs.compactMode === "boolean") {
        const root = document.body;
        root.classList.toggle("density-compact", newPrefs.compactMode);
      }
    } catch (error) {
      logError("Failed to save preferences:", { error: error });
    } finally {
      setIsLoading(false);
    }
  };

  const hexToHslTriplet = (hex: string): string => {
    const cleaned = hex.replace("#", "");
    const bigint = parseInt(
      cleaned.length === 3
        ? cleaned
            .split("")
            .map((c) => c + c)
            .join("")
        : cleaned,
      16,
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const r1 = r / 255;
    const g1 = g / 255;
    const b1 = b / 255;
    const max = Math.max(r1, g1, b1);
    const min = Math.min(r1, g1, b1);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r1:
          h = ((g1 - b1) / d) % 6;
          break;
        case g1:
          h = (b1 - r1) / d + 2;
          break;
        default:
          h = (r1 - g1) / d + 4;
      }
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyCustomColors = (colors: UserPreferences["customColors"]) => {
    const root = document.documentElement;
    try {
      if (colors?.primary) {
        root.style.setProperty("--primary", hexToHslTriplet(colors.primary));
      }
      if (colors?.secondary) {
        root.style.setProperty(
          "--secondary",
          hexToHslTriplet(colors.secondary),
        );
      }
      if (colors?.accent) {
        root.style.setProperty("--accent", hexToHslTriplet(colors.accent));
      }
    } catch {}
  };

  const exportPreferences = async () => {
    try {
      const dataStr = JSON.stringify(preferences, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "boostlly-preferences.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      logError("Failed to export preferences:", { error: error });
    }
  };

  const resetToDefaults = async () => {
    if (
      confirm("Are you sure you want to reset all preferences to defaults?")
    ) {
      const defaults: UserPreferences = {
        simpleMode: true, // Always true - advanced features removed
        customColors: { ...defaultPalette },
        fontSize: "medium",
        animations: true,
        compactMode: false,
        textToSpeech: true,
        speechRate: 0.8,
        speechVolume: 80,
        notificationSounds: true,
        soundVolume: 70,
        dataSharing: false,
        analyticsEnabled: true,
        profileVisibility: "public",
        highContrast: false,
        screenReader: false,
        reducedMotion: false,
        pushNotifications: true,
        dailyReminders: true,
        achievementAlerts: true,
        autoSync: true,
        offlineMode: false,
        cacheEnabled: true,
      };
      await savePreferences(defaults);
    }
  };

  // Calculate contrast-adjusted colors for tabs and UI elements
  // IMPORTANT: This hook must be called before any conditional returns to follow Rules of Hooks
  const tabColors = useMemo(() => {
    if (!palette?.bg) {
      // Fallback: use high-contrast colors that work on light backgrounds
      return {
        activeText: "#FFFFFF",
        inactiveText: "#374151", // Dark gray with excellent contrast on light
        hoverText: "#1F2937", // Darker for hover
        activeBg: "#7C3AED", // Primary color
        inactiveBg: "transparent",
        tabBackdropColor: "#FFFFFF",
        activeContrast: 4.5,
        inactiveContrast: 12.0,
      };
    }

    const bgColor = palette.bg;
    const bgLuminance = getLuminance(bgColor);
    const isDarkBg = bgLuminance < 0.5;
    
    // Tab backdrop color: dark overlay for dark backgrounds, light overlay for light backgrounds
    // This ensures tabs have a consistent, high-contrast background
    const tabBackdropColor = isDarkBg ? "#1F2937" : "#FFFFFF"; // Dark gray or white
    
    // Active tab background: use accent/primary color from palette
    const activeBg = palette?.accent || "#7C3AED";
    
    // Active tab text: ensure high contrast with active background (not backdrop)
    // Use white text on dark backgrounds, dark text on light backgrounds
    let activeText = getOptimalForeground(activeBg);
    let activeContrast = getContrastRatio(activeText, activeBg);
    
    // Ensure active tab text meets WCAG AA normal text (4.5:1) against active background
    if (activeContrast < ContrastLevel.AA_NORMAL) {
      const { fg: adjustedActive } = ensureContrast(
        activeText, 
        activeBg, 
        ContrastLevel.AA_NORMAL,
        true
      );
      activeText = adjustedActive;
      activeContrast = getContrastRatio(activeText, activeBg);
    }
    
    // Inactive tabs: high contrast color that's clearly visible and distinguishable
    // Must meet WCAG AA for UI components (3:1), prefer 4.5:1 for better visibility
    let inactiveText: string;
    
    if (isDarkBg) {
      // Dark backdrop: use light gray for excellent contrast
      inactiveText = "#D1D5DB"; // Light gray
      let inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      
      // Ensure it meets minimum (should easily meet 4.5:1)
      if (inactiveContrast < ContrastLevel.AA_NORMAL) {
        const { fg: adjustedInactive } = ensureContrast(
          inactiveText,
          tabBackdropColor,
          ContrastLevel.AA_NORMAL,
          true
        );
        inactiveText = adjustedInactive;
        inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      }
    } else {
      // Light backdrop: use dark gray for excellent contrast
      inactiveText = "#374151"; // Dark gray
      let inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      
      // Ensure it meets minimum (should easily meet 4.5:1)
      if (inactiveContrast < ContrastLevel.AA_NORMAL) {
        const { fg: adjustedInactive } = ensureContrast(
          inactiveText,
          tabBackdropColor,
          ContrastLevel.AA_NORMAL,
          true
        );
        inactiveText = adjustedInactive;
        inactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
      }
    }
    
    // Hover state: slightly darker/lighter than inactive for clear feedback
    const hoverText = isDarkBg 
      ? "#F3F4F6" // Lighter for dark backdrop
      : "#1F2937"; // Darker for light backdrop
    
    // Final verification
    const finalActiveContrast = getContrastRatio(activeText, activeBg);
    const finalInactiveContrast = getContrastRatio(inactiveText, tabBackdropColor);
    const finalHoverContrast = getContrastRatio(hoverText, tabBackdropColor);
    
    return {
      activeText,
      inactiveText,
      hoverText,
      activeBg,
      inactiveBg: "transparent",
      tabBackdropColor,
      activeContrast: finalActiveContrast,
      inactiveContrast: finalInactiveContrast,
    };
  }, [palette]);

  // Calculate contrast-adjusted colors for text elements
  const textColors = useMemo(() => {
    if (!palette?.bg) {
      return {
        primary: "hsl(var(--foreground))",
        secondary: "hsl(var(--muted-foreground))",
        cardTitle: "hsl(var(--foreground))",
        cardText: "hsl(var(--foreground))",
      };
    }

    const bgColor = palette.bg;
    const bgLuminance = getLuminance(bgColor);
    
    // Card background: semi-transparent overlay for better contrast
    const cardBg = bgLuminance < 0.5 ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)";
    
    // Primary text: ensure high contrast on card background
    let primaryText = palette?.fg || getOptimalForeground(cardBg);
    let primaryContrast = getContrastRatio(primaryText, cardBg);
    
    if (primaryContrast < ContrastLevel.AA_NORMAL) {
      const { fg: adjustedPrimary } = ensureContrast(
        primaryText,
        cardBg,
        ContrastLevel.AA_NORMAL,
        true
      );
      primaryText = adjustedPrimary;
    }
    
    // Secondary text: slightly muted but still readable
    let secondaryText = bgLuminance < 0.5 ? "#D1D5DB" : "#6B7280";
    let secondaryContrast = getContrastRatio(secondaryText, cardBg);
    
    if (secondaryContrast < ContrastLevel.AA_NORMAL) {
      const { fg: adjustedSecondary } = ensureContrast(
        secondaryText,
        cardBg,
        ContrastLevel.AA_NORMAL,
        true
      );
      secondaryText = adjustedSecondary;
    }
    
    return {
      primary: primaryText,
      secondary: secondaryText,
      cardTitle: primaryText,
      cardText: primaryText,
      cardBg,
    };
  }, [palette]);

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <Card className="border border-border shadow-sm" style={{ backgroundColor: textColors.cardBg }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
            <Settings className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <Card style={{ backgroundColor: textColors.cardBg }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
            <Palette className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
            Theme & Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: textColors.cardTitle }}>Custom Colors</h4>
            <p className="text-xs font-medium" style={{ color: textColors.secondary }}>
              Default palette: Primary{" "}
              <span className="font-semibold">#7C3AED</span>, Secondary{" "}
              <span className="font-semibold">#A78BFA</span>, Accent
              <span className="font-semibold"> #9333EA</span>
            </p>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  savePreferences({ customColors: { ...defaultPalette } })
                }
              >
                Apply Default Palette
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {(["primary", "secondary", "accent"] as const).map(
                (colorType) => (
                  <div key={colorType} className="space-y-2">
                    <label className="text-sm font-semibold capitalize" style={{ color: textColors.cardText }}>
                      {colorType}
                    </label>
                    <Input
                      value={preferences.customColors[colorType]}
                      onChange={(e) =>
                        savePreferences({
                          customColors: {
                            ...preferences.customColors,
                            [colorType]: e.target.value,
                          },
                        })
                      }
                      className="w-full text-sm"
                      placeholder="#000000"
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Animations</span>
              <Switch
                checked={preferences.animations}
                onCheckedChange={(checked) =>
                  savePreferences({ animations: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Compact Mode</span>
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={(checked) =>
                  savePreferences({ compactMode: checked })
                }
              />
            </div>
          </div>

          {/* Display preferences */}
          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: textColors.cardTitle }}>Display</h4>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Show author</span>
              <Switch
                checked={preferences.showAuthor ?? true}
                onCheckedChange={(checked) =>
                  savePreferences({ showAuthor: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Show daily background</span>
              <Switch
                checked={preferences.showBackground ?? true}
                onCheckedChange={(checked) =>
                  savePreferences({ showBackground: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Show time and date</span>
              <Switch
                checked={preferences.showTimeDate ?? true}
                onCheckedChange={(checked) =>
                  savePreferences({ showTimeDate: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAudioTab = () => {
    // Sound preview function (requires user gesture)
    const handleSoundPreview = async () => {
      try {
        // Import sound manager dynamically to avoid SSR issues
        const { playSound } = await import("@boostlly/core");
        await playSound("crystal-chime", preferences.soundVolume);
      } catch (error) {
        logWarning("Sound preview failed:", { error: error });
        // Fallback: show a brief visual feedback
        const button = document.querySelector(
          "[data-sound-preview]",
        ) as HTMLElement;
        if (button) {
          button.style.transform = "scale(0.95)";
          setTimeout(() => {
            button.style.transform = "scale(1)";
          }, 100);
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Notification Sounds */}
        <Card style={{ backgroundColor: textColors.cardBg }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
              <Volume2 className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
              Notification Sounds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Enable Notification Sounds</span>
              <Switch
                checked={preferences.notificationSounds}
                onCheckedChange={(checked) =>
                  savePreferences({ notificationSounds: checked })
                }
              />
            </div>

            {preferences.notificationSounds && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: textColors.cardText }}>Sound Volume</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={preferences.soundVolume}
                      onChange={(e) =>
                        savePreferences({
                          soundVolume: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12 font-medium" style={{ color: textColors.cardText }}>
                      {preferences.soundVolume}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    data-sound-preview
                    onClick={handleSoundPreview}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium"
                    aria-label="Preview notification sound"
                  >
                    <Volume2 className="w-4 h-4" strokeWidth={2} />
                    Preview Sound
                  </button>
                  <span className="text-xs font-medium" style={{ color: textColors.secondary }}>
                    Click to test sound (requires user interaction)
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Text-to-Speech */}
        <Card style={{ backgroundColor: textColors.cardBg }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
              <Volume2 className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
              Text-to-Speech
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Enable Text-to-Speech</span>
              <Switch
                checked={preferences.textToSpeech}
                onCheckedChange={(checked) =>
                  savePreferences({ textToSpeech: checked })
                }
              />
            </div>

            {preferences.textToSpeech && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: textColors.cardText }}>Speech Rate</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={preferences.speechRate}
                      onChange={(e) =>
                        savePreferences({
                          speechRate: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12 font-medium" style={{ color: textColors.cardText }}>
                      {preferences.speechRate}x
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: textColors.cardText }}>Volume</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={preferences.speechVolume}
                      onChange={(e) =>
                        savePreferences({
                          speechVolume: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12 font-medium" style={{ color: textColors.cardText }}>
                      {preferences.speechVolume}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Removed unused renderAppearanceExtra to satisfy TypeScript noUnusedLocals

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <Card style={{ backgroundColor: textColors.cardBg }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
            <Shield className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
            Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Data Sharing</span>
            <Switch
              checked={preferences.dataSharing}
              onCheckedChange={(checked) =>
                savePreferences({ dataSharing: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Analytics</span>
            <Switch
              checked={preferences.analyticsEnabled}
              onCheckedChange={(checked) =>
                savePreferences({ analyticsEnabled: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>
              Use API Proxy (fixes CORS in extension)
            </span>
            <Switch
              checked={preferences.apiProxy ?? true}
              onCheckedChange={(checked) =>
                savePreferences({ apiProxy: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      <Card style={{ backgroundColor: textColors.cardBg }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
            <Eye className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
            Accessibility Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>High Contrast</span>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={(checked) =>
                savePreferences({ highContrast: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Screen Reader Support</span>
            <Switch
              checked={preferences.screenReader}
              onCheckedChange={(checked) =>
                savePreferences({ screenReader: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Reduced Motion</span>
            <Switch
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) =>
                savePreferences({ reducedMotion: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card style={{ backgroundColor: textColors.cardBg }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
            <Bell className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Push Notifications</span>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                savePreferences({ pushNotifications: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Daily Reminders</span>
            <Switch
              checked={preferences.dailyReminders}
              onCheckedChange={(checked) =>
                savePreferences({ dailyReminders: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Achievement Alerts</span>
            <Switch
              checked={preferences.achievementAlerts}
              onCheckedChange={(checked) =>
                savePreferences({ achievementAlerts: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <Card style={{ backgroundColor: textColors.cardBg }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold" style={{ color: textColors.cardTitle }}>
            <Zap className="w-5 h-5" style={{ color: textColors.cardTitle }} strokeWidth={2} />
            Performance & Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Auto Sync</span>
            <Switch
              checked={preferences.autoSync}
              onCheckedChange={(checked) =>
                savePreferences({ autoSync: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Offline Mode</span>
            <Switch
              checked={preferences.offlineMode}
              onCheckedChange={(checked) =>
                savePreferences({ offlineMode: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: textColors.cardText }}>Cache Enabled</span>
            <Switch
              checked={preferences.cacheEnabled}
              onCheckedChange={(checked) =>
                savePreferences({ cacheEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // TabButton component for proper contrast handling
  interface TabButtonProps {
    id: string;
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onClick: () => void;
    tabColors: {
      activeText: string;
      inactiveText: string;
      hoverText: string;
      activeBg: string;
      inactiveBg: string;
    };
  }

  const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, isActive, onClick, tabColors }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const textColor = isActive 
      ? tabColors.activeText 
      : isHovered 
        ? tabColors.hoverText 
        : tabColors.inactiveText;
    
    return (
      <button
        key={id}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-selected={isActive}
        role="tab"
        className="flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        style={{
          backgroundColor: isActive ? tabColors.activeBg : tabColors.inactiveBg,
          color: textColor,
          fontWeight: isActive ? 600 : 400,
        }}
      >
        <Icon 
          className="w-4 h-4" 
          style={{ color: textColor }}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <span>{label}</span>
      </button>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralTab();
      case "appearance":
        return renderAppearanceTab();
      case "audio":
        return renderAudioTab();
      case "privacy":
        return renderPrivacyTab();
      case "accessibility":
        return renderAccessibilityTab();
      case "notifications":
        return renderNotificationsTab();
      case "performance":
        return renderPerformanceTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
        <div className="min-w-0">
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{ color: textColors.primary }}
          >
            Enhanced Settings
          </h2>
          <p
            className="text-sm sm:text-base font-medium"
            style={{ color: textColors.secondary }}
          >
            Advanced customization and preferences
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportPreferences}
            className="w-full xs:w-auto sm:w-auto font-medium"
            style={{
              color: textColors.primary,
              borderColor: textColors.secondary,
            }}
          >
            <Download
              className="w-4 h-4 mr-2"
              style={{ color: textColors.primary }}
              strokeWidth={2}
            />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="w-full xs:w-auto sm:w-auto font-medium"
            style={{
              color: textColors.primary,
              borderColor: textColors.secondary,
            }}
          >
            <RefreshCw
              className="w-4 h-4 mr-2"
              style={{ color: textColors.primary }}
              strokeWidth={2}
            />
            Reset
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div 
        className="sticky top-0 z-10 -mx-4 sm:mx-0 px-4 sm:px-0 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm"
        style={{ backgroundColor: tabColors.tabBackdropColor + "CC" }} // 80% opacity
      >
        <div 
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide rounded-lg p-1 border elevation-1"
          style={{ 
            backgroundColor: tabColors.tabBackdropColor,
            borderColor: textColors.secondary + "40", // 25% opacity
          }}
        >
          {[
            { id: "general", label: "General", icon: Settings },
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "audio", label: "Audio", icon: Volume2 },
            { id: "privacy", label: "Privacy", icon: Shield },
            { id: "accessibility", label: "Accessibility", icon: Eye },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "performance", label: "Performance", icon: Zap },
          ].map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === (tab.id as any)}
              onClick={() => setActiveTab(tab.id as any)}
              tabColors={tabColors}
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[360px] sm:min-h-[400px] pb-4">
        {renderTabContent()}
      </div>

      {/* Save Status */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: textColors.secondary }}>
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: textColors.secondary }} strokeWidth={2} />
          Saving preferences...
        </div>
      )}
    </div>
  );
}

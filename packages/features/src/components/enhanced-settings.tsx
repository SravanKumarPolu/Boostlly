import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@boostlly/ui";
import { useAutoTheme, logError, logDebug, logWarning } from "@boostlly/core";
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
} from "lucide-react";

interface EnhancedSettingsProps {
  storage: any;
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

export function EnhancedSettings({ storage }: EnhancedSettingsProps) {
  // Use auto-theme palette for dynamic contrast
  const { palette } = useAutoTheme();

  const defaultPalette = {
    primary: "#7C3AED", // Purple
    secondary: "#A78BFA", // Light Purple
    accent: "#9333EA", // Purple
  } as const;
  const [preferences, setPreferences] = useState<UserPreferences>({
    simpleMode: true,
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
      if (Object.prototype.hasOwnProperty.call(newPrefs, "simpleMode")) {
        await storage.set("simpleMode", updated.simpleMode);
      }
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

        // Broadcast simple mode changes
        if (Object.prototype.hasOwnProperty.call(newPrefs, "simpleMode")) {
          window.dispatchEvent(
            new CustomEvent("boostlly:simpleMode:changed", {
              detail: { simpleMode: updated.simpleMode },
            }),
          );
        }

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
        simpleMode: true,
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

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-2">
                Simple Mode
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hide advanced features for a cleaner, simpler experience
              </p>
            </div>
            <div className="flex-shrink-0 pt-1">
              <Switch
                checked={preferences.simpleMode}
                onCheckedChange={(checked) => {
                  setPreferences((prev) => ({ ...prev, simpleMode: checked }));
                  savePreferences({ ...preferences, simpleMode: checked });
                }}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          {preferences.simpleMode && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Simple Mode Active
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Advanced features like Voice Commands, AI Analytics, Pattern
                    Recognition, and API Explorer are now hidden. You can switch
                    back anytime in Settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme & Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Custom Colors</h4>
            <p className="text-xs text-muted-foreground">
              Default palette: Primary{" "}
              <span className="font-medium">#7C3AED</span>, Secondary{" "}
              <span className="font-medium">#A78BFA</span>, Accent
              <span className="font-medium"> #9333EA</span>
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
                    <label className="text-sm font-medium capitalize">
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
              <span className="text-sm">Animations</span>
              <Switch
                checked={preferences.animations}
                onCheckedChange={(checked) =>
                  savePreferences({ animations: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">Compact Mode</span>
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
            <h4 className="font-medium">Display</h4>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">Show author</span>
              <Switch
                checked={preferences.showAuthor ?? true}
                onCheckedChange={(checked) =>
                  savePreferences({ showAuthor: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">Show daily background</span>
              <Switch
                checked={preferences.showBackground ?? true}
                onCheckedChange={(checked) =>
                  savePreferences({ showBackground: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">Show time and date</span>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Notification Sounds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Notification Sounds</span>
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
                  <label className="text-sm font-medium">Sound Volume</label>
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
                    <span className="text-sm w-12">
                      {preferences.soundVolume}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    data-sound-preview
                    onClick={handleSoundPreview}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Preview notification sound"
                  >
                    <Volume2 className="w-4 h-4" />
                    Preview Sound
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Click to test sound (requires user interaction)
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Text-to-Speech */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Text-to-Speech
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Text-to-Speech</span>
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
                  <label className="text-sm font-medium">Speech Rate</label>
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
                    <span className="text-sm w-12">
                      {preferences.speechRate}x
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume</label>
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
                    <span className="text-sm w-12">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Data Sharing</span>
            <Switch
              checked={preferences.dataSharing}
              onCheckedChange={(checked) =>
                savePreferences({ dataSharing: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Analytics</span>
            <Switch
              checked={preferences.analyticsEnabled}
              onCheckedChange={(checked) =>
                savePreferences({ analyticsEnabled: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Accessibility Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">High Contrast</span>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={(checked) =>
                savePreferences({ highContrast: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Screen Reader Support</span>
            <Switch
              checked={preferences.screenReader}
              onCheckedChange={(checked) =>
                savePreferences({ screenReader: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Reduced Motion</span>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Push Notifications</span>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                savePreferences({ pushNotifications: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Daily Reminders</span>
            <Switch
              checked={preferences.dailyReminders}
              onCheckedChange={(checked) =>
                savePreferences({ dailyReminders: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Achievement Alerts</span>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance & Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto Sync</span>
            <Switch
              checked={preferences.autoSync}
              onCheckedChange={(checked) =>
                savePreferences({ autoSync: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Offline Mode</span>
            <Switch
              checked={preferences.offlineMode}
              onCheckedChange={(checked) =>
                savePreferences({ offlineMode: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Cache Enabled</span>
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
            style={{ color: palette?.fg || "hsl(var(--foreground))" }}
          >
            Enhanced Settings
          </h2>
          <p
            className="text-sm sm:text-base"
            style={{ color: palette?.fg || "hsl(var(--foreground))" }}
          >
            Advanced customization and preferences
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportPreferences}
            className="w-full xs:w-auto sm:w-auto"
            style={{
              color: palette?.fg || "hsl(var(--foreground))",
              borderColor: palette?.fg || "hsl(var(--border))",
            }}
          >
            <Download
              className="w-4 h-4 mr-2"
              style={{ color: palette?.fg || "hsl(var(--foreground))" }}
            />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="w-full xs:w-auto sm:w-auto"
            style={{
              color: palette?.fg || "hsl(var(--foreground))",
              borderColor: palette?.fg || "hsl(var(--border))",
            }}
          >
            <RefreshCw
              className="w-4 h-4 mr-2"
              style={{ color: palette?.fg || "hsl(var(--foreground))" }}
            />
            Reset
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 -mx-4 sm:mx-0 px-4 sm:px-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide bg-card rounded-lg p-1 border border-border elevation-1 hover-soft">
          {[
            { id: "general", label: "General", icon: Settings },
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "audio", label: "Audio", icon: Volume2 },
            { id: "privacy", label: "Privacy", icon: Shield },
            { id: "accessibility", label: "Accessibility", icon: Eye },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "performance", label: "Performance", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              aria-selected={activeTab === (tab.id as any)}
              role="tab"
              className={
                activeTab === (tab.id as any)
                  ? "flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm whitespace-nowrap shadow"
                  : "flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent text-xs sm:text-sm whitespace-nowrap"
              }
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[360px] sm:min-h-[400px] pb-4">
        {renderTabContent()}
      </div>

      {/* Save Status */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Saving preferences...
        </div>
      )}
    </div>
  );
}

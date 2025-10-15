"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Badge,
  Input,
  Switch,
  Progress,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@boostlly/ui";
import { StorageService } from "@boostlly/platform-web";
// Monitoring features removed for privacy-first approach
import {
  BarChart3,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
} from "lucide-react";

export default function AdvancedSettingsPage() {
  const storage = new StorageService();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Generate user ID only on client side
    setUserId("user_" + Math.random().toString(36).substr(2, 9));
  }, []);

  // Privacy settings
  const [privacyMode, setPrivacyMode] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Storage settings
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(50 * 1024 * 1024); // 50MB
  const [cacheSize, setCacheSize] = useState(0);

  // Performance settings
  const [isOnline, setIsOnline] = useState(true); // Default to true, will update on mount
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial online status only on client
    setIsOnline(navigator.onLine);
    
    loadSettings();
    loadStorageInfo();

    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const settings = (await storage.get("settings")) || {};
      setPrivacyMode(settings.privacyMode !== false);
      setDataCollection(settings.dataCollection === true);
      setAnalyticsEnabled(settings.analyticsEnabled === true);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      // Calculate storage usage
      let totalSize = 0;
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith("boostlly_")) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length * 2; // Rough estimate (2 bytes per char)
          }
        }
      }

      setStorageUsed(totalSize);
      setCacheSize(Math.floor(totalSize * 0.3)); // Estimate cache as 30% of total
    } catch (error) {
      console.error("Failed to load storage info:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await storage.set("settings", {
        privacyMode,
        dataCollection,
        analyticsEnabled,
      });

      // Show success feedback
      const button = document.querySelector(".save-settings-btn");
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 300);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const clearCache = async () => {
    try {
      // Clear only cache-related data, preserve user data
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (
          key.startsWith("boostlly_cache_") ||
          key.startsWith("boostlly_temp_")
        ) {
          localStorage.removeItem(key);
        }
      }

      await loadStorageInfo();
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };

  const clearAllData = async () => {
    if (
      confirm("Are you sure you want to clear all data? This cannot be undone.")
    ) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith("boostlly_")) {
            localStorage.removeItem(key);
          }
        }

        await loadStorageInfo();
        await loadSettings();
      } catch (error) {
        console.error("Failed to clear all data:", error);
      }
    }
  };

  const exportData = async () => {
    try {
      const data: any = {};
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith("boostlly_")) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `boostlly-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStoragePercentage = (): number => {
    return Math.min((storageUsed / storageLimit) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Advanced Settings
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Configure privacy, storage, and performance settings for your
            Boostlly experience.
          </p>
        </div>

        {/* Privacy Settings */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Privacy Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Enhanced privacy protection (recommended)
                  </p>
                </div>
                <Switch
                  checked={privacyMode}
                  onCheckedChange={setPrivacyMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Data Collection</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow collection of usage data (disabled for privacy)
                  </p>
                </div>
                <Switch
                  checked={dataCollection}
                  onCheckedChange={setDataCollection}
                  disabled={privacyMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable usage analytics (disabled for privacy)
                  </p>
                </div>
                <Switch
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                  disabled={privacyMode}
                />
              </div>
            </div>

            {privacyMode && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Privacy Mode Active
                  </span>
                </div>
                <p className="text-sm text-green-400/80 mt-1">
                  All data stays on your device. No external tracking or
                  analytics.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Information */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-400" />
              Storage & Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Storage Used</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatBytes(storageUsed)} of {formatBytes(storageLimit)}
                  </p>
                </div>
                <Badge
                  variant={
                    getStoragePercentage() > 80 ? "destructive" : "secondary"
                  }
                >
                  {getStoragePercentage().toFixed(1)}%
                </Badge>
              </div>

              <Progress value={getStoragePercentage()} className="h-2" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Total Data</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatBytes(storageUsed)}
                  </p>
                </div>

                <div className="p-4 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">Cache</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatBytes(cacheSize)}
                  </p>
                </div>

                <div className="p-4 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatBytes(storageLimit - storageUsed)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={clearCache}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache
              </Button>
              <Button
                onClick={clearAllData}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-400" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={exportData} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Button
                onClick={loadStorageInfo}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Stats
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Export your quotes, collections, and settings for backup or
              migration.
            </p>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {isOnline ? "Online" : "Offline"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline
                    ? "Connected to the internet"
                    : "Working offline - all data stored locally"}
                </p>
              </div>
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? "Connected" : "Offline"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={saveSettings}
            className="save-settings-btn px-8 py-3 text-lg"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

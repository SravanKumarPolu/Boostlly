"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Switch,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@boostlly/ui";
import {
  Settings,
  Bell,
  Palette,
  Shield,
  Smartphone,
  Monitor,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5" />
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Compact Mode</span>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Data & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/privacy"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Privacy Policy & Data Transparency</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Learn how we protect your data and what information is stored locally.
            </p>
            <div className="flex items-center justify-between pt-2 border-t">
              <span>Auto-save Quotes</span>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
          </CardContent>
        </Card>

        {/* Device Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Device Sync</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sync your data across all your devices
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

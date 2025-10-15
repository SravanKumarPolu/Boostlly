"use client";

import React from "react";
import { VoiceCommands } from "@boostlly/features";
import { Quote, UserPreferences } from "@boostlly/core";

export const dynamic = "force-dynamic";

export default function Page() {
  const userQuotes: Quote[] = [
    {
      id: "1",
      text: "The best way to predict the future is to invent it.",
      author: "Alan Kay",
      category: "innovation",
      tags: [],
    },
    {
      id: "2",
      text: "What you do speaks so loudly that I cannot hear what you say.",
      author: "Ralph Waldo Emerson",
      category: "wisdom",
      tags: [],
    },
  ];

  const userPreferences: UserPreferences = {
    theme: "auto",
    customColors: {
      primary: "#3B82F6",
      secondary: "#10B981",
      accent: "#F59E0B",
    },
    fontSize: "medium",
    animations: true,
    compactMode: false,
    textToSpeech: true,
    speechRate: 0.9,
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
    notifications: true,
    dailyReminder: true,
    categories: ["motivation", "success", "wisdom"],
    language: "en",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Voice Commands & Speech</h1>
      <VoiceCommands
        userQuotes={userQuotes}
        userPreferences={userPreferences}
        onQuoteSelect={() => {}}
        onNavigate={() => {}}
      />
    </div>
  );
}

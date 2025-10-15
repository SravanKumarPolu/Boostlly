"use client";

import React from "react";
import { PatternRecognition } from "@boostlly/features";
import { Quote, UserPreferences } from "@boostlly/core";

export const dynamic = "force-dynamic";

export default function Page() {
  const userQuotes: Quote[] = [
    {
      id: "1",
      text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      author: "Will Durant",
      category: "habits",
      tags: [],
    },
    {
      id: "2",
      text: "Motivation is what gets you started. Habit is what keeps you going.",
      author: "Jim Ryun",
      category: "habits",
      tags: [],
    },
  ];

  const userPreferences: UserPreferences = {
    theme: "auto",
    notifications: true,
    dailyReminder: true,
    categories: ["habits"],
    language: "en",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pattern Recognition</h1>
      <PatternRecognition
        userQuotes={userQuotes}
        userPreferences={userPreferences}
      />
    </div>
  );
}

"use client";

import React from "react";
import { AdvancedPredictions } from "@boostlly/features";
import { Quote, UserPreferences } from "@boostlly/core";

export const dynamic = "force-dynamic";

export default function Page() {
  const userQuotes: Quote[] = [
    {
      id: "1",
      text: "Simplicity is the soul of efficiency.",
      author: "Austin Freeman",
      category: "productivity",
      tags: [],
    },
    {
      id: "2",
      text: "Well begun is half done.",
      author: "Aristotle",
      category: "motivation",
      tags: [],
    },
    {
      id: "3",
      text: "Action is the foundational key to all success.",
      author: "Pablo Picasso",
      category: "success",
      tags: [],
    },
  ];

  const userPreferences: UserPreferences = {
    theme: "auto",
    notifications: true,
    dailyReminder: true,
    categories: ["motivation"],
    language: "en",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Advanced Predictive Analytics</h1>
      
      <AdvancedPredictions
        userQuotes={userQuotes}
        userPreferences={userPreferences}
      />
    </div>
  );
}

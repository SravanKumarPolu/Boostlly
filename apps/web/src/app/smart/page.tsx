"use client";

import React from "react";
import dynamic from "next/dynamic";
import { SmartRecommendations } from "@boostlly/features";
import { Quote, UserPreferences } from "@boostlly/core";

function ClientPage() {
  const userQuotes: Quote[] = [
    {
      id: "1",
      text: "Do or do not. There is no try.",
      author: "Yoda",
      category: "motivation",
      tags: [],
    },
    {
      id: "2",
      text: "The only limit to our realization of tomorrow is our doubts of today.",
      author: "F. D. Roosevelt",
      category: "motivation",
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
      <h1 className="text-2xl font-bold mb-4">Smart Recommendations</h1>
      <SmartRecommendations
        userQuotes={userQuotes}
        userPreferences={userPreferences}
        onQuoteSelect={() => {}}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(ClientPage), { ssr: false });

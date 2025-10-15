"use client";

import React from "react";
import dynamic from "next/dynamic";
import { IntelligentCategorization } from "@boostlly/features";
import { Quote, UserPreferences } from "@boostlly/core";

function ClientPage() {
  const userQuotes: Quote[] = [
    {
      id: "1",
      text: "Stay hungry, stay foolish.",
      author: "Steve Jobs",
      category: "motivation",
      tags: [],
    },
    {
      id: "2",
      text: "The only true wisdom is in knowing you know nothing.",
      author: "Socrates",
      category: "wisdom",
      tags: [],
    },
  ];

  const userPreferences: UserPreferences = {
    theme: "auto",
    notifications: true,
    dailyReminder: true,
    categories: ["motivation", "wisdom"],
    language: "en",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Intelligent Categorization</h1>
      <IntelligentCategorization
        userQuotes={userQuotes}
        userPreferences={userPreferences}
        onQuoteUpdate={() => {}}
        onCategoryCreate={() => {}}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(ClientPage), { ssr: false });

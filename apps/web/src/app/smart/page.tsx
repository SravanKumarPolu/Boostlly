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
      
      {/* Beta Notice */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-1.5 flex-shrink-0"></div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
              🚀 Advanced Features - Beta Version
            </h3>
            <p className="text-xs text-purple-500 dark:text-purple-300 mb-3">
              These advanced features are currently in beta. Coming soon with full functionality:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                <span>AI-Powered Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                <span>Smart Predictions</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                <span>Voice Commands</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                <span>Pattern Recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SmartRecommendations
        userQuotes={userQuotes}
        userPreferences={userPreferences}
        onQuoteSelect={() => {}}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(ClientPage), { ssr: false });

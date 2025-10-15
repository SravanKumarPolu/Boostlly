"use client";

import React from "react";
import {
  Brain,
  Users,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Personal Motivation Insights
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover patterns in your motivational journey with privacy-focused
            insights.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Quote Patterns</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Analyze your favorite quotes to discover what motivates you most.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Motivation</span>
                <span className="text-blue-400">45%</span>
              </div>
              <div className="w-full bg-background/30 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold">Favorite Authors</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              See which authors resonate most with your personal values.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Steve Jobs</span>
                <span className="text-red-400">8 quotes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Winston Churchill</span>
                <span className="text-red-400">5 quotes</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold">Reading Habits</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Track your daily motivation reading patterns and streaks.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Streak</span>
                <span className="text-green-400">7 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Best Streak</span>
                <span className="text-green-400">21 days</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Quote Categories</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Discover which types of quotes inspire you most.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success</span>
                <span className="text-purple-400">12 quotes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Leadership</span>
                <span className="text-purple-400">9 quotes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Privacy-First Insights
          </h3>
          <p className="text-muted-foreground text-center">
            All insights are generated locally from your saved data. No external
            analysis, no data sharing, no cloud processing. Your patterns stay
            private.
          </p>
        </div>
      </div>
    </div>
  );
}

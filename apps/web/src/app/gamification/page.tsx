"use client";

import React from "react";
import { Trophy, Target, Star, Calendar, BookOpen, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Personal Growth Tracking
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your daily motivation journey with simple, privacy-focused
            progress indicators.
          </p>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-1">7</h3>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 text-center">
            <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-1">42</h3>
            <p className="text-sm text-muted-foreground">Quotes Read</p>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-1">18</h3>
            <p className="text-sm text-muted-foreground">Favorites</p>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-1">3</h3>
            <p className="text-sm text-muted-foreground">Collections</p>
          </div>
        </div>

        {/* Simple Achievements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Your Progress</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Daily Reader</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Read a motivational quote every day for 7 days straight.
              </p>
              <div className="w-full bg-background/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Completed! 🎉
              </p>
            </div>

            <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold">Quote Collector</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Save 20 quotes to your favorites.
              </p>
              <div className="w-full bg-background/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                  style={{ width: "90%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                18/20 quotes saved
              </p>
            </div>

            <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold">Organizer</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Create 5 different quote collections.
              </p>
              <div className="w-full bg-background/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-teal-400 h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                3/5 collections created
              </p>
            </div>

            <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold">Explorer</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Read quotes from 10 different categories.
              </p>
              <div className="w-full bg-background/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                  style={{ width: "80%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                8/10 categories explored
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Privacy-First Progress Tracking
          </h3>
          <p className="text-muted-foreground text-center">
            All your progress is stored locally on your device. No external
            tracking, no data collection, no servers. Your achievements are
            yours alone.
          </p>
        </div>
      </div>
    </div>
  );
}

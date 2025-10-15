"use client";

import React from "react";
import {
  Shield,
  Database,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
} from "lucide-react";

export default function SyncPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Local Data Management
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All your data stays on your device. No cloud sync, no external
            servers, complete privacy.
          </p>
        </div>

        {/* Privacy Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold">Privacy by Design</h2>
            </div>
            <p className="text-muted-foreground">
              Boostlly is designed with privacy as the core principle. No data
              leaves your device, no external tracking, no cloud
              synchronization.
            </p>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Local Storage Only</h2>
            </div>
            <p className="text-muted-foreground">
              All your quotes, collections, and settings are stored locally in
              your browser. They never leave your device and are never
              transmitted to external servers.
            </p>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Complete Control</h2>
            </div>
            <p className="text-muted-foreground">
              You have full control over your data. Export it, import it, or
              delete it completely. No external dependencies or data sharing.
            </p>
          </div>

          <div className="p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <EyeOff className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-semibold">No Tracking</h2>
            </div>
            <p className="text-muted-foreground">
              No analytics, no usage tracking, no data collection. Your browsing
              behavior and app usage remain completely private.
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="p-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Data Management Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <Download className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Export Data</h3>
              <p className="text-muted-foreground">
                Download all your quotes, collections, and settings as a JSON
                file for backup.
              </p>
            </div>
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Import Data</h3>
              <p className="text-muted-foreground">
                Restore your data from a previously exported JSON file.
              </p>
            </div>
          </div>
        </div>

        {/* Why No Sync */}
        <div className="p-6 bg-background/30 rounded-xl border border-border/50">
          <h3 className="text-lg font-semibold mb-4">Why No Cloud Sync?</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>Privacy:</strong> Cloud sync requires sending your data to
              external servers, which compromises your privacy and gives others
              access to your personal information.
            </p>
            <p>
              <strong>Security:</strong> Local storage is more secure than cloud
              storage. Your data is protected by your device&apos;s security
              measures.
            </p>
            <p>
              <strong>Simplicity:</strong> No accounts, no passwords, no complex
              setup. Just install and start using the app immediately.
            </p>
            <p>
              <strong>Reliability:</strong> Your data is always available, even
              when offline. No dependency on internet connectivity or external
              services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { StorageService } from "@boostlly/platform-web";
import { ExportImport } from "@boostlly/features";
import { Button } from "@boostlly/ui";
import { ArrowLeft, Database, Download, Upload } from "lucide-react";
import Link from "next/link";

export default function ExportImportPage() {
  const [storage] = useState(() => new StorageService());
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const quotes = (await storage.get("savedQuotes")) || [];
      const cols = (await storage.get("collections")) || [];
      setSavedQuotes(quotes);
      setCollections(cols);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleDataChange = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Data Management
              </h1>
              <p className="text-muted-foreground">
                Export and import your quotes and settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            <span className="text-muted-foreground">
              {savedQuotes.length} quotes, {collections.length} collections
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Download className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">
              {savedQuotes.length}
            </p>
            <p className="text-sm text-muted-foreground">Saved Quotes</p>
          </div>

          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Upload className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">
              {collections.length}
            </p>
            <p className="text-sm text-muted-foreground">Collections</p>
          </div>

          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Database className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-sm text-muted-foreground">Export Formats</p>
          </div>

          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Download className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">2</p>
            <p className="text-sm text-muted-foreground">Import Formats</p>
          </div>
        </div>

        {/* Export/Import Component */}
        <ExportImport storage={storage} onDataChange={handleDataChange} />
      </div>
    </div>
  );
}

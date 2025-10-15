import { Quote, QuoteCollection, User, UserStats } from "../types";

export interface ExportData {
  version: string;
  timestamp: string;
  metadata: {
    app: string;
    version: string;
    exportedBy: string;
    totalQuotes: number;
    totalCollections: number;
  };
  data: {
    quotes: Quote[];
    collections: QuoteCollection[];
    user: User;
    settings: any;
    stats: UserStats;
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    quotes: number;
    collections: number;
    settings: boolean;
    stats: boolean;
  };
  errors: string[];
  warnings: string[];
}

export class ExportImportManager {
  private static instance: ExportImportManager;

  static getInstance(): ExportImportManager {
    if (!ExportImportManager.instance) {
      ExportImportManager.instance = new ExportImportManager();
    }
    return ExportImportManager.instance;
  }

  /**
   * Export all data in JSON format
   */
  async exportToJSON(storage: any): Promise<string> {
    try {
      const quotes = (await storage.get("savedQuotes")) || [];
      const collections = (await storage.get("collections")) || [];
      const user = (await storage.get("user")) || this.getDefaultUser();
      const settings = (await storage.get("settings")) || {};
      const stats = (await storage.get("userStats")) || this.getDefaultStats();

      const exportData: ExportData = {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        metadata: {
          app: "Boostlly",
          version: "1.0.0",
          exportedBy: user.name || "User",
          totalQuotes: quotes.length,
          totalCollections: collections.length,
        },
        data: {
          quotes,
          collections,
          user,
          settings,
          stats,
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Export quotes only in CSV format
   */
  async exportQuotesToCSV(storage: any): Promise<string> {
    try {
      const quotes = (await storage.get("savedQuotes")) || [];

      if (quotes.length === 0) {
        return "text,author,category,createdAt\n";
      }

      const headers = ["text", "author", "category", "createdAt", "source"];
      const csvRows = [headers.join(",")];

      for (const quote of quotes) {
        const row = [
          `"${this.escapeCSV(quote.text)}"`,
          `"${this.escapeCSV(quote.author)}"`,
          `"${this.escapeCSV(quote.category || "")}"`,
          quote.createdAt ? new Date(quote.createdAt).toISOString() : "",
          `"${this.escapeCSV(quote.source || "")}"`,
        ];
        csvRows.push(row.join(","));
      }

      return csvRows.join("\n");
    } catch (error) {
      throw new Error(
        `CSV export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Export quotes in TXT format (simple text)
   */
  async exportQuotesToTXT(storage: any): Promise<string> {
    try {
      const quotes = (await storage.get("savedQuotes")) || [];

      if (quotes.length === 0) {
        return "No quotes to export.";
      }

      const lines = ["Boostlly - Exported Quotes", "=".repeat(30), ""];

      quotes.forEach((quote: Quote, index: number) => {
        lines.push(`${index + 1}. "${quote.text}"`);
        lines.push(`   — ${quote.author}`);
        if (quote.category) {
          lines.push(`   Category: ${quote.category}`);
        }
        lines.push("");
      });

      return lines.join("\n");
    } catch (error) {
      throw new Error(
        `TXT export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Import data from JSON format
   */
  async importFromJSON(storage: any, jsonData: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: { quotes: 0, collections: 0, settings: false, stats: false },
      errors: [],
      warnings: [],
    };

    try {
      const importData: ExportData = JSON.parse(jsonData);

      // Validate version compatibility
      if (!this.isVersionCompatible(importData.version)) {
        result.warnings.push(
          `Version ${importData.version} may not be fully compatible`,
        );
      }

      // Import quotes
      if (importData.data.quotes && Array.isArray(importData.data.quotes)) {
        const existingQuotes = (await storage.get("savedQuotes")) || [];
        const newQuotes = importData.data.quotes.filter(
          (quote: Quote) =>
            !existingQuotes.some(
              (existing: Quote) =>
                existing.text === quote.text &&
                existing.author === quote.author,
            ),
        );

        if (newQuotes.length > 0) {
          const updatedQuotes = [...existingQuotes, ...newQuotes];
          await storage.set("savedQuotes", updatedQuotes);
          result.imported.quotes = newQuotes.length;
        }
      }

      // Import collections
      if (
        importData.data.collections &&
        Array.isArray(importData.data.collections)
      ) {
        const existingCollections = (await storage.get("collections")) || [];
        const newCollections = importData.data.collections.filter(
          (collection: QuoteCollection) =>
            !existingCollections.some(
              (existing: QuoteCollection) => existing.id === collection.id,
            ),
        );

        if (newCollections.length > 0) {
          const updatedCollections = [
            ...existingCollections,
            ...newCollections,
          ];
          await storage.set("collections", updatedCollections);
          result.imported.collections = newCollections.length;
        }
      }

      // Import settings (merge with existing)
      if (importData.data.settings) {
        const existingSettings = (await storage.get("settings")) || {};
        const mergedSettings = {
          ...existingSettings,
          ...importData.data.settings,
        };
        await storage.set("settings", mergedSettings);
        result.imported.settings = true;
      }

      // Import stats (merge with existing)
      if (importData.data.stats) {
        const existingStats =
          (await storage.get("userStats")) || this.getDefaultStats();
        const mergedStats = { ...existingStats, ...importData.data.stats };
        await storage.set("userStats", mergedStats);
        result.imported.stats = true;
      }

      result.success = true;
      return result;
    } catch (error) {
      result.errors.push(
        `Import failed: ${error instanceof Error ? error.message : "Invalid JSON format"}`,
      );
      return result;
    }
  }

  /**
   * Import quotes from CSV format
   */
  async importFromCSV(storage: any, csvData: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: { quotes: 0, collections: 0, settings: false, stats: false },
      errors: [],
      warnings: [],
    };

    try {
      const lines = csvData.trim().split("\n");
      if (lines.length < 2) {
        result.errors.push(
          "CSV file must have at least a header and one data row",
        );
        return result;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const requiredHeaders = ["text", "author"];

      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          result.errors.push(`Missing required header: ${header}`);
          return result;
        }
      }

      const quotes: Quote[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = this.parseCSVLine(line);
        if (values.length < 2) {
          result.warnings.push(`Skipping invalid line ${i + 1}`);
          continue;
        }

        const quote: Quote = {
          id: Math.random().toString(36).slice(2, 10),
          text: this.unescapeCSV(values[headers.indexOf("text")] || ""),
          author: this.unescapeCSV(values[headers.indexOf("author")] || ""),
          category: this.unescapeCSV(
            values[headers.indexOf("category")] || "general",
          ),
          source: this.unescapeCSV(
            values[headers.indexOf("source")] || "imported",
          ),
          createdAt: new Date(),
        };

        if (quote.text && quote.author) {
          quotes.push(quote);
        }
      }

      if (quotes.length > 0) {
        const existingQuotes = (await storage.get("savedQuotes")) || [];
        const newQuotes = quotes.filter(
          (quote) =>
            !existingQuotes.some(
              (existing: Quote) =>
                existing.text === quote.text &&
                existing.author === quote.author,
            ),
        );

        if (newQuotes.length > 0) {
          const updatedQuotes = [...existingQuotes, ...newQuotes];
          await storage.set("savedQuotes", updatedQuotes);
          result.imported.quotes = newQuotes.length;
        }
      }

      result.success = true;
      return result;
    } catch (error) {
      result.errors.push(
        `CSV import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return result;
    }
  }

  /**
   * Download file to user's device
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Read file from user's device
   */
  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  private escapeCSV(text: string): string {
    return text.replace(/"/g, '""');
  }

  private unescapeCSV(text: string): string {
    return text.replace(/""/g, '"').replace(/^"|"$/g, "");
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private isVersionCompatible(version: string): boolean {
    const [major] = version.split(".").map(Number);
    return major === 1;
  }

  private getDefaultUser(): User {
    return {
      id: "default-user",
      name: "User",
      preferences: {
        theme: "auto",
        notifications: true,
        dailyReminder: true,
        categories: ["motivation", "productivity"],
        language: "en",
      },
      stats: {
        totalQuotes: 0,
        savedQuotes: 0,
        streak: 0,
        lastSeen: new Date(),
        favoriteCategories: [],
      },
    };
  }

  private getDefaultStats(): UserStats {
    return {
      totalQuotes: 0,
      savedQuotes: 0,
      streak: 0,
      lastSeen: new Date(),
      favoriteCategories: [],
    };
  }
}

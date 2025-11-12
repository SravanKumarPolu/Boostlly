/**
 * Collection Export/Import Module
 * 
 * Handles exporting and importing collections in various formats:
 * - JSON
 * - CSV
 * - PDF (HTML-based)
 */

import type { QuoteCollection } from "../types";
import { logError } from "../utils/logger";

export class CollectionExportManager {
  /**
   * Export collections as JSON
   */
  exportAsJSON(collections: QuoteCollection[]): string {
    const exportData = {
      collections: collections.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export collections as CSV
   */
  exportAsCSV(collections: QuoteCollection[]): string {
    const headers = [
      "Name",
      "Description",
      "Category",
      "Priority",
      "Quote Count",
      "Tags",
      "Created",
      "Updated",
    ];

    const rows = collections.map((collection) => {
      return [
        collection.name || "",
        collection.description || "",
        collection.category || "",
        collection.priority || "",
        collection.quoteIds.length.toString(),
        collection.tags?.join("; ") || "",
        collection.createdAt.toISOString(),
        collection.updatedAt.toISOString(),
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  /**
   * Export collections as PDF (HTML-based)
   */
  exportAsPDF(collections: QuoteCollection[]): string {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Boostlly Collections Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .collection { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .collection-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .collection-desc { color: #666; margin-bottom: 10px; }
        .collection-meta { font-size: 12px; color: #888; }
        .stats { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .export-info { font-size: 10px; color: #999; text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Boostlly Collections Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="stats">
        <h3>Summary</h3>
        <p>Total Collections: ${collections.length}</p>
        <p>Total Quotes: ${collections.reduce((sum, c) => sum + c.quoteIds.length, 0)}</p>
    </div>
    
    ${collections
      .map(
        (collection) => `
        <div class="collection">
            <div class="collection-title">${collection.name}</div>
            <div class="collection-desc">${collection.description || "No description"}</div>
            <div class="collection-meta">
                Category: ${collection.category || "Uncategorized"} | 
                Priority: ${collection.priority || "Medium"} | 
                Quotes: ${collection.quoteIds.length} | 
                Created: ${collection.createdAt.toLocaleDateString()}
                ${collection.tags && collection.tags.length > 0 ? ` | Tags: ${collection.tags.join(", ")}` : ""}
            </div>
        </div>
    `,
      )
      .join("")}
    
    <div class="export-info">
        <p>Exported from Boostlly - Your Personal Motivation App</p>
    </div>
</body>
</html>`;

    return htmlContent;
  }

  /**
   * Import collections from JSON
   */
  importFromJSON(
    jsonData: string,
    existingCollections: QuoteCollection[],
  ): { success: number; errors: string[]; collections: QuoteCollection[] } {
    try {
      const data = JSON.parse(jsonData);
      const importedCollections = Array.isArray(data) ? data : data.collections || [];

      let successCount = 0;
      const errors: string[] = [];
      const collections = [...existingCollections];

      for (const collection of importedCollections) {
        try {
          if (collection.name && collection.id) {
            // Check if collection already exists
            const existingIndex = collections.findIndex(
              (c) => c.id === collection.id,
            );
            if (existingIndex >= 0) {
              // Update existing collection
              Object.assign(collections[existingIndex], {
                name: collection.name,
                description: collection.description,
                color: collection.color,
                icon: collection.icon,
                category: collection.category,
                priority: collection.priority,
                tags: collection.tags,
                updatedAt: new Date(),
              });
            } else {
              // Add new collection
              collections.push({
                ...collection,
                quoteIds: collection.quoteIds || [],
                createdAt: new Date(collection.createdAt || Date.now()),
                updatedAt: new Date(),
              });
            }
            successCount++;
          }
        } catch (error) {
          errors.push(
            `Failed to import collection "${collection.name}": ${error}`,
          );
        }
      }

      return { success: successCount, errors, collections };
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "importFromJSON" },
        "CollectionExportManager",
      );
      return {
        success: 0,
        errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`],
        collections: existingCollections,
      };
    }
  }
}


import { logError, logDebug, logWarning } from "../utils/logger";
import { QuoteCollection } from "../types";
import { StorageService } from "@boostlly/platform";
import { CollectionExportManager } from "./collection-export";
import { CollectionTemplateManager } from "./collection-templates";

export class CollectionService {
  private storage: StorageService;
  private collections: QuoteCollection[] = [];
  private exportManager: CollectionExportManager;
  private templateManager: CollectionTemplateManager;

  constructor(storage: StorageService) {
    this.storage = storage;
    this.exportManager = new CollectionExportManager();
    this.templateManager = new CollectionTemplateManager();
    this.loadCollections();
  }

  private async loadCollections(): Promise<void> {
    try {
      const cached = await this.storage.get<QuoteCollection[]>("collections");
      if (Array.isArray(cached) && cached.length > 0) {
        this.collections = cached;
      } else {
        // Create default collections
        this.collections = this.getDefaultCollections();
        await this.storage.set("collections", this.collections);
      }
    } catch (error) {
      logError("Failed to load collections:", { error: error });
      this.collections = this.getDefaultCollections();
    }
  }

  private getDefaultCollections(): QuoteCollection[] {
    const now = new Date();
    return [
      {
        id: "favorites",
        name: "Favorites",
        description: "Your favorite quotes",
        quoteIds: [],
        createdAt: now,
        updatedAt: now,
        isDefault: true,
        color: "#EF4444", // Red
        icon: "heart",
        category: "Personal",
        priority: "high",
        tags: ["favorites", "personal"],
      },
      {
        id: "work",
        name: "Work",
        description: "Quotes for professional motivation",
        quoteIds: [],
        createdAt: now,
        updatedAt: now,
        isDefault: true,
        color: "#3B82F6", // Blue
        icon: "target",
        category: "Work",
        priority: "high",
        tags: ["work", "professional", "motivation"],
      },
      {
        id: "study",
        name: "Study",
        description: "Quotes for learning and growth",
        quoteIds: [],
        createdAt: now,
        updatedAt: now,
        isDefault: true,
        color: "#10B981", // Green
        icon: "bookmark",
        category: "Learning",
        priority: "medium",
        tags: ["study", "learning", "growth"],
      },
    ];
  }

  async getAllCollections(): Promise<QuoteCollection[]> {
    return this.collections;
  }

  async getCollection(id: string): Promise<QuoteCollection | null> {
    return this.collections.find((c) => c.id === id) || null;
  }

  async createCollection(
    name: string,
    description?: string,
    visualProps?: { color?: string; icon?: string; category?: string },
  ): Promise<QuoteCollection> {
    const now = new Date();
    const collection: QuoteCollection = {
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim(),
      quoteIds: [],
      createdAt: now,
      updatedAt: now,
      color: visualProps?.color,
      icon: visualProps?.icon,
      category: visualProps?.category,
    };

    this.collections.push(collection);
    await this.storage.set("collections", this.collections);
    return collection;
  }

  async updateCollection(
    id: string,
    updates: Partial<
      Pick<
        QuoteCollection,
        | "name"
        | "description"
        | "color"
        | "icon"
        | "category"
        | "priority"
        | "tags"
      >
    >,
  ): Promise<QuoteCollection | null> {
    const collection = this.collections.find((c) => c.id === id);
    if (!collection) return null;

    // Allow editing of all collections (including defaults)
    if (updates.name) collection.name = updates.name.trim();
    if (updates.description !== undefined)
      collection.description = updates.description?.trim();
    if (updates.color) collection.color = updates.color;
    if (updates.icon) collection.icon = updates.icon;
    if (updates.category) collection.category = updates.category;
    if (updates.priority) collection.priority = updates.priority;
    if (updates.tags) collection.tags = updates.tags;
    collection.updatedAt = new Date();

    await this.storage.set("collections", this.collections);
    return collection;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const collection = this.collections.find((c) => c.id === id);
    if (!collection || collection.isDefault) return false;

    const index = this.collections.findIndex((c) => c.id === id);
    this.collections.splice(index, 1);
    await this.storage.set("collections", this.collections);
    return true;
  }

  async addQuoteToCollection(
    collectionId: string,
    quoteId: string,
  ): Promise<boolean> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return false;

    if (!collection.quoteIds.includes(quoteId)) {
      collection.quoteIds.push(quoteId);
      collection.updatedAt = new Date();
      await this.storage.set("collections", this.collections);
    }
    return true;
  }

  async removeQuoteFromCollection(
    collectionId: string,
    quoteId: string,
  ): Promise<boolean> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return false;

    const index = collection.quoteIds.indexOf(quoteId);
    if (index !== -1) {
      collection.quoteIds.splice(index, 1);
      collection.updatedAt = new Date();
      await this.storage.set("collections", this.collections);
    }
    return true;
  }

  async getQuotesInCollection(
    collectionId: string,
    allQuotes: any[],
  ): Promise<any[]> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return [];

    return allQuotes.filter((quote) => collection.quoteIds.includes(quote.id));
  }

  // Enhanced search and filtering methods
  async searchCollections(filters: any): Promise<QuoteCollection[]> {
    let filtered = [...this.collections];

    // Search in name, description, and tags
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchTerm) ||
          collection.description?.toLowerCase().includes(searchTerm) ||
          collection.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm),
          ),
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(
        (collection) => collection.category === filters.category,
      );
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(
        (collection) => collection.priority === filters.priority,
      );
    }

    // Filter by has quotes
    if (filters.hasQuotes !== undefined) {
      filtered = filtered.filter((collection) =>
        filters.hasQuotes
          ? collection.quoteIds.length > 0
          : collection.quoteIds.length === 0,
      );
    }

    // Filter by is default
    if (filters.isDefault !== undefined) {
      filtered = filtered.filter(
        (collection) => collection.isDefault === filters.isDefault,
      );
    }

    // Filter by date created
    if (filters.dateCreated) {
      filtered = filtered.filter(
        (collection) =>
          collection.createdAt >= filters.dateCreated.start &&
          collection.createdAt <= filters.dateCreated.end,
      );
    }

    // Filter by quote count
    if (filters.quoteCount) {
      filtered = filtered.filter(
        (collection) =>
          collection.quoteIds.length >= filters.quoteCount.min &&
          collection.quoteIds.length <= filters.quoteCount.max,
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((collection) =>
        collection.tags?.some((tag) => filters.tags.includes(tag)),
      );
    }

    return filtered;
  }

  async searchQuotesInCollection(
    collectionId: string,
    allQuotes: any[],
    filters: any,
  ): Promise<any[]> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return [];

    let quotes = allQuotes.filter((quote) =>
      collection.quoteIds.includes(quote.id),
    );

    // Search by content
    if (filters.content) {
      const searchTerm = filters.content.toLowerCase();
      quotes = quotes.filter(
        (quote) =>
          quote.text.toLowerCase().includes(searchTerm) ||
          quote.author.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by author
    if (filters.author) {
      quotes = quotes.filter((quote) =>
        quote.author.toLowerCase().includes(filters.author.toLowerCase()),
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      quotes = quotes.filter(
        (quote) => quote.category && filters.tags.includes(quote.category),
      );
    }

    // Filter by liked status
    if (filters.isLiked !== undefined) {
      quotes = quotes.filter((quote) => quote.isLiked === filters.isLiked);
    }

    // Filter by length
    if (filters.length) {
      quotes = quotes.filter(
        (quote) =>
          quote.text.length >= filters.length.min &&
          quote.text.length <= filters.length.max,
      );
    }

    // Filter by date added (if available)
    if (filters.dateAdded) {
      quotes = quotes.filter(
        (quote) =>
          quote.createdAt &&
          quote.createdAt >= filters.dateAdded.start &&
          quote.createdAt <= filters.dateAdded.end,
      );
    }

    return quotes;
  }

  // Smart collection suggestions
  async getSmartCollectionSuggestions(quote: any): Promise<string[]> {
    const suggestions: string[] = [];

    // Suggest based on category
    if (quote.category) {
      const categoryCollections = this.collections.filter(
        (c) => c.category === quote.category,
      );
      suggestions.push(...categoryCollections.map((c) => c.id));
    }

    // Suggest based on content analysis
    const text = quote.text.toLowerCase();
    const author = quote.author.toLowerCase();

    // Work-related keywords
    if (
      text.includes("work") ||
      text.includes("success") ||
      text.includes("professional") ||
      author.includes("business")
    ) {
      const workCollections = this.collections.filter(
        (c) => c.category === "Work" || c.tags?.includes("work"),
      );
      suggestions.push(...workCollections.map((c) => c.id));
    }

    // Motivation-related keywords
    if (
      text.includes("motivation") ||
      text.includes("inspire") ||
      text.includes("dream") ||
      text.includes("goal")
    ) {
      const motivationCollections = this.collections.filter(
        (c) => c.category === "Motivation" || c.tags?.includes("motivation"),
      );
      suggestions.push(...motivationCollections.map((c) => c.id));
    }

    // Learning-related keywords
    if (
      text.includes("learn") ||
      text.includes("knowledge") ||
      text.includes("wisdom") ||
      text.includes("study")
    ) {
      const learningCollections = this.collections.filter(
        (c) => c.category === "Learning" || c.tags?.includes("learning"),
      );
      suggestions.push(...learningCollections.map((c) => c.id));
    }

    // Remove duplicates and return
    return [...new Set(suggestions)];
  }

  // Get collection statistics
  async getCollectionStats(): Promise<{
    totalCollections: number;
    totalQuotes: number;
    categories: Record<string, number>;
    priorities: Record<string, number>;
    averageQuotesPerCollection: number;
  }> {
    const categories: Record<string, number> = {};
    const priorities: Record<string, number> = {};
    let totalQuotes = 0;

    this.collections.forEach((collection) => {
      // Count categories
      if (collection.category) {
        categories[collection.category] =
          (categories[collection.category] || 0) + 1;
      }

      // Count priorities
      if (collection.priority) {
        priorities[collection.priority] =
          (priorities[collection.priority] || 0) + 1;
      }

      // Count total quotes
      totalQuotes += collection.quoteIds.length;
    });

    return {
      totalCollections: this.collections.length,
      totalQuotes,
      categories,
      priorities,
      averageQuotesPerCollection:
        this.collections.length > 0 ? totalQuotes / this.collections.length : 0,
    };
  }

  // ===== DATA PORTABILITY =====

  // Export collections as JSON
  async exportCollectionsAsJSON(): Promise<string> {
    return this.exportManager.exportAsJSON(this.collections);
  }

  // Export collections as CSV
  async exportCollectionsAsCSV(): Promise<string> {
    return this.exportManager.exportAsCSV(this.collections);
  }

  // Export collections as PDF (HTML format for PDF generation)
  async exportCollectionsAsPDF(): Promise<string> {
    return this.exportManager.exportAsPDF(this.collections);
  }

  // Import collections from JSON
  async importCollectionsFromJSON(
    jsonData: string,
  ): Promise<{ success: number; errors: string[] }> {
    const result = this.exportManager.importFromJSON(jsonData, this.collections);
    if (result.success > 0) {
      this.collections = result.collections;
      await this.storage.set("collections", this.collections);
    }
    return { success: result.success, errors: result.errors };
  }

  // Backup all collection data
  async backupCollections(): Promise<string> {
    const backupData = {
      collections: this.collections,
      backupDate: new Date().toISOString(),
      version: "1.0.0",
      metadata: {
        totalCollections: this.collections.length,
        totalQuotes: this.collections.reduce(
          (sum, c) => sum + c.quoteIds.length,
          0,
        ),
        categories: this.collections.reduce(
          (acc, c) => {
            if (c.category) acc[c.category] = (acc[c.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    };
    return JSON.stringify(backupData, null, 2);
  }

  // Restore collections from backup
  async restoreCollections(
    backupData: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(backupData);
      if (!data.collections || !Array.isArray(data.collections)) {
        return { success: false, message: "Invalid backup format" };
      }

      this.collections = data.collections.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt || Date.now()),
      }));

      await this.storage.set("collections", this.collections);
      return {
        success: true,
        message: `Restored ${this.collections.length} collections`,
      };
    } catch (error) {
      return { success: false, message: `Restore failed: ${error}` };
    }
  }

  // ===== ENHANCED INTERACTION =====

  // Move quotes between collections (for drag & drop)
  async moveQuotesBetweenCollections(
    quoteIds: string[],
    fromCollectionId: string,
    toCollectionId: string,
  ): Promise<boolean> {
    const fromCollection = this.collections.find(
      (c) => c.id === fromCollectionId,
    );
    const toCollection = this.collections.find((c) => c.id === toCollectionId);

    if (!fromCollection || !toCollection) return false;

    // Remove from source collection
    fromCollection.quoteIds = fromCollection.quoteIds.filter(
      (id) => !quoteIds.includes(id),
    );
    fromCollection.updatedAt = new Date();

    // Add to target collection (avoid duplicates)
    quoteIds.forEach((quoteId) => {
      if (!toCollection.quoteIds.includes(quoteId)) {
        toCollection.quoteIds.push(quoteId);
      }
    });
    toCollection.updatedAt = new Date();

    await this.storage.set("collections", this.collections);
    return true;
  }

  // Bulk operations
  async bulkAddQuotesToCollection(
    quoteIds: string[],
    collectionId: string,
  ): Promise<number> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return 0;

    let addedCount = 0;
    quoteIds.forEach((quoteId) => {
      if (!collection.quoteIds.includes(quoteId)) {
        collection.quoteIds.push(quoteId);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      collection.updatedAt = new Date();
      await this.storage.set("collections", this.collections);
    }

    return addedCount;
  }

  async bulkRemoveQuotesFromCollection(
    quoteIds: string[],
    collectionId: string,
  ): Promise<number> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return 0;

    const originalCount = collection.quoteIds.length;
    collection.quoteIds = collection.quoteIds.filter(
      (id) => !quoteIds.includes(id),
    );
    const removedCount = originalCount - collection.quoteIds.length;

    if (removedCount > 0) {
      collection.updatedAt = new Date();
      await this.storage.set("collections", this.collections);
    }

    return removedCount;
  }

  // ===== QUICK ACTIONS =====

  // Quick action: Duplicate collection
  async duplicateCollection(
    collectionId: string,
    newName?: string,
  ): Promise<QuoteCollection | null> {
    const sourceCollection = this.collections.find(
      (c) => c.id === collectionId,
    );
    if (!sourceCollection) return null;

    const now = new Date();
    const newCollection: QuoteCollection = {
      id: this.generateId(),
      name: newName || `${sourceCollection.name} (Copy)`,
      description: sourceCollection.description,
      quoteIds: [...sourceCollection.quoteIds], // Copy quote IDs
      createdAt: now,
      updatedAt: now,
      color: sourceCollection.color,
      icon: sourceCollection.icon,
      category: sourceCollection.category,
      priority: sourceCollection.priority,
      tags: sourceCollection.tags ? [...sourceCollection.tags] : undefined,
    };

    this.collections.push(newCollection);
    await this.storage.set("collections", this.collections);
    return newCollection;
  }

  // Quick action: Merge collections
  async mergeCollections(
    sourceCollectionId: string,
    targetCollectionId: string,
  ): Promise<boolean> {
    const sourceCollection = this.collections.find(
      (c) => c.id === sourceCollectionId,
    );
    const targetCollection = this.collections.find(
      (c) => c.id === targetCollectionId,
    );

    if (
      !sourceCollection ||
      !targetCollection ||
      sourceCollectionId === targetCollectionId
    ) {
      return false;
    }

    // Add all quotes from source to target (avoid duplicates)
    sourceCollection.quoteIds.forEach((quoteId) => {
      if (!targetCollection.quoteIds.includes(quoteId)) {
        targetCollection.quoteIds.push(quoteId);
      }
    });

    targetCollection.updatedAt = new Date();

    // Remove source collection
    this.collections = this.collections.filter(
      (c) => c.id !== sourceCollectionId,
    );

    await this.storage.set("collections", this.collections);
    return true;
  }

  // Quick action: Archive collection (move to archived state)
  async archiveCollection(collectionId: string): Promise<boolean> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return false;

    if (!collection.metadata) collection.metadata = {};
    collection.metadata.archived = true;
    collection.metadata.archivedAt = new Date();
    collection.updatedAt = new Date();

    await this.storage.set("collections", this.collections);
    return true;
  }

  // Quick action: Unarchive collection
  async unarchiveCollection(collectionId: string): Promise<boolean> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection || !collection.metadata) return false;

    delete collection.metadata.archived;
    delete collection.metadata.archivedAt;
    collection.updatedAt = new Date();

    await this.storage.set("collections", this.collections);
    return true;
  }

  // Quick action: Get archived collections
  async getArchivedCollections(): Promise<QuoteCollection[]> {
    return this.collections.filter((c) => c.metadata?.archived);
  }

  // Quick action: Clear empty collections
  async clearEmptyCollections(): Promise<number> {
    const emptyCollections = this.collections.filter(
      (c) => c.quoteIds.length === 0 && !c.isDefault,
    );
    const removedCount = emptyCollections.length;

    if (removedCount > 0) {
      this.collections = this.collections.filter(
        (c) => c.quoteIds.length > 0 || c.isDefault,
      );
      await this.storage.set("collections", this.collections);
    }

    return removedCount;
  }

  // Quick action: Sort collections by criteria
  async sortCollections(
    criteria: "name" | "created" | "updated" | "quotes" | "category",
  ): Promise<QuoteCollection[]> {
    const sorted = [...this.collections];

    switch (criteria) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "created":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "updated":
        return sorted.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      case "quotes":
        return sorted.sort((a, b) => b.quoteIds.length - a.quoteIds.length);
      case "category":
        return sorted.sort((a, b) =>
          (a.category || "").localeCompare(b.category || ""),
        );
      default:
        return sorted;
    }
  }

  // ===== SMART FEATURES =====

  // Collection templates
  async getCollectionTemplates(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      color: string;
      icon: string;
      tags: string[];
      isTemplate: boolean;
    }>
  > {
    const templates = this.templateManager.getTemplates();
    return templates.map((t) => ({
      ...t,
      isTemplate: true,
      category: t.category || "Personal",
      color: t.color || "#3B82F6",
      icon: t.icon || "collection",
      tags: t.tags || [],
    }));
  }

  // Create collection from template
  async createCollectionFromTemplate(
    templateId: string,
    customName?: string,
  ): Promise<QuoteCollection | null> {
    const collection = this.templateManager.createCollectionFromTemplate(
      templateId,
      this.generateId.bind(this)
    );
    
    if (!collection) return null;
    
    if (customName) {
      collection.name = customName;
    }
    
    this.collections.push(collection);
    await this.storage.set("collections", this.collections);
    return collection;
  }

  // Collection analytics
  async getCollectionAnalytics(): Promise<{
    totalCollections: number;
    totalQuotes: number;
    mostActiveCollection: string | null;
    leastActiveCollection: string | null;
    averageQuotesPerCollection: number;
    categoryDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    recentActivity: Array<{
      collectionId: string;
      collectionName: string;
      action: string;
      timestamp: Date;
    }>;
  }> {
    const analytics = {
      totalCollections: this.collections.length,
      totalQuotes: this.collections.reduce(
        (sum, c) => sum + c.quoteIds.length,
        0,
      ),
      mostActiveCollection: null as string | null,
      leastActiveCollection: null as string | null,
      averageQuotesPerCollection: 0,
      categoryDistribution: {} as Record<string, number>,
      priorityDistribution: {} as Record<string, number>,
      recentActivity: [] as Array<{
        collectionId: string;
        collectionName: string;
        action: string;
        timestamp: Date;
      }>,
    };

    if (this.collections.length > 0) {
      // Find most and least active collections
      const sortedByQuotes = [...this.collections].sort(
        (a, b) => b.quoteIds.length - a.quoteIds.length,
      );
      analytics.mostActiveCollection = sortedByQuotes[0]?.name || null;
      analytics.leastActiveCollection =
        sortedByQuotes[sortedByQuotes.length - 1]?.name || null;
      analytics.averageQuotesPerCollection =
        analytics.totalQuotes / this.collections.length;

      // Category and priority distribution
      this.collections.forEach((collection) => {
        if (collection.category) {
          analytics.categoryDistribution[collection.category] =
            (analytics.categoryDistribution[collection.category] || 0) + 1;
        }
        if (collection.priority) {
          analytics.priorityDistribution[collection.priority] =
            (analytics.priorityDistribution[collection.priority] || 0) + 1;
        }
      });

      // Recent activity (based on updatedAt)
      const recentCollections = this.collections
        .filter((c) => c.updatedAt)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5);

      analytics.recentActivity = recentCollections.map((collection) => ({
        collectionId: collection.id,
        collectionName: collection.name,
        action: "Updated",
        timestamp: collection.updatedAt,
      }));
    }

    return analytics;
  }

  // Collection reminders
  async setCollectionReminder(
    collectionId: string,
    reminder: {
      type: "daily" | "weekly" | "monthly";
      time: string; // HH:MM format
      enabled: boolean;
      message?: string;
    },
  ): Promise<boolean> {
    const collection = this.collections.find((c) => c.id === collectionId);
    if (!collection) return false;

    // Store reminder in collection metadata
    if (!collection.metadata) collection.metadata = {};
    collection.metadata.reminder = reminder;
    collection.updatedAt = new Date();

    await this.storage.set("collections", this.collections);
    return true;
  }

  async getCollectionReminders(): Promise<
    Array<{
      collectionId: string;
      collectionName: string;
      reminder: any;
    }>
  > {
    return this.collections
      .filter((c) => c.metadata?.reminder?.enabled)
      .map((c) => ({
        collectionId: c.id,
        collectionName: c.name,
        reminder: c.metadata!.reminder!,
      }));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

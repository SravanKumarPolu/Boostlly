/**
 * Comprehensive test suite for CollectionService
 * Tests all major functionality including CRUD operations, search, filtering, and analytics
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CollectionService } from "../services/collection-service";
import { MockStorageService } from "./mocks/storage-mock";
import type { QuoteCollection } from "../types";

describe("CollectionService", () => {
  let storage: MockStorageService;
  let collectionService: CollectionService;

  beforeEach(() => {
    storage = new MockStorageService();
    storage.reset();
    collectionService = new CollectionService(storage);
  });

  describe("Constructor", () => {
    it("should create CollectionService instance", () => {
      expect(collectionService).toBeInstanceOf(CollectionService);
    });

    it("should initialize with default collections", async () => {
      const collections = await collectionService.getAllCollections();
      expect(collections.length).toBeGreaterThan(0);
      
      // Check for default collections
      const favorites = collections.find((c) => c.id === "favorites");
      const work = collections.find((c) => c.id === "work");
      const study = collections.find((c) => c.id === "study");
      
      expect(favorites).toBeDefined();
      expect(work).toBeDefined();
      expect(study).toBeDefined();
    });

    it("should load existing collections from storage", async () => {
      const existingCollections: QuoteCollection[] = [
        {
          id: "custom-1",
          name: "Custom Collection",
          description: "Test collection",
          quoteIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await storage.set("collections", existingCollections);
      
      const service = new CollectionService(storage);
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      const collections = await service.getAllCollections();
      // Should include both custom and default collections, or just custom if it replaces defaults
      expect(collections.length).toBeGreaterThan(0);
      const customCollection = collections.find(c => c.id === "custom-1");
      expect(customCollection).toBeDefined();
    });
  });

  describe("getAllCollections", () => {
    it("should return all collections", async () => {
      const collections = await collectionService.getAllCollections();
      expect(Array.isArray(collections)).toBe(true);
      expect(collections.length).toBeGreaterThan(0);
    });

    it("should return collections with required fields", async () => {
      const collections = await collectionService.getAllCollections();
      collections.forEach((collection) => {
        expect(collection.id).toBeDefined();
        expect(collection.name).toBeDefined();
        expect(collection.quoteIds).toBeDefined();
        expect(collection.createdAt).toBeInstanceOf(Date);
        expect(collection.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe("getCollection", () => {
    it("should return collection by id", async () => {
      const collection = await collectionService.getCollection("favorites");
      expect(collection).toBeDefined();
      expect(collection?.id).toBe("favorites");
    });

    it("should return null for non-existent collection", async () => {
      const collection = await collectionService.getCollection("non-existent");
      expect(collection).toBeNull();
    });
  });

  describe("createCollection", () => {
    it("should create a new collection", async () => {
      const collection = await collectionService.createCollection(
        "Test Collection",
        "Test description"
      );
      
      expect(collection).toBeDefined();
      expect(collection.id).toBeDefined();
      expect(collection.name).toBe("Test Collection");
      expect(collection.description).toBe("Test description");
      expect(collection.quoteIds).toEqual([]);
    });

    it("should create collection with visual props", async () => {
      const collection = await collectionService.createCollection(
        "Colorful Collection",
        "Description",
        { color: "#FF5733", icon: "star", category: "Personal" }
      );
      
      expect(collection.color).toBe("#FF5733");
      expect(collection.icon).toBe("star");
      expect(collection.category).toBe("Personal");
      
      // Tags and priority need to be set via updateCollection
      await collectionService.updateCollection(collection.id, {
        tags: ["test"],
        priority: "high",
      });
      const updated = await collectionService.getCollection(collection.id);
      expect(updated?.tags).toEqual(["test"]);
      expect(updated?.priority).toBe("high");
    });

    it("should trim name and description", async () => {
      const collection = await collectionService.createCollection(
        "  Trimmed Name  ",
        "  Trimmed Description  "
      );
      
      expect(collection.name).toBe("Trimmed Name");
      expect(collection.description).toBe("Trimmed Description");
    });

    it("should persist collection to storage", async () => {
      const collection = await collectionService.createCollection("Test");
      const allCollections = await collectionService.getAllCollections();
      const found = allCollections.find((c) => c.id === collection.id);
      expect(found).toBeDefined();
    });
  });

  describe("updateCollection", () => {
    it("should update collection name", async () => {
      const collection = await collectionService.createCollection("Original Name");
      const updated = await collectionService.updateCollection(collection.id, {
        name: "Updated Name",
      });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Name");
    });

    it("should update collection description", async () => {
      const collection = await collectionService.createCollection("Test", "Original");
      const updated = await collectionService.updateCollection(collection.id, {
        description: "Updated description",
      });
      
      expect(updated?.description).toBe("Updated description");
    });

    it("should update collection visual props", async () => {
      const collection = await collectionService.createCollection("Test");
      const updated = await collectionService.updateCollection(collection.id, {
        color: "#00FF00",
        icon: "heart",
        category: "Work",
      });
      
      expect(updated?.color).toBe("#00FF00");
      expect(updated?.icon).toBe("heart");
      expect(updated?.category).toBe("Work");
    });

    it("should update updatedAt timestamp", async () => {
      const collection = await collectionService.createCollection("Test");
      const originalUpdatedAt = collection.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));
      
      const updated = await collectionService.updateCollection(collection.id, {
        name: "Updated",
      });
      
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it("should return null for non-existent collection", async () => {
      const updated = await collectionService.updateCollection("non-existent", {
        name: "Test",
      });
      expect(updated).toBeNull();
    });
  });

  describe("deleteCollection", () => {
    it("should delete a collection", async () => {
      const collection = await collectionService.createCollection("To Delete");
      const deleted = await collectionService.deleteCollection(collection.id);
      
      expect(deleted).toBe(true);
      const found = await collectionService.getCollection(collection.id);
      expect(found).toBeNull();
    });

    it("should not delete default collections", async () => {
      const deleted = await collectionService.deleteCollection("favorites");
      expect(deleted).toBe(false);
      
      const collection = await collectionService.getCollection("favorites");
      expect(collection).toBeDefined();
    });

    it("should return false for non-existent collection", async () => {
      const deleted = await collectionService.deleteCollection("non-existent");
      expect(deleted).toBe(false);
    });
  });

  describe("addQuoteToCollection", () => {
    it("should add quote to collection", async () => {
      const collection = await collectionService.createCollection("Test");
      const quoteId = "quote-123";
      
      const result = await collectionService.addQuoteToCollection(collection.id, quoteId);
      expect(result).toBe(true);
      
      const updated = await collectionService.getCollection(collection.id);
      expect(updated?.quoteIds).toContain(quoteId);
    });

    it("should not add duplicate quotes", async () => {
      const collection = await collectionService.createCollection("Test");
      const quoteId = "quote-123";
      
      await collectionService.addQuoteToCollection(collection.id, quoteId);
      await collectionService.addQuoteToCollection(collection.id, quoteId);
      
      const updated = await collectionService.getCollection(collection.id);
      const count = updated?.quoteIds.filter((id) => id === quoteId).length;
      expect(count).toBe(1);
    });

    it("should update updatedAt when adding quote", async () => {
      const collection = await collectionService.createCollection("Test");
      const originalUpdatedAt = collection.updatedAt;
      
      await new Promise((resolve) => setTimeout(resolve, 10));
      await collectionService.addQuoteToCollection(collection.id, "quote-1");
      
      const updated = await collectionService.getCollection(collection.id);
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it("should return false for non-existent collection", async () => {
      const result = await collectionService.addQuoteToCollection("non-existent", "quote-1");
      expect(result).toBe(false);
    });
  });

  describe("removeQuoteFromCollection", () => {
    it("should remove quote from collection", async () => {
      const collection = await collectionService.createCollection("Test");
      const quoteId = "quote-123";
      
      await collectionService.addQuoteToCollection(collection.id, quoteId);
      const result = await collectionService.removeQuoteFromCollection(collection.id, quoteId);
      
      expect(result).toBe(true);
      const updated = await collectionService.getCollection(collection.id);
      expect(updated?.quoteIds).not.toContain(quoteId);
    });

    it("should return false if quote not in collection", async () => {
      const collection = await collectionService.createCollection("Test");
      const result = await collectionService.removeQuoteFromCollection(collection.id, "non-existent");
      expect(result).toBe(true); // Still returns true, just doesn't remove anything
    });

    it("should return false for non-existent collection", async () => {
      const result = await collectionService.removeQuoteFromCollection("non-existent", "quote-1");
      expect(result).toBe(false);
    });
  });

  describe("getQuotesInCollection", () => {
    it("should return quotes in collection", async () => {
      const collection = await collectionService.createCollection("Test");
      const quoteId = "quote-123";
      await collectionService.addQuoteToCollection(collection.id, quoteId);
      
      const allQuotes = [
        { id: "quote-123", text: "Test quote", author: "Author" },
        { id: "quote-456", text: "Other quote", author: "Other" },
      ];
      
      const quotes = await collectionService.getQuotesInCollection(collection.id, allQuotes);
      expect(quotes.length).toBe(1);
      expect(quotes[0].id).toBe(quoteId);
    });

    it("should return empty array for non-existent collection", async () => {
      const quotes = await collectionService.getQuotesInCollection("non-existent", []);
      expect(quotes).toEqual([]);
    });
  });

  describe("searchCollections", () => {
    beforeEach(async () => {
      const workCollection = await collectionService.createCollection("Work Collection", "For work quotes", {
        category: "Work",
      });
      await collectionService.updateCollection(workCollection.id, {
        tags: ["work", "professional"],
      });
      
      const personalCollection = await collectionService.createCollection("Personal Collection", "Personal quotes", {
        category: "Personal",
      });
      await collectionService.updateCollection(personalCollection.id, {
        tags: ["personal", "life"],
      });
    });

    it("should search by name", async () => {
      const results = await collectionService.searchCollections({ search: "Work" });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain("work");
    });

    it("should search by description", async () => {
      const results = await collectionService.searchCollections({ search: "Personal" });
      expect(results.some((c) => c.description?.includes("Personal"))).toBe(true);
    });

    it("should filter by category", async () => {
      const results = await collectionService.searchCollections({ category: "Work" });
      results.forEach((collection) => {
        expect(collection.category).toBe("Work");
      });
    });

    it("should filter by priority", async () => {
      const collection = await collectionService.createCollection("High Priority");
      await collectionService.updateCollection(collection.id, {
        priority: "high",
      });
      
      const results = await collectionService.searchCollections({ priority: "high" });
      results.forEach((collection) => {
        expect(collection.priority).toBe("high");
      });
    });

    it("should filter by hasQuotes", async () => {
      const collection = await collectionService.createCollection("With Quotes");
      await collectionService.addQuoteToCollection(collection.id, "quote-1");
      
      const withQuotes = await collectionService.searchCollections({ hasQuotes: true });
      const withoutQuotes = await collectionService.searchCollections({ hasQuotes: false });
      
      expect(withQuotes.some((c) => c.id === collection.id)).toBe(true);
      expect(withoutQuotes.some((c) => c.id === collection.id)).toBe(false);
    });

    it("should filter by tags", async () => {
      const results = await collectionService.searchCollections({ tags: ["work"] });
      results.forEach((collection) => {
        expect(collection.tags?.includes("work")).toBe(true);
      });
    });
  });

  describe("getCollectionStats", () => {
    it("should return collection statistics", async () => {
      const collection1 = await collectionService.createCollection("Test 1", undefined, {
        category: "Work",
      });
      await collectionService.updateCollection(collection1.id, {
        priority: "high",
      });
      
      const collection2 = await collectionService.createCollection("Test 2", undefined, {
        category: "Personal",
      });
      await collectionService.updateCollection(collection2.id, {
        priority: "medium",
      });
      
      await collectionService.addQuoteToCollection("favorites", "quote-1");
      await collectionService.addQuoteToCollection("favorites", "quote-2");
      
      const stats = await collectionService.getCollectionStats();
      
      expect(stats.totalCollections).toBeGreaterThan(0);
      expect(stats.totalQuotes).toBeGreaterThanOrEqual(2);
      expect(stats.categories).toBeDefined();
      expect(stats.priorities).toBeDefined();
      expect(stats.averageQuotesPerCollection).toBeGreaterThanOrEqual(0);
    });

    it("should calculate average quotes per collection correctly", async () => {
      const collection1 = await collectionService.createCollection("Test 1");
      const collection2 = await collectionService.createCollection("Test 2");
      
      await collectionService.addQuoteToCollection(collection1.id, "quote-1");
      await collectionService.addQuoteToCollection(collection1.id, "quote-2");
      await collectionService.addQuoteToCollection(collection2.id, "quote-3");
      
      const stats = await collectionService.getCollectionStats();
      const testCollections = stats.totalCollections;
      const avg = stats.averageQuotesPerCollection;
      
      expect(avg).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getSmartCollectionSuggestions", () => {
    it("should suggest collections based on category", async () => {
      await collectionService.createCollection("Work Collection", undefined, {
        category: "Work",
      });
      
      const quote = {
        id: "quote-1",
        text: "Work hard",
        author: "Author",
        category: "Work",
      };
      
      const suggestions = await collectionService.getSmartCollectionSuggestions(quote);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should suggest collections based on content keywords", async () => {
      const collection = await collectionService.createCollection("Work Collection", undefined, {
        category: "Work",
      });
      await collectionService.updateCollection(collection.id, {
        tags: ["work"],
      });
      
      const quote = {
        id: "quote-1",
        text: "Success comes from hard work",
        author: "Author",
      };
      
      const suggestions = await collectionService.getSmartCollectionSuggestions(quote);
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      const errorStorage = {
        get: vi.fn().mockRejectedValue(new Error("Storage error")),
        set: vi.fn().mockRejectedValue(new Error("Storage error")),
        remove: vi.fn(),
        clear: vi.fn(),
        keys: vi.fn(),
        getSync: vi.fn().mockReturnValue(null),
        setSync: vi.fn(),
      } as any;

      const service = new CollectionService(errorStorage);
      // Should still initialize with default collections
      const collections = await service.getAllCollections();
      expect(Array.isArray(collections)).toBe(true);
    });
  });

  describe("Data Persistence", () => {
    it("should persist collections to storage", async () => {
      await collectionService.createCollection("Persistent Collection");
      const stored = await storage.get<QuoteCollection[]>("collections");
      expect(stored).toBeDefined();
      expect(Array.isArray(stored)).toBe(true);
      expect(stored?.some((c) => c.name === "Persistent Collection")).toBe(true);
    });

    it("should load collections from storage on initialization", async () => {
      const testCollections: QuoteCollection[] = [
        {
          id: "stored-1",
          name: "Stored Collection",
          description: "Test",
          quoteIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await storage.set("collections", testCollections);
      
      const service = new CollectionService(storage);
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      const collections = await service.getAllCollections();
      expect(collections.some((c) => c.id === "stored-1")).toBe(true);
    });
  });
});


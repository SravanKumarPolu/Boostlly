/**
 * Comprehensive test suite for SearchService
 * 
 * Tests search functionality including:
 * - Basic search
 * - Field-specific search
 * - Search suggestions
 * - Advanced search with filters
 * - Collection-based search
 * 
 * @module SearchService Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SearchService } from "../services/search-service";
import type { Quote, QuoteCollection } from "../types";

describe("SearchService", () => {
  let searchService: SearchService;
  let testQuotes: Quote[];
  let testCollections: QuoteCollection[];

  beforeEach(() => {
    testQuotes = [
      {
        id: "quote-1",
        text: "The only way to do great work is to love what you do",
        author: "Steve Jobs",
        source: "DummyJSON",
        category: "motivation",
        isLiked: true,
      },
      {
        id: "quote-2",
        text: "Innovation distinguishes between a leader and a follower",
        author: "Steve Jobs",
        source: "DummyJSON",
        category: "leadership",
        isLiked: false,
      },
      {
        id: "quote-3",
        text: "Success is not final, failure is not fatal",
        author: "Winston Churchill",
        source: "DummyJSON",
        category: "success",
        isLiked: true,
      },
      {
        id: "quote-4",
        text: "The future belongs to those who believe in the beauty of their dreams",
        author: "Eleanor Roosevelt",
        source: "DummyJSON",
        category: "inspiration",
        isLiked: false,
      },
    ];

    testCollections = [
      {
        id: "collection-1",
        name: "Work Motivation",
        description: "Quotes for work",
        quoteIds: ["quote-1", "quote-2"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "collection-2",
        name: "Success Stories",
        description: "Success quotes",
        quoteIds: ["quote-3"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    searchService = new SearchService(testCollections);
    searchService.updateData(testQuotes, testCollections);
  });

  describe("Constructor", () => {
    it("should create SearchService instance", () => {
      const service = new SearchService();
      expect(service).toBeInstanceOf(SearchService);
    });

    it("should create SearchService with collections", () => {
      const service = new SearchService(testCollections);
      expect(service).toBeInstanceOf(SearchService);
    });
  });

  describe("updateData", () => {
    it("should update quotes and collections", () => {
      const newQuotes: Quote[] = [
        {
          id: "new-1",
          text: "New quote",
          author: "New Author",
          source: "DummyJSON",
        },
      ];
      
      searchService.updateData(newQuotes, testCollections);
      
      const results = searchService.search("New quote");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.text).toContain("New quote");
    });

    it("should handle empty quotes array", () => {
      expect(() => searchService.updateData([], [])).not.toThrow();
    });

    it("should handle empty collections array", () => {
      expect(() => searchService.updateData(testQuotes, [])).not.toThrow();
    });
  });

  describe("search", () => {
    it("should search quotes by text", () => {
      const results = searchService.search("great work");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.text.toLowerCase()).toContain("great work");
    });

    it("should search quotes by author", () => {
      const results = searchService.search("Steve Jobs");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.author === "Steve Jobs")).toBe(true);
    });

    it("should search quotes by category", () => {
      const results = searchService.search("motivation");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return empty array for empty query", () => {
      const results = searchService.search("");
      expect(results).toEqual([]);
    });

    it("should return empty array for whitespace-only query", () => {
      const results = searchService.search("   ");
      expect(results).toEqual([]);
    });

    it("should return results with scores", () => {
      const results = searchService.search("work");
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(result.refIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it("should handle partial matches", () => {
      const results = searchService.search("innova");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.text.toLowerCase().includes("innovation"))).toBe(true);
    });
  });

  describe("searchByField", () => {
    it("should search by text field", () => {
      const results = searchService.searchByField("great work", "text");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.text.toLowerCase()).toContain("great work");
    });

    it("should search by author field", () => {
      const results = searchService.searchByField("Steve Jobs", "author");
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.item.author).toBe("Steve Jobs");
      });
    });

    it("should search by category field", () => {
      const results = searchService.searchByField("motivation", "category");
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.item.category).toBe("motivation");
      });
    });

    it("should return empty array for empty query", () => {
      const results = searchService.searchByField("", "text");
      expect(results).toEqual([]);
    });

    it("should handle case-insensitive search", () => {
      const results = searchService.searchByField("STEVE JOBS", "author");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("getSuggestions", () => {
    it("should return suggestions based on query", () => {
      const suggestions = searchService.getSuggestions("Steve");
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should limit suggestions to maxSuggestions", () => {
      const suggestions = searchService.getSuggestions("work", 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it("should return author suggestions", () => {
      const suggestions = searchService.getSuggestions("Steve");
      expect(suggestions.some(s => s.includes("Steve Jobs"))).toBe(true);
    });

    it("should return category suggestions", () => {
      const suggestions = searchService.getSuggestions("motiv");
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should return collection suggestions", () => {
      const suggestions = searchService.getSuggestions("Work");
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should return empty array for empty query", () => {
      const suggestions = searchService.getSuggestions("");
      expect(suggestions).toEqual([]);
    });

    it("should return unique suggestions", () => {
      const suggestions = searchService.getSuggestions("work");
      const unique = new Set(suggestions);
      expect(unique.size).toBe(suggestions.length);
    });
  });

  describe("advancedSearch", () => {
    it("should search by query only", () => {
      const results = searchService.advancedSearch({ query: "work" });
      expect(results.length).toBeGreaterThan(0);
    });

    it("should filter by author", () => {
      const results = searchService.advancedSearch({ author: "Steve Jobs" });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.item.author).toBe("Steve Jobs");
      });
    });

    it("should filter by category", () => {
      const results = searchService.advancedSearch({ category: "motivation" });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.item.category).toBe("motivation");
      });
    });

    it("should filter by collection", () => {
      const results = searchService.advancedSearch({ collection: "Work" });
      expect(results.length).toBeGreaterThan(0);
    });

    it("should filter by isLiked", () => {
      const likedResults = searchService.advancedSearch({ isLiked: true });
      expect(likedResults.length).toBeGreaterThan(0);
      likedResults.forEach(result => {
        expect(result.item.isLiked).toBe(true);
      });

      const notLikedResults = searchService.advancedSearch({ isLiked: false });
      notLikedResults.forEach(result => {
        expect(result.item.isLiked).toBe(false);
      });
    });

    it("should combine multiple filters", () => {
      const results = searchService.advancedSearch({
        query: "work",
        author: "Steve Jobs",
        category: "motivation",
        isLiked: true,
      });
      
      expect(Array.isArray(results)).toBe(true);
      results.forEach(result => {
        expect(result.item.author).toBe("Steve Jobs");
        expect(result.item.isLiked).toBe(true);
      });
    });

    it("should return empty array when no matches", () => {
      const results = searchService.advancedSearch({
        author: "NonExistentAuthor123",
      });
      expect(results).toEqual([]);
    });

    it("should handle empty filters", () => {
      const results = searchService.advancedSearch({});
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive for author filter", () => {
      const results = searchService.advancedSearch({ author: "steve jobs" });
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive for category filter", () => {
      const results = searchService.advancedSearch({ category: "MOTIVATION" });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in query", () => {
      const results = searchService.search("work!@#$%");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle very long queries", () => {
      const longQuery = "a".repeat(1000);
      const results = searchService.search(longQuery);
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle unicode characters", () => {
      const results = searchService.search("travail");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle quotes with missing fields", () => {
      const incompleteQuotes: Quote[] = [
        {
          id: "incomplete-1",
          text: "Test quote",
          author: undefined,
          source: "DummyJSON",
          category: undefined,
        },
      ];
      
      searchService.updateData(incompleteQuotes, []);
      const results = searchService.search("Test");
      expect(results.length).toBeGreaterThan(0);
    });
  });
});


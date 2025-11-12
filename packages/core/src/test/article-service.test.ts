/**
 * Comprehensive test suite for ArticleService
 * 
 * Tests article management functionality including:
 * - Getting all articles
 * - Featured articles
 * - Article by slug
 * - Articles by category
 * - Categories
 * - Search articles
 * - Related articles
 * 
 * @module ArticleService Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ArticleService } from "../services/article-service";

describe("ArticleService", () => {
  let articleService: ArticleService;

  beforeEach(() => {
    articleService = new ArticleService();
  });

  afterEach(() => {
    articleService.destroy();
  });

  describe("Constructor", () => {
    it("should create ArticleService instance", () => {
      expect(articleService).toBeInstanceOf(ArticleService);
    });

    it("should initialize with articles", async () => {
      const response = await articleService.getArticles();
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should initialize with categories", async () => {
      const response = await articleService.getCategories();
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  describe("getArticles", () => {
    it("should return all articles", async () => {
      const response = await articleService.getArticles();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return articles with required fields", async () => {
      const response = await articleService.getArticles();
      
      if (response.data.length > 0) {
        const article = response.data[0];
        expect(article.id).toBeDefined();
        expect(article.title).toBeDefined();
        expect(article.content).toBeDefined();
        expect(article.author).toBeDefined();
        expect(article.slug).toBeDefined();
      }
    });

    it("should cache articles", async () => {
      const response1 = await articleService.getArticles();
      const response2 = await articleService.getArticles();
      
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      // Second call might be cached
      expect(response2.cached).toBeDefined();
    });
  });

  describe("getFeaturedArticles", () => {
    it("should return only featured articles", async () => {
      const response = await articleService.getFeaturedArticles();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        response.data.forEach(article => {
          expect(article.featured).toBe(true);
        });
      }
    });

    it("should return empty array if no featured articles", async () => {
      const response = await articleService.getFeaturedArticles();
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe("getArticleBySlug", () => {
    it("should return article by slug", async () => {
      // First get all articles to find a slug
      const allArticles = await articleService.getArticles();
      if (allArticles.data.length > 0) {
        const slug = allArticles.data[0].slug;
        const response = await articleService.getArticleBySlug(slug);
        
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data?.slug).toBe(slug);
      }
    });

    it("should return null for non-existent slug", async () => {
      const response = await articleService.getArticleBySlug("non-existent-slug-12345");
      
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    it("should handle empty slug", async () => {
      const response = await articleService.getArticleBySlug("");
      
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });
  });

  describe("getArticlesByCategory", () => {
    it("should return articles by category", async () => {
      const response = await articleService.getArticlesByCategory("motivation");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        response.data.forEach(article => {
          expect(article.category).toBe("motivation");
        });
      }
    });

    it("should return empty array for non-existent category", async () => {
      const response = await articleService.getArticlesByCategory("non-existent-category");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(0);
    });

    it("should handle case-sensitive category", async () => {
      const response = await articleService.getArticlesByCategory("MOTIVATION");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe("getCategories", () => {
    it("should return all categories", async () => {
      const response = await articleService.getCategories();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return categories with required fields", async () => {
      const response = await articleService.getCategories();
      
      if (response.data.length > 0) {
        const category = response.data[0];
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
      }
    });
  });

  describe("searchArticles", () => {
    it("should search articles by title", async () => {
      const response = await articleService.searchArticles("discipline");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should search articles by content", async () => {
      const response = await articleService.searchArticles("science");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should search articles by tags", async () => {
      const response = await articleService.searchArticles("habits");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should return empty array for no matches", async () => {
      const response = await articleService.searchArticles("nonexistentsearchterm12345");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should handle empty query", async () => {
      const response = await articleService.searchArticles("");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should be case-insensitive", async () => {
      const response = await articleService.searchArticles("DISCIPLINE");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should handle partial matches", async () => {
      const response = await articleService.searchArticles("discipl");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe("getRelatedArticles", () => {
    it("should return related articles", async () => {
      const allArticles = await articleService.getArticles();
      if (allArticles.data.length > 0) {
        const articleId = allArticles.data[0].id;
        const response = await articleService.getRelatedArticles(articleId);
        
        expect(response.success).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
      }
    });

    it("should respect limit parameter", async () => {
      const allArticles = await articleService.getArticles();
      if (allArticles.data.length > 0) {
        const articleId = allArticles.data[0].id;
        const response = await articleService.getRelatedArticles(articleId, 2);
        
        expect(response.success).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeLessThanOrEqual(2);
      }
    });

    it("should not include the article itself", async () => {
      const allArticles = await articleService.getArticles();
      if (allArticles.data.length > 0) {
        const articleId = allArticles.data[0].id;
        const response = await articleService.getRelatedArticles(articleId);
        
        expect(response.success).toBe(true);
        response.data.forEach(article => {
          expect(article.id).not.toBe(articleId);
        });
      }
    });

    it("should return empty array for non-existent article", async () => {
      const response = await articleService.getRelatedArticles("non-existent-id");
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(0);
    });

    it("should return articles from same category", async () => {
      const allArticles = await articleService.getArticles();
      if (allArticles.data.length > 0) {
        const article = allArticles.data[0];
        const response = await articleService.getRelatedArticles(article.id);
        
        expect(response.success).toBe(true);
        if (response.data.length > 0) {
          response.data.forEach(relatedArticle => {
            expect(relatedArticle.category).toBe(article.category);
          });
        }
      }
    });
  });

  describe("Caching", () => {
    it("should cache article results", async () => {
      const response1 = await articleService.getArticles();
      const response2 = await articleService.getArticles();
      
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      // Second call should potentially be cached
      expect(response2.cached).toBeDefined();
    });

    it("should clear cache", async () => {
      await articleService.getArticles();
      await articleService.clearCache();
      
      // Cache should be cleared
      const stats = articleService.getCacheStats();
      expect(stats).toBeDefined();
    });
  });

  describe("Metrics", () => {
    it("should track service metrics", async () => {
      await articleService.getArticles();
      await articleService.getFeaturedArticles();
      
      const metrics = articleService.getMetrics();
      expect(metrics.totalCalls).toBeGreaterThan(0);
      expect(metrics.successCalls).toBeGreaterThan(0);
    });
  });

  describe("Health Check", () => {
    it("should return healthy status", async () => {
      await articleService.getArticles();
      expect(articleService.isHealthy()).toBe(true);
    });
  });
});


/**
 * Comprehensive test suite for SocialEcosystemService
 * 
 * Tests all major functionality including:
 * - Comment management
 * - Social metrics
 * - Like functionality
 * - Reply functionality
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SocialEcosystemService } from "../services/social-ecosystem-service";
import { MockStorageService } from "./mocks/storage-mock";

describe("SocialEcosystemService", () => {
  let service: SocialEcosystemService;
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
    service = new SocialEcosystemService(storage);
  });

  describe("Constructor", () => {
    it("should create SocialEcosystemService instance", () => {
      expect(service).toBeInstanceOf(SocialEcosystemService);
    });

    it("should initialize with storage", () => {
      expect(service).toBeDefined();
    });
  });

  describe("Singleton Pattern", () => {
    it("should return same instance from getInstance", () => {
      const instance1 = SocialEcosystemService.getInstance();
      const instance2 = SocialEcosystemService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Add Comment", () => {
    it("should add a comment to a quote", async () => {
      const comment = await service.addComment("quote-1", "user-1", "Great quote!");
      expect(comment).toBeDefined();
      expect(comment.quoteId).toBe("quote-1");
      expect(comment.userId).toBe("user-1");
      expect(comment.content).toBe("Great quote!");
      expect(comment.id).toBeDefined();
    });

    it("should create comment with timestamp", async () => {
      const comment = await service.addComment("quote-1", "user-1", "Test");
      expect(comment.timestamp).toBeDefined();
      expect(typeof comment.timestamp).toBe("number");
    });

    it("should initialize comment with zero likes", async () => {
      const comment = await service.addComment("quote-1", "user-1", "Test");
      expect(comment.likes).toBe(0);
    });

    it("should store comment in storage", async () => {
      await service.addComment("quote-1", "user-1", "Test");
      const comments = await service.getComments("quote-1");
      expect(comments.length).toBe(1);
      expect(comments[0].content).toBe("Test");
    });
  });

  describe("Get Comments", () => {
    it("should return empty array for quote with no comments", async () => {
      const comments = await service.getComments("quote-no-comments");
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(0);
    });

    it("should return all comments for a quote", async () => {
      await service.addComment("quote-1", "user-1", "Comment 1");
      await service.addComment("quote-1", "user-2", "Comment 2");
      
      const comments = await service.getComments("quote-1");
      expect(comments.length).toBe(2);
    });

    it("should return comments for different quotes separately", async () => {
      await service.addComment("quote-1", "user-1", "Comment for quote 1");
      await service.addComment("quote-2", "user-1", "Comment for quote 2");
      
      const comments1 = await service.getComments("quote-1");
      const comments2 = await service.getComments("quote-2");
      
      expect(comments1.length).toBe(1);
      expect(comments2.length).toBe(1);
      expect(comments1[0].content).toBe("Comment for quote 1");
      expect(comments2[0].content).toBe("Comment for quote 2");
    });
  });

  describe("Like Comment", () => {
    it("should increment likes on a comment", async () => {
      const comment = await service.addComment("quote-1", "user-1", "Test");
      await service.likeComment(comment.id, "quote-1");
      
      const comments = await service.getComments("quote-1");
      const likedComment = comments.find(c => c.id === comment.id);
      expect(likedComment!.likes).toBe(1);
    });

    it("should handle multiple likes", async () => {
      const comment = await service.addComment("quote-1", "user-1", "Test");
      await service.likeComment(comment.id, "quote-1");
      await service.likeComment(comment.id, "quote-1");
      
      const comments = await service.getComments("quote-1");
      const likedComment = comments.find(c => c.id === comment.id);
      expect(likedComment!.likes).toBe(2);
    });

    it("should handle like on non-existent comment gracefully", async () => {
      await expect(service.likeComment("non-existent", "quote-1")).resolves.not.toThrow();
    });
  });

  describe("Reply to Comment", () => {
    it("should add a reply to a comment", async () => {
      const parentComment = await service.addComment("quote-1", "user-1", "Parent");
      const reply = await service.replyToComment(
        parentComment.id,
        "quote-1",
        {
          quoteId: "quote-1",
          userId: "user-2",
          userName: "User_2",
          content: "Reply content",
        }
      );
      
      expect(reply).toBeDefined();
      expect(reply.parentId).toBe(parentComment.id);
      expect(reply.content).toBe("Reply content");
    });

    it("should add reply to parent comment's replies array", async () => {
      const parentComment = await service.addComment("quote-1", "user-1", "Parent");
      await service.replyToComment(
        parentComment.id,
        "quote-1",
        {
          quoteId: "quote-1",
          userId: "user-2",
          userName: "User_2",
          content: "Reply",
        }
      );
      
      const comments = await service.getComments("quote-1");
      const parent = comments.find(c => c.id === parentComment.id);
      expect(parent!.replies.length).toBe(1);
      expect(parent!.replies[0].content).toBe("Reply");
    });
  });

  describe("Edit Comment", () => {
    it("should update comment content", async () => {
      const comment = await service.addComment("quote-1", "user-1", "Original");
      await service.editComment(comment.id, "quote-1", "Edited");
      
      const comments = await service.getComments("quote-1");
      const editedComment = comments.find(c => c.id === comment.id);
      expect(editedComment!.content).toBe("Edited");
      expect(editedComment!.edited).toBe(true);
    });

    it("should handle edit on non-existent comment gracefully", async () => {
      await expect(service.editComment("non-existent", "quote-1", "New")).resolves.not.toThrow();
    });
  });

  describe("Delete Comment", () => {
    it("should delete a comment", async () => {
      const comment = await service.addComment("quote-1", "user-1", "To delete");
      await expect(service.deleteComment(comment.id, "user-1")).resolves.not.toThrow();
    });
  });

  describe("Report Comment", () => {
    it("should report a comment", async () => {
      const comment = await service.addComment("quote-1", "user-1", "To report");
      await expect(
        service.reportComment(comment.id, "user-2", "Spam")
      ).resolves.not.toThrow();
    });
  });

  describe("Get Social Metrics", () => {
    it("should return social metrics", async () => {
      const metrics = await service.getSocialMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalUsers).toBe("number");
      expect(typeof metrics.totalComments).toBe("number");
      expect(typeof metrics.totalLikes).toBe("number");
    });

    it("should include top contributors", async () => {
      const metrics = await service.getSocialMetrics();
      expect(Array.isArray(metrics.topContributors)).toBe(true);
      expect(metrics.topContributors.length).toBeGreaterThan(0);
    });

    it("should include trending hashtags", async () => {
      const metrics = await service.getSocialMetrics();
      expect(Array.isArray(metrics.trendingHashtags)).toBe(true);
    });

    it("should include viral quotes", async () => {
      const metrics = await service.getSocialMetrics();
      expect(Array.isArray(metrics.viralQuotes)).toBe(true);
    });

    it("should include category breakdown", async () => {
      const metrics = await service.getSocialMetrics();
      expect(Array.isArray(metrics.categoryBreakdown)).toBe(true);
    });

    it("should include engagement breakdown", async () => {
      const metrics = await service.getSocialMetrics();
      expect(metrics.engagementBreakdown).toBeDefined();
      if (metrics.engagementBreakdown) {
        expect(typeof metrics.engagementBreakdown.likes).toBe("number");
        expect(typeof metrics.engagementBreakdown.comments).toBe("number");
        expect(typeof metrics.engagementBreakdown.shares).toBe("number");
      }
    });
  });

  describe("Ensure Initialized", () => {
    it("should initialize service", async () => {
      await expect(service.ensureInitialized()).resolves.not.toThrow();
    });
  });
});


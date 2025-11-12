/**
 * Collection Templates Module
 * 
 * Manages collection templates for quick collection creation
 */

import type { QuoteCollection } from "../types";

export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  color?: string;
  icon?: string;
  category?: string;
  tags?: string[];
}

export class CollectionTemplateManager {
  private templates: CollectionTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    this.templates = [
      {
        id: "daily-motivation",
        name: "Daily Motivation",
        description: "Start your day with inspiring quotes",
        color: "#EF4444",
        icon: "sun",
        category: "Personal",
        tags: ["motivation", "daily", "inspiration"],
      },
      {
        id: "work-focus",
        name: "Work Focus",
        description: "Quotes to boost productivity at work",
        color: "#3B82F6",
        icon: "briefcase",
        category: "Work",
        tags: ["work", "productivity", "focus"],
      },
      {
        id: "study-time",
        name: "Study Time",
        description: "Motivational quotes for learning",
        color: "#10B981",
        icon: "book",
        category: "Learning",
        tags: ["study", "learning", "education"],
      },
      {
        id: "fitness-goals",
        name: "Fitness Goals",
        description: "Stay motivated on your fitness journey",
        color: "#F59E0B",
        icon: "dumbbell",
        category: "Health",
        tags: ["fitness", "health", "exercise"],
      },
      {
        id: "creative-inspiration",
        name: "Creative Inspiration",
        description: "Spark your creativity",
        color: "#8B5CF6",
        icon: "palette",
        category: "Creative",
        tags: ["creativity", "art", "inspiration"],
      },
      {
        id: "leadership",
        name: "Leadership",
        description: "Quotes for leaders and managers",
        color: "#6366F1",
        icon: "users",
        category: "Professional",
        tags: ["leadership", "management", "team"],
      },
      {
        id: "success-mindset",
        name: "Success Mindset",
        description: "Develop a winning mindset",
        color: "#EC4899",
        icon: "trophy",
        category: "Personal",
        tags: ["success", "mindset", "achievement"],
      },
      {
        id: "resilience",
        name: "Resilience",
        description: "Build mental toughness",
        color: "#14B8A6",
        icon: "shield",
        category: "Personal",
        tags: ["resilience", "strength", "perseverance"],
      },
    ];
  }

  /**
   * Get all templates
   */
  getTemplates(): CollectionTemplate[] {
    return [...this.templates];
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): CollectionTemplate | null {
    return this.templates.find((t) => t.id === id) || null;
  }

  /**
   * Create collection from template
   */
  createCollectionFromTemplate(
    templateId: string,
    generateId: () => string,
  ): QuoteCollection | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const now = new Date();
    return {
      id: generateId(),
      name: template.name,
      description: template.description,
      quoteIds: [],
      createdAt: now,
      updatedAt: now,
      color: template.color,
      icon: template.icon,
      category: template.category,
      priority: "medium",
      tags: template.tags,
    };
  }
}


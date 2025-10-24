import { Article, ArticleCategory } from "../types";
import { BaseService, ServiceResponse } from "./base-service";
import { errorHandler, ErrorUtils } from "../utils/error-handler";
import { logDebug, logError, logWarning } from "../utils/logger";

/**
 * ArticleService - Service for managing blog articles and content
 * 
 * This service handles article management, categorization, and content delivery.
 * It provides methods for fetching articles, managing categories, and handling
 * article-related operations with caching and error handling.
 * 
 * @example
 * ```typescript
 * const articleService = new ArticleService();
 * const articles = await articleService.getArticles();
 * const featured = await articleService.getFeaturedArticles();
 * ```
 */
export class ArticleService extends BaseService {
  private articles: Article[] = [];
  private categories: ArticleCategory[] = [];
  private articleCache: Map<string, Article> = new Map();

  constructor() {
    super("ArticleService");
    this.initializeArticles();
    this.initializeCategories();
  }

  /**
   * Initialize sample articles
   */
  private initializeArticles(): void {
    this.articles = [
      {
        id: "article-1",
        title: "How to Cultivate Discipline: 7 Science-Backed Strategies",
        content: `
# How to Cultivate Discipline: 7 Science-Backed Strategies

Discipline is often misunderstood as a trait you either have or don't have. However, research shows that discipline is a skill that can be developed and strengthened over time. Here are seven evidence-based strategies to help you build lasting discipline.

## 1. Start Small and Build Momentum

The "2-minute rule" suggests starting with tasks that take less than 2 minutes to complete. This builds momentum and creates a sense of accomplishment that fuels further action.

## 2. Use Implementation Intentions

Research by psychologist Peter Gollwitzer shows that creating specific "if-then" plans significantly increases follow-through. For example: "If it's 7 AM, then I will do 10 push-ups."

## 3. Remove Decision Fatigue

Steve Jobs wore the same outfit daily to eliminate trivial decisions. Reduce the number of choices you need to make about routine activities to preserve mental energy for important decisions.

## 4. Create Environmental Design

Make good choices easier and bad choices harder. If you want to read more, place books in visible locations. If you want to eat healthier, keep junk food out of the house.

## 5. Use the "Seinfeld Strategy"

Jerry Seinfeld's method of marking an X on a calendar for each day he wrote jokes created a visual chain he didn't want to break. This visual progress tracking leverages our brain's desire for consistency.

## 6. Practice Self-Compassion

Studies show that self-compassion, not self-criticism, leads to better self-regulation. When you slip up, treat yourself with the same kindness you'd show a friend.

## 7. Build Identity-Based Habits

Instead of focusing on what you want to achieve, focus on who you want to become. "I am a person who exercises" is more powerful than "I want to lose weight."

## Conclusion

Discipline is not about perfection; it's about progress. By implementing these strategies consistently, you'll develop the self-control needed to achieve your most important goals.

Remember: Every expert was once a beginner. Every pro was once an amateur. Every icon was once an unknown. Start where you are, use what you have, do what you can.
        `,
        excerpt: "Discover seven science-backed strategies to build lasting discipline and achieve your goals with proven psychological techniques.",
        author: "Boostlly Team",
        publishedAt: new Date("2024-01-15"),
        category: "motivation",
        tags: ["discipline", "habits", "psychology", "self-improvement"],
        featured: true,
        slug: "how-to-cultivate-discipline-7-science-backed-strategies",
        readingTime: 8,
        imageUrl: "/assets/articles/discipline.jpg",
        seoTitle: "How to Cultivate Discipline: 7 Science-Backed Strategies for Success",
        seoDescription: "Learn proven psychological techniques to build lasting discipline and achieve your goals with these 7 evidence-based strategies."
      },
      {
        id: "article-2",
        title: "5 Daily Habits for Better Focus and Productivity",
        content: `
# 5 Daily Habits for Better Focus and Productivity

In our hyperconnected world, maintaining focus has become increasingly challenging. These five daily habits, backed by neuroscience research, can significantly improve your concentration and productivity.

## 1. Morning Meditation (10 minutes)

Studies show that just 10 minutes of daily meditation can increase focus and reduce mind-wandering. Start your day with mindfulness to set a calm, focused tone.

## 2. Deep Work Blocks

Cal Newport's concept of "deep work" involves dedicating uninterrupted time to cognitively demanding tasks. Schedule 2-4 hour blocks for your most important work.

## 3. Digital Minimalism

Limit notifications and create phone-free zones during work hours. Research indicates that even having a phone nearby reduces cognitive capacity.

## 4. Regular Movement Breaks

The Pomodoro Technique (25 minutes work, 5 minutes break) aligns with our natural attention spans. Use breaks for light movement to boost circulation and mental clarity.

## 5. Evening Reflection

End each day by reviewing what you accomplished and planning the next day's priorities. This practice reduces anxiety and improves sleep quality.

## Bonus: The 2-Minute Rule

If a task takes less than 2 minutes, do it immediately. This prevents small tasks from accumulating and cluttering your mental space.

## Conclusion

Focus is a skill that can be trained. By consistently practicing these habits, you'll develop the mental discipline needed to achieve your most ambitious goals.

Remember: Success is the sum of small efforts repeated day in and day out.
        `,
        excerpt: "Boost your focus and productivity with these 5 neuroscience-backed daily habits that successful people use to achieve their goals.",
        author: "Boostlly Team",
        publishedAt: new Date("2024-01-20"),
        category: "productivity",
        tags: ["focus", "productivity", "habits", "neuroscience"],
        featured: true,
        slug: "5-daily-habits-better-focus-productivity",
        readingTime: 6,
        imageUrl: "/assets/articles/focus.jpg",
        seoTitle: "5 Daily Habits for Better Focus and Productivity | Boostlly",
        seoDescription: "Discover 5 neuroscience-backed daily habits that successful people use to improve focus, productivity, and achieve their goals."
      },
      {
        id: "article-3",
        title: "The Psychology of Motivation: What Really Drives Us",
        content: `
# The Psychology of Motivation: What Really Drives Us

Understanding the psychological principles behind motivation can help you harness your inner drive and achieve lasting success. Let's explore the science of what truly motivates human behavior.

## The Two Types of Motivation

### Intrinsic Motivation
This comes from within - the joy of learning, personal growth, and self-fulfillment. It's the most powerful and sustainable form of motivation.

### Extrinsic Motivation
This comes from external rewards like money, recognition, or avoiding punishment. While effective short-term, it can undermine intrinsic motivation over time.

## The Self-Determination Theory

Developed by Edward Deci and Richard Ryan, this theory identifies three basic psychological needs:

1. **Autonomy**: The need to feel in control of your actions
2. **Competence**: The need to feel effective and capable
3. **Relatedness**: The need to feel connected to others

## The Power of Purpose

Research shows that people with a strong sense of purpose live longer, healthier lives. Purpose provides direction and meaning to our efforts.

## The Progress Principle

Teresa Amabile's research reveals that making progress on meaningful work is the most important factor in daily motivation and positive emotions.

## How to Cultivate Intrinsic Motivation

1. **Connect to Values**: Align your goals with your core values
2. **Set Mastery Goals**: Focus on learning and improvement rather than performance
3. **Find Flow**: Engage in activities that challenge you appropriately
4. **Celebrate Progress**: Acknowledge small wins regularly

## The Motivation Myth

Motivation isn't something you wait for - it's something you create through action. The most motivated people are those who take action despite not feeling motivated.

## Conclusion

True motivation comes from within. By understanding these psychological principles and applying them to your life, you can develop the inner drive needed to achieve your most ambitious goals.

Remember: Motivation is not a feeling; it's a decision to act in alignment with your values and goals.
        `,
        excerpt: "Discover the psychological principles behind motivation and learn how to harness your inner drive for lasting success and achievement.",
        author: "Boostlly Team",
        publishedAt: new Date("2024-01-25"),
        category: "psychology",
        tags: ["motivation", "psychology", "self-determination", "purpose"],
        featured: false,
        slug: "psychology-motivation-what-really-drives-us",
        readingTime: 7,
        imageUrl: "/assets/articles/motivation.jpg",
        seoTitle: "The Psychology of Motivation: What Really Drives Us to Success",
        seoDescription: "Explore the science of motivation and learn psychological principles to harness your inner drive for lasting success and achievement."
      },
      {
        id: "article-4",
        title: "Building Resilience Through Daily Inspiration",
        content: `
# Building Resilience Through Daily Inspiration

Resilience isn't about avoiding challenges; it's about bouncing back stronger. Learn how daily inspiration can build the mental toughness needed to overcome life's obstacles.

## What is Resilience?

Resilience is the ability to adapt and bounce back from adversity, trauma, or significant stress. It's not a trait you either have or don't have - it's a skill that can be developed.

## The Science of Resilience

Research by psychologist Martin Seligman shows that resilience can be learned through:

1. **Optimism**: Believing that setbacks are temporary and specific
2. **Self-Efficacy**: Confidence in your ability to handle challenges
3. **Social Support**: Strong relationships that provide emotional support

## Daily Inspiration as a Resilience Builder

### Morning Motivation
Starting your day with positive, inspiring content sets a resilient mindset for whatever challenges come your way.

### Evening Reflection
Ending your day by reflecting on what went well and what you learned builds gratitude and perspective.

## The 3 P's of Resilience

1. **Personalization**: Don't blame yourself for everything
2. **Permanence**: Remember that difficult times are temporary
3. **Pervasiveness**: Don't let one setback affect all areas of your life

## Building Your Resilience Toolkit

- **Daily Inspiration**: Read motivational quotes and stories
- **Gratitude Practice**: Write down three things you're grateful for
- **Growth Mindset**: View challenges as opportunities to learn
- **Self-Care**: Prioritize your physical and mental health
- **Social Connection**: Maintain strong relationships with others

## The Power of Perspective

Resilient people don't see setbacks as failures; they see them as feedback. Every challenge is an opportunity to grow stronger and wiser.

## Conclusion

Resilience is built through daily practice, not overnight transformation. By incorporating daily inspiration and these resilience-building practices into your routine, you'll develop the mental toughness needed to overcome any obstacle.

Remember: The oak fought the wind and was broken, the willow bent when it must and survived. Be like the willow - flexible, adaptable, and resilient.
        `,
        excerpt: "Learn how daily inspiration builds resilience and mental toughness to overcome life's challenges and bounce back stronger than ever.",
        author: "Boostlly Team",
        publishedAt: new Date("2024-01-30"),
        category: "resilience",
        tags: ["resilience", "mental-toughness", "inspiration", "growth"],
        featured: false,
        slug: "building-resilience-daily-inspiration",
        readingTime: 6,
        imageUrl: "/assets/articles/resilience.jpg",
        seoTitle: "Building Resilience Through Daily Inspiration | Mental Toughness",
        seoDescription: "Discover how daily inspiration builds resilience and mental toughness to help you overcome challenges and bounce back stronger."
      }
    ];
  }

  /**
   * Initialize article categories
   */
  private initializeCategories(): void {
    this.categories = [
      {
        id: "motivation",
        name: "Motivation",
        slug: "motivation",
        description: "Articles about staying motivated and driven",
        color: "#3B82F6",
        articleCount: 1
      },
      {
        id: "productivity",
        name: "Productivity",
        slug: "productivity",
        description: "Tips and strategies for better productivity",
        color: "#10B981",
        articleCount: 1
      },
      {
        id: "psychology",
        name: "Psychology",
        slug: "psychology",
        description: "The science behind human behavior and motivation",
        color: "#8B5CF6",
        articleCount: 1
      },
      {
        id: "resilience",
        name: "Resilience",
        slug: "resilience",
        description: "Building mental toughness and resilience",
        color: "#F59E0B",
        articleCount: 1
      }
    ];
  }

  /**
   * Get all articles
   */
  async getArticles(): Promise<ServiceResponse<Article[]>> {
    return this.execute(
      "getArticles",
      "articles:all",
      async () => {
        logDebug("Fetching all articles");
        return this.articles;
      }
    );
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(): Promise<ServiceResponse<Article[]>> {
    return this.execute(
      "getFeaturedArticles",
      "articles:featured",
      async () => {
        logDebug("Fetching featured articles");
        return this.articles.filter(article => article.featured);
      }
    );
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<ServiceResponse<Article | null>> {
    return this.execute(
      "getArticleBySlug",
      `article:slug:${slug}`,
      async () => {
        logDebug("Fetching article by slug", { slug });
        return this.articles.find(a => a.slug === slug) || null;
      }
    );
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category: string): Promise<ServiceResponse<Article[]>> {
    return this.execute(
      "getArticlesByCategory",
      `articles:category:${category}`,
      async () => {
        logDebug("Fetching articles by category", { category });
        return this.articles.filter(article => article.category === category);
      }
    );
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<ServiceResponse<ArticleCategory[]>> {
    return this.execute(
      "getCategories",
      "categories:all",
      async () => {
        logDebug("Fetching article categories");
        return this.categories;
      }
    );
  }

  /**
   * Search articles
   */
  async searchArticles(query: string): Promise<ServiceResponse<Article[]>> {
    return this.execute(
      "searchArticles",
      `articles:search:${query}`,
      async () => {
        logDebug("Searching articles", { query });
        const searchTerm = query.toLowerCase();
        return this.articles.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          article.content.toLowerCase().includes(searchTerm) ||
          article.excerpt.toLowerCase().includes(searchTerm) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
    );
  }

  /**
   * Get related articles
   */
  async getRelatedArticles(articleId: string, limit: number = 3): Promise<ServiceResponse<Article[]>> {
    return this.execute(
      "getRelatedArticles",
      `articles:related:${articleId}:${limit}`,
      async () => {
        logDebug("Fetching related articles", { articleId, limit });
        const article = this.articles.find(a => a.id === articleId);
        if (!article) {
          return [];
        }

        return this.articles
          .filter(a => a.id !== articleId && a.category === article.category)
          .slice(0, limit);
      }
    );
  }
}

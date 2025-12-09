"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@boostlly/ui";
import { ArticleService } from "@boostlly/core";
import { Article, ArticleCategory } from "@boostlly/core";
import { 
  BookOpen, 
  Clock, 
  User, 
  Tag, 
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Star
} from "lucide-react";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");

  const articleService = new ArticleService();

  useEffect(() => {
    loadArticles();
    loadCategories();
    loadFeaturedArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticles();
      if (response.success) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await articleService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadFeaturedArticles = async () => {
    try {
      const response = await articleService.getFeaturedArticles();
      if (response.success) {
        setFeaturedArticles(response.data);
      }
    } catch (error) {
      console.error("Failed to load featured articles:", error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case "oldest":
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case "popular":
        return b.readingTime - a.readingTime; // Using reading time as popularity proxy
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Motivational Articles
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-gray-900 mb-6">
            Inspiring Articles for Your Journey
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-gray-600 max-w-3xl mx-auto">
            Discover science-backed strategies, motivational insights, and practical tips to help you achieve your goals and build lasting habits.
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredArticles.slice(0, 2).map((article) => (
                <Card key={article.id} className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white/80" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {article.readingTime} min read
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold leading-snug text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-base leading-relaxed text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs md:text-sm leading-normal text-gray-500">
                        <User className="w-4 h-4" />
                        {article.author}
                      </div>
                      <Button asChild>
                        <a href={`/articles/${article.slug}`}>Read More</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "popular")}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedArticles.map((article) => (
            <Card key={article.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ backgroundColor: categories.find(c => c.id === article.category)?.color + '20' }}
                  >
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {article.readingTime} min
                  </div>
                </div>
                
                <h3 className="text-base md:text-lg font-semibold leading-snug text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-base leading-relaxed text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm leading-normal text-gray-500">
                    <User className="w-4 h-4" />
                    {article.author}
                  </div>
                  <div className="flex items-center gap-1 text-xs md:text-sm leading-normal text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Button asChild className="w-full">
                  <a href={`/articles/${article.slug}`}>Read Article</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold leading-snug text-gray-600 mb-2">No articles found</h3>
            <p className="text-base leading-relaxed text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

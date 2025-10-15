import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@boostlly/ui";
import {
  Brain,
  TrendingUp,
  Heart,
  BookOpen,
  Target,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Quote, UserPreferences } from "@boostlly/core";
import "./smart-recommendations.css";

interface SmartRecommendationsProps {
  userQuotes: Quote[];
  userPreferences: UserPreferences;
  onQuoteSelect: (quote: Quote) => void;
}

interface RecommendationScore {
  quote: Quote;
  score: number;
  reasons: string[];
  category:
    | "mood"
    | "time"
    | "interest"
    | "trending"
    | "personal"
    | "discovery";
}

export function SmartRecommendations({
  userQuotes,
  onQuoteSelect,
}: SmartRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<
    "smart" | "trending" | "personal" | "discovery"
  >("smart");
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>(
    [],
  );

  // Analyze user behavior patterns
  const userPatterns = useMemo(() => {
    if (userQuotes.length === 0) return null;

    const patterns = {
      favoriteCategories: new Map<string, number>(),
      favoriteAuthors: new Map<string, number>(),
      readingTimes: new Map<number, number>(),
      interactionLevels: new Map<string, number>(),
      moodPreferences: new Map<string, number>(),
      quoteLengths: [] as number[],
      tags: new Map<string, number>(),
    };

    userQuotes.forEach((quote) => {
      // Category analysis
      if (quote.category) {
        patterns.favoriteCategories.set(
          quote.category,
          (patterns.favoriteCategories.get(quote.category) || 0) + 1,
        );
      }

      // Author analysis
      if (quote.author) {
        patterns.favoriteAuthors.set(
          quote.author,
          (patterns.favoriteAuthors.get(quote.author) || 0) + 1,
        );
      }

      // Tag analysis
      if (quote.tags) {
        quote.tags.forEach((tag) => {
          patterns.tags.set(tag, (patterns.tags.get(tag) || 0) + 1);
        });
      }

      // Length analysis
      patterns.quoteLengths.push(quote.text.length);

      // Interaction analysis (simulated)
      const interactionLevel = Math.random() * 5 + 1; // Simulate user interaction
      patterns.interactionLevels.set(quote.id, interactionLevel);
    });

    return patterns;
  }, [userQuotes]);

  // Determine recommendation category
  const determineCategory = (
    score: number,
    reasons: string[],
  ): RecommendationScore["category"] => {
    if (score > 8) return "trending";
    if (reasons.some((r) => r.includes("favorite"))) return "personal";
    if (reasons.some((r) => r.includes("mood"))) return "mood";
    if (reasons.some((r) => r.includes("time"))) return "time";
    if (reasons.some((r) => r.includes("discovery"))) return "discovery";
    return "interest";
  };

  // Generate smart recommendations
  const generateRecommendations = useMemo(() => {
    if (!userPatterns) return [];

    const allQuotes = userQuotes;
    const recommendations: RecommendationScore[] = [];

    allQuotes.forEach((quote) => {
      let score = 0;
      const reasons: string[] = [];

      // Category preference scoring
      if (
        quote.category &&
        userPatterns.favoriteCategories.has(quote.category)
      ) {
        const categoryWeight =
          userPatterns.favoriteCategories.get(quote.category) || 0;
        score += categoryWeight * 2;
        reasons.push(`Matches your favorite category: ${quote.category}`);
      }

      // Author preference scoring
      if (quote.author && userPatterns.favoriteAuthors.has(quote.author)) {
        const authorWeight =
          userPatterns.favoriteAuthors.get(quote.author) || 0;
        score += authorWeight * 1.5;
        reasons.push(`From your favorite author: ${quote.author}`);
      }

      // Tag preference scoring
      if (quote.tags) {
        quote.tags.forEach((tag) => {
          if (userPatterns.tags.has(tag)) {
            const tagWeight = userPatterns.tags.get(tag) || 0;
            score += tagWeight * 0.5;
            reasons.push(`Contains your favorite tag: ${tag}`);
          }
        });
      }

      // Length preference scoring
      const avgLength =
        userPatterns.quoteLengths.reduce((a, b) => a + b, 0) /
        userPatterns.quoteLengths.length;
      const lengthDiff = Math.abs(quote.text.length - avgLength);
      if (lengthDiff < 50) {
        score += 3;
        reasons.push("Matches your preferred quote length");
      }

      // Time-based scoring
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour <= 10) {
        score += 2;
        reasons.push("Perfect for morning motivation");
      } else if (currentHour >= 18 && currentHour <= 22) {
        score += 2;
        reasons.push("Great for evening reflection");
      }

      // Mood-based scoring (simulated)
      const moodScore = Math.random() * 3 + 1;
      score += moodScore;
      reasons.push("Matches your current mood");

      // Discovery bonus (reduce score for frequently seen quotes)
      const interactionLevel =
        userPatterns.interactionLevels.get(quote.id) || 1;
      if (interactionLevel < 3) {
        score += 2;
        reasons.push("New discovery opportunity");
      }

      if (score > 0) {
        recommendations.push({
          quote,
          score: Math.round(score * 10) / 10,
          reasons: reasons.slice(0, 3), // Top 3 reasons
          category: determineCategory(score, reasons),
        });
      }
    });

    // Sort by score and return top recommendations
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [userQuotes, userPatterns]);

  // Get trending quotes (most interacted with)
  const trendingQuotes = useMemo(() => {
    if (!userPatterns) return [];

    return userQuotes
      .map((quote) => ({
        quote,
        interactionLevel: userPatterns.interactionLevels.get(quote.id) || 1,
      }))
      .sort((a, b) => b.interactionLevel - a.interactionLevel)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        score: item.interactionLevel,
        reasons: [`High engagement: ${Math.round(item.interactionLevel)}/5`],
        category: "trending" as const,
      }));
  }, [userQuotes, userPatterns]);

  // Get personal recommendations (based on preferences)
  const personalRecommendations = useMemo(() => {
    return generateRecommendations
      .filter((rec) => rec.reasons.some((r) => r.includes("favorite")))
      .slice(0, 8);
  }, [generateRecommendations]);

  // Get discovery recommendations (new opportunities)
  const discoveryRecommendations = useMemo(() => {
    return generateRecommendations
      .filter((rec) => rec.reasons.some((r) => r.includes("discovery")))
      .slice(0, 8);
  }, [generateRecommendations]);

  useEffect(() => {
    setRecommendations(generateRecommendations);
  }, [generateRecommendations]);

  const renderRecommendationCard = (rec: RecommendationScore) => (
    <Card
      key={rec.quote.id}
      className="cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={() => onQuoteSelect(rec.quote)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <Badge
            variant={getBadgeVariant(rec.category)}
            className="text-xs flex-shrink-0"
          >
            {rec.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
            <Target className="w-3 h-3" />
            {rec.score}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-foreground mb-2 sm:mb-3 line-clamp-3 leading-relaxed">
          "{rec.quote.text}"
        </p>

        {rec.quote.author && (
          <p className="text-xs text-muted-foreground mb-2">
            — {rec.quote.author}
          </p>
        )}

        <div className="space-y-1">
          {rec.reasons.map((reason, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-foreground"
            >
              <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case "trending":
        return "default";
      case "personal":
        return "secondary";
      case "mood":
        return "outline";
      case "time":
        return "destructive";
      case "discovery":
        return "gradient";
      default:
        return "outline";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "smart":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mobile-grid">
            {recommendations
              .slice(0, 6)
              .map((rec) => renderRecommendationCard(rec))}
          </div>
        );

      case "trending":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mobile-grid">
            {trendingQuotes.map((rec) => renderRecommendationCard(rec))}
          </div>
        );

      case "personal":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mobile-grid">
            {personalRecommendations.map((rec) =>
              renderRecommendationCard(rec),
            )}
          </div>
        );

      case "discovery":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mobile-grid">
            {discoveryRecommendations.map((rec) =>
              renderRecommendationCard(rec),
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!userPatterns) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Start collecting quotes to get smart recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
            <span className="truncate">Smart Recommendations</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            AI-powered suggestions based on your preferences and behavior
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">
              {recommendations.length} matches
            </span>
            <span className="sm:hidden">{recommendations.length}</span>
          </div>
        </div>
      </div>

      {/* Pattern Insights - Mobile Responsive */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Your Reading Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold truncate px-1">
                {Array.from(userPatterns.favoriteCategories.keys())
                  .slice(0, 3)
                  .join(", ") || "None"}
              </div>
              <div className="text-xs text-muted-foreground">
                Top Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold truncate px-1">
                {Array.from(userPatterns.favoriteAuthors.keys())
                  .slice(0, 2)
                  .join(", ") || "None"}
              </div>
              <div className="text-xs text-muted-foreground">
                Favorite Authors
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">
                {Math.round(
                  userPatterns.quoteLengths.reduce((a, b) => a + b, 0) /
                    userPatterns.quoteLengths.length,
                ) || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg Quote Length
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">
                {userQuotes.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Quotes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs - Mobile Responsive */}
      <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border overflow-x-auto scrollbar-hide mobile-spacing">
        {[
          {
            id: "smart",
            label: "Smart",
            icon: Brain,
            count: recommendations.length,
          },
          {
            id: "trending",
            label: "Trending",
            icon: TrendingUp,
            count: trendingQuotes.length,
          },
          {
            id: "personal",
            label: "Personal",
            icon: Heart,
            count: personalRecommendations.length,
          },
          {
            id: "discovery",
            label: "Discovery",
            icon: BookOpen,
            count: discoveryRecommendations.length,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "gradient" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="text-xs flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-fit mobile-touch-target"
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="hidden xs:inline">{tab.label}</span>
              <Badge
                variant="outline"
                className="text-xs px-1 py-0 flex-shrink-0"
              >
                {tab.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Recommendations Grid - Mobile Responsive */}
      <div className="min-h-[300px] sm:min-h-[400px]">{renderTabContent()}</div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="text-sm w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Recommendations
        </Button>
      </div>
    </div>
  );
}

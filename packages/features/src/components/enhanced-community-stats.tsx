import { useState } from "react";
import { Button, Badge, Progress } from "@boostlly/ui";
import { SocialMetrics } from "@boostlly/core";
import {
  Users,
  Heart,
  Share2,
  MessageSquare,
  BarChart3,
  Activity,
  Hash,
  Star,
  Award,
  Zap,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface EnhancedCommunityStatsProps {
  metrics: SocialMetrics;
}

export function EnhancedCommunityStats({
  metrics,
}: EnhancedCommunityStatsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "trending" | "analytics"
  >("overview");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (growth < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-400";
    if (growth < 0) return "text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Heading rendered by parent; keep this component decoupled */}
      {/* Header with Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs: make horizontally scrollable on mobile */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="flex items-center gap-2 bg-accent/40 rounded-lg p-1 border border-border">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("overview")}
              className="text-xs"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "trending" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("trending")}
              className="text-xs"
            >
              Trending
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("analytics")}
              className="text-xs"
            >
              Analytics
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-background border border-border rounded-lg px-3 py-1 text-foreground text-sm"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6 mt-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div className="flex items-center gap-1">
                  {getGrowthIcon(metrics.weeklyGrowth || 0)}
                  <span
                    className={`text-xs ${getGrowthColor(metrics.weeklyGrowth || 0)}`}
                  >
                    {Math.abs(metrics.weeklyGrowth || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(metrics.totalUsers || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(
                  metrics.dailyActiveUsers || metrics.activeUsers || 0,
                )}{" "}
                active today
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">+12.5%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(metrics.totalQuotes || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Quotes</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber((metrics.viralQuotes || []).length)} viral
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">+8.3%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(metrics.totalInteractions || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Interactions</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(metrics.engagementRate || 0)}% engagement
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">+15.2%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(metrics.activeUsers || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalUsers
                  ? Math.round(
                      ((metrics.activeUsers || 0) / metrics.totalUsers) * 100,
                    )
                  : 0}
                % retention
              </p>
            </div>
          </div>

          {/* Engagement Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Engagement Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-blue-400" />
                    <span className="text-foreground">Likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">
                      {formatNumber(metrics.engagementBreakdown?.likes || 0)}
                    </span>
                    <Progress value={75} className="w-16" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                    <span className="text-foreground">Comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">
                      {formatNumber(metrics.engagementBreakdown?.comments || 0)}
                    </span>
                    <Progress value={45} className="w-16" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    <span className="text-foreground">Shares</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">
                      {formatNumber(metrics.engagementBreakdown?.shares || 0)}
                    </span>
                    <Progress value={30} className="w-16" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-yellow-400" />
                    <span className="text-foreground">Saves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">
                      {formatNumber(metrics.engagementBreakdown?.saves || 0)}
                    </span>
                    <Progress value={60} className="w-16" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Contributors
              </h3>
              <div className="space-y-3">
                {metrics.topContributors
                  .slice(0, 5)
                  .map((user: any, index: number) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold text-xs">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground font-medium text-sm">
                            {user.displayName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user.totalQuotes} quotes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {index === 0 && (
                          <Star className="w-4 h-4 text-yellow-400" />
                        )}
                        {index === 1 && (
                          <Star className="w-4 h-4 text-muted-foreground" />
                        )}
                        {index === 2 && (
                          <Star className="w-4 h-4 text-orange-400" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Tab */}
      {activeTab === "trending" && (
        <div className="space-y-6">
          {/* Trending Hashtags */}
          <div className="p-4 bg-card rounded-xl border border-border elevation-1">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-blue-400" />
              Trending Hashtags
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics.trendingHashtags.slice(0, 8).map((hashtag: any) => (
                <div
                  key={hashtag.tag}
                  className="p-3 bg-card rounded-lg border border-border elevation-1"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-medium">
                      #{hashtag.tag}
                    </span>
                    {getGrowthIcon(hashtag.growth)}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {formatNumber(hashtag.count)} posts
                  </p>
                  <p className={`text-xs ${getGrowthColor(hashtag.growth)}`}>
                    {hashtag.growth > 0 ? "+" : ""}
                    {hashtag.growth.toFixed(1)}% growth
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Viral Quotes */}
          <div className="p-4 bg-card rounded-xl border border-border elevation-1">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Viral Quotes
            </h3>
            <div className="space-y-4">
              {metrics.viralQuotes
                .slice(0, 3)
                .map((quote: any, index: number) => (
                  <div
                    key={quote.id}
                    className="p-4 bg-card rounded-lg border border-border elevation-1"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">
                          #{index + 1}
                        </span>
                        <span className="text-foreground font-medium">
                          {quote.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {formatNumber(quote.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          {formatNumber(quote.shares)}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm italic">
                      "{quote.text}"
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {quote.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="glass" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Category Breakdown */}
          <div className="p-4 bg-card rounded-xl border border-border elevation-1">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Category Distribution
            </h3>
            <div className="space-y-3">
              {metrics.categoryBreakdown.slice(0, 6).map((category: any) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                    <span className="text-foreground capitalize">
                      {category.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">
                      {category.count} quotes
                    </span>
                    <Progress value={category.percentage} className="w-24" />
                    <span className="text-foreground font-medium text-sm">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Retention */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Retention
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">New Users</span>
                  <span className="text-green-400 font-bold">
                    {formatNumber(metrics.userRetention?.newUsers || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Returning Users</span>
                  <span className="text-blue-400 font-bold">
                    {formatNumber(metrics.userRetention?.returningUsers || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Churn Rate</span>
                  <span className="text-red-400 font-bold">
                    {(metrics.userRetention?.churnRate || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border elevation-1">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Daily Active</span>
                  <span className="text-foreground font-bold">
                    {formatNumber(
                      metrics.dailyActiveUsers || metrics.activeUsers || 0,
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Weekly Growth</span>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(metrics.weeklyGrowth || 0)}
                    <span
                      className={`font-bold ${getGrowthColor(metrics.weeklyGrowth || 0)}`}
                    >
                      {Math.abs(metrics.weeklyGrowth || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Engagement Rate</span>
                  <span className="text-purple-400 font-bold">
                    {Math.round(metrics.engagementRate || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

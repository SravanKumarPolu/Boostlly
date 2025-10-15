import { useState, useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
} from "@boostlly/ui";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart,
  Zap,
  BookOpen,
  Heart,
} from "lucide-react";
import { Quote, UserPreferences } from "@boostlly/core";

interface AdvancedAnalyticsProps {
  userQuotes: Quote[];
  userPreferences: UserPreferences;
}

interface AnalyticsData {
  totalQuotes: number;
  totalAuthors: number;
  totalCategories: number;
  totalTags: number;
  readingStreak: number;
  averageQuoteLength: number;
  favoriteTime: string;
  categoryDistribution: { [key: string]: number };
  authorDistribution: { [key: string]: number };
  tagDistribution: { [key: string]: number };
  dailyActivity: { [key: string]: number };
  weeklyTrends: { [key: string]: number };
  monthlyGrowth: { [key: string]: number };
  engagementMetrics: {
    likes: number;
    shares: number;
    comments: number;
    downloads: number;
    views: number;
  };
  goals: {
    dailyQuotes: number;
    weeklyQuotes: number;
    monthlyQuotes: number;
    categoryDiversity: number;
    authorDiversity: number;
  };
  // achievements removed
}

export function AdvancedAnalytics({ userQuotes }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "insights" | "goals"
  >("overview");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );

  // Generate comprehensive analytics data
  const analyticsData = useMemo((): AnalyticsData => {
    if (userQuotes.length === 0) {
      return {
        totalQuotes: 0,
        totalAuthors: 0,
        totalCategories: 0,
        totalTags: 0,
        readingStreak: 0,
        averageQuoteLength: 0,
        favoriteTime: "N/A",
        categoryDistribution: {},
        authorDistribution: {},
        tagDistribution: {},
        dailyActivity: {},
        weeklyTrends: {},
        monthlyGrowth: {},
        engagementMetrics: {
          likes: 0,
          shares: 0,
          comments: 0,
          downloads: 0,
          views: 0,
        },
        goals: {
          dailyQuotes: 0,
          weeklyQuotes: 0,
          monthlyQuotes: 0,
          categoryDiversity: 0,
          authorDiversity: 0,
        },
      };
    }

    // Basic counts
    const totalQuotes = userQuotes.length;
    const authors = new Set(userQuotes.map((q) => q.author).filter(Boolean));
    const categories = new Set(
      userQuotes.map((q) => q.category).filter(Boolean),
    );
    const tags = new Set(userQuotes.flatMap((q) => q.tags || []));

    // Category and author distribution
    const categoryDistribution: { [key: string]: number } = {};
    const authorDistribution: { [key: string]: number } = {};
    const tagDistribution: { [key: string]: number } = {};

    userQuotes.forEach((quote) => {
      if (quote.category) {
        categoryDistribution[quote.category] =
          (categoryDistribution[quote.category] || 0) + 1;
      }
      if (quote.author) {
        authorDistribution[quote.author] =
          (authorDistribution[quote.author] || 0) + 1;
      }
      if (quote.tags) {
        quote.tags.forEach((tag) => {
          tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
        });
      }
    });

    // Calculate averages and metrics
    const averageQuoteLength = Math.round(
      userQuotes.reduce((sum, q) => sum + q.text.length, 0) / totalQuotes,
    );

    // Simulate daily activity (in real app, this would come from timestamps)
    const dailyActivity: { [key: string]: number } = {};
    const weeklyTrends: { [key: string]: number } = {};
    const monthlyGrowth: { [key: string]: number } = {};

    // Generate mock activity data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Simulate activity with some randomness
      const baseActivity = Math.floor(Math.random() * 5) + 1;
      const weekendBonus = [0, 6].includes(date.getDay()) ? 2 : 0;
      dailyActivity[dateStr] = baseActivity + weekendBonus;
    }

    // Weekly trends (last 4 weeks)
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekStr = `Week ${4 - i}`;
      weeklyTrends[weekStr] = Math.floor(Math.random() * 20) + 10;
    }

    // Monthly growth (last 6 months)
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      const monthStr = monthStart.toLocaleDateString("en-US", {
        month: "short",
      });
      monthlyGrowth[monthStr] = Math.floor(Math.random() * 50) + 20;
    }

    // Simulate engagement metrics
    const engagementMetrics = {
      likes: Math.floor(Math.random() * 100) + 50,
      shares: Math.floor(Math.random() * 30) + 10,
      comments: Math.floor(Math.random() * 20) + 5,
      downloads: Math.floor(Math.random() * 40) + 15,
      views: Math.floor(Math.random() * 500) + 200,
    };

    // Calculate goals
    const goals = {
      dailyQuotes: Math.floor(totalQuotes / 30),
      weeklyQuotes: Math.floor(totalQuotes / 4),
      monthlyQuotes: totalQuotes,
      categoryDiversity: Object.keys(categoryDistribution).length,
      authorDiversity: Object.keys(authorDistribution).length,
    };

    // Calculate reading streak (simulated)
    const readingStreak = Math.floor(Math.random() * 15) + 5;

    // Determine favorite time (simulated)
    const favoriteTime = [
      "Morning (6-10 AM)",
      "Afternoon (12-4 PM)",
      "Evening (6-10 PM)",
      "Night (10 PM-2 AM)",
    ][Math.floor(Math.random() * 4)];

    return {
      totalQuotes,
      totalAuthors: authors.size,
      totalCategories: categories.size,
      totalTags: tags.size,
      readingStreak,
      averageQuoteLength,
      favoriteTime,
      categoryDistribution,
      authorDistribution,
      tagDistribution,
      dailyActivity,
      weeklyTrends,
      monthlyGrowth,
      engagementMetrics,
      goals,
    };
  }, [userQuotes]);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-600/20 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-blue-300">
              {analyticsData.totalQuotes}
            </div>
            <div className="text-xs text-blue-200">Total Quotes</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-600/20 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-green-400 mb-2" />
            <div className="text-2xl font-bold text-green-300">
              {analyticsData.readingStreak}
            </div>
            <div className="text-xs text-green-200">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-600/20 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-purple-300">
              {analyticsData.totalCategories}
            </div>
            <div className="text-xs text-purple-200">Categories</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-yellow-300">
              {analyticsData.totalAuthors}
            </div>
            <div className="text-xs text-yellow-200">Authors</div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {analyticsData.engagementMetrics.likes}
              </div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {analyticsData.engagementMetrics.shares}
              </div>
              <div className="text-xs text-muted-foreground">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {analyticsData.engagementMetrics.comments}
              </div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {analyticsData.engagementMetrics.downloads}
              </div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {analyticsData.engagementMetrics.views}
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reading Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Reading Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Quote Length</span>
              <span className="text-sm font-medium">
                {analyticsData.averageQuoteLength} chars
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Favorite Time</span>
              <span className="text-sm font-medium">
                {analyticsData.favoriteTime}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Tags</span>
              <span className="text-sm font-medium">
                {analyticsData.totalTags}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Current Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Daily Quotes</span>
                <span>{analyticsData.goals.dailyQuotes}/3</span>
              </div>
              <Progress
                value={(analyticsData.goals.dailyQuotes / 3) * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Category Diversity</span>
                <span>{analyticsData.goals.categoryDiversity}/5</span>
              </div>
              <Progress
                value={(analyticsData.goals.categoryDiversity / 5) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2 bg-background/5 backdrop-blur-sm rounded-lg p-1 border border-border">
        {["7d", "30d", "90d", "1y"].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "gradient" : "ghost"}
            size="sm"
            onClick={() => setTimeRange(range as any)}
            className="text-xs"
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Activity ({timeRange})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end gap-1">
            {Object.entries(analyticsData.dailyActivity)
              .slice(-parseInt(timeRange.replace("d", "")))
              .map(([date, count]) => (
                <div key={date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                    style={{ height: `${(count / 10) * 100}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(date).getDate()}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weekly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analyticsData.weeklyTrends).map(([week, count]) => (
              <div key={week} className="flex items-center justify-between">
                <span className="text-sm">{week}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                      style={{ width: `${(count / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Monthly Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analyticsData.monthlyGrowth).map(
              ([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm">{month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                        style={{ width: `${(count / 70) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">+{count}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analyticsData.categoryDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm capitalize">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                        style={{
                          width: `${(count / analyticsData.totalQuotes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Authors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Top Authors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analyticsData.authorDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([author, count]) => (
                <div key={author} className="flex items-center justify-between">
                  <span className="text-sm">{author}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                        style={{
                          width: `${(count / analyticsData.totalQuotes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analyticsData.tagDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 20)
              .map(([tag, count]) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag} ({count})
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-6">
      {/* Goal Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Daily Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Read 3 Quotes</span>
                  <span>{analyticsData.goals.dailyQuotes}/3</span>
                </div>
                <Progress
                  value={(analyticsData.goals.dailyQuotes / 3) * 100}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Explore New Category</span>
                  <span>
                    {analyticsData.goals.categoryDiversity >= 5 ? "✅" : "❌"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Read 20 Quotes</span>
                  <span>{analyticsData.goals.weeklyQuotes}/20</span>
                </div>
                <Progress
                  value={(analyticsData.goals.weeklyQuotes / 20) * 100}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Maintain Streak</span>
                  <span>{analyticsData.readingStreak >= 7 ? "✅" : "❌"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Long-term Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Long-term Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-300">
                {analyticsData.totalQuotes}
              </div>
              <div className="text-sm text-blue-200">Current Total</div>
              <div className="text-xs text-blue-300 mt-1">Goal: 500</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-green-600/20 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-300">
                {analyticsData.totalCategories}
              </div>
              <div className="text-sm text-green-200">Categories</div>
              <div className="text-xs text-green-300 mt-1">Goal: 10</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-300">
                {analyticsData.totalAuthors}
              </div>
              <div className="text-sm text-purple-200">Authors</div>
              <div className="text-xs text-purple-300 mt-1">Goal: 25</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // const renderAchievementsTab = () => null;

  if (userQuotes.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Start collecting quotes to see your analytics!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Advanced Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Deep insights into your reading patterns and progress
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {analyticsData.totalQuotes} quotes analyzed
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "trends", label: "Trends", icon: TrendingUp },
          { id: "insights", label: "Insights", icon: PieChart },
          { id: "goals", label: "Goals", icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "gradient" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="text-xs flex items-center gap-1"
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "trends" && renderTrendsTab()}
        {activeTab === "insights" && renderInsightsTab()}
        {activeTab === "goals" && renderGoalsTab()}
      </div>
    </div>
  );
}

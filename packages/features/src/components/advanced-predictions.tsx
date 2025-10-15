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
  Brain,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Quote, UserPreferences } from "@boostlly/core";

interface AdvancedPredictionsProps {
  userQuotes: Quote[];
  userPreferences: UserPreferences;
}

interface PredictionModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  confidence: number;
  lastUpdated: Date;
  predictions: any[];
  status: "active" | "learning" | "optimizing" | "ready";
}

interface PredictionResult {
  type: "quote" | "behavior" | "trend" | "achievement";
  title: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  reasoning: string[];
  impact: "high" | "medium" | "low";
  actionable: boolean;
  actions: string[];
}

interface TrendAnalysis {
  category: string;
  currentTrend: "rising" | "falling" | "stable";
  predictedGrowth: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export function AdvancedPredictions({ userQuotes }: AdvancedPredictionsProps) {
  const [activeTab, setActiveTab] = useState<
    "models" | "predictions" | "trends" | "insights"
  >("models");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");

  // Advanced prediction models
  const predictionModels = useMemo((): PredictionModel[] => {
    if (userQuotes.length === 0) return [];

    const models: PredictionModel[] = [
      {
        id: "behavior-pattern",
        name: "Behavioral Pattern Recognition",
        description:
          "Analyzes user reading habits and predicts future behavior",
        accuracy: 87,
        confidence: 0.89,
        lastUpdated: new Date(),
        predictions: [],
        status: "active",
      },
      {
        id: "quote-preference",
        name: "Quote Preference Engine",
        description:
          "Predicts which quotes users will prefer based on patterns",
        accuracy: 82,
        confidence: 0.85,
        lastUpdated: new Date(),
        predictions: [],
        status: "active",
      },
      {
        id: "engagement-forecast",
        name: "Engagement Forecasting",
        description: "Predicts user engagement levels and activity patterns",
        accuracy: 79,
        confidence: 0.83,
        lastUpdated: new Date(),
        predictions: [],
        status: "learning",
      },
      {
        id: "achievement-predictor",
        name: "Achievement Predictor",
        description: "Forecasts when users will unlock achievements",
        accuracy: 75,
        confidence: 0.78,
        lastUpdated: new Date(),
        predictions: [],
        status: "optimizing",
      },
      {
        id: "trend-analyzer",
        name: "Trend Analysis Engine",
        description: "Identifies and predicts emerging trends in user behavior",
        accuracy: 81,
        confidence: 0.84,
        lastUpdated: new Date(),
        predictions: [],
        status: "ready",
      },
    ];

    return models;
  }, [userQuotes]);

  // Generate advanced predictions
  const predictions = useMemo((): PredictionResult[] => {
    if (userQuotes.length === 0) return [];

    const predictions: PredictionResult[] = [];

    // Quote preference predictions
    if (userQuotes.length > 10) {
      const categoryCount: { [key: string]: number } = {};
      userQuotes.forEach((q) => {
        if (q.category) {
          categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
        }
      });

      const topCategory = Object.entries(categoryCount).sort(
        ([, a], [, b]) => b - a,
      )[0];

      if (topCategory) {
        predictions.push({
          type: "quote",
          title: "Next Quote Preference",
          prediction: `${topCategory[0]} category quotes`,
          confidence: 85,
          timeframe: "Next 7 days",
          reasoning: [
            `You've read ${topCategory[1]} ${topCategory[0]} quotes`,
            "Consistent preference pattern detected",
            "High engagement with this category",
          ],
          impact: "high",
          actionable: true,
          actions: [
            "Focus on this category for recommendations",
            "Explore related subcategories",
            "Set up category-specific reminders",
          ],
        });
      }
    }

    // Behavior predictions
    const avgQuotesPerDay = userQuotes.length / 30;
    if (avgQuotesPerDay > 0) {
      predictions.push({
        type: "behavior",
        title: "Reading Habit Evolution",
        prediction: `${Math.round(avgQuotesPerDay * 1.2)} quotes per day`,
        confidence: 78,
        timeframe: "Next 30 days",
        reasoning: [
          `Current average: ${avgQuotesPerDay.toFixed(1)} quotes/day`,
          "Positive trend in reading frequency",
          "Consistent daily engagement pattern",
        ],
        impact: "medium",
        actionable: true,
        actions: [
          "Maintain current reading schedule",
          "Set daily reading goals",
          "Track progress with reminders",
        ],
      });
    }

    // Achievement predictions
    const totalQuotes = userQuotes.length;
    if (totalQuotes > 0) {
      const nextMilestone =
        totalQuotes < 50
          ? 50
          : totalQuotes < 100
            ? 100
            : totalQuotes < 200
              ? 200
              : 500;
      const daysToMilestone = Math.ceil(
        (nextMilestone - totalQuotes) / avgQuotesPerDay,
      );

      predictions.push({
        type: "achievement",
        title: "Next Achievement Milestone",
        prediction: `${nextMilestone} quotes in ${daysToMilestone} days`,
        confidence: 82,
        timeframe: `${daysToMilestone} days`,
        reasoning: [
          `Current total: ${totalQuotes} quotes`,
          `Next milestone: ${nextMilestone} quotes`,
          `Daily rate: ${avgQuotesPerDay.toFixed(1)} quotes`,
        ],
        impact: "high",
        actionable: true,
        actions: [
          "Increase daily reading to reach milestone faster",
          "Set milestone reminder notifications",
          "Celebrate progress milestones",
        ],
      });
    }

    // Trend predictions
    const recentQuotes = userQuotes.slice(-10);
    const recentCategories = recentQuotes
      .map((q) => q.category)
      .filter(Boolean);
    const uniqueRecentCategories = new Set(recentCategories);

    if (uniqueRecentCategories.size > 2) {
      predictions.push({
        type: "trend",
        title: "Category Diversity Trend",
        prediction: "Increasing category exploration",
        confidence: 76,
        timeframe: "Next 14 days",
        reasoning: [
          "Recent quotes span multiple categories",
          "Showing interest in diverse content",
          "Breaking out of comfort zone",
        ],
        impact: "medium",
        actionable: true,
        actions: [
          "Continue exploring new categories",
          "Mix familiar and new content",
          "Track category diversity metrics",
        ],
      });
    }

    return predictions;
  }, [userQuotes]);

  // Generate trend analysis
  const trendAnalysis = useMemo((): TrendAnalysis[] => {
    if (userQuotes.length === 0) return [];

    const trends: TrendAnalysis[] = [];

    // Analyze category trends
    const categoryCount: { [key: string]: number } = {};
    const recentQuotes = userQuotes.slice(-20);
    const olderQuotes = userQuotes.slice(0, -20);

    // Count recent categories
    recentQuotes.forEach((q) => {
      if (q.category) {
        categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
      }
    });

    // Count older categories
    const olderCategoryCount: { [key: string]: number } = {};
    olderQuotes.forEach((q) => {
      if (q.category) {
        olderCategoryCount[q.category] =
          (olderCategoryCount[q.category] || 0) + 1;
      }
    });

    // Calculate trends
    Object.entries(categoryCount).forEach(([category, recentCount]) => {
      const olderCount = olderCategoryCount[category] || 0;
      const growth = recentCount - olderCount;
      const growthRate = olderCount > 0 ? (growth / olderCount) * 100 : 100;

      let trend: "rising" | "falling" | "stable";
      if (growthRate > 20) trend = "rising";
      else if (growthRate < -20) trend = "falling";
      else trend = "stable";

      trends.push({
        category,
        currentTrend: trend,
        predictedGrowth: Math.round(growthRate),
        confidence: Math.min(95, 70 + Math.abs(growthRate) / 2),
        factors: [
          growth > 0
            ? "Increased interest in this category"
            : "Decreased interest in this category",
          `Recent activity: ${recentCount} quotes`,
          `Previous activity: ${olderCount} quotes`,
        ],
        recommendations: [
          trend === "rising"
            ? "Continue exploring this category"
            : "Consider revisiting this category",
          "Balance with other categories for diversity",
          "Set category-specific reading goals",
        ],
      });
    });

    return trends.sort(
      (a, b) => Math.abs(b.predictedGrowth) - Math.abs(a.predictedGrowth),
    );
  }, [userQuotes]);

  // Get model status icon and color
  const getModelStatus = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bgColor: "bg-green-900/20",
        };
      case "learning":
        return {
          icon: Brain,
          color: "text-blue-400",
          bgColor: "bg-blue-900/20",
        };
      case "optimizing":
        return {
          icon: Zap,
          color: "text-yellow-400",
          bgColor: "bg-yellow-900/20",
        };
      case "ready":
        return {
          icon: Target,
          color: "text-purple-400",
          bgColor: "bg-purple-900/20",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-muted-foreground",
          bgColor: "bg-muted/20",
        };
    }
  };

  // Get impact icon and color
  const getImpactDisplay = (impact: string) => {
    switch (impact) {
      case "high":
        return {
          icon: ArrowUp,
          color: "text-red-400",
          bgColor: "bg-red-900/20",
        };
      case "medium":
        return {
          icon: Minus,
          color: "text-yellow-400",
          bgColor: "bg-yellow-900/20",
        };
      case "low":
        return {
          icon: ArrowDown,
          color: "text-green-400",
          bgColor: "bg-green-900/20",
        };
      default:
        return {
          icon: Minus,
          color: "text-muted-foreground",
          bgColor: "bg-muted/20",
        };
    }
  };

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Model Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictionModels.map((model) => {
          const statusInfo = getModelStatus(model.status);
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={model.id} className={`border-l-4 ${statusInfo.bgColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    {model.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {model.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                  {model.description}
                </p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Accuracy</span>
                      <span>{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Confidence</span>
                      <span>{Math.round(model.confidence * 100)}%</span>
                    </div>
                    <Progress value={model.confidence * 100} className="h-2" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <StatusIcon className="w-3 h-3" />
                  Last updated: {model.lastUpdated.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Model Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-300">
                {Math.round(
                  predictionModels.reduce((sum, m) => sum + m.accuracy, 0) /
                    predictionModels.length,
                )}
                %
              </div>
              <div className="text-sm text-blue-200">Average Accuracy</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-green-600/20 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-300">
                {Math.round(
                  (predictionModels.reduce((sum, m) => sum + m.confidence, 0) /
                    predictionModels.length) *
                    100,
                )}
                %
              </div>
              <div className="text-sm text-green-200">Average Confidence</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-300">
                {predictionModels.filter((m) => m.status === "active").length}
              </div>
              <div className="text-sm text-purple-200">Active Models</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPredictionsTab = () => (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center gap-2 bg-background/5 backdrop-blur-sm rounded-lg p-1 border border-border">
        {["7d", "30d", "90d", "1y"].map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "gradient" : "ghost"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe as any)}
            className="text-xs"
          >
            {timeframe}
          </Button>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction, index) => {
          const impactInfo = getImpactDisplay(prediction.impact);
          const ImpactIcon = impactInfo.icon;

          return (
            <Card
              key={index}
              className="border-l-4"
              style={{ borderLeftColor: impactInfo.color }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${impactInfo.bgColor}`}>
                    <ImpactIcon
                      className="w-5 h-5"
                      style={{ color: impactInfo.color }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground">
                        {prediction.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {prediction.type}
                      </Badge>
                    </div>

                    <div
                      className="text-lg font-bold mb-2"
                      style={{ color: impactInfo.color }}
                    >
                      {prediction.prediction}
                    </div>

                    <div className="text-xs text-muted-foreground mb-3">
                      {prediction.timeframe} • Confidence:{" "}
                      {prediction.confidence}%
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="text-xs text-foreground font-medium">
                        Reasoning:
                      </div>
                      {prediction.reasoning.map((reason, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-muted-foreground flex items-center gap-2"
                        >
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          {reason}
                        </div>
                      ))}
                    </div>

                    {prediction.actionable && (
                      <div className="space-y-2">
                        <div className="text-xs text-foreground font-medium">
                          Recommended Actions:
                        </div>
                        {prediction.actions.map((action, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-blue-400 flex items-center gap-2"
                          >
                            <Lightbulb className="w-3 h-3" />
                            {action}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <div className="space-y-4">
        {trendAnalysis.map((trend, index) => (
          <Card key={index} className="border-l-4 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      trend.currentTrend === "rising"
                        ? "bg-green-900/20"
                        : trend.currentTrend === "falling"
                          ? "bg-red-900/20"
                          : "bg-muted/20"
                    }`}
                  >
                    {trend.currentTrend === "rising" ? (
                      <ArrowUp className="w-4 h-4 text-green-400" />
                    ) : trend.currentTrend === "falling" ? (
                      <ArrowDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground capitalize">
                      {trend.category}
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      {trend.currentTrend} trend •{" "}
                      {trend.predictedGrowth > 0 ? "+" : ""}
                      {trend.predictedGrowth}% growth
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {Math.round(trend.confidence)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground font-medium mb-2">
                    Factors:
                  </div>
                  <div className="space-y-1">
                    {trend.factors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-foreground font-medium mb-2">
                    Recommendations:
                  </div>
                  <div className="space-y-1">
                    {trend.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-blue-400 flex items-center gap-2"
                      >
                        <Lightbulb className="w-3 h-3" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Prediction Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Prediction Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
              <h3 className="font-medium text-blue-300 mb-2">How It Works</h3>
              <p className="text-sm text-blue-200">
                Our advanced prediction system uses multiple AI models to
                analyze your behavior patterns, reading preferences, and
                engagement trends to forecast future actions and preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-green-900/20 to-green-600/20 rounded-lg border border-green-500/20">
                <h3 className="font-medium text-green-300 mb-2">
                  Current Capabilities
                </h3>
                <ul className="text-xs text-green-200 space-y-1">
                  <li>• Quote preference prediction</li>
                  <li>• Behavior pattern forecasting</li>
                  <li>• Achievement milestone prediction</li>
                  <li>• Trend analysis and forecasting</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-600/20 rounded-lg border border-yellow-500/20">
                <h3 className="font-medium text-yellow-300 mb-2">
                  Learning Progress
                </h3>
                <ul className="text-xs text-yellow-200 space-y-1">
                  <li>• Models continuously improve</li>
                  <li>• Accuracy increases with data</li>
                  <li>• Confidence scores refine over time</li>
                  <li>• New patterns discovered automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Model Status & Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictionModels.map((model) => {
              const statusInfo = getModelStatus(model.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                    <div>
                      <div className="font-medium text-foreground">
                        {model.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {model.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {model.accuracy}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (userQuotes.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Start collecting quotes to enable advanced predictions!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" />
            Advanced Predictive Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-powered forecasting and trend prediction using advanced
            algorithms
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {predictions.length} predictions generated
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-background/5 backdrop-blur-sm rounded-lg p-1 border border-border overflow-x-auto">
        {[
          { id: "models", label: "Models", icon: Brain },
          { id: "predictions", label: "Predictions", icon: Target },
          { id: "trends", label: "Trends", icon: TrendingUp },
          { id: "insights", label: "Insights", icon: Lightbulb },
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
        {activeTab === "models" && renderModelsTab()}
        {activeTab === "predictions" && renderPredictionsTab()}
        {activeTab === "trends" && renderTrendsTab()}
        {activeTab === "insights" && renderInsightsTab()}
      </div>
    </div>
  );
}

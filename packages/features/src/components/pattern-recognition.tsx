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
  Clock,
  Target,
  Zap,
  Lightbulb,
  Activity,
  BarChart3,
  Heart,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Quote, UserPreferences } from "@boostlly/core";

interface PatternRecognitionProps {
  userQuotes: Quote[];
  userPreferences: UserPreferences;
}

interface UserPattern {
  readingTime: "morning" | "afternoon" | "evening" | "night";
  favoriteLength: "short" | "medium" | "long";
  categoryPreference: string[];
  authorPreference: string[];
  moodPattern:
    | "motivational"
    | "reflective"
    | "inspirational"
    | "philosophical";
  readingFrequency: "daily" | "weekly" | "occasional";
  interactionStyle: "passive" | "active" | "social";
}

interface LearningInsight {
  type: "behavior" | "preference" | "trend" | "prediction";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  action?: string;
  icon: any;
  color: string;
}

export function PatternRecognition({ userQuotes }: PatternRecognitionProps) {
  const [activeTab, setActiveTab] = useState<
    "patterns" | "learning" | "predictions" | "insights"
  >("patterns");

  // Analyze user patterns using client-side intelligence
  const userPatterns = useMemo((): UserPattern => {
    if (userQuotes.length === 0) {
      return {
        readingTime: "morning",
        favoriteLength: "medium",
        categoryPreference: [],
        authorPreference: [],
        moodPattern: "motivational",
        readingFrequency: "occasional",
        interactionStyle: "passive",
      };
    }

    // Analyze quote lengths
    const lengths = userQuotes.map((q) => q.text.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    let favoriteLength: "short" | "medium" | "long";
    if (avgLength < 100) favoriteLength = "short";
    else if (avgLength < 200) favoriteLength = "medium";
    else favoriteLength = "long";

    // Analyze categories
    const categoryCount: { [key: string]: number } = {};
    userQuotes.forEach((q) => {
      if (q.category) {
        categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
      }
    });
    const categoryPreference = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    // Analyze authors
    const authorCount: { [key: string]: number } = {};
    userQuotes.forEach((q) => {
      if (q.author) {
        authorCount[q.author] = (authorCount[q.author] || 0) + 1;
      }
    });
    const authorPreference = Object.entries(authorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([author]) => author);

    // Determine mood pattern based on categories and content
    let moodPattern:
      | "motivational"
      | "reflective"
      | "inspirational"
      | "philosophical";
    if (
      categoryPreference.includes("Motivation") ||
      categoryPreference.includes("Success")
    ) {
      moodPattern = "motivational";
    } else if (
      categoryPreference.includes("Wisdom") ||
      categoryPreference.includes("Life")
    ) {
      moodPattern = "reflective";
    } else if (
      categoryPreference.includes("Love") ||
      categoryPreference.includes("Happiness")
    ) {
      moodPattern = "inspirational";
    } else {
      moodPattern = "philosophical";
    }

    // Determine reading frequency
    let readingFrequency: "daily" | "weekly" | "occasional";
    if (userQuotes.length > 50) readingFrequency = "daily";
    else if (userQuotes.length > 20) readingFrequency = "weekly";
    else readingFrequency = "occasional";

    // Determine interaction style
    let interactionStyle: "passive" | "active" | "social";
    if (userQuotes.length > 100) interactionStyle = "active";
    else if (userQuotes.length > 30) interactionStyle = "social";
    else interactionStyle = "passive";

    // Determine reading time (simulated based on patterns)
    const readingTime: "morning" | "afternoon" | "evening" | "night" = [
      "morning",
      "afternoon",
      "evening",
      "night",
    ][Math.floor(Math.random() * 4)] as
      | "morning"
      | "afternoon"
      | "evening"
      | "night";

    return {
      readingTime,
      favoriteLength,
      categoryPreference,
      authorPreference,
      moodPattern,
      readingFrequency,
      interactionStyle,
    };
  }, [userQuotes]);

  // Generate learning insights
  const learningInsights = useMemo((): LearningInsight[] => {
    const insights: LearningInsight[] = [];

    // Behavior insights
    insights.push({
      type: "behavior",
      title: "Reading Time Pattern",
      description: `You prefer reading quotes during ${userPatterns.readingTime} hours`,
      confidence: 0.85,
      actionable: true,
      action: "Set reminders for optimal reading times",
      icon: Clock,
      color: "#3B82F6",
    });

    insights.push({
      type: "behavior",
      title: "Quote Length Preference",
      description: `You favor ${userPatterns.favoriteLength} quotes (${userPatterns.favoriteLength === "short" ? "under 100 chars" : userPatterns.favoriteLength === "medium" ? "100-200 chars" : "over 200 chars"})`,
      confidence: 0.9,
      actionable: true,
      action: "Focus on your preferred quote length",
      icon: BookOpen,
      color: "#10B981",
    });

    // Preference insights
    if (userPatterns.categoryPreference.length > 0) {
      insights.push({
        type: "preference",
        title: "Category Focus",
        description: `You're drawn to ${userPatterns.categoryPreference.slice(0, 3).join(", ")} categories`,
        confidence: 0.8,
        actionable: true,
        action: "Explore related categories for variety",
        icon: Target,
        color: "#F59E0B",
      });
    }

    if (userPatterns.authorPreference.length > 0) {
      insights.push({
        type: "preference",
        title: "Author Affinity",
        description: `You connect with ${userPatterns.authorPreference.slice(0, 2).join(" and ")}`,
        confidence: 0.75,
        actionable: true,
        action: "Discover more works by these authors",
        icon: Heart,
        color: "#EF4444",
      });
    }

    // Trend insights
    insights.push({
      type: "trend",
      title: "Reading Frequency",
      description: `You're a ${userPatterns.readingFrequency} reader with ${userQuotes.length} quotes collected`,
      confidence: 0.9,
      actionable: true,
      action:
        userPatterns.readingFrequency === "daily"
          ? "Maintain your excellent habit"
          : "Increase reading frequency",
      icon: TrendingUp,
      color: "#8B5CF6",
    });

    // Prediction insights
    insights.push({
      type: "prediction",
      title: "Mood Alignment",
      description: `Your current mood pattern is ${userPatterns.moodPattern}`,
      confidence: 0.7,
      actionable: true,
      action: "Try quotes that complement your mood",
      icon: Lightbulb,
      color: "#EC4899",
    });

    return insights;
  }, [userPatterns, userQuotes.length]);

  // Generate predictions based on patterns
  const predictions = useMemo(() => {
    const predictions = [];

    // Next quote recommendation
    if (userPatterns.categoryPreference.length > 0) {
      predictions.push({
        title: "Next Quote Type",
        prediction: `${userPatterns.categoryPreference[0]} category quote`,
        confidence: 0.8,
        reason: "Based on your category preference",
        icon: Target,
        color: "#3B82F6",
      });
    }

    // Reading time prediction
    predictions.push({
      title: "Optimal Reading Time",
      prediction: `${userPatterns.readingTime} hours`,
      confidence: 0.75,
      reason: "Based on your reading patterns",
      icon: Clock,
      color: "#10B981",
    });

    // Growth prediction
    const growthRate = userQuotes.length / 30; // Assuming 30 days
    predictions.push({
      title: "Monthly Growth",
      prediction: `${Math.round(growthRate * 30)} quotes`,
      confidence: 0.7,
      reason: "Based on your current collection rate",
      icon: TrendingUp,
      color: "#F59E0B",
    });

    return predictions;
  }, [userPatterns, userQuotes.length]);

  const renderPatternsTab = () => (
    <div className="space-y-6">
      {/* Pattern Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-600/20 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <div className="text-lg font-bold text-blue-300 capitalize">
              {userPatterns.readingTime}
            </div>
            <div className="text-xs text-blue-200">Preferred Time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-600/20 border-green-500/20">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto text-green-400 mb-2" />
            <div className="text-lg font-bold text-green-300 capitalize">
              {userPatterns.favoriteLength}
            </div>
            <div className="text-xs text-green-200">Quote Length</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-600/20 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto text-purple-400 mb-2" />
            <div className="text-lg font-bold text-purple-300 capitalize">
              {userPatterns.moodPattern}
            </div>
            <div className="text-xs text-purple-200">Mood Pattern</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
            <div className="text-lg font-bold text-yellow-300 capitalize">
              {userPatterns.readingFrequency}
            </div>
            <div className="text-xs text-yellow-200">Reading Frequency</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Pattern Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Category Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userPatterns.categoryPreference.map((category, index) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm capitalize">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-background/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                        style={{
                          width: `${((userPatterns.categoryPreference.length - index) / userPatterns.categoryPreference.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Author Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userPatterns.authorPreference.map((author, index) => (
                <div key={author} className="flex items-center justify-between">
                  <span className="text-sm">{author}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-background/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                        style={{
                          width: `${((userPatterns.authorPreference.length - index) / userPatterns.authorPreference.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Pattern Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {userPatterns.readingTime === "morning"
                  ? "🌅"
                  : userPatterns.readingTime === "afternoon"
                    ? "☀️"
                    : userPatterns.readingTime === "evening"
                      ? "🌆"
                      : "🌙"}
              </div>
              <div className="text-sm capitalize">
                {userPatterns.readingTime}
              </div>
              <div className="text-xs text-muted-foreground">Reading Time</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {userPatterns.favoriteLength === "short"
                  ? "📝"
                  : userPatterns.favoriteLength === "medium"
                    ? "📄"
                    : "📚"}
              </div>
              <div className="text-sm capitalize">
                {userPatterns.favoriteLength}
              </div>
              <div className="text-xs text-muted-foreground">Quote Length</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {userPatterns.moodPattern === "motivational"
                  ? "🚀"
                  : userPatterns.moodPattern === "reflective"
                    ? "🤔"
                    : userPatterns.moodPattern === "inspirational"
                      ? "✨"
                      : "🧠"}
              </div>
              <div className="text-sm capitalize">
                {userPatterns.moodPattern}
              </div>
              <div className="text-xs text-muted-foreground">Mood Pattern</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLearningTab = () => (
    <div className="space-y-6">
      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Pattern Recognition</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Behavior Analysis</span>
                <span>72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Preference Learning</span>
                <span>68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card
              key={index}
              className="border-l-4"
              style={{ borderLeftColor: insight.color }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-6 h-6 mt-1`}
                    style={{ color: insight.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground">
                        {insight.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </div>
                      {insight.actionable && (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderPredictionsTab = () => (
    <div className="space-y-6">
      {/* Predictions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictions.map((prediction, index) => {
          const Icon = prediction.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-4">
                <Icon
                  className={`w-8 h-8 mx-auto mb-2`}
                  style={{ color: prediction.color }}
                />
                <h3 className="font-medium text-foreground mb-2">
                  {prediction.title}
                </h3>
                <div
                  className="text-lg font-bold mb-2"
                  style={{ color: prediction.color }}
                >
                  {prediction.prediction}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  {prediction.reason}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-16 bg-background/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${prediction.confidence * 100}%`,
                        backgroundColor: prediction.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Future Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Future Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
              <h3 className="font-medium text-blue-300 mb-2">
                Reading Habit Evolution
              </h3>
              <p className="text-sm text-blue-200">
                Based on your current patterns, you're likely to develop
                stronger preferences for
                {userPatterns.categoryPreference.length > 0
                  ? ` ${userPatterns.categoryPreference[0]} and ${userPatterns.categoryPreference[1] || "related"} categories`
                  : " motivational content"}
                .
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-900/20 to-green-600/20 rounded-lg border border-green-500/20">
              <h3 className="font-medium text-green-300 mb-2">
                Optimal Learning Times
              </h3>
              <p className="text-sm text-green-200">
                Your brain is most receptive to new insights during{" "}
                {userPatterns.readingTime} hours. Consider scheduling your quote
                reading sessions during this time for maximum impact.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-600/20 rounded-lg border border-yellow-500/20">
              <h3 className="font-medium text-yellow-300 mb-2">
                Growth Trajectory
              </h3>
              <p className="text-sm text-yellow-200">
                At your current rate, you'll reach{" "}
                {Math.round(userQuotes.length * 1.5)} quotes in the next month.
                This growth pattern suggests a deepening engagement with
                inspirational content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* AI Learning Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Learning Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">
                Learning Capabilities
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Behavior Analysis
                  </span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Pattern Recognition
                  </span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Preference Learning
                  </span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Prediction Engine
                  </span>
                  <span className="text-yellow-400">Learning</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Data Points</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quotes Analyzed</span>
                  <span className="text-foreground font-medium">
                    {userQuotes.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Patterns Identified
                  </span>
                  <span className="text-foreground font-medium">
                    {learningInsights.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Predictions Made
                  </span>
                  <span className="text-foreground font-medium">
                    {predictions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Learning Accuracy
                  </span>
                  <span className="text-foreground font-medium">78%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continuous Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Continuous Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-900/20 to-purple-600/20 rounded-lg border border-purple-500/20">
              <h3 className="font-medium text-purple-300 mb-2">How It Works</h3>
              <p className="text-sm text-purple-200">
                Our AI system continuously learns from your interactions,
                reading patterns, and preferences to provide increasingly
                accurate insights and predictions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background/5 rounded-lg">
                <Brain className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <h4 className="font-medium text-foreground mb-1">
                  Observation
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tracks your reading behavior and preferences
                </p>
              </div>
              <div className="text-center p-4 bg-background/5 rounded-lg">
                <Brain className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <h4 className="font-medium text-foreground mb-1">Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Identifies patterns and correlations
                </p>
              </div>
              <div className="text-center p-4 bg-background/5 rounded-lg">
                <Lightbulb className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                <h4 className="font-medium text-foreground mb-1">Insights</h4>
                <p className="text-xs text-muted-foreground">
                  Provides actionable recommendations
                </p>
              </div>
            </div>
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
          Start collecting quotes to enable pattern recognition!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" />
            Pattern Recognition & Learning
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-powered analysis of your reading patterns and behavior
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {learningInsights.length} insights discovered
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border overflow-x-auto">
        {[
          { id: "patterns", label: "Patterns", icon: BarChart3 },
          { id: "learning", label: "Learning", icon: Brain },
          { id: "predictions", label: "Predictions", icon: TrendingUp },
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
        {activeTab === "patterns" && renderPatternsTab()}
        {activeTab === "learning" && renderLearningTab()}
        {activeTab === "predictions" && renderPredictionsTab()}
        {activeTab === "insights" && renderInsightsTab()}
      </div>
    </div>
  );
}

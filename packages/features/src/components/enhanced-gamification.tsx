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
  Trophy,
  Target,
  Star,
  Award,
  Crown,
  Gift,
  CheckCircle,
  Lock,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Quote, UserPreferences } from "@boostlly/core";

interface EnhancedGamificationProps {
  userQuotes: Quote[];
  userPreferences: UserPreferences;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: "reading" | "exploration" | "mastery";
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  requirements: string[];
  rewards: string[];
}

interface Goal {
  id: string;
  name: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  progress: number;
  deadline: Date;
  isCompleted: boolean;
  rewards: string[];
}

export function EnhancedGamification({
  userQuotes,
}: EnhancedGamificationProps) {
  const [activeTab, setActiveTab] = useState<
    "achievements" | "goals" | "leaderboard" | "rewards"
  >("achievements");

  // Generate achievements based on user data
  const achievements = useMemo((): Achievement[] => {
    if (userQuotes.length === 0) return [];

    const totalQuotes = userQuotes.length;
    const uniqueCategories = new Set(
      userQuotes.map((q) => q.category).filter(Boolean),
    );

    return [
      {
        id: "first-quote",
        name: "First Steps",
        description: "Save your first quote",
        icon: Star,
        category: "reading",
        rarity: "common",
        points: 10,
        isUnlocked: totalQuotes > 0,
        progress: Math.min(totalQuotes, 1),
        maxProgress: 1,
        requirements: ["Save 1 quote"],
        rewards: ["10 points", "Beginner badge"],
      },
      {
        id: "quote-collector",
        name: "Quote Collector",
        description: "Save 10 quotes",
        icon: Award,
        category: "reading",
        rarity: "common",
        points: 25,
        isUnlocked: totalQuotes >= 10,
        progress: Math.min(totalQuotes, 10),
        maxProgress: 10,
        requirements: ["Save 10 quotes"],
        rewards: ["25 points", "Collector badge"],
      },
      {
        id: "category-explorer",
        name: "Category Explorer",
        description: "Explore 3 different quote categories",
        icon: Target,
        category: "exploration",
        rarity: "rare",
        points: 50,
        isUnlocked: uniqueCategories.size >= 3,
        progress: Math.min(uniqueCategories.size, 3),
        maxProgress: 3,
        requirements: ["Explore 3 categories"],
        rewards: ["50 points", "Explorer badge"],
      },
      {
        id: "quote-master",
        name: "Quote Master",
        description: "Save 50 quotes",
        icon: Crown,
        category: "mastery",
        rarity: "epic",
        points: 150,
        isUnlocked: totalQuotes >= 50,
        progress: Math.min(totalQuotes, 50),
        maxProgress: 50,
        requirements: ["Save 50 quotes"],
        rewards: ["150 points", "Master badge"],
      },
    ];
  }, [userQuotes]);

  // Generate goals based on user data
  const goals = useMemo((): Goal[] => {
    if (userQuotes.length === 0) return [];

    const totalQuotes = userQuotes.length;
    const today = new Date();
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );
    const endOfWeek = new Date(
      today.getTime() + (7 - today.getDay()) * 24 * 60 * 60 * 1000,
    );
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    return [
      {
        id: "daily-quotes",
        name: "Daily Reading",
        description: "Read 3 quotes today",
        type: "daily",
        target: 3,
        current: Math.min(totalQuotes, 3),
        progress: Math.min((totalQuotes / 3) * 100, 100),
        deadline: endOfDay,
        isCompleted: totalQuotes >= 3,
        rewards: ["Daily bonus points", "Reading streak"],
      },
      {
        id: "weekly-exploration",
        name: "Weekly Exploration",
        description: "Explore 2 new categories this week",
        type: "weekly",
        target: 2,
        current: Math.min(
          new Set(userQuotes.map((q) => q.category).filter(Boolean)).size,
          2,
        ),
        progress: Math.min(
          (new Set(userQuotes.map((q) => q.category).filter(Boolean)).size /
            2) *
            100,
          100,
        ),
        deadline: endOfWeek,
        isCompleted:
          new Set(userQuotes.map((q) => q.category).filter(Boolean)).size >= 2,
        rewards: ["Weekly bonus", "Explorer points"],
      },
      {
        id: "monthly-mastery",
        name: "Monthly Mastery",
        description: "Save 20 quotes this month",
        type: "monthly",
        target: 20,
        current: Math.min(totalQuotes, 20),
        progress: Math.min((totalQuotes / 20) * 100, 100),
        deadline: endOfMonth,
        isCompleted: totalQuotes >= 20,
        rewards: ["Monthly achievement", "Master points"],
      },
    ];
  }, [userQuotes]);

  // Get rarity display
  const getRarityDisplay = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          color: "text-muted-foreground",
          bgColor: "bg-muted/20",
          borderColor: "border-border/20",
        };
      case "rare":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-900/20",
          borderColor: "border-blue-500/20",
        };
      case "epic":
        return {
          color: "text-purple-400",
          bgColor: "bg-purple-900/20",
          borderColor: "border-purple-500/20",
        };
      case "legendary":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-900/20",
          borderColor: "border-yellow-500/20",
        };
      default:
        return {
          color: "text-muted-foreground",
          bgColor: "bg-muted/20",
          borderColor: "border-border/20",
        };
    }
  };

  // Get goal type display
  const getGoalTypeDisplay = (type: string) => {
    switch (type) {
      case "daily":
        return {
          icon: Calendar,
          color: "text-green-400",
          bgColor: "bg-green-900/20",
        };
      case "weekly":
        return {
          icon: Clock,
          color: "text-blue-400",
          bgColor: "bg-blue-900/20",
        };
      case "monthly":
        return {
          icon: TrendingUp,
          color: "text-purple-400",
          bgColor: "bg-purple-900/20",
        };
      default:
        return {
          icon: Target,
          color: "text-muted-foreground",
          bgColor: "bg-muted/20",
        };
    }
  };

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const rarityInfo = getRarityDisplay(achievement.rarity);
          const AchievementIcon = achievement.icon;

          return (
            <Card
              key={achievement.id}
              className={`border-l-4 ${
                achievement.isUnlocked
                  ? rarityInfo.borderColor
                  : "border-border"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${rarityInfo.bgColor}`}>
                    <AchievementIcon
                      className={`w-6 h-6 ${rarityInfo.color}`}
                    />
                  </div>

                  <div className="text-right">
                    <Badge variant="outline" className="text-xs capitalize">
                      {achievement.rarity}
                    </Badge>
                    <div className="text-sm font-bold text-foreground mt-1">
                      {achievement.points} pts
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-foreground mb-2">
                  {achievement.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {achievement.description}
                </p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <Progress
                    value={
                      (achievement.progress / achievement.maxProgress) * 100
                    }
                    className="h-2"
                  />
                </div>

                {achievement.isUnlocked ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Unlocked
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">Rewards:</div>
                      {achievement.rewards.map((reward, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Gift className="w-3 h-3" />
                          {reward}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">Requirements:</div>
                      {achievement.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Lock className="w-3 h-3" />
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievement Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-300">
                {achievements.filter((a) => a.isUnlocked).length}
              </div>
              <div className="text-sm text-blue-200">Unlocked</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-green-600/20 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-300">
                {achievements
                  .filter((a) => a.isUnlocked)
                  .reduce((sum, a) => sum + a.points, 0)}
              </div>
              <div className="text-sm text-green-200">Total Points</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-300">
                {Math.round(
                  (achievements.filter((a) => a.isUnlocked).length /
                    achievements.length) *
                    100,
                )}
                %
              </div>
              <div className="text-sm text-purple-200">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const typeInfo = getGoalTypeDisplay(goal.type);
          const TypeIcon = typeInfo.icon;

          return (
            <Card
              key={goal.id}
              className={`border-l-4 ${
                goal.isCompleted
                  ? "border-green-500 bg-green-900/10"
                  : "border-blue-500/20"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                    <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                  </div>

                  <div className="text-right">
                    <Badge
                      variant={goal.isCompleted ? "default" : "outline"}
                      className="text-xs capitalize"
                    >
                      {goal.type}
                    </Badge>
                    {goal.isCompleted && (
                      <div className="text-xs text-green-400 mt-1">
                        Completed!
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-foreground mb-2">
                  {goal.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {goal.description}
                </p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Deadline</div>
                    <div className="text-foreground">
                      {goal.deadline.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium mb-1">Rewards:</div>
                    {goal.rewards.map((reward, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Gift className="w-3 h-3" />
                        {reward}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goals Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-green-600/20 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-300">
                {goals.filter((g) => g.isCompleted).length}
              </div>
              <div className="text-sm text-green-200">Completed</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-300">
                {goals.filter((g) => !g.isCompleted).length}
              </div>
              <div className="text-sm text-blue-200">Active</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-300">
                {Math.round(
                  (goals.filter((g) => g.isCompleted).length / goals.length) *
                    100,
                )}
                %
              </div>
              <div className="text-sm text-purple-200">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <p>Leaderboard coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg border border-blue-500/20">
              <h3 className="font-medium text-blue-300 mb-2">Theme Unlocks</h3>
              <div className="text-sm text-blue-200 space-y-1">
                <div>• Color Customization</div>
                <div>• Animated Backgrounds</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-600/20 rounded-lg border border-green-500/20">
              <h3 className="font-medium text-green-300 mb-2">
                Feature Access
              </h3>
              <div className="text-sm text-green-200 space-y-1">
                <div>• Advanced Analytics</div>
                <div>• Export Options</div>
                <div>• Priority Support</div>
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
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Start collecting quotes to unlock achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-400" />
            Enhanced Gamification & Achievements
          </h2>
          <p className="text-sm text-muted-foreground">
            Unlock achievements, complete goals, and climb the leaderboard
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:self-auto self-start">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {achievements.filter((a) => a.isUnlocked).length} achievements
            unlocked
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-background/5 backdrop-blur-sm rounded-lg p-1 border border-border overflow-x-auto">
        {[
          { id: "achievements", label: "Achievements", icon: Trophy },
          { id: "goals", label: "Goals", icon: Target },
          { id: "leaderboard", label: "Leaderboard", icon: Crown },
          { id: "rewards", label: "Rewards", icon: Gift },
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

      <div className="min-h-[500px]">
        {activeTab === "achievements" && renderAchievementsTab()}
        {activeTab === "goals" && renderGoalsTab()}
        {activeTab === "leaderboard" && renderLeaderboardTab()}
        {activeTab === "rewards" && renderRewardsTab()}
      </div>
    </div>
  );
}

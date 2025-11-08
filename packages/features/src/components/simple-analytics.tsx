import { useMemo } from "react";
import { Card, CardContent } from "@boostlly/ui";
import {
  BookOpen,
  Calendar,
  Heart,
  BarChart3,
} from "lucide-react";
import {
  useCurrentStreak,
  useSavedQuotes,
  useProfileStats,
} from "@boostlly/core";

interface SimpleAnalyticsProps {
  variant?: "web" | "popup";
}

/**
 * Simple Analytics component - shows only basic stats for a cleaner experience
 * Used when simpleMode is enabled to hide advanced analytics features
 */
export function SimpleAnalytics({ variant = "web" }: SimpleAnalyticsProps) {
  const currentStreak = useCurrentStreak();
  const savedQuotes = useSavedQuotes();
  const profileStats = useProfileStats();

  const stats = useMemo(() => {
    const totalQuotesRead = profileStats?.totalQuotesRead || 0;
    const totalSaved = savedQuotes?.length || 0;
    const streak = currentStreak || 0;
    
    // Calculate unique authors and categories from saved quotes
    const authors = new Set(
      savedQuotes?.map((q: any) => q.author).filter(Boolean) || []
    );
    const categories = new Set(
      savedQuotes?.map((q: any) => q.category).filter(Boolean) || []
    );

    return {
      totalQuotesRead,
      totalSaved,
      streak,
      totalAuthors: authors.size,
      totalCategories: categories.size,
    };
  }, [currentStreak, savedQuotes, profileStats]);

  return (
    <div className="space-y-4">
      {/* Simple Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-600/20 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-blue-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-blue-300">
              {stats.totalQuotesRead}
            </div>
            <div className="text-xs sm:text-sm text-blue-200">Quotes Read</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-600/20 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-green-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-green-300">
              {stats.streak}
            </div>
            <div className="text-xs sm:text-sm text-green-200">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-600/20 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-purple-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-purple-300">
              {stats.totalSaved}
            </div>
            <div className="text-xs sm:text-sm text-purple-200">Saved</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-yellow-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-yellow-300">
              {stats.totalAuthors}
            </div>
            <div className="text-xs sm:text-sm text-yellow-200">Authors</div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Info Message */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Simple mode active. Basic statistics shown for a cleaner experience.
            Enable advanced analytics in Settings to see detailed insights.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


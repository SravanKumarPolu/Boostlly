import { useState } from "react";
import { Button, Badge, DecorativeBackdrop } from "@boostlly/ui";
import {
  Heart,
  Share2,
  MessageCircle,
  Filter,
  Search,
  Grid,
  List,
  UserPlus,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  Clock,
  Eye,
  Bookmark,
  Send,
  Tag,
} from "lucide-react";

// Enhanced Header Component
export function EnhancedCommunityHeader({
  onRefresh,
  isRefreshing,
  viewMode,
  onViewModeChange,
  showFilters,
  onShowFiltersChange,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-border p-4 sm:p-6">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse" />
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Community Hub
            </h1>
            <p className="text-foreground/80 mt-1 text-sm sm:text-base">
              Discover, share, and connect with wisdom seekers
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                onViewModeChange(viewMode === "grid" ? "list" : "grid")
              }
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
            >
              {viewMode === "grid" ? (
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onShowFiltersChange(!showFilters)}
              className={`text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300 ${
                showFilters ? "bg-accent text-foreground" : ""
              }`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Search Bar Component
export function EnhancedSearchBar({
  searchQuery,
  onSearchChange,
  onSearch,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
        <input
          placeholder="Search quotes, users, or tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background/10 border border-border rounded-lg text-foreground placeholder-muted-foreground/40 focus:bg-background/15 focus:border-border transition-all duration-300 outline-none"
        />
      </div>
      <Button
        onClick={onSearch}
        variant="gradient"
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </div>
  );
}

// Enhanced Navigation Tabs Component
export function EnhancedNavigationTabs({
  activeTab,
  onTabChange,
  tabData,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabData: Array<{ id: string; label: string; icon: any; count: number }>;
}) {
  return (
    <div className="bg-background/5 backdrop-blur-xl rounded-2xl p-2 border border-border">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {tabData.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl whitespace-nowrap relative group flex-shrink-0 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-foreground border border-border"
                : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base">
              {tab.label}
            </span>
            {tab.count > 0 && (
              <Badge
                variant={activeTab === tab.id ? "default" : "glass"}
                className="text-xs hidden sm:inline-flex"
              >
                {tab.count}
              </Badge>
            )}
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Enhanced Quote Card Component
export function EnhancedQuoteCard({
  quote,
  onLike,
  onShare,
  onFollow,
  currentUserId,
  index,
}: {
  quote: any;
  onLike: () => void;
  onShare: () => void;
  onFollow: () => void;
  currentUserId?: string;
  index: number;
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div
      className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border hover:bg-accent hover:border-border transition-all duration-300 transform hover:scale-[1.02] group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Enhanced User Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-foreground font-semibold text-lg">
              {quote.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {quote.username || "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(quote.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUserId !== quote.userId && (
            <Button
              onClick={onFollow}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Quote Content */}
      <div className="mb-6">
        <p className="text-foreground italic text-lg mb-3 leading-relaxed">
          "{quote.text}"
        </p>
        <p className="text-foreground/80 text-base font-medium">
          — {quote.author}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="glass" className="text-xs">
            {quote.category || "General"}
          </Badge>
          {(quote.tags || []).slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Enhanced Engagement Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {quote.engagement?.views || 0}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
            {quote.engagement?.saves || 0}
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(quote.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onLike}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 transition-all duration-300 ${
              quote.isLiked
                ? "text-red-400 hover:text-red-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${quote.isLiked ? "fill-current" : ""}`}
            />
            <span className="text-sm font-medium">{quote.likes || 0}</span>
          </Button>
          <Button
            onClick={onShare}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 transition-all duration-300 ${
              quote.isShared
                ? "text-blue-400 hover:text-blue-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Share2
              className={`w-5 h-5 ${quote.isShared ? "fill-current" : ""}`}
            />
            <span className="text-sm font-medium">{quote.shares || 0}</span>
          </Button>
          <Button
            onClick={() => setShowComments(!showComments)}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 transition-all duration-300 ${
              showComments
                ? "text-blue-400 hover:text-blue-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{quote.comments || 0}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

// Enhanced Empty State Component
export function EnhancedEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: {
  icon: any;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-16 relative">
      <DecorativeBackdrop className="-z-10" density="low" />
      <div className="w-24 h-24 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-12 h-12 text-purple-400" />
      </div>
      <h4 className="text-xl font-semibold text-foreground mb-3">{title}</h4>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          variant="gradient"
          className="bg-gradient-to-r from-purple-500 to-blue-500"
          onClick={onAction}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {actionText}
        </Button>
      )}
    </div>
  );
}

// Enhanced Loading State Component
export function EnhancedLoadingState({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}

// Enhanced Stats Card Component
export function EnhancedStatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
}: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-400";
    if (trend === "down") return "text-red-400";
    return "text-muted-foreground";
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "→";
  };

  return (
    <div className="p-4 sm:p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border hover:bg-accent transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`text-xs sm:text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
            </span>
            <span className={`text-xs ${getTrendColor()}`}>{trendValue}</span>
          </div>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-foreground mb-1">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button, Badge, Alert } from "@boostlly/ui";
import {
  APIIntegrationManager,
  APIMetrics,
  logError,
  logDebug,
  logWarning,
} from "@boostlly/core";
import { getCategoryDisplay } from "@boostlly/core/utils/category-display";
import {
  Globe,
  Settings,
  Zap,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Gauge,
  Shield,
  X,
} from "lucide-react";

interface APIIntegrationProps {
  storage?: any;
}

export function APIIntegration({}: APIIntegrationProps) {
  const [apiManager] = useState(() => APIIntegrationManager.getInstance());
  const [apiHealth, setApiHealth] = useState<Record<string, boolean>>({});
  const [apiMetrics, setApiMetrics] = useState<Record<string, APIMetrics>>({});
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [testQuote, setTestQuote] = useState<any>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const categories = [
    "motivation",
    "success",
    "leadership",
    "happiness",
    "wisdom",
    "creativity",
    "advice",
    "inspiration",
    "productivity",
    "growth",
    "learning",
    "mindset",
    "positivity",
    "courage",
    "confidence",
    "peace",
    "simplicity",
    "calm",
    "discipline",
    "focus",
    "love",
    "kindness",
    "compassion",
    "purpose",
    "life",
    "resilience",
    "vision",
    "innovation",
    "gratitude",
    "mindfulness",
    "change",
    "adaptability",
    "faith",
    "hope",
  ];

  useEffect(() => {
    loadAPIMetrics();
    checkAPIHealth();
  }, []);

  const loadAPIMetrics = () => {
    const metrics = apiManager.getAPIMetrics();
    setApiMetrics(metrics);
  };

  const checkAPIHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await apiManager.getAPIHealth();
      setApiHealth(health);
    } catch (error) {
      logError("Failed to check API health:", { error: error });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const testRandomQuote = async () => {
    setIsLoadingQuote(true);
    try {
      const response = await apiManager.getRandomQuote(
        selectedCategory || undefined,
      );
      if (response.success && response.data) {
        setTestQuote(response.data);
      }
    } catch (error) {
      logError("Failed to get test quote:", { error: error });
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const clearCache = () => {
    apiManager.clearCache();
    loadAPIMetrics();
  };

  const getProviderIcon = (provider: string) => {
    const isHealthy = apiHealth[provider];
    return isHealthy ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    );
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 1000) return "text-green-400";
    if (time < 3000) return "text-yellow-400";
    return "text-red-400";
  };

  const formatResponseTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const getSuccessRate = (metrics: APIMetrics) => {
    if (metrics.totalRequests === 0) return 0;
    return Math.round(
      (metrics.successfulRequests / metrics.totalRequests) * 100,
    );
  };

  return (
    <div className="space-y-6">
      {/* API Integration Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-foreground/10 to-foreground/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 whitespace-nowrap">
              <span className="bg-gradient-to-r from-foreground to-blue-200 bg-clip-text text-transparent">
                API Integration
              </span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Discover and import quotes from external APIs
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="px-4 py-3 bg-background/10 backdrop-blur-sm rounded-full border border-border flex items-center gap-3 w-full lg:w-auto justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Globe className="w-4 h-4 text-blue-300" />
              <span className="text-foreground font-medium text-sm">
                Connected to 6 APIs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Health Overview */}
      <div className="p-4 sm:p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-semibold text-foreground">
              API Health Status
            </h3>
            <p className="text-sm text-muted-foreground">
              Monitor external quote providers
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Button
              onClick={checkAPIHealth}
              disabled={isCheckingHealth}
              variant="glass"
              size="sm"
              className="flex items-center gap-2 w-full lg:w-auto justify-center"
            >
              <RefreshCw
                className={`w-4 h-4 ${isCheckingHealth ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Object.entries(apiHealth).map(([provider, isHealthy]) => (
            <div
              key={provider}
              className={`p-3 sm:p-4 rounded-xl border text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isHealthy
                  ? "border-green-500/30 bg-gradient-to-br from-green-500/20 to-green-600/10 shadow-green-500/20"
                  : "border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-600/10 shadow-red-500/20"
              }`}
            >
              <div className="flex justify-center mb-2 sm:mb-3">
                {getProviderIcon(provider)}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground mb-1 capitalize">
                {provider}
              </p>
              <p
                className={`text-xs font-medium ${isHealthy ? "text-green-300" : "text-red-300"}`}
              >
                {isHealthy ? "🟢 Online" : "🔴 Offline"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* API Metrics */}
      <div className="p-4 sm:p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-semibold text-foreground">
              API Performance
            </h3>
            <p className="text-sm text-muted-foreground">
              Request statistics and response times
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(apiMetrics).map(([provider, metrics]) => (
            <div
              key={provider}
              className="p-4 sm:p-6 bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-xl border border-border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-semibold text-foreground capitalize text-lg">
                    {provider}
                  </span>
                </div>
                <Badge
                  variant="glass"
                  className="text-xs px-3 py-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400/30"
                >
                  {getSuccessRate(metrics)}% Success
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-sm">
                <div className="p-2 sm:p-3 bg-background/5 rounded-lg border border-border">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                    Total Requests
                  </p>
                  <p className="text-foreground font-bold text-base sm:text-lg">
                    {metrics.totalRequests}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-background/5 rounded-lg border border-border">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                    Success Rate
                  </p>
                  <p className="text-foreground font-bold text-base sm:text-lg">
                    {metrics.successfulRequests}/{metrics.totalRequests}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-background/5 rounded-lg border border-border">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                    Avg Response
                  </p>
                  <p
                    className={`font-bold text-base sm:text-lg ${getResponseTimeColor(metrics.averageResponseTime)}`}
                  >
                    {formatResponseTime(metrics.averageResponseTime)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-background/5 rounded-lg border border-border">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                    Last Used
                  </p>
                  <p className="text-foreground font-bold text-base sm:text-lg">
                    {metrics.lastUsed
                      ? new Date(metrics.lastUsed).toLocaleTimeString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Testing */}
      <div className="p-4 sm:p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 mb-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-foreground">
              API Testing
            </h3>
            <p className="text-sm text-muted-foreground">
              Test quote retrieval by category
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Mobile: Scrollable horizontal category list */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <Button
              onClick={() => setSelectedCategory("")}
              variant={selectedCategory === "" ? "gradient" : "outline"}
              size="sm"
              className={`flex-shrink-0 min-h-[44px] px-4 transition-all duration-300 active:scale-95 ${
                selectedCategory === ""
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30"
                  : "hover:bg-accent hover:border-border"
              }`}
            >
              🌟 All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "gradient" : "outline"}
                size="sm"
                className={`flex-shrink-0 min-h-[44px] px-4 transition-all duration-300 active:scale-95 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30"
                    : "hover:bg-accent hover:border-border"
                }`}
              >
                {getCategoryDisplay(category)}
              </Button>
            ))}
          </div>

          {/* Mobile: Stacked buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={testRandomQuote}
              disabled={isLoadingQuote}
              variant="glass"
              className="flex items-center justify-center gap-2 min-h-[48px] w-full"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingQuote ? "animate-spin" : ""}`}
              />
              Get Test Quote
            </Button>
            <Button
              onClick={clearCache}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 min-h-[44px] w-full"
            >
              <Database className="w-4 h-4" />
              Clear Cache
            </Button>
          </div>

          {testQuote && (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-xl border border-border backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-foreground italic text-lg leading-relaxed mb-3">
                      "{testQuote.text}"
                    </p>
                    <p className="text-foreground/90 text-base font-medium">
                      — {testQuote.author}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="glass"
                      className="text-xs px-3 py-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-400/30"
                    >
                      📚 {testQuote.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 border-border text-foreground/80"
                    >
                      🌐 {testQuote.source}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setTestQuote(null)}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all duration-300 hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="p-4 sm:p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 mb-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-foreground">
              Cache Management
            </h3>
            <p className="text-sm text-muted-foreground">
              Performance optimization and storage
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-400/30 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="p-2 sm:p-3 bg-blue-500/30 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-300" />
            </div>
            <p className="text-xs sm:text-sm text-blue-200/80 uppercase tracking-wider font-medium mb-1 sm:mb-2">
              Cache Size
            </p>
            <p className="text-base sm:text-lg lg:text-2xl font-bold text-foreground">
              {apiManager.getCacheStats().size} items
            </p>
          </div>

          <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-400/30 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
            <div className="p-2 sm:p-3 bg-green-500/30 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
              <Gauge className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-300" />
            </div>
            <p className="text-xs sm:text-sm text-green-200/80 uppercase tracking-wider font-medium mb-1 sm:mb-2">
              Hit Rate
            </p>
            <p className="text-base sm:text-lg lg:text-2xl font-bold text-foreground">
              {Math.round(apiManager.getCacheStats().hitRate * 100)}%
            </p>
          </div>

          <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-400/30 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="p-2 sm:p-3 bg-purple-500/30 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-300" />
            </div>
            <p className="text-xs sm:text-sm text-purple-200/80 uppercase tracking-wider font-medium mb-1 sm:mb-2">
              Rate Limiting
            </p>
            <p className="text-lg sm:text-lg lg:text-2xl font-bold text-foreground">
              Active
            </p>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-foreground/10 to-foreground/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 mb-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-foreground">
              API Configuration
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage provider settings and priorities
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <div className="p-2 bg-muted/20 rounded-lg">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Alert
          variant="info"
          className="border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/10 rounded-xl"
        >
          <div className="p-2 bg-blue-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-200 text-sm sm:text-base">
              API Management
            </h4>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 sm:mt-2 leading-relaxed">
              Configure rate limits, enable/disable providers, and manage API
              keys through the settings panel.
            </p>
          </div>
        </Alert>
      </div>
    </div>
  );
}

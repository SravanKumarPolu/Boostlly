import { useState, useEffect, useRef } from "react";
import { Button } from "@boostlly/ui";

import {
  Menu,
  X,
  Home,
  Search,
  Users,
  Settings,
  Heart,
  TrendingUp,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";

interface MobileResponsiveProps {
  children: React.ReactNode;
  onGesture?: (gesture: string) => void;
}

export function MobileResponsive({
  children,
  onGesture,
}: MobileResponsiveProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenInfo = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape",
      );
    };

    updateScreenInfo();
    window.addEventListener("resize", updateScreenInfo);
    window.addEventListener("orientationchange", updateScreenInfo);

    // Network status
    setIsOnline(navigator.onLine);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    return () => {
      window.removeEventListener("resize", updateScreenInfo);
      window.removeEventListener("orientationchange", updateScreenInfo);
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  const isMobile = screenSize.width < 768;

  return (
    <div className="mobile-responsive-container">
      {/* Offline Status Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 backdrop-blur-sm text-foreground text-center py-2 px-4 z-50">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You are offline</span>
          </div>
        </div>
      )}

      {/* Mobile Navigation Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 bg-background/10 backdrop-blur-xl border-b border-border z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold text-foreground">Boostlly</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-xs text-muted-foreground">
                {orientation === "portrait" ? "Portrait" : "Landscape"}
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Navigation Drawer */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-background/10 backdrop-blur-xl border-r border-border transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-4">
                <MobileNavItem icon={Home} label="Home" href="/" />
                <MobileNavItem icon={Search} label="Search" href="/search" />
                <MobileNavItem
                  icon={Users}
                  label="Community"
                  href="/community"
                />
                <MobileNavItem
                  icon={TrendingUp}
                  label="Trending"
                  href="/trending"
                />
                <MobileNavItem
                  icon={Settings}
                  label="Settings"
                  href="/settings"
                />
              </nav>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">Mobile Optimized</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">Touch Gestures</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Mobile Padding */}
      <main
        className={`transition-all duration-300 ${
          isMobile ? "pt-16 pb-20" : "pt-0 pb-0"
        }`}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/10 backdrop-blur-xl border-t border-border z-40">
          <div className="flex items-center justify-around py-2">
            <MobileBottomNavItem icon={Home} label="Home" active />
            <MobileBottomNavItem icon={Search} label="Search" />
            <MobileBottomNavItem icon={Users} label="Community" />
            <MobileBottomNavItem icon={Heart} label="Likes" />
            <MobileBottomNavItem icon={Settings} label="More" />
          </div>
        </nav>
      )}

      {/* Mobile Gesture Indicator */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 z-30">
          <Button
            variant="glass"
            size="icon"
            className="w-12 h-12 rounded-full shadow-lg"
            onClick={() => onGesture?.("tap")}
          >
            <Smartphone className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface MobileNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

function MobileNavItem({
  icon: Icon,
  label,
  href,
  active,
}: MobileNavItemProps) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-background/20 text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </a>
  );
}

interface MobileBottomNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

function MobileBottomNavItem({
  icon: Icon,
  label,
  active,
}: MobileBottomNavItemProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}

// Mobile-optimized Card Component
export function MobileCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={`bg-background/10 backdrop-blur-xl border border-border rounded-xl p-4 transition-all duration-200 ${
        isPressed ? "scale-95 bg-background/15" : "hover:bg-background/15"
      } ${className}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {children}
    </div>
  );
}

// Mobile-optimized Grid Layout
export function MobileGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
}: {
  children: React.ReactNode;
  columns?: { mobile: number; tablet: number; desktop: number };
  gap?: number;
}) {
  return (
    <div
      className={`grid gap-${gap} ${`grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`}`}
    >
      {children}
    </div>
  );
}

// Mobile-optimized List Layout
export function MobileList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

// Mobile-optimized Swipeable Component
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}) {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const _touch = e.touches[0];
    setStartX(_touch.clientX);
    setStartY(_touch.clientY);
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    setIsDragging(false);
  };

  return (
    <div
      className={`transition-transform duration-200 ${
        isDragging ? "scale-95" : "scale-100"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Mobile-optimized Pull-to-Refresh
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void;
  children: React.ReactNode;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (_e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;

    if (scrollTop === 0) {
      setPullDistance(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const _touch = e.touches[0];
    const scrollTop = containerRef.current?.scrollTop || 0;

    if (scrollTop === 0 && _touch.clientY > 0) {
      const distance = Math.min(_touch.clientY * 0.5, 100);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-center py-4 transition-transform duration-200 ${
          pullDistance > 0 ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ transform: `translateY(${Math.min(pullDistance - 50, 0)}px)` }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
              <span className="text-sm">Refreshing...</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span className="text-sm">Pull to refresh</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ transform: `translateY(${Math.max(0, pullDistance)}px)` }}>
        {children}
      </div>
    </div>
  );
}

// Mobile-optimized Infinite Scroll
export function InfiniteScroll({
  onLoadMore,
  hasMore,
  children,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          onLoadMore();
          setTimeout(() => setIsLoading(false), 1000);
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div>
      {children}
      {hasMore && (
        <div
          ref={observerRef}
          className="flex items-center justify-center py-8"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Missing import
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

"use client";

export default function MobileResponsivePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Mobile Responsiveness
          </h1>
          <p className="text-muted-foreground text-lg">
            Enhanced mobile experience with touch gestures, PWA features, and
            adaptive layouts
          </p>
        </div>

        <div className="space-y-8">
          {/* Mobile Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-background/10 backdrop-blur-sm rounded-xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Touch Gestures
              </h3>
              <p className="text-muted-foreground mb-4">
                Swipe, tap, and pinch gestures for intuitive mobile navigation
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Swipe to navigate</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Pull to refresh</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Pinch to zoom</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-background/10 backdrop-blur-sm rounded-xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                PWA Features
              </h3>
              <p className="text-muted-foreground mb-4">
                Progressive Web App capabilities for app-like experience
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Offline support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Install to home screen</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Push notifications</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-background/10 backdrop-blur-sm rounded-xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Adaptive Layout
              </h3>
              <p className="text-muted-foreground mb-4">
                Responsive design that adapts to different screen sizes
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Mobile-first design</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Tablet optimization</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Desktop enhancement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Demo Content */}
          <div className="p-6 bg-background/10 backdrop-blur-sm rounded-xl border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Mobile Demo
            </h3>
            <p className="text-muted-foreground mb-6">
              This content demonstrates mobile-responsive features. Try resizing
              your browser window or viewing on a mobile device.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-background/5 rounded-lg border border-border"
                >
                  <div className="w-full h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mb-3"></div>
                  <h4 className="text-foreground font-medium mb-2">
                    Demo Card {i + 1}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    This is a responsive card that adapts to different screen
                    sizes.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

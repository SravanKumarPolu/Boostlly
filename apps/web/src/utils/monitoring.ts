/**
 * Production Monitoring and Error Tracking
 * Integrates Sentry for error tracking and analytics
 */

// Initialize Sentry for error tracking
export async function initializeSentry() {
  if (typeof window === 'undefined') return;

  try {
    // Dynamic import to avoid bundling Sentry in development
    // Sentry is optional - only load if available
    if (process.env.NODE_ENV === 'production') {
      // Use dynamic import with type assertion to avoid TypeScript errors
      // when Sentry is not installed
      const sentryModule = await import('@sentry/browser' as any).catch(() => null);
      if (!sentryModule) {
        console.debug('[Monitoring] Sentry not available - skipping initialization');
        return;
      }

      const Sentry = sentryModule as any;
      const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
      
      if (dsn && Sentry && typeof Sentry.init === 'function') {
        // Check if integrations are available
        const BrowserTracing = Sentry.BrowserTracing || (class {});
        const Replay = Sentry.Replay || (class {});
        
        Sentry.init({
          dsn,
          environment: process.env.NODE_ENV,
          tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
          replaysSessionSampleRate: 0.1, // 10% of sessions for session replay
          replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
          integrations: [
            new BrowserTracing(),
            new Replay(),
          ],
          beforeSend(event: any, hint: any) {
            // Filter out known non-critical errors
            if (event.exception) {
              const error = hint.originalException;
              if (error instanceof Error) {
                // Don't report chunk loading errors (handled by ChunkErrorBoundary)
                if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
                  return null;
                }
                // Don't report network errors (handled gracefully)
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                  return null;
                }
              }
            }
            return event;
          },
        });

        console.log('[Monitoring] Sentry initialized');
      } else {
        console.warn('[Monitoring] Sentry DSN not configured or Sentry not available');
      }
    }
  } catch (error) {
    // Sentry is optional - fail silently if not available
    console.debug('[Monitoring] Sentry not available:', error);
  }
}

// Initialize analytics
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  try {
    // Web Vitals monitoring (optional)
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Track Core Web Vitals - optional dependency
      import('web-vitals' as any).then((webVitals: any) => {
        if (webVitals) {
          const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals;
          if (onCLS) onCLS(console.log);
          if (onFID) onFID(console.log);
          if (onFCP) onFCP(console.log);
          if (onLCP) onLCP(console.log);
          if (onTTFB) onTTFB(console.log);
          if (onINP) onINP(console.log);
        }
      }).catch(() => {
        // Web vitals not available, continue without it
        console.debug('[Monitoring] Web vitals not available');
      });
    }

    // Track page views
    if (typeof window !== 'undefined' && window.location) {
      const trackPageView = () => {
        // Send to analytics service if configured
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
            page_path: window.location.pathname,
          });
        }
      };

      // Track initial page view
      trackPageView();

      // Track navigation (for SPA)
      let lastPath = window.location.pathname;
      const observer = new MutationObserver(() => {
        if (window.location.pathname !== lastPath) {
          lastPath = window.location.pathname;
          trackPageView();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  } catch (error) {
    console.error('[Monitoring] Failed to initialize analytics:', error);
  }
}

// Report error to Sentry
export function reportError(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    if (process.env.NODE_ENV === 'production') {
      // Use dynamic import with type assertion - Sentry is optional
      import('@sentry/browser' as any).then((Sentry: any) => {
        if (Sentry && typeof Sentry.captureException === 'function') {
          Sentry.captureException(error, {
            contexts: {
              custom: context || {},
            },
          });
        } else {
          // Sentry not available, log to console
          console.error('[Error]', error, context);
        }
      }).catch(() => {
        // Sentry not available, log to console
        console.error('[Error]', error, context);
      });
    } else {
      // In development, just log to console
      console.error('[Error]', error, context);
    }
  } catch (err) {
    console.error('[Monitoring] Failed to report error:', err);
  }
}

// Track custom event
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    // Send to analytics service if configured
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }

    // Also send to Sentry as breadcrumb
    if (process.env.NODE_ENV === 'production') {
      // Use dynamic import with type assertion - Sentry is optional
      import('@sentry/browser' as any).then((Sentry: any) => {
        if (Sentry && typeof Sentry.addBreadcrumb === 'function') {
          Sentry.addBreadcrumb({
            category: 'user',
            message: eventName,
            level: 'info',
            data: properties,
          });
        }
      }).catch(() => {
        // Sentry not available, continue
      });
    }
  } catch (error) {
    console.error('[Monitoring] Failed to track event:', error);
  }
}

// Track performance metric
export function trackPerformanceMetric(name: string, value: number, unit: string = 'ms') {
  if (typeof window === 'undefined') return;

  try {
    // Send to analytics service if configured
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(value),
        event_category: 'Performance',
        event_label: unit,
      });
    }
  } catch (error) {
    console.error('[Monitoring] Failed to track performance metric:', error);
  }
}


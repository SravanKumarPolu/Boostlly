import * as React from "react";
import { cn } from "../lib/utils";

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

const LazyWrapper = React.forwardRef<HTMLDivElement, LazyWrapperProps>(
  (
    {
      children,
      fallback = (
        <div className="animate-pulse bg-muted/50 rounded-lg h-32 w-full" />
      ),
      className,
      threshold = 0.1,
      rootMargin = "50px",
      triggerOnce = true,
      delay = 0,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [hasTriggered, setHasTriggered] = React.useState(false);
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (delay > 0) {
                setTimeout(() => {
                  setIsVisible(true);
                  if (triggerOnce) setHasTriggered(true);
                }, delay);
              } else {
                setIsVisible(true);
                if (triggerOnce) setHasTriggered(true);
              }
            } else if (!triggerOnce) {
              setIsVisible(false);
            }
          });
        },
        {
          threshold,
          rootMargin,
        },
      );

      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }, [threshold, rootMargin, triggerOnce, delay]);

    const shouldShowContent = triggerOnce
      ? isVisible || hasTriggered
      : isVisible;

    return (
      <div
        ref={(node) => {
          (
            elementRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }
        }}
        className={cn("transition-all duration-300", className)}
        {...props}
      >
        {shouldShowContent ? children : fallback}
      </div>
    );
  },
);

LazyWrapper.displayName = "LazyWrapper";

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode,
  options?: Omit<LazyWrapperProps, "children" | "fallback">,
) {
  const LazyComponent = React.forwardRef<any, T>((props, ref) => (
    <LazyWrapper fallback={fallback} {...options}>
      <Component {...(props as T)} />
    </LazyWrapper>
  ));

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;

  return LazyComponent;
}

// Hook for lazy loading
export function useLazyLoading(options?: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasTriggered, setHasTriggered] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (options?.triggerOnce !== false) setHasTriggered(true);
          } else if (options?.triggerOnce === false) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || "50px",
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options?.threshold, options?.rootMargin, options?.triggerOnce]);

  const shouldShow =
    options?.triggerOnce !== false ? isVisible || hasTriggered : isVisible;

  return { ref, isVisible: shouldShow };
}

export { LazyWrapper };

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const animatedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-card border border-border text-foreground shadow-md hover:bg-accent/10 focus-visible:bg-accent/20 active:bg-accent/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive/10 border border-destructive/30 text-destructive-foreground hover:bg-destructive/20 focus-visible:bg-destructive/30 active:bg-destructive/40 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent/10 focus-visible:bg-accent/20 active:bg-accent/30 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-secondary border border-border text-secondary-foreground hover:bg-accent/10 focus-visible:bg-accent/20 active:bg-accent/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "text-foreground/80 hover:text-foreground hover:bg-accent/10 focus-visible:text-foreground focus-visible:bg-accent/20 active:bg-accent/30 hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary focus-visible:underline focus-visible:ring-2 focus-visible:ring-primary/20 hover:scale-[1.02] active:scale-[0.98]",
        glass:
          "bg-card/60 backdrop-blur-md border border-border text-foreground shadow-lg hover:bg-card/70 focus-visible:bg-card/80 active:bg-card/90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-purple-500 to-blue-500 text-primary-foreground border-0 shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:from-purple-600 hover:to-blue-600 focus-visible:shadow-xl focus-visible:shadow-purple-500/40 active:from-purple-700 active:to-blue-700 hover:scale-[1.02] active:scale-[0.98]",
        success:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-primary-foreground border-0 shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-600 hover:to-emerald-600 focus-visible:shadow-xl focus-visible:shadow-green-500/40 active:from-green-700 active:to-emerald-700 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 py-2",
        lg: "h-12 rounded-xl px-8 py-4 text-base",
        xl: "h-14 rounded-xl px-10 py-5 text-lg",
        icon: "h-11 w-11 rounded-xl",
      },
      animation: {
        none: "",
        pulse: "hover:animate-pulse",
        bounce: "hover:animate-bounce",
        spin: "hover:animate-spin",
        ping: "hover:animate-ping",
        wiggle: "hover:animate-wiggle",
        shimmer: "hover:animate-shimmer",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  },
);

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  loading?: boolean;
  success?: boolean;
  children?: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      ariaLabel,
      ariaDescribedBy,
      loading = false,
      success = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(
          animatedButtonVariants({ variant, size, animation, className }),
        )}
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 ease-out rounded-full" />
        </div>

        {/* Shimmer Effect */}
        {animation === "shimmer" && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Success Checkmark */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-4 h-4 animate-checkmark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <span
          className={cn(
            "relative z-10 transition-opacity duration-200",
            (loading || success) && "opacity-0",
          )}
        >
          {children}
        </span>
      </button>
    );
  },
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, animatedButtonVariants };

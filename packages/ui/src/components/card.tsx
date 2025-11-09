import * as React from "react";
import { cn } from "../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * If true, applies adaptive glassmorphism styling for cards over background images
   * Automatically adapts to daily theme colors
   */
  adaptive?: boolean;
  /**
   * If true, uses glassmorphism effect (backdrop blur)
   */
  glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, adaptive = false, glass = false, ...props }, ref) => {
    // If adaptive or glass is true, use glassmorphism styling
    const isAdaptive = adaptive || glass;
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border shadow-sm transition-all duration-200 ease-out hover:shadow-md group bg-card",
          // Adaptive cards use glassmorphism with theme-adaptive colors
          // Cards automatically adapt to daily background theme via --card and --card-foreground CSS variables
          isAdaptive
            ? "bg-card/85 backdrop-blur-xl backdrop-saturate-180 border-border/40 hover:bg-card/90 hover:border-border/60 shadow-lg hover:shadow-xl card-adaptive"
            : "hover:border-border/80",
          className,
        )}
        data-card="true"
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight text-card-foreground",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground leading-relaxed",
      className,
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 text-card-foreground", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-4 border-t border-border/50", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

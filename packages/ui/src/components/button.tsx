import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:text-primary-foreground focus-visible:bg-primary/90 focus-visible:shadow-md focus-visible:text-primary-foreground active:bg-primary/95 active:text-primary-foreground disabled:bg-primary/50 disabled:text-primary-foreground/70 disabled:opacity-100",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:text-destructive-foreground focus-visible:bg-destructive/90 focus-visible:shadow-md focus-visible:text-destructive-foreground active:bg-destructive/95 active:text-destructive-foreground disabled:bg-destructive/50 disabled:text-destructive-foreground/70 disabled:opacity-100",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-accent/5 hover:border-accent/50 hover:text-foreground focus-visible:bg-accent/10 focus-visible:border-ring focus-visible:text-foreground active:bg-accent/15 active:text-foreground active:border-accent/60 disabled:border-border/50 disabled:text-muted-foreground disabled:opacity-100",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:shadow-md hover:text-secondary-foreground focus-visible:bg-secondary/90 focus-visible:shadow-md focus-visible:text-secondary-foreground active:bg-secondary/95 active:text-secondary-foreground disabled:bg-secondary/50 disabled:text-secondary-foreground/70 disabled:opacity-100",
        ghost:
          "text-foreground hover:bg-accent/10 hover:text-foreground focus-visible:bg-accent/10 focus-visible:text-foreground active:bg-accent/15 active:text-foreground disabled:text-muted-foreground disabled:opacity-100",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/90 focus-visible:underline focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 active:text-primary disabled:text-muted-foreground disabled:opacity-100",
        glass:
          "bg-card/70 backdrop-blur-xl border border-border/50 text-foreground shadow-lg hover:bg-card/80 hover:shadow-xl hover:text-foreground focus-visible:bg-card/85 focus-visible:shadow-xl focus-visible:text-foreground active:bg-card/90 active:text-foreground active:shadow-lg disabled:bg-card/40 disabled:text-muted-foreground disabled:opacity-100",
        gradient:
          "bg-gradient-to-r from-primary via-primary/95 to-primary text-white border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:text-white focus-visible:shadow-xl focus-visible:shadow-primary/40 focus-visible:text-white active:shadow-md active:text-white active:from-primary/98 active:via-primary/98 active:to-primary/98 disabled:from-primary/45 disabled:via-primary/45 disabled:to-primary/45 disabled:text-white/90 disabled:shadow-none",
        success:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30 hover:text-white focus-visible:shadow-xl focus-visible:shadow-green-600/40 focus-visible:text-white active:shadow-md active:text-white active:from-green-700 active:to-emerald-700 disabled:from-green-600/40 disabled:to-emerald-600/40 disabled:text-white/80 disabled:opacity-100 disabled:shadow-none",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 rounded-lg px-4 py-2 text-xs",
        lg: "h-12 rounded-xl px-8 py-3 text-base",
        xl: "h-14 rounded-2xl px-10 py-4 text-lg",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      ariaLabel,
      ariaDescribedBy,
      style,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // For gradient buttons, ensure white text is always visible via inline style
    const isGradient = variant === "gradient";
    const gradientStyle = isGradient 
      ? {
          ...style,
          color: '#ffffff',
        }
      : style;

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        style={gradientStyle}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

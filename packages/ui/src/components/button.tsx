import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:scale-105 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-card border border-border text-foreground shadow-md hover:bg-accent/10 focus-visible:bg-accent/20 active:bg-accent/30",
        destructive:
          "bg-destructive/10 border border-destructive/30 text-destructive-foreground hover:bg-destructive/20 focus-visible:bg-destructive/30 active:bg-destructive/40",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent/10 focus-visible:bg-accent/20 active:bg-accent/30",
        secondary:
          "bg-secondary border border-border text-secondary-foreground hover:bg-accent/10 focus-visible:bg-accent/20 active:bg-accent/30",
        ghost:
          "text-foreground/80 hover:text-foreground hover:bg-accent/10 focus-visible:text-foreground focus-visible:bg-accent/20 active:bg-accent/30",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary focus-visible:underline focus-visible:ring-2 focus-visible:ring-primary/20",
        glass:
          "bg-card/60 backdrop-blur-md border border-border text-foreground shadow-lg hover:bg-card/70 focus-visible:bg-card/80 active:bg-card/90",
        gradient:
          "bg-gradient-to-r from-purple-500 to-blue-500 text-primary-foreground border-0 shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:from-purple-600 hover:to-blue-600 focus-visible:shadow-xl focus-visible:shadow-purple-500/40 active:from-purple-700 active:to-blue-700",
        success:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-primary-foreground border-0 shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-600 hover:to-emerald-600 focus-visible:shadow-xl focus-visible:shadow-green-500/40 active:from-green-700 active:to-emerald-700",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 py-2",
        lg: "h-12 rounded-xl px-8 py-4 text-base",
        xl: "h-14 rounded-xl px-10 py-5 text-lg",
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
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

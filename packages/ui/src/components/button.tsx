import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md focus-visible:bg-primary/90 focus-visible:shadow-md active:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md focus-visible:bg-destructive/90 focus-visible:shadow-md active:bg-destructive/95",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-accent/5 hover:border-accent/50 focus-visible:bg-accent/10 focus-visible:border-ring active:bg-accent/15",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:shadow-md focus-visible:bg-secondary/90 focus-visible:shadow-md active:bg-secondary/95",
        ghost:
          "text-foreground hover:bg-accent/10 hover:text-foreground focus-visible:bg-accent/10 focus-visible:text-foreground active:bg-accent/15",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/90 focus-visible:underline focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
        glass:
          "bg-card/70 backdrop-blur-xl border border-border/50 text-foreground shadow-lg hover:bg-card/80 hover:shadow-xl focus-visible:bg-card/85 focus-visible:shadow-xl active:bg-card/90",
        gradient:
          "bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 focus-visible:shadow-xl focus-visible:shadow-primary/40 active:opacity-95",
        success:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30 focus-visible:shadow-xl focus-visible:shadow-green-600/40 active:opacity-95",
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

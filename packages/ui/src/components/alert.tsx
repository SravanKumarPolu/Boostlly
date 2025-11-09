import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { AlertTriangle, Info, CheckCircle, XCircle, X } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default:
          "bg-background/10 backdrop-blur-sm border-border text-foreground",
        destructive:
          "border-destructive/50 bg-destructive/10 backdrop-blur-sm text-destructive [&>svg]:text-destructive",
        warning:
          "border-yellow-600/50 bg-yellow-600/10 backdrop-blur-sm text-yellow-900 dark:text-yellow-100 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        success:
          "border-green-600/50 bg-green-600/10 backdrop-blur-sm text-green-900 dark:text-green-100 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        info: "border-blue-600/50 bg-blue-600/10 backdrop-blur-sm text-blue-900 dark:text-blue-100 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const icons = {
  default: Info,
  destructive: XCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, onDismiss, children, ...props }, ref) => {
    const Icon = icons[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        <div className="flex-1">{children}</div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

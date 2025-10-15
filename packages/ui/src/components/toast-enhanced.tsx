import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur-md p-6 pr-8 shadow-lg transition-all duration-300 hover:shadow-xl animate-slide-in",
  {
    variants: {
      variant: {
        default: "bg-card/95 text-foreground",
        destructive:
          "border-destructive/50 text-destructive-foreground bg-destructive/10",
        success:
          "border-green-500/50 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950",
        warning:
          "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950",
        info: "border-blue-500/50 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        toastVariants({ variant }),
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className,
      )}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div className="grid gap-1">
    <h3
      ref={ref}
      className={cn(
        "text-sm font-semibold leading-none tracking-tight flex items-center gap-2",
        className,
      )}
      {...props}
    />
  </div>
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className,
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));
ToastClose.displayName = "ToastClose";

// Enhanced Toast with Icons and Animations
interface EnhancedToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
  children?: React.ReactNode;
}

const EnhancedToast = React.forwardRef<HTMLDivElement, EnhancedToastProps>(
  (
    {
      title,
      description,
      variant = "default",
      duration = 5000,
      onClose,
      children,
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isLeaving, setIsLeaving] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [duration]);

    const handleClose = () => {
      setIsLeaving(true);
      setTimeout(() => {
        onClose?.();
      }, 300);
    };

    const getIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case "destructive":
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case "info":
          return <Info className="h-5 w-5 text-blue-600" />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-start space-x-4 overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur-md p-6 pr-8 shadow-lg transition-all duration-300 hover:shadow-xl",
          isVisible && !isLeaving
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-95",
          isLeaving && "opacity-0 translate-x-full scale-95",
          variant === "destructive" &&
            "border-destructive/50 text-destructive-foreground bg-destructive/10",
          variant === "success" &&
            "border-green-500/50 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950",
          variant === "warning" &&
            "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950",
          variant === "info" &&
            "border-blue-500/50 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
        )}
      >
        {/* Progress Bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-current/20 w-full overflow-hidden">
            <div
              className="h-full bg-current/40 animate-progress"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}

        {/* Icon */}
        {getIcon() && <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>}

        {/* Content */}
        <div className="grid gap-1 flex-1">
          {title && (
            <h3 className="text-sm font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
          {children}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  },
);

EnhancedToast.displayName = "EnhancedToast";

export {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  EnhancedToast,
  toastVariants,
};

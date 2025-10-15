export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: "error" | "warning" | "info" | "debug";
  message: string;
  error?: Error;
  context?: LogContext;
  timestamp: Date;
  source?: string;
}

class Logger {
  private static instance: Logger;
  private handlers: ((entry: LogEntry) => void)[] = [];
  private isDevelopment: boolean;

  private constructor() {
    // Check if we're in development mode
    this.isDevelopment =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";

    // Add default console handler
    this.addHandler((entry) => {
      // Skip debug logs in production
      if (entry.level === "debug" && !this.isDevelopment) {
        return;
      }

      const timestamp = entry.timestamp.toISOString();
      const contextStr = entry.context
        ? ` ${JSON.stringify(entry.context)}`
        : "";
      const sourceStr = entry.source ? ` [${entry.source}]` : "";

      switch (entry.level) {
        case "error":
          console.error(
            `[${timestamp}]${sourceStr} ERROR: ${entry.message}${contextStr}`,
            entry.error || "",
          );
          break;
        case "warning":
          console.warn(
            `[${timestamp}]${sourceStr} WARNING: ${entry.message}${contextStr}`,
          );
          break;
        case "info":
          // Only log info in development or if explicitly enabled
          if (this.isDevelopment) {
            console.info(
              `[${timestamp}]${sourceStr} INFO: ${entry.message}${contextStr}`,
            );
          }
          break;
        case "debug":
          // Only log debug in development
          if (this.isDevelopment) {
            console.log(
              `[${timestamp}]${sourceStr} DEBUG: ${entry.message}${contextStr}`,
            );
          }
          break;
      }
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  addHandler(handler: (entry: LogEntry) => void): void {
    this.handlers.push(handler);
  }

  private log(
    level: LogEntry["level"],
    message: string,
    error?: Error,
    context?: LogContext,
    source?: string,
  ): void {
    const entry: LogEntry = {
      level,
      message,
      error,
      context,
      timestamp: new Date(),
      source,
    };

    this.handlers.forEach((handler) => {
      try {
        handler(entry);
      } catch (handlerError) {
        // Prevent infinite loops - only log to console if handler fails
        console.error("Logger handler failed:", handlerError);
      }
    });
  }

  logError(error: Error | string, context?: LogContext, source?: string): void {
    const message = typeof error === "string" ? error : error.message;
    const errorObj = typeof error === "string" ? undefined : error;
    this.log("error", message, errorObj, context, source);
  }

  logWarning(message: string, context?: LogContext, source?: string): void {
    this.log("warning", message, undefined, context, source);
  }

  logInfo(message: string, context?: LogContext, source?: string): void {
    this.log("info", message, undefined, context, source);
  }

  logDebug(message: string, context?: LogContext, source?: string): void {
    this.log("debug", message, undefined, context, source);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logError = (
  error: Error | string,
  context?: LogContext,
  source?: string,
) => {
  logger.logError(error, context, source);
};

export const logWarning = (
  message: string,
  context?: LogContext,
  source?: string,
) => {
  logger.logWarning(message, context, source);
};

export const logInfo = (
  message: string,
  context?: LogContext,
  source?: string,
) => {
  logger.logInfo(message, context, source);
};

export const logDebug = (
  message: string,
  context?: LogContext,
  source?: string,
) => {
  logger.logDebug(message, context, source);
};

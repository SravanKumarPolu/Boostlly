/**
 * Unified Error Handling System
 * 
 * Centralized error handling with consistent patterns, logging,
 * and user-friendly error messages across the application.
 */

import { logError, logWarning, logDebug } from './logger';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  CACHE = 'cache',
  STORAGE = 'storage',
  API = 'api',
  UNKNOWN = 'unknown',
}

/**
 * Enhanced error interface
 */
export interface AppError extends Error {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  timestamp: number;
  retryable: boolean;
  userMessage: string;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableReporting: boolean;
  enableUserNotifications: boolean;
}

/**
 * Centralized error handler class
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig;
  private errorHistory: AppError[] = [];
  private retryAttempts: Map<string, number> = new Map();

  private constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableReporting: true,
      enableUserNotifications: true,
      ...config,
    };
  }

  static getInstance(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Create a standardized application error
   */
  createError(
    message: string,
    code: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    retryable: boolean = false,
    userMessage?: string
  ): AppError {
    const error = new Error(message) as AppError;
    error.code = code;
    error.category = category;
    error.severity = severity;
    error.context = context;
    error.timestamp = Date.now();
    error.retryable = retryable;
    error.userMessage = userMessage || this.getUserFriendlyMessage(category, code);
    
    return error;
  }

  /**
   * Handle and process errors
   */
  async handleError(
    error: Error | AppError,
    context?: Record<string, any>,
    options: {
      retry?: boolean;
      report?: boolean;
      notify?: boolean;
    } = {}
  ): Promise<AppError> {
    const appError = this.normalizeError(error, context);
    const { retry = appError.retryable, report = true, notify = true } = options;

    // Log the error
    this.logError(appError);

    // Add to error history
    this.errorHistory.push(appError);

    // Report error if enabled
    if (report && this.config.enableReporting) {
      await this.reportError(appError);
    }

    // Show user notification if enabled
    if (notify && this.config.enableUserNotifications) {
      this.showUserNotification(appError);
    }

    // Handle retry logic
    if (retry && this.config.enableRetry) {
      return this.handleRetry(appError);
    }

    return appError;
  }

  /**
   * Normalize error to AppError format
   */
  private normalizeError(error: Error | AppError, context?: Record<string, any>): AppError {
    if ('code' in error && 'category' in error) {
      return error as AppError;
    }

    // Determine error category and severity based on error type
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error, category);
    const retryable = this.isRetryableError(error);

    return this.createError(
      error.message,
      this.generateErrorCode(error),
      category,
      severity,
      { ...context, originalError: error.name },
      retryable
    );
  }

  /**
   * Categorize error based on type and message
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorCategory.NETWORK;
    }
    if (name.includes('timeout') || message.includes('timeout')) {
      return ErrorCategory.TIMEOUT;
    }
    if (name.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return ErrorCategory.RATE_LIMIT;
    }
    if (message.includes('cache')) {
      return ErrorCategory.CACHE;
    }
    if (message.includes('storage') || message.includes('localStorage')) {
      return ErrorCategory.STORAGE;
    }
    if (message.includes('api')) {
      return ErrorCategory.API;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    if (category === ErrorCategory.AUTHENTICATION || category === ErrorCategory.AUTHORIZATION) {
      return ErrorSeverity.HIGH;
    }
    if (category === ErrorCategory.NETWORK && error.message.includes('timeout')) {
      return ErrorSeverity.MEDIUM;
    }
    if (category === ErrorCategory.RATE_LIMIT) {
      return ErrorSeverity.LOW;
    }
    if (error.message.includes('critical') || error.message.includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors are usually retryable
    if (name.includes('network') || message.includes('connection')) {
      return true;
    }
    // Timeout errors are retryable
    if (name.includes('timeout') || message.includes('timeout')) {
      return true;
    }
    // Rate limit errors are retryable
    if (message.includes('rate limit') || message.includes('429')) {
      return true;
    }
    // Server errors (5xx) are retryable
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return true;
    }

    return false;
  }

  /**
   * Generate error code
   */
  private generateErrorCode(error: Error): string {
    const name = error.name.replace(/\s+/g, '_').toUpperCase();
    const timestamp = Date.now().toString(36);
    return `${name}_${timestamp}`;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(category: ErrorCategory, code: string): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Unable to connect. Please check your internet connection.',
      [ErrorCategory.TIMEOUT]: 'Request timed out. Please try again.',
      [ErrorCategory.VALIDATION]: 'Invalid input. Please check your data and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
      [ErrorCategory.CACHE]: 'Cache error occurred. Data will be refreshed.',
      [ErrorCategory.STORAGE]: 'Storage error. Your data may not be saved.',
      [ErrorCategory.API]: 'Service temporarily unavailable. Please try again later.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };

    return messages[category] || messages[ErrorCategory.UNKNOWN];
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: AppError): void {
    const logContext = {
      code: error.code,
      category: error.category,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logError(error, logContext, 'ErrorHandler');
        break;
      case ErrorSeverity.HIGH:
        logError(error, logContext, 'ErrorHandler');
        break;
      case ErrorSeverity.MEDIUM:
        logWarning(error.message, logContext);
        break;
      case ErrorSeverity.LOW:
        logDebug(error.message, logContext);
        break;
    }
  }

  /**
   * Report error to external service
   */
  private async reportError(error: AppError): Promise<void> {
    try {
      // In a real application, this would send to an error reporting service
      // like Sentry, Bugsnag, or a custom error tracking system
      console.log('Error reported:', {
        code: error.code,
        category: error.category,
        severity: error.severity,
        message: error.message,
        context: error.context,
        timestamp: error.timestamp,
      });
    } catch (reportingError) {
      logError(
        reportingError instanceof Error ? reportingError : new Error(String(reportingError)),
        { originalError: error.code },
        'ErrorHandler'
      );
    }
  }

  /**
   * Show user notification
   */
  private showUserNotification(error: AppError): void {
    // In a real application, this would show a toast notification
    // or modal to the user
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      console.warn('User notification:', error.userMessage);
    }
  }

  /**
   * Handle retry logic
   */
  private async handleRetry(error: AppError): Promise<AppError> {
    const retryKey = `${error.code}_${error.timestamp}`;
    const attempts = this.retryAttempts.get(retryKey) || 0;

    if (attempts >= this.config.maxRetries) {
      this.retryAttempts.delete(retryKey);
      return error;
    }

    this.retryAttempts.set(retryKey, attempts + 1);

    // Wait before retry with exponential backoff
    const delay = this.config.retryDelay * Math.pow(2, attempts);
    await new Promise(resolve => setTimeout(resolve, delay));

    logDebug(`Retrying operation (attempt ${attempts + 1}/${this.config.maxRetries})`, {
      errorCode: error.code,
      delay,
    });

    return error;
  }

  /**
   * Get error history
   */
  getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.retryAttempts.clear();
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: AppError[];
  } {
    const errorsByCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const errorsBySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = 0;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    this.errorHistory.forEach(error => {
      errorsByCategory[error.category]++;
      errorsBySeverity[error.severity]++;
    });

    return {
      totalErrors: this.errorHistory.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errorHistory.slice(-10), // Last 10 errors
    };
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = ErrorHandler.getInstance();

/**
 * Utility functions for common error scenarios
 */
export const ErrorUtils = {
  /**
   * Create network error
   */
  createNetworkError(message: string, context?: Record<string, any>): AppError {
    return errorHandler.createError(
      message,
      'NETWORK_ERROR',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      context,
      true,
      'Unable to connect. Please check your internet connection.'
    );
  },

  /**
   * Create validation error
   */
  createValidationError(message: string, context?: Record<string, any>): AppError {
    return errorHandler.createError(
      message,
      'VALIDATION_ERROR',
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM,
      context,
      false,
      'Invalid input. Please check your data and try again.'
    );
  },

  /**
   * Create timeout error
   */
  createTimeoutError(message: string, context?: Record<string, any>): AppError {
    return errorHandler.createError(
      message,
      'TIMEOUT_ERROR',
      ErrorCategory.TIMEOUT,
      ErrorSeverity.MEDIUM,
      context,
      true,
      'Request timed out. Please try again.'
    );
  },

  /**
   * Create rate limit error
   */
  createRateLimitError(message: string, context?: Record<string, any>): AppError {
    return errorHandler.createError(
      message,
      'RATE_LIMIT_ERROR',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.LOW,
      context,
      true,
      'Too many requests. Please wait a moment and try again.'
    );
  },
};

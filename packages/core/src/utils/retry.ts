export interface RetryOptions {
  retries?: number;
  baseMs?: number;
  factor?: number;
  jitter?: boolean;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

const defaultOptions: Required<RetryOptions> = {
  retries: 3,
  baseMs: 1000,
  factor: 2,
  jitter: true,
  maxDelay: 30000,
  onRetry: () => {},
};

function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>,
): number {
  const delay = options.baseMs * Math.pow(options.factor, attempt);
  const maxDelay = Math.min(delay, options.maxDelay);

  if (options.jitter) {
    // Add jitter: random value between 0.5 and 1.5 of the calculated delay
    const jitterFactor = 0.5 + Math.random();
    return maxDelay * jitterFactor;
  }

  return maxDelay;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on the last attempt
      if (attempt === opts.retries) {
        break;
      }

      const delay = calculateDelay(attempt, opts);
      opts.onRetry(attempt + 1, lastError, delay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError!,
    attempts: opts.retries + 1,
  };
}

// Convenience function for simple retry without detailed result
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const result = await withRetry(fn, options);
  if (!result.success) {
    throw result.error;
  }
  return result.data!;
}

// Retry with exponential backoff for network requests
export async function retryFetch(
  url: string,
  options: RequestInit & RetryOptions = {},
): Promise<Response> {
  const {
    retries,
    baseMs,
    factor,
    jitter,
    maxDelay,
    onRetry,
    ...fetchOptions
  } = options;

  return retry(() => fetch(url, fetchOptions), {
    retries,
    baseMs,
    factor,
    jitter,
    maxDelay,
    onRetry,
  });
}

// Re-export logError for convenience
export { logError } from "./logger";

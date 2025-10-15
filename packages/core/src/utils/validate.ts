/**
 * Security utilities for input validation and sanitization
 */

/**
 * Clamp a number between min and max values
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sanitize a string with optional constraints
 */
export function safeString(
  value: unknown,
  options: { maxLen?: number; allow?: RegExp } = {},
): string {
  if (typeof value !== "string") {
    return "";
  }

  let result = value.trim();

  // Strip control characters (except newlines and tabs)
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Apply length limit
  if (options.maxLen && result.length > options.maxLen) {
    result = result.slice(0, options.maxLen);
  }

  // Apply regex whitelist if provided
  if (options.allow && !options.allow.test(result)) {
    result = result.replace(new RegExp(`[^${options.allow.source}]`, "g"), "");
  }

  return result;
}

/**
 * Strip HTML tags from a string using DOM text node approach
 */
export function stripTags(html: string): string {
  if (typeof html !== "string") {
    return "";
  }

  // Create a temporary div element
  const div = document.createElement("div");
  div.textContent = html;
  return div.textContent || div.innerText || "";
}

/**
 * Assert that a value is in a set of allowed values
 */
export function assertInSet<T extends string>(
  value: string,
  set: readonly T[],
): T {
  if (set.includes(value as T)) {
    return value as T;
  }
  throw new Error(`Invalid value: ${value}. Allowed values: ${set.join(", ")}`);
}

/**
 * Validate and sanitize search queries
 */
export function validateSearchQuery(query: unknown): string {
  return safeString(query, {
    maxLen: 200,
    allow: /[a-zA-Z0-9\s\-_.,!?'"()]/,
  });
}

/**
 * Validate and sanitize collection names
 */
export function validateCollectionName(name: unknown): string {
  return safeString(name, {
    maxLen: 50,
    allow: /[a-zA-Z0-9\s\-_]/,
  });
}

/**
 * Validate and sanitize quote text
 */
export function validateQuoteText(text: unknown): string {
  return safeString(text, {
    maxLen: 1000,
    allow: /[a-zA-Z0-9\s\-_.,!?'"()\[\]{}:;@#$%^&*+=<>\/\\|`~]/,
  });
}

/**
 * Validate and sanitize author names
 */
export function validateAuthorName(name: unknown): string {
  return safeString(name, {
    maxLen: 100,
    allow: /[a-zA-Z0-9\s\-_.]/,
  });
}

/**
 * Validate numeric settings with clamping
 */
export function validateNumericSetting(
  value: unknown,
  min: number,
  max: number,
  defaultValue: number,
): number {
  if (typeof value !== "number" || isNaN(value)) {
    return defaultValue;
  }
  return clampNumber(value, min, max);
}

/**
 * Validate boolean settings
 */
export function validateBooleanSetting(
  value: unknown,
  defaultValue: boolean,
): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return defaultValue;
}

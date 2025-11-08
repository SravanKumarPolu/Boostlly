# Utilities API Reference

Documentation for utility functions in `@boostlly/core`.

## Table of Contents

- [Date Utilities](#date-utilities)
- [Logger](#logger)
- [Image Generator](#image-generator)
- [Storage Utilities](#storage-utilities)
- [Export/Import](#exportimport)
- [Validation](#validation)
- [Cache Utilities](#cache-utilities)
- [API Configuration](#api-configuration)
- [Performance Utilities](#performance-utilities)

## Date Utilities

Utilities for date manipulation and date-based operations.

**Location:** `packages/core/src/utils/date-utils.ts`

### `getDateKey(date?: Date): string`

Gets a date key string for consistent date-based operations.

**Parameters:**
- `date` (optional): Date object (defaults to today)

**Returns:** Date key string in format "YYYY-MM-DD"

**Example:**
```typescript
import { getDateKey } from '@boostlly/core';

const today = getDateKey(); // "2024-01-15"
const specific = getDateKey(new Date(2024, 0, 20)); // "2024-01-20"
```

### `dateKeyToSeed(dateKey: string): number`

Converts a date key to a numeric seed for consistent randomization.

**Parameters:**
- `dateKey`: Date key string

**Returns:** Numeric seed

**Example:**
```typescript
import { dateKeyToSeed } from '@boostlly/core';

const seed = dateKeyToSeed("2024-01-15"); // 1234567890
```

### `formatDate(date: Date, format?: string): string`

Formats a date according to the specified format.

**Parameters:**
- `date`: Date object
- `format` (optional): Format string (default: "YYYY-MM-DD")

**Returns:** Formatted date string

## Logger

Logging utilities with different log levels.

**Location:** `packages/core/src/utils/logger.ts`

### `logError(message: string, context?: any): void`

Logs an error message with optional context.

**Parameters:**
- `message`: Error message
- `context` (optional): Additional context object

**Example:**
```typescript
import { logError } from '@boostlly/core';

try {
  await fetchQuote();
} catch (error) {
  logError("Failed to fetch quote", { 
    error, 
    quoteId: "123",
    provider: "quotable" 
  });
}
```

### `logWarning(message: string, context?: any): void`

Logs a warning message.

**Parameters:**
- `message`: Warning message
- `context` (optional): Additional context

**Example:**
```typescript
import { logWarning } from '@boostlly/core';

logWarning("API rate limit approaching", { 
  remaining: 10,
  resetTime: new Date() 
});
```

### `logDebug(message: string, context?: any): void`

Logs a debug message (only in development).

**Parameters:**
- `message`: Debug message
- `context` (optional): Additional context

**Example:**
```typescript
import { logDebug } from '@boostlly/core';

logDebug("Quote fetched successfully", { 
  quote, 
  provider: "quotable",
  responseTime: 150 
});
```

### `logInfo(message: string, context?: any): void`

Logs an info message.

**Parameters:**
- `message`: Info message
- `context` (optional): Additional context

## Image Generator

Utilities for generating and downloading quote images.

**Location:** `packages/core/src/utils/image-generator.ts`

### `generateQuoteImage(quote: Quote, options?: ImageOptions): Promise<string>`

Generates an image from a quote.

**Parameters:**
- `quote`: Quote object
- `options` (optional): Image generation options

**Returns:** Promise resolving to image data URL

**Example:**
```typescript
import { generateQuoteImage } from '@boostlly/core';

const imageUrl = await generateQuoteImage(quote, {
  width: 1200,
  height: 630,
  backgroundColor: "#ffffff",
  textColor: "#000000",
  fontFamily: "Arial",
  fontSize: 24
});
```

**ImageOptions:**
```typescript
interface ImageOptions {
  width?: number;          // Image width (default: 1200)
  height?: number;         // Image height (default: 630)
  backgroundColor?: string; // Background color (hex)
  textColor?: string;      // Text color (hex)
  fontFamily?: string;     // Font family
  fontSize?: number;       // Font size
  padding?: number;        // Padding
  borderRadius?: number;    // Border radius
}
```

### `downloadImage(imageUrl: string, filename?: string): Promise<void>`

Downloads an image to the user's device.

**Parameters:**
- `imageUrl`: Image data URL or URL
- `filename` (optional): Filename for download

**Example:**
```typescript
import { downloadImage } from '@boostlly/core';

await downloadImage(imageUrl, "quote-2024-01-15.png");
```

## Storage Utilities

Storage adapter utilities for cross-platform compatibility.

**Location:** `packages/core/src/utils/storage.ts`

### `createStorageAdapter(platform: 'web' | 'extension' | 'android'): StorageAdapter`

Creates a storage adapter for the specified platform.

**Parameters:**
- `platform`: Platform type

**Returns:** Storage adapter instance

**Example:**
```typescript
import { createStorageAdapter } from '@boostlly/core';

const adapter = createStorageAdapter('web');
await adapter.set('key', 'value');
const value = await adapter.get('key');
```

## Export/Import

Utilities for exporting and importing quotes and settings.

**Location:** `packages/core/src/utils/export-import.ts`

### `exportQuotes(quotes: Quote[]): string`

Exports quotes to JSON string.

**Parameters:**
- `quotes`: Array of quotes

**Returns:** JSON string

**Example:**
```typescript
import { exportQuotes } from '@boostlly/core';

const json = exportQuotes(quotes);
// Save to file or copy to clipboard
```

### `importQuotes(json: string): Quote[]`

Imports quotes from JSON string.

**Parameters:**
- `json`: JSON string

**Returns:** Array of quotes

**Example:**
```typescript
import { importQuotes } from '@boostlly/core';

const quotes = importQuotes(jsonString);
```

### `exportSettings(settings: Settings): string`

Exports settings to JSON string.

**Parameters:**
- `settings`: Settings object

**Returns:** JSON string

### `importSettings(json: string): Settings`

Imports settings from JSON string.

**Parameters:**
- `json`: JSON string

**Returns:** Settings object

### `exportAll(data: ExportData): string`

Exports all data (quotes, collections, settings).

**Parameters:**
- `data`: Export data object

**Returns:** JSON string

**Example:**
```typescript
import { exportAll } from '@boostlly/core';

const exportData = {
  quotes: allQuotes,
  collections: allCollections,
  settings: currentSettings
};

const json = exportAll(exportData);
```

## Validation

Validation utilities for data validation.

**Location:** `packages/core/src/utils/validate.ts` and `packages/core/src/utils/validation.ts`

### `validateQuote(quote: any): ValidationResult`

Validates a quote object.

**Parameters:**
- `quote`: Quote object to validate

**Returns:** Validation result

**Example:**
```typescript
import { validateQuote } from '@boostlly/core';

const result = validateQuote(quote);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

**ValidationResult:**
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

### `validateCollection(collection: any): ValidationResult`

Validates a collection object.

**Parameters:**
- `collection`: Collection object

**Returns:** Validation result

## Cache Utilities

Cache management utilities.

**Location:** `packages/core/src/utils/cache-utils.ts`

### `createCacheConfig(options?: CacheConfigOptions): CacheConfig`

Creates a cache configuration.

**Parameters:**
- `options` (optional): Cache configuration options

**Returns:** Cache configuration object

**Example:**
```typescript
import { createCacheConfig } from '@boostlly/core';

const cacheConfig = createCacheConfig({
  ttl: 86400000, // 24 hours
  maxSize: 1000
});
```

### `CACHE_KEYS`

Constants for cache keys.

```typescript
import { CACHE_KEYS } from '@boostlly/core';

const todayQuoteKey = CACHE_KEYS.TODAY_QUOTE;
const collectionsKey = CACHE_KEYS.COLLECTIONS;
```

## API Configuration

API configuration utilities.

**Location:** `packages/core/src/utils/api-config.ts`

### `getAPIConfig(providerName: string): APIProviderConfig | undefined`

Gets API configuration by provider name.

**Parameters:**
- `providerName`: Provider name

**Returns:** API configuration or undefined

**Example:**
```typescript
import { getAPIConfig } from '@boostlly/core';

const config = getAPIConfig('quotable');
if (config) {
  console.log('Base URL:', config.baseUrl);
}
```

### `getEnabledProviders(): APIProviderConfig[]`

Gets all enabled API providers.

**Returns:** Array of enabled provider configurations

### `getAPIEndpoint(provider: string, endpoint?: string): string`

Gets API endpoint URL.

**Parameters:**
- `provider`: Provider name
- `endpoint` (optional): Endpoint path

**Returns:** Full API endpoint URL

## Performance Utilities

Performance optimization utilities.

**Location:** `packages/core/src/utils/performance-optimizer.ts`

### `optimizeBundleSize(): void`

Optimizes bundle size by removing unused code.

### `optimizeImages(): void`

Optimizes images for web delivery.

### `enableLazyLoading(): void`

Enables lazy loading for components.

## Background Theme

Background and theme utilities.

**Location:** `packages/core/src/utils/background-theme.ts`

### `buildPicsumUrl(seed: number, width?: number, height?: number): string`

Builds a Picsum image URL.

**Parameters:**
- `seed`: Seed for consistent image
- `width` (optional): Image width
- `height` (optional): Image height

**Returns:** Picsum image URL

### `extractPalette(imageUrl: string): Promise<ColorPalette>`

Extracts color palette from an image.

**Parameters:**
- `imageUrl`: Image URL

**Returns:** Promise resolving to color palette

### `applyColorPalette(palette: ColorPalette): void`

Applies color palette to CSS variables.

**Parameters:**
- `palette`: Color palette object

## Sound Manager

Sound management utilities.

**Location:** `packages/core/src/utils/sound-manager.ts`

### `playSound(soundId: string, volume?: number): Promise<void>`

Plays a sound by ID.

**Parameters:**
- `soundId`: Sound identifier
- `volume` (optional): Volume level (0-1)

**Example:**
```typescript
import { playSound } from '@boostlly/core';

await playSound('notification', 0.5);
```

## Accessibility

Accessibility utilities.

**Location:** `packages/core/src/utils/accessibility.ts`

### `accessibleTTS(text: string, options?: TTSOptions): Promise<void>`

Text-to-speech with accessibility features.

**Parameters:**
- `text`: Text to speak
- `options` (optional): TTS options

### `announceToScreenReader(message: string): void`

Announces a message to screen readers.

**Parameters:**
- `message`: Message to announce

---

For more information, see:
- [Core API Overview](./core.md)
- [Services API](./services.md)
- [Hooks API](./hooks.md)


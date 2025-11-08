# Core Package API Reference

The `@boostlly/core` package provides the core business logic, services, and utilities for the Boostlly application.

## Table of Contents

- [Types](#types)
- [Services](#services)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Constants](#constants)

## Types

### Quote

Represents a motivational quote with metadata.

```typescript
interface Quote {
  id: string;                    // Stable unique identifier
  text: string;                  // Quote text
  author?: string;               // Author name
  categories?: string[];         // Category tags
  source?: string;               // Source (book, website, etc.)
  addedBy?: "bundle" | "user";  // Origin of quote
  category?: string;             // Legacy: single category
  tags?: string[];               // Legacy: tags array
  isLiked?: boolean;             // User liked status
  isUserAdded?: boolean;         // User-created quote
  createdAt?: Date;              // Creation timestamp
}
```

### QuoteCollection

Represents a collection of quotes with organization metadata.

```typescript
interface QuoteCollection {
  id: string;
  name: string;
  description?: string;
  quoteIds: string[];           // Array of quote IDs
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  color?: string;               // Hex color code
  icon?: string;                // Icon name
  category?: string;            // Category type
  priority?: "high" | "medium" | "low";
  tags?: string[];
  metadata?: {
    reminder?: {
      type: "daily" | "weekly" | "monthly";
      time: string;            // HH:MM format
      enabled: boolean;
      message?: string;
    };
    analytics?: {
      lastViewed?: Date;
      viewCount?: number;
      favoriteCount?: number;
    };
    archived?: boolean;
    archivedAt?: Date;
    [key: string]: any;
  };
}
```

### Settings

User application settings.

```typescript
interface Settings {
  themeMode: "auto" | "light" | "dark";
  fontScale: number;
  showAuthor: boolean;
  showCategories: boolean;
  showSource: boolean;
  enableBackgrounds: boolean;
  alarmTime: string | null;    // 'HH:mm' local time
  soundId: string;             // 'off' | preset | 'custom-*'
}
```

### Source

Quote provider source types.

```typescript
type Source =
  | "ZenQuotes"
  | "Quotable"
  | "FavQs"
  | "They Said So"
  | "QuoteGarden"
  | "Stoic Quotes"
  | "Programming Quotes"
  | "DummyJSON";
```

## Services

### QuoteService

Central service for managing quotes from multiple providers.

**Location:** `packages/core/src/services/quote-service.ts`

**Constructor:**
```typescript
constructor(
  storage?: StorageService,
  config?: Partial<QuoteServiceConfig>
)
```

**Key Methods:**

#### `getTodayQuote(): Promise<Quote>`

Gets today's quote based on date-based seeding.

```typescript
const quote = await quoteService.getTodayQuote();
```

#### `getRandomQuote(category?: string): Promise<Quote>`

Gets a random quote, optionally filtered by category.

```typescript
const quote = await quoteService.getRandomQuote("motivation");
```

#### `searchQuotes(query: string, filters?: SearchFilters): Promise<QuoteSearchResult>`

Searches quotes by text, author, or category.

```typescript
const results = await quoteService.searchQuotes("success", {
  categories: ["motivation"],
  limit: 10
});
```

#### `getBulkQuotes(options: BulkQuoteOptions): Promise<Quote[]>`

Fetches multiple quotes in bulk.

```typescript
const quotes = await quoteService.getBulkQuotes({
  count: 50,
  categories: ["motivation", "success"]
});
```

#### `getRecommendations(quoteId: string, limit?: number): Promise<QuoteRecommendation[]>`

Gets quote recommendations based on similarity.

```typescript
const recommendations = await quoteService.getRecommendations(quote.id, 5);
```

#### `getAnalytics(): QuoteAnalytics`

Returns quote analytics and statistics.

```typescript
const analytics = quoteService.getAnalytics();
console.log(analytics.totalQuotes, analytics.providerStats);
```

**Configuration:**

```typescript
interface QuoteServiceConfig {
  cacheEnabled: boolean;
  maxCacheAge: number;
  categories: string[];
  sourceWeights?: SourceWeights;
  retryAttempts?: number;
  timeout?: number;
}
```

### CollectionService

Service for managing quote collections.

**Location:** `packages/core/src/services/collection-service.ts`

**Constructor:**
```typescript
constructor(storage: StorageService)
```

**Key Methods:**

#### `getAllCollections(): Promise<QuoteCollection[]>`

Gets all collections.

```typescript
const collections = await collectionService.getAllCollections();
```

#### `getCollection(id: string): Promise<QuoteCollection | null>`

Gets a specific collection by ID.

```typescript
const collection = await collectionService.getCollection("favorites");
```

#### `createCollection(name: string, description?: string, visualProps?: {...}): Promise<QuoteCollection>`

Creates a new collection.

```typescript
const collection = await collectionService.createCollection(
  "My Collection",
  "Description",
  { color: "#FF5733", icon: "star" }
);
```

#### `addQuoteToCollection(collectionId: string, quoteId: string): Promise<void>`

Adds a quote to a collection.

```typescript
await collectionService.addQuoteToCollection("favorites", quote.id);
```

#### `removeQuoteFromCollection(collectionId: string, quoteId: string): Promise<void>`

Removes a quote from a collection.

```typescript
await collectionService.removeQuoteFromCollection("favorites", quote.id);
```

#### `deleteCollection(id: string): Promise<void>`

Deletes a collection.

```typescript
await collectionService.deleteCollection("collection-id");
```

### SearchService

Service for advanced quote search functionality.

**Location:** `packages/core/src/services/search-service.ts`

**Key Methods:**

#### `search(query: string, options?: SearchOptions): Promise<Quote[]>`

Performs fuzzy search on quotes.

```typescript
const results = await searchService.search("motivation", {
  threshold: 0.3,
  limit: 20
});
```

### ArticleService

Service for managing articles and content.

**Location:** `packages/core/src/services/article-service.ts`

### EmailService

Service for email functionality.

**Location:** `packages/core/src/services/email-service.ts`

### APIIntegrationManager

Manages integration with external quote APIs.

**Location:** `packages/core/src/services/api-integration.ts`

**Key Methods:**

#### `getQuote(provider: string, options?: any): Promise<APIResponse<Quote>>`

Fetches a quote from a specific provider.

```typescript
const response = await apiManager.getQuote("quotable", {
  category: "motivation"
});
```

#### `getMetrics(): APIMetrics`

Gets API usage metrics.

```typescript
const metrics = apiManager.getMetrics();
```

## Hooks

### useAutoTheme

Hook for automatic theming based on daily background images.

**Location:** `packages/core/src/hooks/useAutoTheme.ts`

```typescript
const {
  imageUrl,        // Current background image URL
  palette,         // Extracted color palette
  isLoading,       // Loading state
  isAnalyzing,     // Color analysis state
  error,           // Error message
  loadTodayImage,  // Load today's image
  loadImageForDate, // Load image for specific date
  loadImage        // Load custom image
} = useAutoTheme();
```

**Example:**
```typescript
function MyComponent() {
  const { imageUrl, isLoading, palette } = useAutoTheme();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div style={{ backgroundImage: `url(${imageUrl})` }}>
      {/* Content */}
    </div>
  );
}
```

### useSoundSettings

Hook for managing sound settings.

**Location:** `packages/core/src/hooks/useSoundSettings.ts`

```typescript
const {
  soundEnabled,
  volume,
  setSoundEnabled,
  setVolume,
  playSound
} = useSoundSettings();
```

## Utilities

### Date Utilities

**Location:** `packages/core/src/utils/date-utils.ts`

#### `getDateKey(date?: Date): string`

Gets a date key string for consistent date-based operations.

```typescript
const key = getDateKey(); // "2024-01-15"
```

#### `dateKeyToSeed(dateKey: string): number`

Converts a date key to a numeric seed.

```typescript
const seed = dateKeyToSeed("2024-01-15");
```

### Logger

**Location:** `packages/core/src/utils/logger.ts`

#### `logError(message: string, context?: any): void`

Logs an error message.

```typescript
logError("Failed to fetch quote", { error, quoteId });
```

#### `logWarning(message: string, context?: any): void`

Logs a warning message.

```typescript
logWarning("API rate limit approaching", { remaining: 10 });
```

#### `logDebug(message: string, context?: any): void`

Logs a debug message.

```typescript
logDebug("Quote fetched successfully", { quote, provider });
```

### Image Generator

**Location:** `packages/core/src/utils/image-generator.ts`

#### `generateQuoteImage(quote: Quote, options?: ImageOptions): Promise<string>`

Generates an image from a quote.

```typescript
const imageUrl = await generateQuoteImage(quote, {
  width: 1200,
  height: 630,
  backgroundColor: "#ffffff"
});
```

#### `downloadImage(imageUrl: string, filename?: string): Promise<void>`

Downloads an image.

```typescript
await downloadImage(imageUrl, "quote.png");
```

### Storage Utilities

**Location:** `packages/core/src/utils/storage.ts`

Storage adapter utilities for cross-platform compatibility.

### Export/Import

**Location:** `packages/core/src/utils/export-import.ts`

#### `exportQuotes(quotes: Quote[]): string`

Exports quotes to JSON string.

```typescript
const json = exportQuotes(quotes);
```

#### `importQuotes(json: string): Quote[]`

Imports quotes from JSON string.

```typescript
const quotes = importQuotes(jsonString);
```

## Constants

**Location:** `packages/core/src/constants/index.ts`

### TIME_CONSTANTS

Time-related constants.

```typescript
const TIME_CONSTANTS = {
  API_TIMEOUT: 10000,
  CACHE_24_HOURS: 86400000,
  RATE_LIMIT_PER_MINUTE: 60,
  RATE_LIMIT_PER_HOUR: 1000
};
```

### API_CONFIG

API endpoint configurations.

```typescript
const API_CONFIG = {
  QUOTABLE_BASE_URL: 'https://api.quotable.io',
  ZENQUOTES_BASE_URL: 'https://zenquotes.io/api',
  // ... more endpoints
};
```

### QUOTE_CATEGORIES

Available quote categories.

```typescript
const QUOTE_CATEGORIES = [
  "motivation",
  "success",
  "inspiration",
  // ... more categories
];
```

## Error Handling

All services extend `BaseService` which provides consistent error handling:

```typescript
try {
  const quote = await quoteService.getTodayQuote();
} catch (error) {
  // Error is automatically logged
  // Use errorHandler for custom handling
  errorHandler.handle(error, {
    context: "fetching today's quote",
    retry: true
  });
}
```

## Type Exports

All types are exported from the main package:

```typescript
import {
  Quote,
  QuoteCollection,
  Settings,
  Source,
  QuoteServiceConfig,
  SearchFilters,
  // ... more types
} from '@boostlly/core';
```

---

For more detailed documentation, see:
- [Services API](./services.md)
- [Hooks API](./hooks.md)
- [Utilities API](./utilities.md)


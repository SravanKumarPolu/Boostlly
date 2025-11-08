# Services API Reference

Detailed documentation for all service classes in `@boostlly/core`.

## QuoteService

Central service for managing quotes from multiple providers with intelligent fallback, caching, and analytics.

### Constructor

```typescript
new QuoteService(
  storage?: StorageService,
  config?: Partial<QuoteServiceConfig>
)
```

**Parameters:**
- `storage` (optional): Storage service instance for persistence
- `config` (optional): Service configuration overrides

**Example:**
```typescript
import { QuoteService } from '@boostlly/core';
import { StorageService } from '@boostlly/platform-web';

const storage = new StorageService();
const quoteService = new QuoteService(storage, {
  cacheEnabled: true,
  maxCacheAge: 86400000, // 24 hours
  categories: ["motivation", "success"]
});
```

### Methods

#### `getTodayQuote(): Promise<Quote>`

Gets today's quote using date-based seeding for consistency.

**Returns:** Promise resolving to today's quote

**Example:**
```typescript
const quote = await quoteService.getTodayQuote();
console.log(`${quote.text} - ${quote.author}`);
```

**Behavior:**
- Uses date-based seeding for consistent daily quotes
- Falls back through provider chain if primary fails
- Caches result for 24 hours
- Returns bundled quote if all APIs fail

#### `getRandomQuote(category?: string): Promise<Quote>`

Gets a random quote, optionally filtered by category.

**Parameters:**
- `category` (optional): Filter by category name

**Returns:** Promise resolving to a random quote

**Example:**
```typescript
const quote = await quoteService.getRandomQuote("motivation");
```

#### `searchQuotes(query: string, filters?: SearchFilters): Promise<QuoteSearchResult>`

Searches quotes by text, author, or category.

**Parameters:**
- `query`: Search query string
- `filters` (optional): Additional search filters

**Returns:** Promise resolving to search results

**Example:**
```typescript
const results = await quoteService.searchQuotes("success", {
  categories: ["motivation"],
  limit: 10,
  minLength: 50
});
```

**SearchFilters:**
```typescript
interface SearchFilters {
  categories?: string[];
  authors?: string[];
  sources?: Source[];
  limit?: number;
  minLength?: number;
  maxLength?: number;
}
```

#### `getBulkQuotes(options: BulkQuoteOptions): Promise<Quote[]>`

Fetches multiple quotes in bulk.

**Parameters:**
- `options`: Bulk fetch configuration

**Returns:** Promise resolving to array of quotes

**Example:**
```typescript
const quotes = await quoteService.getBulkQuotes({
  count: 50,
  categories: ["motivation", "success"],
  sources: ["Quotable", "ZenQuotes"]
});
```

**BulkQuoteOptions:**
```typescript
interface BulkQuoteOptions {
  count: number;
  categories?: string[];
  sources?: Source[];
  excludeIds?: string[];
}
```

#### `getRecommendations(quoteId: string, limit?: number): Promise<QuoteRecommendation[]>`

Gets quote recommendations based on similarity.

**Parameters:**
- `quoteId`: ID of the quote to get recommendations for
- `limit` (optional): Maximum number of recommendations (default: 5)

**Returns:** Promise resolving to array of recommendations

**Example:**
```typescript
const recommendations = await quoteService.getRecommendations(quote.id, 10);
```

#### `getAnalytics(): QuoteAnalytics`

Returns quote analytics and statistics.

**Returns:** Analytics object with statistics

**Example:**
```typescript
const analytics = quoteService.getAnalytics();
console.log(`Total quotes: ${analytics.totalQuotes}`);
console.log(`Provider stats:`, analytics.providerStats);
```

**QuoteAnalytics:**
```typescript
interface QuoteAnalytics {
  totalQuotes: number;
  providerStats: Record<Source, {
    count: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  categoryDistribution: Record<string, number>;
  dailyStats: {
    date: string;
    quotesFetched: number;
    errors: number;
  }[];
}
```

#### `getHealthStatus(): Map<Source, APIHealthStatus>`

Gets health status for all quote providers.

**Returns:** Map of source to health status

**Example:**
```typescript
const health = quoteService.getHealthStatus();
health.forEach((status, source) => {
  console.log(`${source}: ${status.status}`);
});
```

### Configuration

```typescript
interface QuoteServiceConfig {
  cacheEnabled: boolean;        // Enable caching
  maxCacheAge: number;          // Cache TTL in milliseconds
  categories: string[];         // Preferred categories
  sourceWeights?: SourceWeights; // Provider priority weights
  retryAttempts?: number;       // Retry attempts (default: 3)
  timeout?: number;             // Request timeout (default: 10000ms)
}
```

## CollectionService

Service for managing quote collections with organization and metadata.

### Constructor

```typescript
new CollectionService(storage: StorageService)
```

**Parameters:**
- `storage`: Storage service instance (required)

**Example:**
```typescript
import { CollectionService } from '@boostlly/core';

const collectionService = new CollectionService(storage);
```

### Methods

#### `getAllCollections(): Promise<QuoteCollection[]>`

Gets all collections.

**Returns:** Promise resolving to array of collections

**Example:**
```typescript
const collections = await collectionService.getAllCollections();
collections.forEach(collection => {
  console.log(collection.name, collection.quoteIds.length);
});
```

#### `getCollection(id: string): Promise<QuoteCollection | null>`

Gets a specific collection by ID.

**Parameters:**
- `id`: Collection ID

**Returns:** Promise resolving to collection or null

**Example:**
```typescript
const favorites = await collectionService.getCollection("favorites");
if (favorites) {
  console.log(`Favorites has ${favorites.quoteIds.length} quotes`);
}
```

#### `createCollection(name: string, description?: string, visualProps?: VisualProps): Promise<QuoteCollection>`

Creates a new collection.

**Parameters:**
- `name`: Collection name (required)
- `description`: Optional description
- `visualProps`: Optional visual properties

**Returns:** Promise resolving to created collection

**Example:**
```typescript
const collection = await collectionService.createCollection(
  "Work Motivation",
  "Quotes for professional inspiration",
  {
    color: "#3B82F6",
    icon: "briefcase",
    category: "Work"
  }
);
```

**VisualProps:**
```typescript
interface VisualProps {
  color?: string;    // Hex color code
  icon?: string;     // Icon name
  category?: string; // Category type
}
```

#### `updateCollection(id: string, updates: Partial<QuoteCollection>): Promise<QuoteCollection>`

Updates an existing collection.

**Parameters:**
- `id`: Collection ID
- `updates`: Partial collection object with updates

**Returns:** Promise resolving to updated collection

**Example:**
```typescript
const updated = await collectionService.updateCollection("favorites", {
  name: "My Favorites",
  color: "#FF5733"
});
```

#### `deleteCollection(id: string): Promise<void>`

Deletes a collection. Cannot delete default collections.

**Parameters:**
- `id`: Collection ID

**Returns:** Promise that resolves when deletion is complete

**Example:**
```typescript
await collectionService.deleteCollection("custom-collection-id");
```

#### `addQuoteToCollection(collectionId: string, quoteId: string): Promise<void>`

Adds a quote to a collection.

**Parameters:**
- `collectionId`: Collection ID
- `quoteId`: Quote ID to add

**Returns:** Promise that resolves when quote is added

**Example:**
```typescript
await collectionService.addQuoteToCollection("favorites", quote.id);
```

#### `removeQuoteFromCollection(collectionId: string, quoteId: string): Promise<void>`

Removes a quote from a collection.

**Parameters:**
- `collectionId`: Collection ID
- `quoteId`: Quote ID to remove

**Returns:** Promise that resolves when quote is removed

**Example:**
```typescript
await collectionService.removeQuoteFromCollection("favorites", quote.id);
```

#### `getQuotesInCollection(collectionId: string): Promise<Quote[]>`

Gets all quotes in a collection.

**Parameters:**
- `collectionId`: Collection ID

**Returns:** Promise resolving to array of quotes

**Example:**
```typescript
const quotes = await collectionService.getQuotesInCollection("favorites");
```

## SearchService

Service for advanced quote search with fuzzy matching and filtering.

### Constructor

```typescript
new SearchService(quotes: Quote[])
```

**Parameters:**
- `quotes`: Array of quotes to search

**Example:**
```typescript
import { SearchService } from '@boostlly/core';

const searchService = new SearchService(allQuotes);
```

### Methods

#### `search(query: string, options?: SearchOptions): Promise<Quote[]>`

Performs fuzzy search on quotes.

**Parameters:**
- `query`: Search query string
- `options`: Search configuration options

**Returns:** Promise resolving to array of matching quotes

**Example:**
```typescript
const results = await searchService.search("motivation", {
  threshold: 0.3,
  limit: 20,
  keys: ["text", "author"]
});
```

**SearchOptions:**
```typescript
interface SearchOptions {
  threshold?: number;      // Match threshold (0-1, default: 0.3)
  limit?: number;          // Maximum results (default: 20)
  keys?: string[];         // Fields to search (default: ["text", "author"])
  includeScore?: boolean; // Include match scores
}
```

## ArticleService

Service for managing articles and content.

### Constructor

```typescript
new ArticleService(storage: StorageService)
```

### Methods

#### `getArticles(filters?: ArticleFilters): Promise<Article[]>`

Gets articles with optional filtering.

#### `getArticle(id: string): Promise<Article | null>`

Gets a specific article by ID.

## EmailService

Service for email functionality.

### Constructor

```typescript
new EmailService(config: EmailConfig)
```

### Methods

#### `sendEmail(to: string, subject: string, body: string): Promise<void>`

Sends an email.

#### `subscribe(email: string, preferences: EmailPreferences): Promise<void>`

Subscribes an email to newsletters.

## APIIntegrationManager

Manages integration with external quote APIs with rate limiting and health monitoring.

### Constructor

```typescript
new APIIntegrationManager(config?: APIIntegrationConfig)
```

### Methods

#### `getQuote(provider: string, options?: any): Promise<APIResponse<Quote>>`

Fetches a quote from a specific provider.

**Parameters:**
- `provider`: Provider name
- `options`: Provider-specific options

**Returns:** Promise resolving to API response

**Example:**
```typescript
const response = await apiManager.getQuote("quotable", {
  category: "motivation"
});

if (response.success) {
  console.log(response.data);
}
```

#### `getMetrics(): APIMetrics`

Gets API usage metrics and statistics.

**Returns:** Metrics object

**Example:**
```typescript
const metrics = apiManager.getMetrics();
console.log(`Total requests: ${metrics.totalRequests}`);
console.log(`Success rate: ${metrics.successRate}%`);
```

**APIMetrics:**
```typescript
interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTime: number;
  providerMetrics: Record<string, ProviderMetrics>;
}
```

#### `getHealthStatus(): Record<string, APIHealthStatus>`

Gets health status for all configured providers.

**Returns:** Map of provider names to health status

## BaseService

Base class that all services extend. Provides common functionality.

### Protected Methods

#### `handleError(error: Error, context?: string): ServiceResponse<T>`

Handles errors consistently across services.

#### `logOperation(operation: string, data?: any): void`

Logs service operations for debugging.

---

For more information, see:
- [Core API Overview](./core.md)
- [Hooks API](./hooks.md)
- [Utilities API](./utilities.md)


# ADR-003: Quote Provider Architecture

## Status

Accepted

## Context

Boostlly fetches quotes from multiple external APIs (ZenQuotes, Quotable, FavQs, etc.). We needed a system that:

- Supports multiple quote sources
- Handles failures gracefully with fallbacks
- Allows easy addition of new providers
- Provides consistent quote format regardless of source
- Implements rate limiting and caching

## Decision

We implemented a provider-based architecture:

1. **Base Provider Interface**: Defines contract for all quote providers
2. **Provider Implementations**: Each API has its own provider class
3. **Quote Fetcher Service**: Orchestrates provider selection and fallback
4. **Circuit Breaker Pattern**: Prevents cascading failures
5. **Weighted Selection**: Providers are selected based on configurable weights

```typescript
// Base interface
export abstract class QuoteProvider {
  abstract name: Source;
  abstract random(): Promise<Quote>;
  abstract search(query: string): Promise<Quote[]>;
}

// Implementation
export class ZenQuotesProvider extends QuoteProvider {
  name = "ZenQuotes" as const;
  async random(): Promise<Quote> { ... }
}

// Orchestration
export class QuoteFetcher {
  selectPrimarySource(): Source { ... }
  getFallbackChain(primary: Source): Source[] { ... }
}
```

## Consequences

### Positive

- **Extensibility**: Easy to add new quote providers
- **Resilience**: Automatic fallback to working providers
- **Flexibility**: Can adjust provider weights based on performance
- **Testability**: Each provider can be tested independently

### Negative

- **Complexity**: More classes and abstractions
- **Provider maintenance**: Need to update providers when APIs change
- **Rate limiting**: Must coordinate rate limits across providers

### Mitigations

- Comprehensive error handling and logging
- Health monitoring for each provider
- Caching to reduce API calls
- Circuit breaker to prevent hammering failing APIs


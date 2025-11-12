# ADR-002: Platform Abstraction Layer

## Status

Accepted

## Context

Boostlly needs to run on multiple platforms (Web, Browser Extension, Android) that have different APIs for:
- Storage (localStorage, chrome.storage, AsyncStorage)
- Notifications (Web Notifications API, chrome.notifications, React Native)
- Background tasks (Service Workers, Extension Background Scripts, React Native)

We needed a way to write platform-agnostic code while leveraging platform-specific features.

## Decision

We created a platform abstraction layer with:

1. **Interface definitions** (`@boostlly/platform`): Define contracts for platform services
2. **Platform implementations**: Separate packages for each platform
3. **Service injection**: Services are injected at application startup

```typescript
// Interface
export interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  // ...
}

// Platform-specific implementations
// @boostlly/platform-web
export class WebStorageService extends StorageService { ... }

// @boostlly/platform-extension
export class ExtensionStorageService extends StorageService { ... }
```

## Consequences

### Positive

- **Platform-agnostic code**: Core business logic doesn't depend on platform APIs
- **Easy testing**: Can mock platform services in tests
- **Platform flexibility**: Easy to add new platforms
- **Type safety**: TypeScript ensures implementations match interfaces

### Negative

- **Abstraction overhead**: Additional layer of indirection
- **Feature limitations**: Must work with lowest common denominator or use feature detection
- **Initial setup**: More code to write initially

### Mitigations

- Keep abstractions focused on essential operations
- Use feature detection for platform-specific optimizations
- Document platform-specific behaviors


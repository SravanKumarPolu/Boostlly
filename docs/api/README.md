# Boostlly API Documentation

This directory contains comprehensive API documentation for the Boostlly project. The APIs are organized by package and functionality.

## 📚 Documentation Index

### Core Package (`@boostlly/core`)

- **[Core API Overview](./core.md)** - Main entry point and types
- **[Services API](./services.md)** - Business logic services (QuoteService, CollectionService, etc.)
- **[Hooks API](./hooks.md)** - React hooks for state management and side effects
- **[Utilities API](./utilities.md)** - Helper functions and utilities

### Platform Packages

- **`@boostlly/platform`** - Platform abstraction layer
- **`@boostlly/platform-web`** - Web-specific implementations
- **`@boostlly/platform-extension`** - Browser extension implementations
- **`@boostlly/platform-android`** - Android/React Native implementations

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build
```

### Basic Usage

```typescript
import { QuoteService, CollectionService } from '@boostlly/core';
import { StorageService } from '@boostlly/platform-web';

// Initialize storage
const storage = new StorageService();

// Create services
const quoteService = new QuoteService(storage);
const collectionService = new CollectionService(storage);

// Get today's quote
const quote = await quoteService.getTodayQuote();
console.log(quote.text, quote.author);
```

## 📦 Package Structure

```
@boostlly/core/
├── services/        # Business logic services
├── hooks/          # React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── constants/      # Configuration constants
```

## 🔗 Related Documentation

- [Component Documentation](../components/README.md) - React component APIs
- [Guides](../guides/) - Usage guides and tutorials
- [Main README](../../README.md) - Project overview

## 📝 API Versioning

All APIs follow semantic versioning. Breaking changes are documented in release notes.

## 🤝 Contributing

When adding new APIs:

1. Document all public exports
2. Include TypeScript types
3. Add usage examples
4. Update this index

---

For detailed API documentation, see the individual documentation files linked above.


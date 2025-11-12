# ADR-005: Type Safety Approach

## Status

Accepted

## Context

Boostlly is a TypeScript project that needs to maintain type safety across multiple packages and platforms. We needed to decide:

- How strict to be with TypeScript settings
- How to handle platform-specific types
- How to avoid `any` types while maintaining flexibility
- How to share types across packages

## Decision

We adopted a strict type safety approach:

### 1. Strict TypeScript Configuration
- `strict: true` in all tsconfig files
- No implicit `any` types
- Strict null checks enabled

### 2. Type Definitions
- Shared types in `@boostlly/core/src/types.ts`
- Platform-specific types in platform packages
- Interface-based design for services

### 3. Avoiding `any` Types
- Use generic types for storage operations
- Use type guards for runtime type checking
- Use `unknown` instead of `any` when type is truly unknown
- Create specific interfaces for dynamic objects

### 4. Type Sharing
- Core types exported from `@boostlly/core`
- Platform types exported from platform packages
- Feature types in feature packages

## Example

```typescript
// ❌ Bad: Using any
const settings = storage.getSync("settings") as any;

// ✅ Good: Using proper types
interface SettingsWithTimezone {
  timezone?: string;
  [key: string]: unknown;
}
const settings = storage.getSync<SettingsWithTimezone>("settings");
```

## Consequences

### Positive

- **Early error detection**: TypeScript catches errors at compile time
- **Better IDE support**: Autocomplete and refactoring work better
- **Self-documenting**: Types serve as documentation
- **Refactoring safety**: TypeScript helps catch breaking changes

### Negative

- **Initial development time**: More time spent on type definitions
- **Learning curve**: Team needs to understand TypeScript well
- **Strictness**: Sometimes requires more verbose code

### Mitigations

- Regular code reviews to catch type issues
- Linting rules to prevent `any` usage
- Type utilities for common patterns
- Documentation of type patterns


# ADR-004: Testing Strategy

## Status

Accepted

## Context

Boostlly is a complex application with multiple layers (core services, UI components, platform-specific code) and multiple deployment targets. We needed a testing strategy that:

- Ensures code quality across all layers
- Supports rapid development
- Catches regressions early
- Works across different platforms
- Is maintainable and scalable

## Decision

We adopted a multi-layered testing approach:

### 1. Unit Tests (Vitest)
- **Location**: `packages/*/src/test/`
- **Scope**: Individual functions, classes, utilities
- **Framework**: Vitest with jsdom for React components
- **Coverage Target**: 80%+ for core business logic

### 2. Component Tests (React Testing Library)
- **Location**: `packages/ui/src/test/`, `packages/features/src/test/`
- **Scope**: React components in isolation
- **Framework**: Vitest + React Testing Library
- **Focus**: User interactions, accessibility, rendering

### 3. Integration Tests
- **Location**: `packages/core/src/test/`
- **Scope**: Service interactions, storage operations
- **Framework**: Vitest with mocks
- **Focus**: Component integration, API interactions

### 4. E2E Tests (Playwright)
- **Location**: `e2e/`
- **Scope**: Full user workflows
- **Framework**: Playwright
- **Focus**: Critical user paths, cross-browser compatibility

## Consequences

### Positive

- **Confidence**: Multiple layers catch different types of issues
- **Fast feedback**: Unit and component tests run quickly
- **Real-world validation**: E2E tests verify actual user flows
- **Documentation**: Tests serve as living documentation

### Negative

- **Maintenance overhead**: More tests to maintain
- **Initial setup**: Requires configuring multiple test frameworks
- **CI/CD complexity**: Need to run different test suites

### Mitigations

- Automated test runs in CI/CD
- Clear test organization and naming conventions
- Regular test maintenance and cleanup
- Focus on testing critical paths


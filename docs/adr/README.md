# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Boostlly project. ADRs document important architectural decisions made throughout the project's development.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made along with their context and consequences. They help:

- **Document decisions**: Record why certain choices were made
- **Share knowledge**: Help team members understand the reasoning
- **Track history**: Maintain a record of how the architecture evolved
- **Guide future decisions**: Provide context for similar decisions

## ADR Format

Each ADR follows this structure:

1. **Title**: Short descriptive title
2. **Status**: Proposed, Accepted, Deprecated, or Superseded
3. **Context**: The issue motivating this decision
4. **Decision**: The change that we're proposing or have agreed to implement
5. **Consequences**: What becomes easier or more difficult to do because of this change

## Current ADRs

- [ADR-001: Monorepo Structure](./001-monorepo-structure.md)
- [ADR-002: Platform Abstraction Layer](./002-platform-abstraction.md)
- [ADR-003: Quote Provider Architecture](./003-quote-provider-architecture.md)
- [ADR-004: Testing Strategy](./004-testing-strategy.md)
- [ADR-005: Type Safety Approach](./005-type-safety-approach.md)

## Contributing

When making a significant architectural decision:

1. Create a new ADR file following the template
2. Number it sequentially (e.g., `006-new-decision.md`)
3. Update this README with a link to the new ADR
4. Review with the team before marking as "Accepted"


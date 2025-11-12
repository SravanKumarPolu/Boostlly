# ADR-001: Monorepo Structure

## Status

Accepted

## Context

Boostlly needs to support multiple platforms (Web, Browser Extension, Android) while sharing core business logic and UI components. We needed a structure that:

- Allows code sharing between platforms
- Maintains clear separation of concerns
- Enables independent deployment of each platform
- Supports efficient development workflows

## Decision

We adopted a monorepo structure using pnpm workspaces with the following organization:

```
boostlly/
├── packages/
│   ├── core/          # Shared business logic
│   ├── ui/            # Shared UI components
│   ├── features/      # Feature components
│   ├── platform/      # Platform abstraction interfaces
│   ├── platform-web/  # Web platform implementation
│   ├── platform-extension/ # Extension platform implementation
│   └── platform-android/  # Android platform implementation
├── apps/
│   ├── web/           # Next.js web application
│   ├── extension/     # Browser extension
│   └── android/       # React Native Android app
└── scripts/           # Shared build and utility scripts
```

## Consequences

### Positive

- **Code reuse**: Business logic and UI components are shared across platforms
- **Type safety**: TypeScript types are shared, ensuring consistency
- **Single source of truth**: Core logic is maintained in one place
- **Efficient development**: Changes to core logic benefit all platforms
- **Consistent tooling**: Single package manager and build system

### Negative

- **Complexity**: More complex project structure requires understanding
- **Build coordination**: Changes to shared packages require rebuilding dependents
- **Dependency management**: Need to be careful about circular dependencies

### Mitigations

- Clear documentation of package dependencies
- Automated build scripts that handle dependencies
- Type checking across packages to catch issues early


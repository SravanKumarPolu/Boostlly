# Component Documentation

This directory contains comprehensive documentation for all React components in the Boostlly project.

## 📚 Documentation Index

### Feature Components (`@boostlly/features`)

- **[Feature Components](./features.md)** - Main feature components (TodayTab, CollectionsTab, UnifiedApp, etc.)
- **[Search Components](./search.md)** - Search and filtering components
- **[Navigation Components](./navigation.md)** - Navigation and routing components

### UI Components (`@boostlly/ui`)

- **[UI Components](./ui.md)** - Design system components (Button, Card, Input, etc.)
- **[Layout Components](./layout.md)** - Layout and container components
- **[Feedback Components](./feedback.md)** - Toast, Alert, ErrorBoundary components

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
import { UnifiedApp } from '@boostlly/features';
import { Button, Card } from '@boostlly/ui';

function App() {
  return (
    <div>
      <UnifiedApp variant="web" />
    </div>
  );
}
```

## 📦 Package Structure

```
@boostlly/features/
├── components/     # Feature components
│   ├── today-tab.tsx
│   ├── collections-tab.tsx
│   ├── unified-app.tsx
│   └── ...
├── hooks/         # Component hooks
└── utils/         # Component utilities

@boostlly/ui/
├── components/    # UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
└── lib/          # Utilities
```

## 🎨 Component Patterns

### Props Interface

All components use TypeScript interfaces for props:

```typescript
interface ComponentProps {
  // Required props
  title: string;
  
  // Optional props
  description?: string;
  variant?: 'default' | 'primary';
  
  // Event handlers
  onClick?: () => void;
  onChange?: (value: string) => void;
}
```

### Variant System

Many components support variants for different styles:

```typescript
<Button variant="primary" size="lg">
  Click Me
</Button>
```

### Accessibility

All components follow WCAG guidelines:

- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## 🔗 Related Documentation

- [API Documentation](../api/README.md) - Core APIs and services
- [Guides](../guides/) - Usage guides and tutorials
- [Main README](../../README.md) - Project overview

## 📝 Component Guidelines

When creating new components:

1. Use TypeScript for all props
2. Include JSDoc comments
3. Support accessibility features
4. Follow the design system
5. Add examples to documentation
6. Export from package index

---

For detailed component documentation, see the individual documentation files linked above.


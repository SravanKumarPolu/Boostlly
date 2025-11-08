# UI Components Reference

Documentation for design system components in `@boostlly/ui`.

## Table of Contents

- [Button](#button)
- [Card](#card)
- [Input](#input)
- [Badge](#badge)
- [Switch](#switch)
- [Progress](#progress)
- [ErrorBoundary](#errorboundary)
- [Alert](#alert)
- [Toast](#toast)
- [Skeleton](#skeleton)
- [Other Components](#other-components)

## Button

Versatile button component with multiple variants and sizes.

### Import

```typescript
import { Button } from '@boostlly/ui';
```

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'glass'
    | 'gradient'
    | 'success';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  asChild?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}
```

### Example

```typescript
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button variant="outline" size="sm">
  Secondary Action
</Button>

<Button variant="ghost" size="icon" ariaLabel="Close">
  <X />
</Button>
```

### Variants

- **`default`**: Standard button with card background
- **`destructive`**: Red variant for destructive actions
- **`outline`**: Outlined button with transparent background
- **`secondary`**: Secondary button style
- **`ghost`**: Minimal button with no background
- **`link`**: Link-style button
- **`glass`**: Glassmorphism effect
- **`gradient`**: Gradient background (purple to blue)
- **`success`**: Success variant (green gradient)

### Sizes

- **`sm`**: Small button
- **`default`**: Default size
- **`lg`**: Large button
- **`xl`**: Extra large button
- **`icon`**: Square icon button

## Card

Card component for content containers.

### Import

```typescript
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter 
} from '@boostlly/ui';
```

### Example

```typescript
<Card>
  <CardHeader>
    <CardTitle>Quote of the Day</CardTitle>
    <CardDescription>Daily motivation</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your quote content here</p>
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Components

- **`Card`**: Main container
- **`CardHeader`**: Header section
- **`CardTitle`**: Title text
- **`CardDescription`**: Description text
- **`CardContent`**: Main content area
- **`CardFooter`**: Footer section

## Input

Input field component.

### Import

```typescript
import { Input } from '@boostlly/ui';
```

### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // All standard input props supported
}
```

### Example

```typescript
<Input 
  type="text"
  placeholder="Search quotes..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

<Input 
  type="email"
  placeholder="Email"
  ariaLabel="Email address"
/>
```

## Badge

Badge component for labels and tags.

### Import

```typescript
import { Badge } from '@boostlly/ui';
```

### Props

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

### Example

```typescript
<Badge>New</Badge>
<Badge variant="secondary">Featured</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Tag</Badge>
```

## Switch

Toggle switch component.

### Import

```typescript
import { Switch } from '@boostlly/ui';
```

### Props

```typescript
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}
```

### Example

```typescript
<Switch 
  checked={enabled}
  onCheckedChange={setEnabled}
  ariaLabel="Enable notifications"
/>
```

## Progress

Progress bar component.

### Import

```typescript
import { Progress } from '@boostlly/ui';
```

### Props

```typescript
interface ProgressProps {
  value?: number;  // 0-100
  max?: number;    // Default: 100
  ariaLabel?: string;
}
```

### Example

```typescript
<Progress value={75} ariaLabel="Loading progress" />
```

## ErrorBoundary

Error boundary component for catching React errors.

### Import

```typescript
import { ErrorBoundary } from '@boostlly/ui';
```

### Props

```typescript
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}
```

### Example

```typescript
<ErrorBoundary 
  onError={(error) => console.error('Error caught:', error)}
>
  <MyComponent />
</ErrorBoundary>
```

## Alert

Alert component for displaying messages.

### Import

```typescript
import { Alert, AlertTitle, AlertDescription } from '@boostlly/ui';
```

### Example

```typescript
<Alert>
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Your quote has been saved successfully.
  </AlertDescription>
</Alert>
```

## Toast

Toast notification component.

### Import

```typescript
import { Toast, ToastTitle, ToastDescription } from '@boostlly/ui';
import { EnhancedToast } from '@boostlly/ui';
```

### Example

```typescript
// Basic toast
<Toast>
  <ToastTitle>Notification</ToastTitle>
  <ToastDescription>Action completed</ToastDescription>
</Toast>

// Enhanced toast with more features
<EnhancedToast 
  title="Success"
  description="Quote saved"
  variant="success"
  duration={3000}
/>
```

## Skeleton

Loading skeleton components.

### Import

```typescript
import { 
  Skeleton,
  TabSkeleton,
  StatsSkeleton,
  SearchSkeleton,
  CollectionsSkeleton,
  QuoteSkeleton,
  CardSkeleton
} from '@boostlly/ui';
```

### Example

```typescript
{isLoading ? (
  <TabSkeleton />
) : (
  <TabContent />
)}

{isLoading ? (
  <QuoteSkeleton />
) : (
  <QuoteCard quote={quote} />
)}
```

## Other Components

### Section

Section container component.

```typescript
import { Section } from '@boostlly/ui';

<Section title="My Section">
  {/* Content */}
</Section>
```

### NavigationButton

Navigation button component.

```typescript
import { NavigationButton } from '@boostlly/ui';

<NavigationButton 
  icon={Home}
  label="Home"
  active={activeTab === 'home'}
  onClick={() => setActiveTab('home')}
/>
```

### DecorativeBackdrop

Decorative backdrop component.

```typescript
import { DecorativeBackdrop } from '@boostlly/ui';

<DecorativeBackdrop variant="gradient">
  {/* Content */}
</DecorativeBackdrop>
```

### LazyWrapper

Component for lazy loading.

```typescript
import { LazyWrapper, withLazyLoading } from '@boostlly/ui';

<LazyWrapper fallback={<Skeleton />}>
  <HeavyComponent />
</LazyWrapper>

// HOC version
const LazyComponent = withLazyLoading(HeavyComponent, <Skeleton />);
```

### VirtualScroll

Virtual scrolling component for large lists.

```typescript
import { VirtualScroll, SearchableVirtualScroll } from '@boostlly/ui';

<VirtualScroll
  items={quotes}
  itemHeight={100}
  renderItem={(quote) => <QuoteCard quote={quote} />}
/>

<SearchableVirtualScroll
  items={quotes}
  searchQuery={query}
  itemHeight={100}
  renderItem={(quote) => <QuoteCard quote={quote} />}
/>
```

### UnifiedQuoteCard

Unified quote card component.

```typescript
import { 
  UnifiedQuoteCard,
  QuoteCardGrid,
  QuoteCardList 
} from '@boostlly/ui';

<UnifiedQuoteCard 
  quote={quote}
  variant="default"
  onSave={() => {}}
  onShare={() => {}}
/>

<QuoteCardGrid quotes={quotes} />

<QuoteCardList quotes={quotes} />
```

## Utilities

### cn

Utility function for combining class names.

```typescript
import { cn } from '@boostlly/ui';

<div className={cn("base-class", condition && "conditional-class")} />
```

## Styling

All components use Tailwind CSS and support:

- Dark mode (via `dark:` classes)
- Responsive design
- Custom theming
- CSS variables for colors

### Theme Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}
```

## Accessibility

All components follow WCAG 2.1 guidelines:

- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

## Best Practices

1. **Always provide labels**: Use `ariaLabel` for icon-only buttons
2. **Use semantic HTML**: Components use appropriate HTML elements
3. **Handle loading states**: Use skeleton components
4. **Error handling**: Wrap in ErrorBoundary
5. **Responsive design**: Components are mobile-friendly

## TypeScript Support

All components are fully typed with TypeScript:

```typescript
import type { ButtonProps, CardProps } from '@boostlly/ui';
```

---

For more information, see:
- [Feature Components](./features.md)
- [API Documentation](../api/README.md)


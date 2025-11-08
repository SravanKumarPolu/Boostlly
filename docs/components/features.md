# Feature Components Reference

Documentation for feature components in `@boostlly/features`.

## Table of Contents

- [UnifiedApp](#unifiedapp)
- [TodayTab](#todaytab)
- [CollectionsTab](#collectionstab)
- [AdvancedSearch](#advancedsearch)
- [APIExplorer](#apiexplorer)
- [EnhancedSettings](#enhancedsettings)
- [VoiceCommands](#voicecommands)
- [Other Components](#other-components)

## UnifiedApp

Main unified application component that orchestrates all features. Works in both web and extension (popup) variants.

### Import

```typescript
import { UnifiedApp } from '@boostlly/features';
```

### Props

```typescript
interface UnifiedAppProps {
  variant?: 'web' | 'popup';  // Display variant (default: 'web')
  storage?: StorageLike;       // Optional storage service
  savedQuotes?: SavedQuote[]; // Pre-loaded saved quotes
  collections?: QuoteCollection[]; // Pre-loaded collections
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: Quote) => void;
  onSaveAsImage?: (quote: Quote) => void;
  onAddToCollection?: (quote: Quote) => void;
}
```

### Example

```typescript
function App() {
  return (
    <UnifiedApp 
      variant="web"
      onSpeakQuote={(quote) => console.log('Speaking:', quote.text)}
    />
  );
}
```

### Features

- Tab-based navigation (Today, Search, Collections, Analytics, Settings)
- Auto-theme based on daily background images
- Voice commands support
- Responsive design
- Error boundary protection
- Loading states and skeletons

### Variants

- **`web`**: Full-featured web application layout
- **`popup`**: Compact layout for browser extension popup

## TodayTab

Component for displaying and interacting with today's quote.

### Import

```typescript
import { TodayTab } from '@boostlly/features';
```

### Props

```typescript
interface TodayTabProps {
  storage?: any;
  onSavedChanged?: () => void;
  onLikedChanged?: () => void;
  onAddSavedImmediate?: (quote: Quote) => void;
  onRemoveSavedImmediate?: (idOrQuote: string | Quote) => void;
  onAddLikedImmediate?: (quote: Quote) => void;
  onRemoveLikedImmediate?: (idOrQuote: string | Quote) => void;
}
```

### Ref Methods

The component exposes methods via `forwardRef`:

```typescript
interface TodayTabRef {
  refresh: () => void;              // Refresh today's quote
  getQuote: () => Quote | null;     // Get current quote
  speak: () => void;                // Speak current quote
  getStatus: () => {                // Get current status
    quote: Quote | null;
    isSaved: boolean;
    isLiked: boolean;
  };
}
```

### Example

```typescript
import { useRef } from 'react';
import { TodayTab } from '@boostlly/features';

function MyComponent() {
  const todayTabRef = useRef<TodayTabRef>(null);

  const handleRefresh = () => {
    todayTabRef.current?.refresh();
  };

  return (
    <div>
      <button onClick={handleRefresh}>Refresh Quote</button>
      <TodayTab 
        ref={todayTabRef}
        onSavedChanged={() => console.log('Saved changed')}
      />
    </div>
  );
}
```

### Features

- Displays today's quote with auto-theme background
- Save and like functionality
- Text-to-speech support
- Share and copy to clipboard
- Generate quote images
- Reading streak tracking
- Badge unlocking

## CollectionsTab

Component for managing quote collections.

### Import

```typescript
import { CollectionsTab } from '@boostlly/features';
```

### Props

```typescript
interface CollectionsTabProps {
  storage?: any;
  collections?: QuoteCollection[];
  onCollectionChange?: () => void;
}
```

### Example

```typescript
function MyComponent() {
  return (
    <CollectionsTab 
      onCollectionChange={() => console.log('Collections updated')}
    />
  );
}
```

### Features

- View all collections
- Create new collections
- Edit collection metadata
- Add/remove quotes from collections
- Collection organization with colors and icons
- Default collections (Favorites, Work, Study)

## AdvancedSearch

Advanced search component with filtering and sorting.

### Import

```typescript
import { AdvancedSearch } from '@boostlly/features';
```

### Props

```typescript
interface AdvancedSearchProps {
  storage?: any;
  onQuoteSelect?: (quote: Quote) => void;
  initialQuery?: string;
}
```

### Example

```typescript
function MyComponent() {
  return (
    <AdvancedSearch 
      initialQuery="motivation"
      onQuoteSelect={(quote) => console.log('Selected:', quote)}
    />
  );
}
```

### Features

- Full-text search
- Category filtering
- Author filtering
- Source filtering
- Sort options
- Search history
- Recent searches

## APIExplorer

Component for exploring and testing quote APIs.

### Import

```typescript
import { APIExplorer } from '@boostlly/features';
```

### Props

```typescript
interface APIExplorerProps {
  storage: any;  // Required storage service
}
```

### Example

```typescript
import { StorageService } from '@boostlly/platform-web';

function MyComponent() {
  const storage = new StorageService();
  
  return <APIExplorer storage={storage} />;
}
```

### Features

- Test multiple quote providers
- View API health status
- Configure API settings
- View API metrics
- Rate limiting information
- Response time monitoring

## EnhancedSettings

Enhanced settings component with comprehensive configuration options.

### Import

```typescript
import { EnhancedSettings } from '@boostlly/features';
```

### Props

```typescript
interface EnhancedSettingsProps {
  storage?: any;
  onSettingsChange?: (settings: Settings) => void;
}
```

### Example

```typescript
function MyComponent() {
  return (
    <EnhancedSettings 
      onSettingsChange={(settings) => {
        console.log('Settings updated:', settings);
      }}
    />
  );
}
```

### Features

- Theme configuration (light/dark/auto)
- Font size adjustment
- Display options (author, categories, source)
- Background settings
- Alarm/notification settings
- Sound settings
- Export/import settings
- Privacy settings

## VoiceCommands

Component for voice command functionality.

### Import

```typescript
import { VoiceCommands } from '@boostlly/features';
```

### Props

```typescript
interface VoiceCommandsProps {
  onCommand?: (command: string) => void;
  enabled?: boolean;
}
```

### Example

```typescript
function MyComponent() {
  return (
    <VoiceCommands 
      enabled={true}
      onCommand={(cmd) => {
        if (cmd === 'next quote') {
          // Handle command
        }
      }}
    />
  );
}
```

### Features

- Voice recognition
- Command processing
- Visual feedback
- Error handling
- Browser compatibility checks

## Other Components

### ExportImport

Component for exporting and importing quotes and settings.

```typescript
import { ExportImport } from '@boostlly/features';

<ExportImport storage={storage} />
```

### QuoteCollections

Component for displaying and managing quote collections.

```typescript
import { QuoteCollections } from '@boostlly/features';

<QuoteCollections storage={storage} />
```

### SmartRecommendations

Component for displaying smart quote recommendations.

```typescript
import { SmartRecommendations } from '@boostlly/features';

<SmartRecommendations quoteId={quote.id} />
```

### IntelligentCategorization

Component for intelligent quote categorization.

```typescript
import { IntelligentCategorization } from '@boostlly/features';

<IntelligentCategorization quote={quote} />
```

### PatternRecognition

Component for recognizing patterns in quotes.

```typescript
import { PatternRecognition } from '@boostlly/features';

<PatternRecognition quotes={quotes} />
```

### AdvancedPredictions

Component for advanced quote predictions.

```typescript
import { AdvancedPredictions } from '@boostlly/features';

<AdvancedPredictions />
```

### EmailSubscription

Component for email newsletter subscription.

```typescript
import { EmailSubscription } from '@boostlly/features';

<EmailSubscription />
```

### MobileResponsive

Wrapper component for mobile-responsive layouts.

```typescript
import { MobileResponsive } from '@boostlly/features';

<MobileResponsive>
  {/* Content */}
</MobileResponsive>
```

### ClientOnly

Component for rendering content only on the client side.

```typescript
import { ClientOnly } from '@boostlly/features';

<ClientOnly>
  {/* Client-only content */}
</ClientOnly>
```

### GlobalVoiceListener

Global voice listener component for app-wide voice commands.

```typescript
import { GlobalVoiceListener } from '@boostlly/features';

<GlobalVoiceListener 
  onCommand={(cmd) => handleCommand(cmd)}
/>
```

## Component Hooks

### useAppState

Hook for managing application state.

```typescript
import { useAppState } from '@boostlly/features';

const { appState, setActiveTab } = useAppState(storage);
```

### useSearchState

Hook for managing search state.

```typescript
import { useSearchState } from '@boostlly/features';

const { query, results, search } = useSearchState();
```

## Best Practices

1. **Storage**: Always provide a storage service when required
2. **Error Handling**: Wrap components in ErrorBoundary
3. **Loading States**: Use Suspense for async components
4. **Accessibility**: Ensure all interactive elements are keyboard accessible
5. **Performance**: Use lazy loading for heavy components

## TypeScript Support

All components are fully typed. Import types as needed:

```typescript
import type { 
  UnifiedAppProps,
  TodayTabProps,
  CollectionsTabProps 
} from '@boostlly/features';
```

---

For more information, see:
- [UI Components](./ui.md)
- [API Documentation](../api/README.md)


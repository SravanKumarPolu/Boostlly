# Hooks API Reference

React hooks provided by `@boostlly/core` for state management and side effects.

## useAutoTheme

Hook for automatic theming based on daily background images. Loads Picsum images and extracts color palettes for dynamic theming.

### Signature

```typescript
function useAutoTheme(): AutoThemeState & {
  loadTodayImage: () => void;
  loadImageForDate: (date: Date) => void;
  loadImage: (imageUrl: string) => Promise<void>;
}
```

### Returns

```typescript
interface AutoThemeState {
  imageUrl: string | null;      // Current background image URL
  palette: ColorPalette | null; // Extracted color palette
  isLoading: boolean;           // Loading state
  isAnalyzing: boolean;         // Color analysis in progress
  error: string | null;         // Error message if any
  loadTodayImage: () => void;   // Load today's image
  loadImageForDate: (date: Date) => void; // Load image for date
  loadImage: (imageUrl: string) => Promise<void>; // Load custom image
}
```

### Example

```typescript
import { useAutoTheme } from '@boostlly/core';

function ThemedComponent() {
  const { imageUrl, palette, isLoading, error, loadTodayImage } = useAutoTheme();

  if (isLoading) {
    return <div>Loading theme...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundColor: palette?.dominant || '#ffffff'
      }}
    >
      <h1 style={{ color: palette?.text || '#000000' }}>
        Themed Content
      </h1>
    </div>
  );
}
```

### Behavior

- Automatically loads today's image on mount
- Uses date-based seeding for consistent daily images
- Extracts color palette from images for theming
- Handles errors gracefully without breaking the UI
- Supports loading images for specific dates

### ColorPalette

```typescript
interface ColorPalette {
  dominant: string;    // Dominant color (hex)
  secondary: string;   // Secondary color (hex)
  accent: string;      // Accent color (hex)
  text: string;       // Recommended text color (hex)
  background: string; // Recommended background color (hex)
}
```

## useSoundSettings

Hook for managing sound settings and playback.

### Signature

```typescript
function useSoundSettings(): {
  soundEnabled: boolean;
  volume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  playSound: (soundId: string) => Promise<void>;
}
```

### Returns

- `soundEnabled`: Whether sounds are enabled
- `volume`: Volume level (0-1)
- `setSoundEnabled`: Toggle sound on/off
- `setVolume`: Set volume level
- `playSound`: Play a sound by ID

### Example

```typescript
import { useSoundSettings } from '@boostlly/core';

function SoundControls() {
  const {
    soundEnabled,
    volume,
    setSoundEnabled,
    setVolume,
    playSound
  } = useSoundSettings();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
        />
        Enable Sounds
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />
      <button onClick={() => playSound('notification')}>
        Test Sound
      </button>
    </div>
  );
}
```

### Behavior

- Persists settings to storage
- Loads settings on mount
- Provides sound playback functionality
- Handles platform-specific sound implementations

## Custom Hooks Pattern

You can create custom hooks using the core services:

### Example: useQuoteService

```typescript
import { useState, useEffect } from 'react';
import { QuoteService } from '@boostlly/core';
import { StorageService } from '@boostlly/platform-web';

function useQuoteService() {
  const [quoteService] = useState(() => {
    const storage = new StorageService();
    return new QuoteService(storage);
  });
  const [todayQuote, setTodayQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quoteService.getTodayQuote()
      .then(setTodayQuote)
      .finally(() => setLoading(false));
  }, []);

  return { quoteService, todayQuote, loading };
}
```

### Example: useCollectionService

```typescript
import { useState, useEffect } from 'react';
import { CollectionService } from '@boostlly/core';
import { StorageService } from '@boostlly/platform-web';

function useCollectionService() {
  const [collectionService] = useState(() => {
    const storage = new StorageService();
    return new CollectionService(storage);
  });
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collectionService.getAllCollections()
      .then(setCollections)
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    collectionService.getAllCollections()
      .then(setCollections);
  };

  return { collectionService, collections, loading, refresh };
}
```

## Hook Best Practices

1. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
2. **Dependencies**: Include all dependencies in dependency arrays
3. **Cleanup**: Clean up subscriptions and timers in `useEffect` cleanup
4. **Error Handling**: Handle errors gracefully in hooks
5. **Loading States**: Always provide loading states for async operations

### Example with Error Handling

```typescript
function useTodayQuote() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const quoteService = new QuoteService(storage);
    
    quoteService.getTodayQuote()
      .then(setQuote)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { quote, loading, error };
}
```

---

For more information, see:
- [Core API Overview](./core.md)
- [Services API](./services.md)
- [Component Documentation](../components/README.md)


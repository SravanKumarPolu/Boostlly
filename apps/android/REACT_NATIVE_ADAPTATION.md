# React Native Component Adaptation Guide

## Current Situation

The `UnifiedApp` component and other UI components in `@boostlly/features` are built for web (using HTML elements like `div`, `span`, CSS classes, etc.). React Native uses different components (`View`, `Text`, `StyleSheet`, etc.).

## Options for Adaptation

### Option 1: Create React Native Versions (Recommended)

Create React Native-specific versions of components in `packages/features/src/components/native/`:

**Pros:**
- ✅ Best performance
- ✅ Native look and feel
- ✅ Access to native features
- ✅ Smaller bundle size

**Cons:**
- ❌ Need to maintain separate components
- ❌ More initial work

**Example:**
```tsx
// packages/features/src/components/native/UnifiedApp.tsx
import { View, Text, StyleSheet } from 'react-native';
import { AndroidStorageService } from '@boostlly/platform-android';
import { QuoteService } from '@boostlly/core';

export function UnifiedAppNative({ storageService }) {
  // Use React Native components
  return (
    <View style={styles.container}>
      <Text>Boostlly</Text>
      {/* React Native UI */}
    </View>
  );
}
```

### Option 2: Use react-native-web (Quick Start)

Use `react-native-web` to make React Native components work on web, and use them everywhere.

**Pros:**
- ✅ Single codebase
- ✅ Works on web and mobile

**Cons:**
- ❌ Larger bundle size
- ❌ Some web-specific features may not work
- ❌ Performance not as good as native

### Option 3: Hybrid Approach (Best Long-term)

1. Keep shared business logic in `@boostlly/core` (already done ✅)
2. Create platform-specific UI:
   - `packages/features/src/components/web/` - Web components
   - `packages/features/src/components/native/` - React Native components
3. Share types and utilities

## Recommended Implementation Plan

### Phase 1: Core Services (Already Done ✅)
- ✅ `@boostlly/core` - Business logic works on all platforms
- ✅ `@boostlly/platform-android` - Android platform services

### Phase 2: Create React Native UI Components

1. **Create native component structure:**
   ```
   packages/features/src/components/native/
   ├── UnifiedApp.tsx
   ├── TodayTab.tsx
   ├── SearchTab.tsx
   ├── CollectionsTab.tsx
   ├── AnalyticsTab.tsx
   └── SettingsTab.tsx
   ```

2. **Use React Native components:**
   - `View` instead of `div`
   - `Text` instead of `span`/`p`
   - `StyleSheet` instead of CSS classes
   - `ScrollView` for scrollable content
   - `TouchableOpacity` for buttons

3. **Example component:**
   ```tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import { QuoteService } from '@boostlly/core';
   import { AndroidStorageService } from '@boostlly/platform-android';

   export function TodayTabNative({ storageService }) {
     const [quote, setQuote] = useState(null);
     
     useEffect(() => {
       const quoteService = new QuoteService(storageService);
       quoteService.getTodayQuote().then(setQuote);
     }, []);

     return (
       <View style={styles.container}>
         <Text style={styles.quote}>{quote?.text}</Text>
         <Text style={styles.author}>— {quote?.author}</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 20,
     },
     quote: {
       fontSize: 18,
       marginBottom: 10,
     },
     author: {
       fontSize: 14,
       fontStyle: 'italic',
     },
   });
   ```

### Phase 3: Update Android App

Update `apps/android/App.tsx` to use native components:

```tsx
import { UnifiedAppNative } from '@boostlly/features/native';

export default function App() {
  const storageService = new AndroidStorageService();
  
  return (
    <SafeAreaProvider>
      <UnifiedAppNative storageService={storageService} />
    </SafeAreaProvider>
  );
}
```

## Shared Code That Works Now

These packages work on React Native without changes:
- ✅ `@boostlly/core` - All services (QuoteService, etc.)
- ✅ `@boostlly/platform-android` - Platform services
- ✅ Types and interfaces
- ✅ Utility functions

## Next Steps

1. **Start with Today Tab:**
   - Create `TodayTabNative.tsx`
   - Use `QuoteService` from `@boostlly/core`
   - Build simple React Native UI

2. **Gradually add other tabs:**
   - Search, Collections, Analytics, Settings

3. **Create navigation:**
   - Use `react-navigation` or `@react-navigation/native`

4. **Add styling:**
   - Use `StyleSheet` or a library like `styled-components/native`

## Resources

- [React Native Components](https://reactnative.dev/docs/components-and-apis)
- [React Native Styling](https://reactnative.dev/docs/style)
- [React Navigation](https://reactnavigation.org/)
- [Expo Components](https://docs.expo.dev/versions/latest/)

## Current App.tsx

The current `App.tsx` is a placeholder. Replace it with your React Native components as you build them.


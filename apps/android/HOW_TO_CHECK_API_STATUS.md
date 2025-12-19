# How to Check if APIs Failed Today - Android App

## Quick Check Methods

### 1. **Visual Indicator in App**

The Today tab now shows a badge indicating if the quote came from an API:
- **🌐 API** (green badge) = Quote came from an external API provider ✅
- **📦 Local** (orange badge) = APIs failed, using local fallback ⚠️

### 2. **Check Console Logs**

Open React Native Debugger or Metro bundler console and look for:

#### ✅ **API Success:**
```
[TodayTab] Quote loaded - Source: Quotable, From API: ✅
```

#### ⚠️ **API Failure (with fallback):**
```
[TodayTab] Quote loaded - Source: local, From API: ⚠️ (fallback)
```

### 3. **Check Quote Source Programmatically**

You can check the quote source in your code:

```typescript
import { isQuoteFromAPI } from './utils/checkAPIStatus';

const quote = await quoteService.getQuoteByDay();
if (isQuoteFromAPI(quote)) {
  console.log('✅ Quote came from API');
} else {
  console.log('⚠️ Quote came from local fallback');
}
```

### 4. **Get Full API Status**

Use the utility function to get complete API status:

```typescript
import { checkAPIStatus, logAPIStatus } from './utils/checkAPIStatus';

// Get status object
const status = await checkAPIStatus(quoteService);
console.log('Status:', status.status); // 'all_healthy' | 'some_down' | 'all_down'
console.log('Healthy APIs:', status.healthyCount, '/', status.totalCount);

// Or log full status to console
await logAPIStatus(quoteService);
```

### 5. **Check Health Status Directly**

```typescript
const healthStatus = quoteService.getHealthStatus();
healthStatus.forEach(health => {
  console.log(`${health.source}: ${health.status} (${health.successRate}% success)`);
});
```

## Understanding the Status

### Status Values:
- **`all_healthy`** = All APIs are working ✅
- **`some_down`** = Some APIs failed, but some are working ⚠️
- **`all_down`** = All APIs failed, using local fallback ❌

### Quote Sources:

**API Sources (means APIs worked):**
- `Quotable`
- `ZenQuotes`
- `FavQs`
- `TheySaidSo`
- `QuoteGarden`
- `StoicQuotes`
- `ProgrammingQuotes`

**Fallback Sources (means APIs failed):**
- `local`
- `Bundled`
- `DummyJSON`
- Any other source

## What Happens When APIs Fail?

The system has **multiple fallback layers**:

1. **Primary API Provider** (day-based rotation)
   ↓ (if fails)
2. **Fallback API Providers** (tries others)
   ↓ (if all fail)
3. **Prefetched Quotes** (if available)
   ↓ (if not available)
4. **Local Quote Pool** (always works)
   ↓ (always succeeds)
5. **Hardcoded Fallback Quote**

**Even if ALL APIs fail, you'll still get a quote!**

## Testing API Status

### Method 1: Force Refresh
Clear cache and force a fresh fetch:

```typescript
// Clear cache
await storageService.set('dailyQuote', null);
await storageService.set('dailyQuoteDate', null);

// Force fresh fetch
const quote = await quoteService.getQuoteByDay(true);
```

### Method 2: Check Specific Provider
```typescript
try {
  const quote = await quoteService.randomFrom('Quotable');
  console.log('Quotable API:', '✅ Working');
} catch (error) {
  console.log('Quotable API:', '❌ Failed');
}
```

## Summary

**To check if APIs failed today:**

1. ✅ **Look at the badge** in Today tab (🌐 API vs 📦 Local)
2. ✅ **Check console logs** for source information
3. ✅ **Use `checkAPIStatus()`** utility function
4. ✅ **Check `getHealthStatus()`** for detailed provider status

**Remember:** The app always works, even when APIs fail, thanks to the fallback system!


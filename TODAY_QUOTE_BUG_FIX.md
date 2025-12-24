# Today Quote Bug Fix

## Root Cause

**Issue**: Today quote was being replaced by previously saved quotes.

**Root Cause**: In `getDailyQuote()`, saved quotes were incorrectly included in the daily quote selection pool (lines 387-399). This meant that if a user saved yesterday's quote, it could potentially be selected again as today's quote, causing the bug where saved quotes would appear as the Today quote.

## Fix

**File Changed**: `packages/core/src/services/quote-service.ts`

**Change**: Removed saved quotes from the daily quote selection pool in `getDailyQuote()`.

### Before:
```typescript
// Include custom saved quotes from storage
// Merge shipped/local quotes with cached API enrichment pool
let allQuotes = [...this.quotes, ...this.cacheManager.getCachedApiQuotes()];
try {
  const savedQuotes = this.storage.getSync("savedQuotes");
  if (Array.isArray(savedQuotes) && savedQuotes.length > 0) {
    // Add custom quotes to the pool
    allQuotes = [...allQuotes, ...savedQuotes];
  }
} catch (error) {
  // If we can't get saved quotes, just use default quotes
  logDebug("Could not load saved quotes for daily quote", { error });
}
```

### After:
```typescript
// CRITICAL: Do NOT include saved quotes in daily quote pool
// Saved quotes should only appear in Saved/Collections tabs, not as Today's quote
// Merge shipped/local quotes with cached API enrichment pool only
let allQuotes = [...this.quotes, ...this.cacheManager.getCachedApiQuotes()];
```

## Why This Fix Works

1. **Separation of Concerns**: Saved quotes are user-curated content that should only appear in the Saved/Collections tabs, not in the Today view.

2. **Deterministic Daily Quotes**: The Today quote should be deterministic based on the date, selected from:
   - Shipped/local quotes (`this.quotes`)
   - Cached API quotes (`this.cacheManager.getCachedApiQuotes()`)

3. **No Cross-Contamination**: By removing saved quotes from the pool, we ensure that:
   - Today's quote is always determined by `getDailyQuote(date)` or `getQuoteByDay()`
   - Saved quotes only appear in Saved/Collections tabs
   - Yesterday's saved quote will never override today's quote

## Verification

### Test Cases

1. **Save yesterday's quote → Open app next day**
   - ✅ Today shows new quote (deterministic for new day)
   - ✅ Saved tab shows yesterday's quote

2. **Save today's quote → Refresh**
   - ✅ Today still shows today's quote (with Saved state = true)
   - ✅ Saved tab shows today's quote

3. **Quote state synchronization**
   - ✅ `isSaved` = `savedIds.includes(todayQuote.id)`
   - ✅ `isLiked` = `likedIds.includes(todayQuote.id)`
   - ✅ UI shows "Saved" indicator when quote is saved, but quote itself is not replaced

## Notes

- `getDailyQuoteAsync()` is safe because it falls back to `getDailyQuote()`, which now excludes saved quotes.
- `getQuoteByDay()` is safe because it uses API providers directly and doesn't include saved quotes.
- `getRandomQuote()` still includes saved quotes, which is intentional for random quote selection (not daily quotes).

## Impact

- **Breaking Changes**: None
- **Data Loss**: None (saved quotes remain in storage)
- **User Experience**: Fixed - Today quote no longer gets replaced by saved quotes
- **Performance**: No impact (actually slightly faster by not loading saved quotes unnecessarily)


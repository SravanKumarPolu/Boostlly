# How Quotes Are Fetched Every Day - Complete Flow

## Overview
The daily quote system uses a **dual-path architecture** with automatic day-change detection and intelligent caching.

## Two Fetching Paths

### 1. Primary Path: `getQuoteByDay()` (API-based)
**Location:** `packages/core/src/services/quote-service.ts` (lines 562-695)

**How it works:**
- Fetches quotes from external API providers (ZenQuotes, Quotable, FavQs, etc.)
- Uses day-based provider rotation (different provider each day)
- Implements fallback chain if primary provider fails
- Caches quote with date key: `dailyQuote` and `dailyQuoteDate`

**Key Features:**
- Checks cache first (unless `force=true`)
- Validates cached quote date matches today
- Automatically clears stale cache if date doesn't match
- Falls back to local quotes if all providers fail

### 2. Fallback Path: `getDailyQuote()` (Local-based)
**Location:** `packages/core/src/services/quote-service.ts` (lines 343-440)

**How it works:**
- Uses local quotes pool (shipped quotes + cached API quotes + user's saved quotes)
- Deterministic selection based on today's date
- Avoids showing quotes from last 7 days
- Always returns a quote (never fails)

**Key Features:**
- Synchronous (no async/await needed)
- Filters out recently shown quotes
- Uses date-based index for consistent selection
- Updates quote history to prevent repetition

## Day Change Detection

**Location:** `packages/features/src/components/today-tab.tsx` (lines 433-496)

The system automatically detects when a new day starts through multiple mechanisms:

### 1. **Initial Load Check** (lines 398-423)
- Runs when component mounts
- Checks if cached quote date matches today
- Fetches new quote if date changed

### 2. **Hourly Interval Check** (line 471)
```typescript
setInterval(checkAndRefreshQuote, 60 * 60 * 1000); // Every hour
```
- Checks every hour to catch midnight day changes
- Compares stored date with current date

### 3. **Visibility Change Detection** (lines 474-479)
```typescript
document.addEventListener('visibilitychange', handleVisibilityChange);
```
- Checks when page becomes visible (user returns after being away)
- Catches cases where user left tab open overnight

### 4. **Window Focus Detection** (lines 482-485)
```typescript
window.addEventListener('focus', handleFocus);
```
- Checks when window regains focus
- Ensures fresh quote when user returns to app

## Cache Management

### Cache Keys
- `dailyQuote` - The cached quote object
- `dailyQuoteDate` - Date key (YYYY-MM-DD format)
- Legacy keys also supported: `dayBasedQuote`, `dayBasedQuoteDate`

### Stale Cache Detection
Both `getQuoteByDay()` and `getDailyQuote()` check:
```typescript
if (storedDate && storedDate !== today) {
  // Clear stale cache immediately
  this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
  this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
}
```

## Complete Flow Diagram

```
User Opens App
    ↓
Component Mounts (today-tab.tsx)
    ↓
Check Cached Quote Date
    ↓
Is Date === Today?
    ├─ YES → Use Cached Quote ✅
    └─ NO → Fetch New Quote
            ↓
        Try getQuoteByDay() (API)
            ↓
        Provider Available?
            ├─ YES → Fetch from API → Cache → Return ✅
            └─ NO → Try Next Provider
                    ↓
                All Providers Failed?
                    ├─ YES → Fallback to getDailyQuote() (Local)
                    └─ NO → Continue trying providers
                            ↓
                        getDailyQuote()
                            ↓
                        Select from Local Pool → Cache → Return ✅
```

## Automatic Refresh Triggers

1. **On Mount** - Initial check when component loads
2. **Every Hour** - Interval check for day changes
3. **On Visibility** - When page becomes visible
4. **On Focus** - When window regains focus

## Key Code Locations

### Quote Fetching Logic
- **Primary API Path:** `packages/core/src/services/quote-service.ts:562` (`getQuoteByDay`)
- **Fallback Local Path:** `packages/core/src/services/quote-service.ts:343` (`getDailyQuote`)

### Day Change Detection
- **Auto-refresh Logic:** `packages/features/src/components/today-tab.tsx:433` (useEffect hook)
- **Initial Load:** `packages/features/src/components/today-tab.tsx:398` (loadDailyQuote function)

## Testing the Flow

### Force Refresh (Development)
Add `?force=1` to URL to bypass cache:
```
http://localhost:3000?force=1
```

### Verify Day Change Detection
1. Open browser console
2. Look for logs:
   - `[TodayTab] Date changed: YYYY-MM-DD -> YYYY-MM-DD, fetching fresh quote`
   - `[QuoteService.getQuoteByDay] ⚠️ STALE QUOTE! ... Clearing cache...`
   - `[QuoteService] ✅ All quote caches cleared. Will generate fresh quote for YYYY-MM-DD`

## Summary

✅ **Quotes fetch automatically** when:
- Component first loads
- Date changes (detected hourly, on visibility, or on focus)
- Cache is stale (date mismatch)

✅ **Two-tier system** ensures:
- Always returns a quote (never fails)
- Prefers fresh API quotes when available
- Falls back to local quotes reliably

✅ **Smart caching** prevents:
- Unnecessary API calls
- Showing same quote multiple times per day
- Showing quotes from previous days


# How the 7-Day Quote System Works

## Overview

The Boostlly app uses a sophisticated **7-day quote system** that ensures you get a fresh quote every day while avoiding repetition. The system has multiple layers of fallback to ensure you always get a quote, even when APIs fail.

---

## 🎯 How It Works - Step by Step

### 1. **Daily Quote Selection**

When you open the app, the system:

1. **Checks the date** - Gets today's date (YYYY-MM-DD format)
2. **Checks cache** - Looks for a cached quote from today
3. **If cached quote exists** → Shows it immediately ✅
4. **If no cached quote** → Fetches a new one

### 2. **7-Day Repetition Avoidance**

The system keeps track of quotes shown in the **last 7 days** and filters them out:

```typescript
// From quote-service.ts line 463
const recentQuotes = this.getRecentQuoteHistory(7); // Last 7 days

// Filter out recently shown quotes
availableQuotes = allQuotes.filter(quote => 
  !recentQuotes.some(recent => recent.id === quote.id)
);
```

**What this means:**
- ✅ You won't see the same quote twice within 7 days
- ✅ The system remembers what quotes were shown
- ✅ If you have many quotes, it filters out recent ones
- ✅ If you have few quotes, it uses all available quotes

---

## 🌐 What APIs Give Quotes?

The app uses **multiple quote APIs** with a day-based rotation system:

### Weekly Provider Schedule

| Day | Provider | API Endpoint | Description |
|-----|----------|--------------|-------------|
| **Sunday** | DummyJSON | Local (offline) | Fallback quotes for reliability |
| **Monday** | ZenQuotes | `https://zenquotes.io/api` | Zen wisdom quotes |
| **Tuesday** | Quotable | `https://api.quotable.io/random` | Large collection, no API key needed |
| **Wednesday** | FavQs | `https://favqs.com/api` | Midweek motivation |
| **Thursday** | Stoic Quotes | Various endpoints | Stoic philosophy quotes |
| **Friday** | QuoteGarden | `https://quotegarden.herokuapp.com` | Curated collection |
| **Saturday** | Programming Quotes | `https://programming-quotesapi.vercel.app/api/random` | Developer wisdom |

### All API Endpoints Used

1. **Quotable API**
   - URL: `https://api.quotable.io/random`
   - No API key required
   - Large database of quotes
   - Used: Tuesday

2. **ZenQuotes API**
   - URL: `https://zenquotes.io/api`
   - No API key required
   - Used: Monday

3. **FavQs API**
   - URL: `https://favqs.com/api`
   - May require API key
   - Used: Wednesday

4. **QuoteGarden API**
   - URL: `https://quotegarden.herokuapp.com`
   - Used: Friday

5. **Programming Quotes API**
   - URL: `https://programming-quotesapi.vercel.app/api/random`
   - Used: Saturday

6. **Stoic Quotes**
   - Various endpoints
   - Used: Thursday

7. **They Said So**
   - URL: `https://quotes.rest`
   - Used as fallback

---

## 🔄 Fallback System (When APIs Don't Work)

The system has **multiple layers of fallback** to ensure you always get a quote:

### Fallback Chain Order

```
1. Primary Provider (day-based)
   ↓ (if fails)
2. DummyJSON (local fallback)
   ↓ (if fails)
3. ZenQuotes
   ↓ (if fails)
4. Quotable
   ↓ (if fails)
5. FavQs
   ↓ (if fails)
6. QuoteGarden
   ↓ (if fails)
7. Stoic Quotes
   ↓ (if fails)
8. Programming Quotes
   ↓ (if fails)
9. They Said So
   ↓ (if all fail)
10. Local Quote Pool (getDailyQuote)
    ↓ (always succeeds)
11. Hardcoded Fallback Quote
```

### How Fallback Works

**Step 1: Try Primary Provider**
```typescript
// Gets today's provider (e.g., Monday = ZenQuotes)
const todaysProvider = getTodaysProvider();
const quote = await provider.random();
```

**Step 2: If Primary Fails, Try Fallback Chain**
```typescript
// Tries each provider in order until one succeeds
for (const provider of fallbackChain) {
  try {
    const quote = await provider.random();
    return quote; // Success!
  } catch (error) {
    continue; // Try next provider
  }
}
```

**Step 3: If All APIs Fail, Use Local Quotes**
```typescript
// Falls back to local quote pool
const localQuote = getDailyQuote();
// This always succeeds - uses bundled quotes
```

**Step 4: Final Fallback**
```typescript
// If everything fails, use hardcoded fallback quote
return getRandomFallbackQuote("motivation");
```

---

## 📦 Where Quotes Come From (If APIs Fail)

When APIs don't work, quotes come from:

### 1. **Bundled Quotes** (Local)
- Pre-installed quotes in the app
- Located in: `packages/core/src/utils/Boostlly.ts`
- Categories: motivation, success, wisdom, inspiration
- **Always available** - works offline

### 2. **Cached API Quotes**
- Quotes previously fetched from APIs
- Stored locally in browser storage
- Key: `quotes-cache`
- Enriches the quote pool over time

### 3. **User Saved Quotes**
- Quotes you've saved/favorited
- Stored in: `savedQuotes` in storage
- Added to the daily quote pool

### 4. **Hardcoded Fallback**
- Emergency fallback quotes
- Ensures you always get something
- Never fails

---

## 🔍 How to Check If APIs Are Working

### Method 1: Check Browser Console

Open Developer Tools (F12) and look for:

**✅ API Success:**
```
[QuoteService.getQuoteByDay] Day-based quote: Successfully fetched
source: "Quotable"
```

**⚠️ API Failure:**
```
Day-based quote: Provider Quotable failed, trying next
Day-based quote: All providers failed, using local fallback
```

### Method 2: Check Quote Source

```javascript
// In browser console
const quote = await quoteService.getQuoteByDay();
console.log('Quote source:', quote.source);
```

**If source is:**
- `"Quotable"`, `"ZenQuotes"`, `"FavQs"`, etc. → ✅ API worked
- `"local"`, `"Bundled"`, `"DummyJSON"` → ⚠️ API failed, using fallback

### Method 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to:
   - `api.quotable.io`
   - `zenquotes.io`
   - `favqs.com`
   - etc.
4. Check response status:
   - **200** = ✅ Success
   - **429** = ⚠️ Rate limited
   - **500/503** = ❌ Server error
   - **Failed/Timeout** = ❌ Network error

---

## 🎲 How Quote Selection Works (7-Day Logic)

### Date-Based Selection

The system uses today's date to select a quote deterministically:

```typescript
// From quote-service.ts line 1491-1507
private getQuoteIndexForDate(dateString: string): number {
  const date = new Date(dateString);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Combine multiple factors for variety
  const combined = (dayOfYear * 7 + year * 3 + month * 5 + day * 11 + 
                   Math.floor(date.getTime() / (1000 * 60 * 60 * 24)) * 13) % 1000;
  return combined;
}
```

**What this means:**
- Same date = Same quote (for all users)
- Different date = Different quote
- Uses date factors to create variety

### 7-Day History Filtering

```typescript
// Get quotes from last 7 days
const recentQuotes = getRecentQuoteHistory(7);

// Filter them out
availableQuotes = allQuotes.filter(quote => 
  !recentQuotes.some(recent => recent.id === quote.id)
);
```

**Logic:**
1. Get all available quotes
2. Get quotes shown in last 7 days
3. Remove recent quotes from pool
4. Select quote from remaining pool using date-based index

---

## 📝 Summary

### How It Works:
1. ✅ **Daily Selection** - One quote per day based on date
2. ✅ **7-Day Memory** - Remembers quotes from last 7 days
3. ✅ **No Repetition** - Filters out recent quotes
4. ✅ **Multiple APIs** - Different provider each day
5. ✅ **Smart Fallback** - Always returns a quote

### What APIs Are Used:
- **Quotable** (Tuesday) - `api.quotable.io`
- **ZenQuotes** (Monday) - `zenquotes.io`
- **FavQs** (Wednesday) - `favqs.com`
- **QuoteGarden** (Friday) - `quotegarden.herokuapp.com`
- **Programming Quotes** (Saturday) - `programming-quotesapi.vercel.app`
- **Stoic Quotes** (Thursday) - Various endpoints
- **They Said So** - Fallback only

### If APIs Don't Work:
1. ✅ Tries fallback providers in order
2. ✅ Uses cached API quotes (previously fetched)
3. ✅ Uses bundled local quotes (always available)
4. ✅ Uses user saved quotes
5. ✅ Final hardcoded fallback (never fails)

**Result: You always get a quote, even when offline or APIs fail!** 🎉

---

## 🔧 Code Locations

- **Main Quote Service**: `packages/core/src/services/quote-service.ts`
- **Day-Based Provider Selection**: `packages/core/src/utils/day-based-quotes.ts`
- **Quote Fetcher**: `packages/core/src/services/quote-fetcher.ts`
- **7-Day History Logic**: `packages/core/src/services/quote-service.ts:463` and `1514`
- **Fallback Quotes**: `packages/core/src/utils/Boostlly.ts`

---

**Last Updated**: 2024-01-15
**Status**: ✅ Fully Functional


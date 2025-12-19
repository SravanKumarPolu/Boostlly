# How to Check if Today's Quote is from API or Local

## Quick Answer

Every quote has a `source` property that tells you where it came from.

## How to Check

### Method 1: Check Browser Console

```javascript
// In browser console (F12)
const quote = JSON.parse(localStorage.getItem('dailyQuote'));
console.log('Quote source:', quote?.source);
console.log('Full quote:', quote);
```

### Method 2: Check Quote Object

The quote object has a `source` property:

```typescript
{
  text: "Dream bigger. Do bigger.",
  author: "Anonymous",
  source: "Quotable",  // ← This tells you the source!
  category: "motivation",
  // ... other properties
}
```

## Source Values

### ✅ API Sources (From External APIs)

| Source | Meaning | API Endpoint |
|--------|---------|--------------|
| `"Quotable"` | From Quotable API | `api.quotable.io` |
| `"ZenQuotes"` | From ZenQuotes API | `zenquotes.io` |
| `"FavQs"` | From FavQs API | `favqs.com` |
| `"QuoteGarden"` | From QuoteGarden API | `quotegarden.herokuapp.com` |
| `"Stoic Quotes"` | From Stoic Quotes API | Various endpoints |
| `"Programming Quotes"` | From Programming Quotes API | `programming-quotesapi.vercel.app` |
| `"They Said So"` | From They Said So API | `quotes.rest` |

### ❌ Local Sources (From Boostlly.ts or Bundled)

| Source | Meaning | Location |
|--------|---------|----------|
| `"DummyJSON"` | Local fallback quotes | `Boostlly.ts` |
| `"Bundled"` | Bundled quotes | `quotes.json` or `Boostlly.ts` |
| `"local"` | Local quotes | `Boostlly.ts` |
| `undefined` or `null` | No source set | Usually local fallback |

## Code Location

**File:** `packages/core/src/services/quote-service.ts`

**Line 750-753:** Quote source is set when fetched from API:
```typescript
const attributedQuote: Quote = {
  ...quote,
  source: providerSource,  // ← Sets source to provider name
};
```

**Line 796:** When all APIs fail, uses local fallback:
```typescript
const fallbackQuote = this.getDailyQuote(); // ← Local quote (no API source)
```

## How It Works

### Flow When API Works:

```
1. Try Primary Provider (e.g., Quotable)
   ↓ Success
2. Set source = "Quotable"
   ↓
3. Cache quote with source
   ↓
4. Return quote with source = "Quotable" ✅
```

### Flow When API Fails:

```
1. Try Primary Provider → ❌ Fails
2. Try Fallback Providers → ❌ All Fail
   ↓
3. Use getDailyQuote() (local fallback)
   ↓
4. Quote from Boostlly.ts
   ↓
5. Source = "DummyJSON" or undefined ❌
```

## Quick Check Script

Run this in browser console to check today's quote source:

```javascript
(function checkQuoteSource() {
  try {
    // Get cached quote
    const cachedQuote = localStorage.getItem('dailyQuote');
    const cachedDate = localStorage.getItem('dailyQuoteDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (!cachedQuote) {
      console.log('❌ No cached quote found');
      return;
    }
    
    const quote = JSON.parse(cachedQuote);
    
    console.log('📅 Date:', cachedDate);
    console.log('📅 Today:', today);
    console.log('📝 Quote:', quote.text?.substring(0, 50) + '...');
    console.log('👤 Author:', quote.author);
    console.log('🏷️  Source:', quote.source || 'Not set (likely local)');
    
    // Determine if API or local
    const apiSources = [
      'Quotable', 'ZenQuotes', 'FavQs', 'QuoteGarden', 
      'Stoic Quotes', 'Programming Quotes', 'They Said So'
    ];
    
    const isAPI = apiSources.includes(quote.source);
    
    if (isAPI) {
      console.log('✅ SOURCE: API (' + quote.source + ')');
    } else {
      console.log('❌ SOURCE: LOCAL (from Boostlly.ts)');
      console.log('   Reason: API failed or source not set');
    }
    
    // Check if date matches
    if (cachedDate !== today) {
      console.warn('⚠️  WARNING: Cached quote is from different date!');
    }
    
  } catch (error) {
    console.error('Error checking quote source:', error);
  }
})();
```

## Expected Output

### When API Works:
```
📅 Date: 2024-01-15
📅 Today: 2024-01-15
📝 Quote: Dream bigger. Do bigger....
👤 Author: Anonymous
🏷️  Source: Quotable
✅ SOURCE: API (Quotable)
```

### When API Fails:
```
📅 Date: 2024-01-15
📅 Today: 2024-01-15
📝 Quote: Success is not final, failure is not fatal....
👤 Author: Winston Churchill
🏷️  Source: DummyJSON
❌ SOURCE: LOCAL (from Boostlly.ts)
   Reason: API failed or source not set
```

## Check Network Tab

You can also check if API was called:

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to:
   - `api.quotable.io`
   - `zenquotes.io`
   - `favqs.com`
   - etc.

**If you see API requests:**
- ✅ Quote likely from API
- Check response status (200 = success)

**If no API requests:**
- ❌ Quote is from local fallback

## Summary

| Check | API Quote | Local Quote |
|-------|-----------|-------------|
| **quote.source** | "Quotable", "ZenQuotes", etc. | "DummyJSON", "Bundled", or undefined |
| **Network Tab** | Shows API requests | No API requests |
| **Console Logs** | "Successfully fetched" | "All providers failed, using local fallback" |

---

**Quick Test:** Run the script above in your browser console to instantly see if today's quote is from API or local!


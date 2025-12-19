# All API Endpoints Used in Boostlly

## Complete List of Quote API Endpoints

### 1. **Quotable API** (Tuesday)
**Base URL:** `https://api.quotable.io`

**Endpoints:**
- **Random Quote:** `GET https://api.quotable.io/random`
- **Search Quotes:** `GET https://api.quotable.io/search/quotes?query={query}&limit=10`
- **Quotes by Tag:** `GET https://api.quotable.io/quotes?tags={category}&limit=10`
- **Quotes by Author:** `GET https://api.quotable.io/quotes?author={author}&limit=10`

**Features:**
- ✅ No API key required
- ✅ Large database
- ✅ Free to use
- ✅ Timeout: 8 seconds

**Code Location:** `packages/core/src/services/providers/quotable.ts`

---

### 2. **ZenQuotes API** (Monday)
**Base URL:** `https://zenquotes.io/api`

**Endpoints:**
- **Today's Quote:** `GET https://zenquotes.io/api/today`

**Features:**
- ✅ No API key required
- ✅ Daily quote
- ✅ Free to use
- ✅ Timeout: 8 seconds

**Code Location:** `packages/core/src/services/providers/zenquotes.ts`

---

### 3. **FavQs API** (Wednesday)
**Base URL:** `https://favqs.com/api`

**Endpoints:**
- **Quote of the Day:** `GET https://favqs.com/api/qotd`
- **Search by Tag:** `GET https://favqs.com/api/quotes?filter={query}&type=tag`
- **Quotes by Category:** `GET https://favqs.com/api/quotes?filter={category}&type=tag`
- **Quotes by Author:** `GET https://favqs.com/api/quotes?filter={author}&type=author`

**Features:**
- ⚠️ May require API key (optional)
- ✅ Good quality quotes
- ✅ Timeout: 8 seconds

**Code Location:** `packages/core/src/services/providers/favqs.ts`

---

### 4. **QuoteGarden API** (Friday)
**Base URL:** `https://quote-garden.onrender.com/api/v3`

**Endpoints:**
- **Random Quote:** `GET https://quote-garden.onrender.com/api/v3/quotes/random`

**Features:**
- ✅ No API key required
- ✅ Curated collection
- ✅ Free to use
- ✅ Timeout: 8 seconds

**Note:** Also configured as `https://quotegarden.herokuapp.com` in constants

**Code Location:** `packages/core/src/services/providers/quotegarden.ts`

---

### 5. **Stoic Quotes API** (Thursday)
**Base URL:** `https://stoic-quotes.com/api`

**Endpoints:**
- **Random Quote:** `GET https://stoic-quotes.com/api/quote`

**Features:**
- ✅ No API key required
- ✅ Stoic philosophy quotes
- ✅ Free to use
- ✅ Timeout: 8 seconds

**Code Location:** `packages/core/src/services/providers/stoic-quotes.ts`

---

### 6. **Programming Quotes API** (Saturday)
**Base URL:** `https://programming-quotesapi.vercel.app/api`

**Endpoints:**
- **Random Quote:** `GET https://programming-quotesapi.vercel.app/api/random`

**Features:**
- ✅ No API key required
- ✅ Programming/tech quotes
- ✅ Free to use
- ✅ Default timeout

**Code Location:** `packages/core/src/services/providers/programming-quotes.ts`

---

### 7. **They Said So API** (Fallback)
**Base URL:** `https://quotes.rest`

**Endpoints:**
- **Quote of the Day (JSON):** `GET https://quotes.rest/qod.json`
- **Quote of the Day (EN):** `GET https://quotes.rest/qod?language=en`
- **Quote of the Day:** `GET https://quotes.rest/qod`

**Features:**
- ⚠️ Most endpoints require authentication
- ✅ Tries multiple endpoints
- ✅ Fallback quotes if API fails

**Code Location:** `packages/core/src/services/providers/theysaidso.ts`

---

### 8. **DummyJSON API** (Sunday / Fallback)
**Base URL:** `https://dummyjson.com`

**Endpoints:**
- **Random Quote:** `GET https://dummyjson.com/quotes/random`

**Features:**
- ✅ No API key required
- ✅ Used as local fallback
- ✅ Free to use

**Code Location:** `packages/core/src/services/providers/dummyjson.ts`

---

### 9. **Type.fit API** (Optional)
**Base URL:** `https://type.fit/api`

**Endpoints:**
- **All Quotes:** `GET https://type.fit/api/quotes`

**Features:**
- ✅ No API key required
- ✅ Returns all quotes at once
- ✅ Free to use

**Code Location:** `packages/core/src/services/providers/typefit.ts`

---

## Weekly Schedule Summary

| Day | Provider | Primary Endpoint |
|-----|----------|------------------|
| **Sunday** | DummyJSON | `https://dummyjson.com/quotes/random` |
| **Monday** | ZenQuotes | `https://zenquotes.io/api/today` |
| **Tuesday** | Quotable | `https://api.quotable.io/random` |
| **Wednesday** | FavQs | `https://favqs.com/api/qotd` |
| **Thursday** | Stoic Quotes | `https://stoic-quotes.com/api/quote` |
| **Friday** | QuoteGarden | `https://quote-garden.onrender.com/api/v3/quotes/random` |
| **Saturday** | Programming Quotes | `https://programming-quotesapi.vercel.app/api/random` |

---

## API Configuration

**File:** `packages/core/src/constants/index.ts`

```typescript
export const API_CONFIG = {
  QUOTABLE_BASE_URL: 'https://api.quotable.io',
  ZENQUOTES_BASE_URL: 'https://zenquotes.io/api',
  PROGRAMMING_QUOTES_BASE_URL: 'https://programming-quotesapi.vercel.app/api',
  QUOTEGARDEN_BASE_URL: 'https://quotegarden.herokuapp.com',
  FAVQS_BASE_URL: 'https://favqs.com/api',
  THEYSAIDSO_BASE_URL: 'https://quotes.rest',
  
  DEFAULT_TIMEOUT: 8000, // 8 seconds
  DEFAULT_RATE_LIMIT: 60, // per minute
  DEFAULT_CACHE_DURATION: 86400000, // 24 hours
}
```

---

## Testing Endpoints

### Test All APIs:

```javascript
// Run in browser console
const endpoints = [
  { name: 'Quotable', url: 'https://api.quotable.io/random' },
  { name: 'ZenQuotes', url: 'https://zenquotes.io/api/today' },
  { name: 'FavQs', url: 'https://favqs.com/api/qotd' },
  { name: 'QuoteGarden', url: 'https://quote-garden.onrender.com/api/v3/quotes/random' },
  { name: 'Stoic Quotes', url: 'https://stoic-quotes.com/api/quote' },
  { name: 'Programming Quotes', url: 'https://programming-quotesapi.vercel.app/api/random' },
  { name: 'DummyJSON', url: 'https://dummyjson.com/quotes/random' },
];

(async function testAPIs() {
  console.log('🧪 Testing All APIs...\n');
  
  for (const { name, url } of endpoints) {
    try {
      const start = Date.now();
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const time = Date.now() - start;
      
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ ${name}: Working (${time}ms)`);
        console.log(`   Response:`, data);
      } else {
        console.log(`❌ ${name}: Failed (${res.status})`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
    }
    console.log('');
  }
})();
```

---

## API Features Summary

| Provider | API Key Required | Rate Limit | Timeout | Status |
|----------|------------------|------------|---------|--------|
| Quotable | ❌ No | 60/min | 8s | ✅ Active |
| ZenQuotes | ❌ No | Unknown | 8s | ✅ Active |
| FavQs | ⚠️ Optional | Unknown | 8s | ✅ Active |
| QuoteGarden | ❌ No | Unknown | 8s | ✅ Active |
| Stoic Quotes | ❌ No | None | 8s | ✅ Active |
| Programming Quotes | ❌ No | Unknown | Default | ✅ Active |
| They Said So | ⚠️ Most endpoints | Unknown | Default | ⚠️ Limited |
| DummyJSON | ❌ No | Unknown | Default | ✅ Active |

---

## Fallback Behavior

If any API fails:
1. ✅ Tries next provider in fallback chain
2. ✅ Uses cached quotes (if available)
3. ✅ Falls back to local quotes from `Boostlly.ts`
4. ✅ App always works, even offline!

---

**Last Updated:** 2024-01-15  
**Total APIs:** 9 providers  
**Status:** ✅ All documented


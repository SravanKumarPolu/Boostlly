# How to Check if APIs Failed Today

## Quick Check Methods

### 1. **Check Browser Console Logs**

Open your browser's Developer Console (F12 or Cmd+Option+I) and look for these log messages:

#### ✅ **API Success Indicators:**
```
[QuoteService.getQuoteByDay] Day-based quote: Successfully fetched
Day-based quote: Fetching from today's provider
```

#### ⚠️ **API Failure Indicators:**
```
Day-based quote: Provider [ProviderName] failed, trying next
Day-based quote: All providers failed, using local fallback
[QuoteService] ⚠️ STALE QUOTE DETECTED!
```

### 2. **Check Quote Source**

Look at the quote object in console or check the quote's `source` property:

```javascript
// In browser console:
const quote = await quoteService.getQuoteByDay();
console.log('Quote source:', quote.source);
```

**Possible sources:**
- `"Quotable"`, `"ZenQuotes"`, `"FavQs"`, etc. = ✅ API worked
- `"local"`, `"Bundled"`, `"DummyJSON"` = ⚠️ API failed, using fallback

### 3. **Check API Health Status Programmatically**

```javascript
// In browser console or your code:
const quoteService = new QuoteService(storage);
const healthStatus = quoteService.getHealthStatus();

console.table(healthStatus);
// Shows: source, status (healthy/degraded/down), successRate, responseTime
```

### 4. **Use the Statistics Component**

If you have the Statistics component enabled, it shows API health status:
- Navigate to Statistics tab
- Look for "API Health Status" section
- Green = Healthy, Yellow = Degraded, Red = Down

### 5. **Check Network Tab**

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to:
   - `api.quotable.io`
   - `zenquotes.io`
   - `favqs.com`
   - `quotes.rest`
   - `theysaidso.com`
4. Check response status:
   - **200** = ✅ Success
   - **429** = ⚠️ Rate limited
   - **500/503** = ❌ Server error
   - **Failed/Timeout** = ❌ Network error

## Understanding the Fallback System

The system has **multiple layers of fallback**:

```
1. Primary Provider (day-based rotation)
   ↓ (if fails)
2. Fallback Provider Chain
   ↓ (if all fail)
3. Prefetched Quote (if available)
   ↓ (if not available)
4. Local Quote Pool (getDailyQuote)
   ↓ (always succeeds)
5. Hardcoded Fallback Quote
```

**Even if ALL APIs fail, you'll still get a quote!**

## Common Failure Scenarios

### Scenario 1: Single Provider Fails
```
✅ Primary provider fails
✅ System tries fallback providers
✅ One fallback succeeds
✅ Quote fetched successfully
```

### Scenario 2: All Providers Fail
```
❌ All API providers fail
✅ System uses local quote pool
✅ Quote still displayed (from local cache)
⚠️ Log shows: "All providers failed, using local fallback"
```

### Scenario 3: Network Issues
```
❌ Network timeout/error
✅ System automatically retries with next provider
✅ Falls back to local if all fail
```

## How to Force Test API Status

### Method 1: Force Refresh with URL Parameter
```
http://localhost:3000?force=1
```
This bypasses cache and forces fresh API calls.

### Method 2: Clear Cache and Reload
```javascript
// In browser console:
await quoteService.clearCache();
// Then reload the page
```

### Method 3: Check Specific Provider
```javascript
// Test a specific provider
const quote = await quoteService.randomFrom('Quotable');
console.log('Quotable API:', quote ? '✅ Working' : '❌ Failed');
```

## What to Look For in Logs

### Successful API Fetch:
```
[QuoteService.getQuoteByDay] Day-based quote: Fetching from today's provider
  provider: "Quotable"
  day: "Monday"
[QuoteService.getQuoteByDay] Day-based quote: Successfully fetched
  source: "Quotable"
  isPrimary: true
```

### API Failure (with Fallback):
```
Day-based quote: Provider Quotable failed, trying next
  provider: "Quotable"
  error: "Network error: Failed to fetch"
Day-based quote: Provider ZenQuotes failed, trying next
Day-based quote: All providers failed, using local fallback
```

### Using Cached Quote:
```
[QuoteService] Using cached quote from 2024-01-15 (timezone: local)
```

## Quick Diagnostic Script

Run this in your browser console to check API status:

```javascript
(async function checkAPIStatus() {
  const storage = window.localStorage; // or your storage service
  const { QuoteService } = await import('@boostlly/core');
  const quoteService = new QuoteService(storage);
  
  console.log('=== API Health Check ===');
  const health = quoteService.getHealthStatus();
  health.forEach(status => {
    const icon = status.status === 'healthy' ? '✅' : 
                 status.status === 'degraded' ? '⚠️' : '❌';
    console.log(`${icon} ${status.source}: ${status.status} (${status.successRate}% success)`);
  });
  
  console.log('\n=== Testing Quote Fetch ===');
  try {
    const quote = await quoteService.getQuoteByDay(true); // force refresh
    console.log('✅ Quote fetched successfully');
    console.log('Source:', quote.source);
    console.log('Text:', quote.text.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ Quote fetch failed:', error);
  }
})();
```

## Summary

**To check if APIs failed today:**

1. ✅ **Check console logs** for failure messages
2. ✅ **Check quote source** - if it's "local" or "Bundled", APIs likely failed
3. ✅ **Check health status** using `getHealthStatus()`
4. ✅ **Check Network tab** for failed API requests
5. ✅ **Remember**: Even if APIs fail, you'll still get a quote (from local pool)

**The system is designed to always work, even when APIs fail!**


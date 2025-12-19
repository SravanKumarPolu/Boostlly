# Why APIs Are Not Fetching - Diagnostic Guide

## Common Reasons APIs Don't Fetch

### 1. **Circuit Breaker is Open** ⚠️
**What it means:** Provider failed too many times, so it's temporarily disabled.

**Check:**
```javascript
// In browser console
const quoteService = new QuoteService(localStorage);
const healthStatus = quoteService.getHealthStatus();
console.table(healthStatus);
```

**Look for:** Status = "down" or circuit breaker state = "open"

**Fix:** Wait for circuit breaker to reset (usually 5-10 minutes) or clear circuit breaker state:
```javascript
// Clear circuit breaker (if accessible)
localStorage.removeItem('circuitBreakerState');
```

### 2. **Rate Limiting** ⚠️
**What it means:** Too many requests to API, temporarily blocked.

**Check:**
```javascript
const quoteService = new QuoteService(localStorage);
const healthStatus = quoteService.getHealthStatus();
// Look for rate_limited status
```

**Fix:** Wait a few minutes, then try again.

### 3. **Network/Internet Connection** ❌
**What it means:** No internet connection or network error.

**Check:**
```javascript
// Check if online
console.log('Online:', navigator.onLine);

// Check network tab in DevTools
// Look for failed requests (red)
```

**Fix:** Check your internet connection.

### 4. **API Provider Down** ❌
**What it means:** The external API server is down or unreachable.

**Check:**
```javascript
// Test API directly
fetch('https://api.quotable.io/random')
  .then(r => r.json())
  .then(d => console.log('✅ Quotable API works:', d))
  .catch(e => console.error('❌ Quotable API failed:', e));
```

**Fix:** Wait for API to come back online, or use local quotes.

### 5. **CORS/Network Blocking** ⚠️
**What it means:** Browser or network blocking API requests.

**Check:**
- Open DevTools → Network tab
- Look for CORS errors
- Check if requests are blocked

**Fix:** Check browser settings, VPN, or firewall.

### 6. **Provider Not Available Check** ⚠️
**What it means:** `isProviderAvailable()` returns false.

**Conditions that make provider unavailable:**
- Circuit breaker is open
- Rate limited
- Provider marked as unhealthy
- Provider not in enabled list

## Diagnostic Script

Run this in browser console to diagnose:

```javascript
(async function diagnoseAPI() {
  console.log('=== API DIAGNOSTIC ===\n');
  
  // 1. Check if online
  console.log('1. Network Status:');
  console.log('   Online:', navigator.onLine ? '✅' : '❌');
  console.log('   Connection:', navigator.connection?.effectiveType || 'Unknown');
  
  // 2. Check cached quote
  console.log('\n2. Current Quote:');
  const cachedQuote = localStorage.getItem('dailyQuote');
  if (cachedQuote) {
    const quote = JSON.parse(cachedQuote);
    console.log('   Source:', quote.source || 'Not set');
    console.log('   Is API:', ['Quotable', 'ZenQuotes', 'FavQs'].includes(quote.source) ? '✅' : '❌');
  } else {
    console.log('   No cached quote');
  }
  
  // 3. Test APIs directly
  console.log('\n3. Testing APIs:');
  
  const testAPI = async (name, url) => {
    try {
      const start = Date.now();
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const time = Date.now() - start;
      if (res.ok) {
        console.log(`   ${name}: ✅ Working (${time}ms)`);
        return true;
      } else {
        console.log(`   ${name}: ❌ Failed (${res.status})`);
        return false;
      }
    } catch (error) {
      console.log(`   ${name}: ❌ Error - ${error.message}`);
      return false;
    }
  };
  
  await testAPI('Quotable', 'https://api.quotable.io/random');
  await testAPI('ZenQuotes', 'https://zenquotes.io/api/today');
  
  // 4. Check QuoteService health
  console.log('\n4. QuoteService Health:');
  try {
    // Import QuoteService if available
    if (typeof window !== 'undefined' && window.QuoteService) {
      const quoteService = new window.QuoteService(localStorage);
      const health = quoteService.getHealthStatus();
      console.table(health);
    } else {
      console.log('   QuoteService not available in window');
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  // 5. Check Network Tab
  console.log('\n5. Network Requests:');
  console.log('   Open DevTools → Network tab to see API requests');
  console.log('   Look for:');
  console.log('   - Failed requests (red)');
  console.log('   - CORS errors');
  console.log('   - Timeout errors');
  console.log('   - 429 (rate limit) errors');
  
  console.log('\n=== END DIAGNOSTIC ===');
})();
```

## Quick Fixes

### Fix 1: Clear Circuit Breaker
```javascript
// Clear all circuit breaker states
Object.keys(localStorage).forEach(key => {
  if (key.includes('circuit') || key.includes('breaker')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```

### Fix 2: Force API Fetch
```javascript
// Force refresh quote (bypasses cache)
const url = new URL(window.location.href);
url.searchParams.set('force', '1');
window.location.href = url.toString();
```

### Fix 3: Check Environment Variables
```javascript
// Check if API is disabled
console.log('ENABLE_API:', process.env.NEXT_PUBLIC_ENABLE_API);
// Should be 'true' or undefined (not 'false')
```

### Fix 4: Reset Rate Limiter
```javascript
// Clear rate limiter state
Object.keys(localStorage).forEach(key => {
  if (key.includes('rate') || key.includes('limit')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```

## Why It Works Offline

The app works offline because:

1. **Local Fallback Quotes** - `Boostlly.ts` has hundreds of hardcoded quotes
2. **Cached Quotes** - Previously fetched quotes are stored locally
3. **Graceful Degradation** - System automatically falls back to local quotes when APIs fail

## Expected Behavior

**When APIs Work:**
- Quote source = "Quotable", "ZenQuotes", etc.
- Badge shows: 🌐 From [Provider]
- Network tab shows successful API requests

**When APIs Fail:**
- Quote source = "DummyJSON", "Bundled", or undefined
- Badge shows: 📦 Local Quote
- Network tab shows failed/blocked requests
- App still works with local quotes ✅

## Summary

| Issue | Symptom | Fix |
|-------|---------|-----|
| Circuit Breaker Open | Provider skipped | Wait 5-10 min or clear state |
| Rate Limited | 429 errors | Wait a few minutes |
| No Internet | Network errors | Check connection |
| API Down | All providers fail | Use local quotes (automatic) |
| CORS Blocked | CORS errors | Check browser/network settings |

---

**Run the diagnostic script above to identify the exact issue!**


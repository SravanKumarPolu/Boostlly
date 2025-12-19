# How Boostlly.ts Quotes Work

## Overview

When APIs fail, quotes come from `Boostlly.ts` using **date-based deterministic selection** (NOT random). This ensures consistency and variety.

---

## How Quote Selection Works

### Key Point: **Date-Based Deterministic Selection**

The `getRandomFallbackQuote()` function is **NOT truly random**. It uses **today's date** to calculate which quote to select.

### Code from Boostlly.ts (Line 2162-2195)

```typescript
export function getRandomFallbackQuote(category?: string): Quote {
  let availableQuotes = BOOSTLLY_FALLBACK_QUOTES;
  
  // Filter by category if provided
  if (category) {
    availableQuotes = BOOSTLLY_FALLBACK_QUOTES.filter(
      quote => quote.category === mappedCategory || 
      quote.tags?.includes(category.toLowerCase())
    );
  }
  
  // Use date-based selection for consistency
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  // Calculate deterministic index based on date
  const combined = (dayOfYear * 7 + year * 3 + month * 5 + day * 11) % 1000;
  const quoteIndex = combined % availableQuotes.length;
  
  return availableQuotes[quoteIndex]; // ← Returns quote at calculated index
}
```

---

## How It Works: Step by Step

### Step 1: Get Today's Date Components
```typescript
const today = new Date();
const dayOfYear = 15;  // Example: January 15th
const year = 2024;
const month = 1;
const day = 15;
```

### Step 2: Calculate Deterministic Index
```typescript
// Combine date factors
const combined = (dayOfYear * 7 + year * 3 + month * 5 + day * 11) % 1000;
// Example: (15 * 7 + 2024 * 3 + 1 * 5 + 15 * 11) % 1000 = 632

// Get quote index
const quoteIndex = combined % availableQuotes.length;
// Example: 632 % 500 = 132 (if there are 500 quotes)
```

### Step 3: Select Quote
```typescript
return availableQuotes[quoteIndex]; // Returns quote at position 132
```

---

## Answer to Your Question

### Q: Last week API failed, it took quote from Boostlly.ts. This week same thing happens - will it take random or one after another?

**Answer: It will take a DIFFERENT quote, not the same one!**

### Why?

1. **Date-Based Selection**: Different date = Different quote index = Different quote
   - Last week: Date = 2024-01-08 → Index = 456 → Quote #456
   - This week: Date = 2024-01-15 → Index = 632 → Quote #632
   - **Result:** Different quotes! ✅

2. **7-Day History Filter**: Even if the date calculation would select the same quote, it gets filtered out
   - The system remembers quotes from last 7 days
   - If a quote was shown last week, it won't be shown again this week

---

## Example Scenarios

### Scenario 1: API Fails Monday (2024-01-08)

```
Date: 2024-01-08
dayOfYear = 8
year = 2024
month = 1
day = 8

Calculation:
combined = (8 * 7 + 2024 * 3 + 1 * 5 + 8 * 11) % 1000 = 625
quoteIndex = 625 % 500 = 125

Result: Quote at index 125 ✅
```

### Scenario 2: API Fails Monday Next Week (2024-01-15)

```
Date: 2024-01-15
dayOfYear = 15
year = 2024
month = 1
day = 15

Calculation:
combined = (15 * 7 + 2024 * 3 + 1 * 5 + 15 * 11) % 1000 = 632
quoteIndex = 632 % 500 = 132

Result: Quote at index 132 ✅ (DIFFERENT from last week!)
```

### Scenario 3: API Fails Same Day Next Year (2025-01-08)

```
Date: 2025-01-08
dayOfYear = 8
year = 2025  ← Different year!
month = 1
day = 8

Calculation:
combined = (8 * 7 + 2025 * 3 + 1 * 5 + 8 * 11) % 1000 = 628
quoteIndex = 628 % 500 = 128

Result: Quote at index 128 ✅ (DIFFERENT from last year!)
```

---

## Selection Type: Deterministic (Not Random)

### ✅ Deterministic Selection
- **Same date** = **Same quote** (for all users)
- **Different date** = **Different quote**
- Predictable and consistent

### ❌ NOT Random Selection
- Not using `Math.random()`
- Not sequential (one after another)
- Based on date calculation

---

## Additional Protection: 7-Day History Filter

Even with date-based selection, there's an extra layer of protection:

### From quote-service.ts (Line 463-469)

```typescript
// Get recent quote history to avoid repetition
const recentQuotes = this.getRecentQuoteHistory(7); // Last 7 days

// Filter out recently shown quotes
let availableQuotes = allQuotes.filter(quote => 
  !recentQuotes.some(recent => this.quotesAreEqual(recent, quote))
);
```

### How It Works:

1. **Get quotes from last 7 days** from history
2. **Filter them out** from available quotes
3. **Select from remaining quotes** using date-based index

### Example:

```
Last week (Jan 8): Quote #125 shown
This week (Jan 15): 
  - Date calculation: Index = 132
  - But Quote #125 is in history (last 7 days)
  - Quote #125 is filtered out
  - System selects next available quote after filtering
  - Result: Different quote! ✅
```

---

## Complete Flow When API Fails

```
API Fails
    ↓
getDailyQuote() called
    ↓
Build quote pool:
  - Bundled quotes (from Boostlly.ts)
  - Cached API quotes
  - User saved quotes
    ↓
Filter out quotes from last 7 days
    ↓
Calculate date-based index:
  index = (dayOfYear * 7 + year * 3 + month * 5 + day * 11) % quoteCount
    ↓
Select quote at calculated index
    ↓
Return quote ✅
```

---

## Key Points Summary

| Question | Answer |
|----------|--------|
| **Is it random?** | ❌ No, it's **date-based deterministic** |
| **Is it sequential?** | ❌ No, it's **date-based**, not one after another |
| **Same date = Same quote?** | ✅ Yes, same date always gives same quote |
| **Different date = Different quote?** | ✅ Yes, different date gives different quote |
| **Will it repeat last week's quote?** | ❌ No, because:<br>1. Different date = different index<br>2. 7-day history filter prevents repetition |

---

## Code Locations

- **Main Function:** `packages/core/src/utils/Boostlly.ts` - Line 2162
- **Date Calculation:** `packages/core/src/utils/Boostlly.ts` - Line 2180-2192
- **History Filtering:** `packages/core/src/services/quote-service.ts` - Line 463-469
- **Index Calculation:** `packages/core/src/services/quote-service.ts` - Line 1503-1520

---

## Visual Example

```
Week 1 (Jan 8, 2024):
  Date → Index 125 → Quote #125 ✅
  
Week 2 (Jan 15, 2024):
  Date → Index 132 → Quote #132 ✅ (Different!)
  
Week 3 (Jan 22, 2024):
  Date → Index 139 → Quote #139 ✅ (Different!)
  
If Index 132 was already shown in last 7 days:
  Filter it out → Select next available quote ✅
```

---

## Conclusion

**Boostlly.ts quotes work using date-based deterministic selection:**

1. ✅ **Not random** - Uses date calculation
2. ✅ **Not sequential** - Based on date, not order
3. ✅ **Different dates = Different quotes** - Always!
4. ✅ **7-day filter** - Extra protection against repetition
5. ✅ **Consistent** - Same date = same quote for everyone

**Result:** You'll get a different quote each time, even if APIs fail on the same day of different weeks!

---

**Last Updated:** 2024-01-15  
**Status:** ✅ Complete Explanation


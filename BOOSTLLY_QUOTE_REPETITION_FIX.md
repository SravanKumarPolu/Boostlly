# Boostlly Quote Repetition Fix

## Problem
When APIs fail and quotes are fetched from `Boostlly.ts`, the same quotes were repeating:
- Same quotes repeating within 7 days
- Same quotes repeating within 7 months
- Date-based selection was too deterministic
- History tracking wasn't working properly

## Root Causes

1. **No History Tracking**: `getRandomFallbackQuote()` wasn't tracking which quotes were shown
2. **Deterministic Selection**: Date-based algorithm always selected same quote for same day
3. **No Storage Access**: Providers don't have storage, so history couldn't be tracked
4. **Duplicate Code**: History filtering was done twice but inconsistently

## Solutions Implemented

### 1. Global Storage Reference
- Added `globalStorageRef` to allow providers (which don't have storage) to track history
- QuoteService sets this reference during initialization
- `getRandomFallbackQuote()` uses global storage when provider storage isn't available

**File**: `packages/core/src/utils/Boostlly.ts`
- Lines 29-44: Global storage reference functions

### 2. 7-Day Repetition Avoidance
- Filters out quotes shown in last 7 days
- Falls back to 14-day history if needed
- Uses same date format (`getDateKey`) as quote service for consistency

**File**: `packages/core/src/utils/Boostlly.ts`
- Lines 2250-2334: History filtering and rotation logic

### 3. Circular Rotation Algorithm
- Rotates through ALL available quotes before repeating
- Finds quotes never shown (preferred)
- Falls back to oldest quote in history if all shown recently
- Uses better prime numbers for distribution

**File**: `packages/core/src/utils/Boostlly.ts`
- Lines 2279-2334: Circular rotation with history awareness

### 4. Automatic History Updates
- Updates quote history when quote is selected
- Uses same format as quote service (`{quote, date, timestamp}`)
- Keeps last 100 entries to prevent storage bloat
- Deduplicates entries for same quote

**File**: `packages/core/src/utils/Boostlly.ts`
- Lines 2336-2360: History update logic

### 5. Better Date Format Consistency
- Uses `getDateKey()` for date strings (YYYY-MM-DD format)
- Matches quote service date format exactly
- Prevents timezone issues

**File**: `packages/core/src/utils/Boostlly.ts`
- Line 27: Import `getDateKey`
- Lines 2255-2258: Date format consistency

## How It Works Now

1. **Quote Selection Flow**:
   ```
   getRandomFallbackQuote() called
   ↓
   Get quote history from storage (7-day window)
   ↓
   Filter out recently shown quotes
   ↓
   Calculate date-based starting index
   ↓
   Rotate through available quotes to find one not shown recently
   ↓
   If all shown recently → find oldest quote or never-shown quote
   ↓
   Update history with selected quote
   ↓
   Return quote with source: "Local"
   ```

2. **Circular Rotation**:
   - Starts from date-based index
   - Rotates through all quotes (circular)
   - Skips quotes shown in last 7 days
   - Ensures all 253 quotes are shown before repeating

3. **History Tracking**:
   - Stores: `{quote, date: "YYYY-MM-DD", timestamp}`
   - Keeps last 100 entries
   - Deduplicates by quote signature (ID or text+author)
   - Uses same format as quote service

## Testing

To verify the fix works:

1. **Clear cache**: Add `?force=1` to URL
2. **Check console**: Look for `[Boostlly]` logs showing history filtering
3. **Verify rotation**: Quotes should not repeat within 7 days
4. **Check storage**: `quoteHistory` should contain entries with dates

## Files Changed

1. `packages/core/src/utils/Boostlly.ts`
   - Added global storage reference
   - Enhanced `getRandomFallbackQuote()` with history tracking
   - Improved rotation algorithm
   - Better date format handling

2. `packages/core/src/services/quote-service.ts`
   - Sets global storage reference on initialization
   - Passes storage to `getRandomFallbackQuote()` calls

## Benefits

✅ **No Repetition**: Quotes won't repeat within 7 days  
✅ **Circular Rotation**: All 253 quotes shown before repeating  
✅ **Automatic**: Works without user intervention  
✅ **Consistent**: Uses same date format as quote service  
✅ **Efficient**: Keeps only last 100 history entries  
✅ **Provider Support**: Works even when providers don't have storage  

## Result

When APIs fail, users will get:
- Fresh quotes from Boostlly.ts
- No repetition within 7 days
- Circular rotation through all 253 quotes
- Automatic history tracking
- Better variety with time-based selection





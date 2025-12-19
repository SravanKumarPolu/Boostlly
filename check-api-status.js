/**
 * Quick API Status Checker
 * 
 * Run this in your browser console to check if APIs are working today
 * 
 * Usage:
 * 1. Open your app in browser
 * 2. Open Developer Console (F12 or Cmd+Option+I)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 */

(async function checkAPIStatus() {
  console.log('🔍 Checking API Status...\n');
  
  try {
    // Try to access QuoteService (adjust import path based on your setup)
    let QuoteService;
    let storage;
    
    // Try different ways to access QuoteService
    if (typeof window !== 'undefined') {
      // For web app - try to get from window or import
      if (window.QuoteService) {
        QuoteService = window.QuoteService;
      } else {
        // Try dynamic import
        try {
          const module = await import('@boostlly/core');
          QuoteService = module.QuoteService;
        } catch (e) {
          console.warn('Could not import QuoteService. Make sure you run this in the app context.');
          return;
        }
      }
      
      // Get storage (adjust based on your storage implementation)
      storage = window.localStorage || {
        getSync: (key) => {
          try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : null;
          } catch {
            return localStorage.getItem(key);
          }
        },
        setSync: (key, val) => {
          try {
            localStorage.setItem(key, JSON.stringify(val));
          } catch {
            localStorage.setItem(key, val);
          }
        }
      };
    } else {
      console.error('This script must be run in a browser environment');
      return;
    }
    
    const quoteService = new QuoteService(storage);
    
    // Check 1: Health Status
    console.log('📊 API Health Status:');
    console.log('─'.repeat(50));
    const healthStatus = quoteService.getHealthStatus();
    
    if (healthStatus && healthStatus.length > 0) {
      healthStatus.forEach(status => {
        const icon = status.status === 'healthy' ? '✅' : 
                     status.status === 'degraded' ? '⚠️' : '❌';
        const statusColor = status.status === 'healthy' ? 'green' : 
                            status.status === 'degraded' ? 'orange' : 'red';
        console.log(
          `%c${icon} ${status.source}`,
          `color: ${statusColor}; font-weight: bold`,
          `- ${status.status} (${status.successRate.toFixed(1)}% success, ${status.responseTime}ms)`
        );
      });
    } else {
      console.warn('⚠️ No health status data available');
    }
    
    console.log('\n');
    
    // Check 2: Try fetching today's quote
    console.log('📝 Testing Quote Fetch:');
    console.log('─'.repeat(50));
    
    try {
      const quote = await quoteService.getQuoteByDay(true); // Force fresh fetch
      console.log('✅ Quote fetched successfully!');
      console.log('   Source:', quote.source);
      console.log('   Text:', quote.text.substring(0, 60) + '...');
      console.log('   Author:', quote.author || 'Unknown');
      
      // Determine if API worked
      const apiSources = ['Quotable', 'ZenQuotes', 'FavQs', 'TheySaidSo', 'QuoteGarden', 'StoicQuotes', 'ProgrammingQuotes'];
      const isFromAPI = apiSources.includes(quote.source);
      
      if (isFromAPI) {
        console.log('\n✅ SUCCESS: Quote came from API provider');
      } else {
        console.log('\n⚠️ FALLBACK: Quote came from local cache/fallback');
        console.log('   This means APIs may have failed, but system still works!');
      }
    } catch (error) {
      console.error('❌ Failed to fetch quote:', error);
      console.log('   This indicates a problem with the quote service');
    }
    
    // Check 3: Check cached quote
    console.log('\n💾 Cache Status:');
    console.log('─'.repeat(50));
    const cachedQuote = storage.getSync('dailyQuote');
    const cachedDate = storage.getSync('dailyQuoteDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (cachedQuote && cachedDate) {
      console.log('📦 Cached quote found');
      console.log('   Date:', cachedDate);
      console.log('   Today:', today);
      console.log('   Source:', cachedQuote.source);
      console.log('   Status:', cachedDate === today ? '✅ Fresh (today)' : '⚠️ Stale (old date)');
    } else {
      console.log('📭 No cached quote found');
    }
    
    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📋 SUMMARY:');
    console.log('─'.repeat(50));
    
    const healthyCount = healthStatus?.filter(h => h.status === 'healthy').length || 0;
    const totalCount = healthStatus?.length || 0;
    
    if (healthyCount === totalCount && totalCount > 0) {
      console.log('✅ All APIs are healthy!');
    } else if (healthyCount > 0) {
      console.log(`⚠️ ${healthyCount}/${totalCount} APIs are healthy`);
      console.log('   Some APIs may be down, but fallback system is working');
    } else {
      console.log('❌ No APIs are currently healthy');
      console.log('   System is using local fallback quotes');
    }
    
    console.log('\n💡 Tip: Check browser Network tab for detailed API request status');
    
  } catch (error) {
    console.error('❌ Error checking API status:', error);
    console.log('\n💡 Make sure you run this script in the browser console');
    console.log('   while your Boostlly app is loaded');
  }
})();


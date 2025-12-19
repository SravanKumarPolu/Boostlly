/**
 * API Status Checker Utility
 * 
 * Helper functions to check if APIs are working and get health status
 */

import { QuoteService } from '@boostlly/core';
import { Quote } from '@boostlly/core';

/**
 * Check if a quote came from an API provider or fallback
 */
export function isQuoteFromAPI(quote: Quote): boolean {
  const apiSources = [
    'Quotable',
    'ZenQuotes',
    'FavQs',
    'TheySaidSo',
    'QuoteGarden',
    'StoicQuotes',
    'ProgrammingQuotes',
  ];
  return apiSources.includes(quote.source || '');
}

/**
 * Get API status summary
 */
export async function checkAPIStatus(quoteService: QuoteService): Promise<{
  quoteSource: string;
  isFromAPI: boolean;
  healthStatus: any[];
  healthyCount: number;
  totalCount: number;
  status: 'all_healthy' | 'some_down' | 'all_down';
}> {
  try {
    // Get current quote
    const quote = await (quoteService as any).getQuoteByDay?.() || 
                 await (quoteService as any).getDailyQuoteAsync?.() ||
                 quoteService.getDailyQuote();
    
    // Get health status
    const healthStatus = quoteService.getHealthStatus();
    const healthyCount = healthStatus.filter(h => h.status === 'healthy').length;
    const totalCount = healthStatus.length;
    
    let status: 'all_healthy' | 'some_down' | 'all_down';
    if (healthyCount === totalCount && totalCount > 0) {
      status = 'all_healthy';
    } else if (healthyCount > 0) {
      status = 'some_down';
    } else {
      status = 'all_down';
    }
    
    return {
      quoteSource: quote.source || 'unknown',
      isFromAPI: isQuoteFromAPI(quote),
      healthStatus,
      healthyCount,
      totalCount,
      status,
    };
  } catch (error) {
    console.error('[checkAPIStatus] Error:', error);
    return {
      quoteSource: 'error',
      isFromAPI: false,
      healthStatus: [],
      healthyCount: 0,
      totalCount: 0,
      status: 'all_down',
    };
  }
}

/**
 * Log API status to console (for debugging)
 */
export async function logAPIStatus(quoteService: QuoteService): Promise<void> {
  const status = await checkAPIStatus(quoteService);
  
  console.log('=== API Status Check ===');
  console.log(`Quote Source: ${status.quoteSource}`);
  console.log(`From API: ${status.isFromAPI ? '✅ Yes' : '⚠️ No (using fallback)'}`);
  console.log(`Status: ${status.status}`);
  console.log(`Healthy APIs: ${status.healthyCount}/${status.totalCount}`);
  
  if (status.healthStatus.length > 0) {
    console.log('\nProvider Health:');
    status.healthStatus.forEach(health => {
      const icon = health.status === 'healthy' ? '✅' : 
                   health.status === 'degraded' ? '⚠️' : '❌';
      console.log(`  ${icon} ${health.source}: ${health.status} (${health.successRate.toFixed(1)}% success)`);
    });
  }
}


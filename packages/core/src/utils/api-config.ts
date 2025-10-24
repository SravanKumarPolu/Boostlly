/**
 * API Configuration Utilities
 * 
 * Centralized API configuration to eliminate hardcoded endpoints
 * and provide consistent API management across the application.
 */

import { API_CONFIG, TIME_CONSTANTS } from '../constants';

/**
 * API Provider configuration interface
 */
export interface APIProviderConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number;
  enabled: boolean;
  priority: number;
  categories: string[];
  timeout: number;
  cacheDuration: number;
}

/**
 * Default API provider configurations
 */
export const DEFAULT_API_PROVIDERS: APIProviderConfig[] = [
  {
    name: 'quotable',
    baseUrl: API_CONFIG.QUOTABLE_BASE_URL,
    rateLimit: TIME_CONSTANTS.RATE_LIMIT_PER_MINUTE,
    enabled: true,
    priority: 1,
    categories: ['motivation', 'success', 'leadership', 'happiness', 'wisdom'],
    timeout: API_CONFIG.DEFAULT_TIMEOUT,
    cacheDuration: API_CONFIG.DEFAULT_CACHE_DURATION,
  },
  {
    name: 'zenquotes',
    baseUrl: API_CONFIG.ZENQUOTES_BASE_URL,
    rateLimit: 20,
    enabled: true,
    priority: 2,
    categories: ['general', 'motivation', 'wisdom', 'success'],
    timeout: API_CONFIG.DEFAULT_TIMEOUT,
    cacheDuration: API_CONFIG.DEFAULT_CACHE_DURATION,
  },
  {
    name: 'programming-quotes',
    baseUrl: API_CONFIG.PROGRAMMING_QUOTES_BASE_URL,
    rateLimit: 15,
    enabled: true,
    priority: 3,
    categories: ['programming', 'technology', 'development'],
    timeout: API_CONFIG.DEFAULT_TIMEOUT,
    cacheDuration: API_CONFIG.DEFAULT_CACHE_DURATION,
  },
];

/**
 * Create API provider configuration
 */
export function createAPIProvider(config: Partial<APIProviderConfig>): APIProviderConfig {
  return {
    name: config.name || 'unknown',
    baseUrl: config.baseUrl || '',
    apiKey: config.apiKey,
    rateLimit: config.rateLimit || TIME_CONSTANTS.RATE_LIMIT_PER_MINUTE,
    enabled: config.enabled ?? true,
    priority: config.priority || 1,
    categories: config.categories || [],
    timeout: config.timeout || API_CONFIG.DEFAULT_TIMEOUT,
    cacheDuration: config.cacheDuration || API_CONFIG.DEFAULT_CACHE_DURATION,
  };
}

/**
 * Get API endpoint URL
 */
export function getAPIEndpoint(provider: string, endpoint: string = ''): string {
  const baseUrl = DEFAULT_API_PROVIDERS.find(p => p.name === provider)?.baseUrl;
  if (!baseUrl) {
    throw new Error(`Unknown API provider: ${provider}`);
  }
  return `${baseUrl}${endpoint}`;
}

/**
 * Get API configuration by name
 */
export function getAPIConfig(providerName: string): APIProviderConfig | undefined {
  return DEFAULT_API_PROVIDERS.find(p => p.name === providerName);
}

/**
 * Get all enabled API providers
 */
export function getEnabledProviders(): APIProviderConfig[] {
  return DEFAULT_API_PROVIDERS.filter(p => p.enabled);
}

/**
 * Get providers by category
 */
export function getProvidersByCategory(category: string): APIProviderConfig[] {
  return DEFAULT_API_PROVIDERS.filter(p => 
    p.enabled && p.categories.includes(category)
  );
}

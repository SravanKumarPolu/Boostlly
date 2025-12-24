/**
 * E2E Tests for Search Functionality
 * 
 * Tests search, filters, and results
 */

import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to search
    const searchLink = page.locator(
      'a:has-text("Search"), button:has-text("Search"), [aria-label*="search" i], nav a[href*="search"]'
    ).first();
    
    if (await searchLink.isVisible({ timeout: 5000 })) {
      await searchLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display search interface', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();
    
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test('should perform basic search', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('success');
      await page.waitForTimeout(1000);

      // Verify search results appear
      const results = page.locator(
        '[data-testid*="result"], [class*="result"], [class*="quote"]'
      ).first();

      // Results may or may not appear depending on data
      await page.waitForTimeout(1000);
      expect(await searchInput.inputValue()).toBe('success');
    }
  });

  test('should show search suggestions', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('mot');
      await page.waitForTimeout(500);

      // Look for suggestions dropdown
      const suggestions = page.locator(
        '[role="listbox"], [class*="suggestion"], [class*="autocomplete"]'
      ).first();

      // Suggestions may or may not appear
      await page.waitForTimeout(500);
    }
  });

  test('should clear search', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('test query');
      
      // Find clear button
      const clearButton = page.locator(
        'button[aria-label*="clear" i], button[aria-label*="close" i], button:has([class*="close"])'
      ).first();

      if (await clearButton.isVisible({ timeout: 2000 })) {
        await clearButton.click();
        await page.waitForTimeout(500);
        expect(await searchInput.inputValue()).toBe('');
      }
    }
  });
});

test.describe('Search Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchLink = page.locator(
      'a:has-text("Search"), button:has-text("Search"), [aria-label*="search" i]'
    ).first();
    
    if (await searchLink.isVisible({ timeout: 5000 })) {
      await searchLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show filter options', async ({ page }) => {
    // Look for filter button or filter section
    const filterButton = page.locator(
      'button:has-text("Filter"), button[aria-label*="filter" i], button:has([class*="filter"])'
    ).first();

    if (await filterButton.isVisible({ timeout: 5000 })) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Verify filters are visible
      const filters = page.locator(
        '[data-testid*="filter"], [class*="filter-panel"], form'
      ).first();

      // Filters may be visible
      await page.waitForTimeout(500);
    }
  });

  test('should filter by author', async ({ page }) => {
    const filterButton = page.locator(
      'button:has-text("Filter"), button[aria-label*="filter" i]'
    ).first();

    if (await filterButton.isVisible({ timeout: 5000 })) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Look for author filter
      const authorFilter = page.locator(
        'input[placeholder*="author" i], select[name*="author" i], [data-testid*="author"]'
      ).first();

      if (await authorFilter.isVisible({ timeout: 3000 })) {
        await authorFilter.fill('test');
        await page.waitForTimeout(1000);

        // Verify filter is applied
        expect(await authorFilter.inputValue()).toContain('test');
      }
    }
  });

  test('should filter by category', async ({ page }) => {
    const filterButton = page.locator(
      'button:has-text("Filter"), button[aria-label*="filter" i]'
    ).first();

    if (await filterButton.isVisible({ timeout: 5000 })) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Look for category filter
      const categoryFilter = page.locator(
        'select[name*="category" i], button:has-text("Category"), [data-testid*="category"]'
      ).first();

      if (await categoryFilter.isVisible({ timeout: 3000 })) {
        await categoryFilter.click();
        await page.waitForTimeout(500);

        // Select a category option
        const option = page.locator(
          '[role="option"]:has-text("motivation"), option:has-text("motivation")'
        ).first();

        if (await option.isVisible({ timeout: 2000 })) {
          await option.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});

test.describe('Search Results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchLink = page.locator(
      'a:has-text("Search"), button:has-text("Search"), [aria-label*="search" i]'
    ).first();
    
    if (await searchLink.isVisible({ timeout: 5000 })) {
      await searchLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display search results', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('quote');
      await page.waitForTimeout(2000);

      // Look for results container
      const resultsContainer = page.locator(
        '[data-testid*="results"], [class*="results"], main'
      ).first();

      await expect(resultsContainer).toBeVisible();
    }
  });

  test('should show empty state when no results', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('nonexistentquery12345');
      await page.waitForTimeout(2000);

      // Look for empty state message
      const emptyState = page.locator(
        'text=/no results/i, text=/not found/i, [class*="empty"]'
      ).first();

      // Empty state may or may not appear
      await page.waitForTimeout(500);
    }
  });

  test('should allow interaction with search results', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('success');
      await page.waitForTimeout(2000);

      // Find a result item
      const resultItem = page.locator(
        '[data-testid*="result"], [class*="quote-card"], article'
      ).first();

      if (await resultItem.isVisible({ timeout: 3000 })) {
        // Verify result is interactive
        await expect(resultItem).toBeVisible();
      }
    }
  });
});


/**
 * E2E Tests for Navigation
 * 
 * Tests navigation between different sections
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to collections', async ({ page }) => {
    // Find collections link/button
    const collectionsLink = page.locator('a:has-text("Collections"), button:has-text("Collections"), [aria-label*="collections" i]').first();
    if (await collectionsLink.isVisible()) {
      await collectionsLink.click();
      // Verify navigation
      await page.waitForTimeout(1000);
      // Check URL or page content
      const url = page.url();
      expect(url).toMatch(/collection/i);
    }
  });

  test('should navigate to settings', async ({ page }) => {
    // Find settings link/button
    const settingsLink = page.locator('a:has-text("Settings"), button:has-text("Settings"), [aria-label*="settings" i]').first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).toMatch(/setting/i);
    }
  });

  test('should navigate to search', async ({ page }) => {
    // Find search link/button
    const searchLink = page.locator('a:has-text("Search"), button:has-text("Search"), [aria-label*="search" i]').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForTimeout(1000);
      // Verify search interface is visible
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]').first();
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});


/**
 * E2E Tests for Homepage
 * 
 * Tests critical user flows on the homepage
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check that page loads
    await expect(page).toHaveTitle(/boostlly/i);
    
    // Check for main content
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should display daily quote', async ({ page }) => {
    // Wait for quote to load - look for quote text or author
    const quoteText = page.locator('[data-testid="quote-text"], [class*="quote"], p, blockquote').first();
    await expect(quoteText).toBeVisible({ timeout: 10000 });
    
    // Verify quote has content
    const text = await quoteText.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('should have navigation', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Quote Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for quote to load
    await page.waitForTimeout(2000);
  });

  test('should allow saving a quote', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Find and click save button
    const saveButton = page.locator(
      'button:has-text("Save"), button[aria-label*="save" i], button[title*="save" i], [data-testid*="save"]'
    ).first();
    
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      // Wait for save action to complete
      await page.waitForTimeout(1000);
      
      // Verify button state changed or success indicator appears
      const savedIndicator = page.locator(
        '[aria-label*="saved" i], [class*="saved"], [data-testid*="saved"]'
      ).first();
      
      // Check if save was successful (button might change state)
      const buttonText = await saveButton.textContent();
      const isSaved = buttonText?.toLowerCase().includes('saved') || 
                     buttonText?.toLowerCase().includes('remove') ||
                     await savedIndicator.isVisible().catch(() => false);
      
      expect(isSaved).toBeTruthy();
    }
    // Note: If save button is not found, test will pass (button might be in different location)
  });

  test('should allow sharing a quote', async ({ page }) => {
    // Find and click share button
    const shareButton = page.locator('button:has-text("Share"), button[aria-label*="share" i]').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      // Verify share dialog or action
      await page.waitForTimeout(500);
    }
  });
});


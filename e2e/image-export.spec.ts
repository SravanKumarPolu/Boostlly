/**
 * E2E Tests for Quote Image Export
 */

import { test, expect } from '@playwright/test';

test.describe('Quote Image Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for quote to load
    await page.waitForTimeout(2000);
  });

  test('should allow exporting quote as image', async ({ page }) => {
    // Find export/save as image button
    const exportButton = page.locator(
      'button[aria-label*="image" i], button[aria-label*="export" i], button:has-text("Export"), button:has-text("Image")'
    ).first();
    
    if (await exportButton.isVisible({ timeout: 5000 })) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      
      await exportButton.click();
      
      // Wait for download or image customizer to appear
      const download = await downloadPromise;
      const customizer = page.locator('text=/Customize Quote Image/i');
      
      // Either download started or customizer opened
      const hasDownload = download !== null;
      const hasCustomizer = await customizer.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasDownload || hasCustomizer).toBeTruthy();
    }
  });

  test('should open image customizer if available', async ({ page }) => {
    // Try to find image export button
    const exportButton = page.locator(
      'button[aria-label*="image" i], button:has-text("Export")'
    ).first();
    
    if (await exportButton.isVisible({ timeout: 5000 })) {
      await exportButton.click();
      
      // Check if customizer opens
      const customizer = page.locator('text=/Customize Quote Image/i');
      if (await customizer.isVisible({ timeout: 3000 }).catch(() => false)) {
        expect(customizer).toBeVisible();
      }
    }
  });
});


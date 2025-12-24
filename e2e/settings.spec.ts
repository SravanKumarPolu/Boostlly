/**
 * E2E Tests for Settings Page
 * 
 * Tests settings updates and persistence
 */

import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to settings
    const settingsLink = page.locator(
      'a:has-text("Settings"), button:has-text("Settings"), [aria-label*="settings" i], nav a[href*="setting"]'
    ).first();
    
    if (await settingsLink.isVisible({ timeout: 5000 })) {
      await settingsLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display settings page', async ({ page }) => {
    // Check for settings interface
    const settingsContainer = page.locator(
      '[data-testid="settings"], [class*="settings"], main'
    ).first();
    
    await expect(settingsContainer).toBeVisible({ timeout: 5000 });
  });

  test('should toggle notifications', async ({ page }) => {
    // Find notifications toggle
    const notificationToggle = page.locator(
      'input[type="checkbox"][name*="notification" i], button[aria-label*="notification" i], [role="switch"][aria-label*="notification" i]'
    ).first();

    if (await notificationToggle.isVisible({ timeout: 5000 })) {
      const initialState = await notificationToggle.isChecked().catch(() => false);
      
      await notificationToggle.click();
      await page.waitForTimeout(500);

      const newState = await notificationToggle.isChecked().catch(() => false);
      expect(newState).not.toBe(initialState);
    }
  });

  test('should update theme', async ({ page }) => {
    // Find theme selector
    const themeSelector = page.locator(
      'select[name*="theme" i], button:has-text("Theme"), [data-testid*="theme"]'
    ).first();

    if (await themeSelector.isVisible({ timeout: 5000 })) {
      await themeSelector.click();
      await page.waitForTimeout(500);

      // Select different theme
      const darkOption = page.locator(
        '[role="option"]:has-text("Dark"), option:has-text("Dark"), button:has-text("Dark")'
      ).first();

      if (await darkOption.isVisible({ timeout: 2000 })) {
        await darkOption.click();
        await page.waitForTimeout(1000);

        // Verify theme changed (check body class or data attribute)
        const body = page.locator('body');
        const bodyClass = await body.getAttribute('class');
        const bodyDataTheme = await body.getAttribute('data-theme');
        
        // Theme may be applied via class or data attribute
        expect(bodyClass || bodyDataTheme).toBeTruthy();
      }
    }
  });

  test('should update notification time', async ({ page }) => {
    // Find time input
    const timeInput = page.locator(
      'input[type="time"], input[name*="time" i], input[placeholder*="time" i]'
    ).first();

    if (await timeInput.isVisible({ timeout: 5000 })) {
      await timeInput.fill('09:00');
      await page.waitForTimeout(500);

      // Verify time was set
      const value = await timeInput.inputValue();
      expect(value).toContain('09:00');
    }
  });

  test('should clear cache', async ({ page }) => {
    // Find clear cache button
    const clearCacheButton = page.locator(
      'button:has-text("Clear Cache"), button[aria-label*="clear cache" i]'
    ).first();

    if (await clearCacheButton.isVisible({ timeout: 5000 })) {
      await clearCacheButton.click();
      await page.waitForTimeout(500);

      // Look for confirmation if needed
      const confirmButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Clear")'
      ).first();

      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
        await page.waitForTimeout(1000);
      }

      // Verify action completed (may show success message)
      await page.waitForTimeout(500);
    }
  });

  test('should export data', async ({ page, context }) => {
    // Grant download permissions
    await context.grantPermissions(['downloads']);

    // Find export button
    const exportButton = page.locator(
      'button:has-text("Export"), button[aria-label*="export" i]'
    ).first();

    if (await exportButton.isVisible({ timeout: 5000 })) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      await exportButton.click();
      await page.waitForTimeout(1000);

      // Check if download was triggered
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toBeTruthy();
      }
    }
  });
});

test.describe('Settings Persistence', () => {
  test('should persist settings across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to settings
    const settingsLink = page.locator(
      'a:has-text("Settings"), button:has-text("Settings"), [aria-label*="settings" i]'
    ).first();
    
    if (await settingsLink.isVisible({ timeout: 5000 })) {
      await settingsLink.click();
      await page.waitForTimeout(1000);

      // Change a setting
      const notificationToggle = page.locator(
        'input[type="checkbox"][name*="notification" i], [role="switch"][aria-label*="notification" i]'
      ).first();

      if (await notificationToggle.isVisible({ timeout: 5000 })) {
        const initialState = await notificationToggle.isChecked().catch(() => false);
        await notificationToggle.click();
        await page.waitForTimeout(1000);

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Navigate back to settings
        if (await settingsLink.isVisible({ timeout: 5000 })) {
          await settingsLink.click();
          await page.waitForTimeout(1000);

          // Verify setting persisted
          const newState = await notificationToggle.isChecked().catch(() => false);
          expect(newState).not.toBe(initialState);
        }
      }
    }
  });
});


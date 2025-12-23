/**
 * E2E Tests for Onboarding Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage to trigger onboarding
    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
  });

  test('should show onboarding on first visit', async ({ page }) => {
    // Wait for onboarding to appear
    const onboarding = page.locator('text=/Welcome to Boostlly/i');
    await expect(onboarding).toBeVisible({ timeout: 5000 });
  });

  test('should allow theme selection', async ({ page }) => {
    // Wait for onboarding
    await page.waitForSelector('text=/Welcome to Boostlly/i', { timeout: 5000 });
    
    // Click Get Started
    await page.click('button:has-text("Get Started")');
    
    // Wait for theme selection
    await expect(page.locator('text=/Choose Your Theme/i')).toBeVisible();
    
    // Select light theme
    const lightButton = page.locator('button:has-text("Light")');
    if (await lightButton.isVisible()) {
      await lightButton.click();
    }
  });

  test('should allow skipping onboarding', async ({ page }) => {
    // Wait for onboarding
    await page.waitForSelector('text=/Welcome to Boostlly/i', { timeout: 5000 });
    
    // Click Skip
    const skipButton = page.locator('button:has-text("Skip")');
    await skipButton.click();
    
    // Onboarding should be dismissed
    await expect(page.locator('text=/Welcome to Boostlly/i')).not.toBeVisible({ timeout: 3000 });
  });

  test('should not show onboarding on subsequent visits', async ({ page, context }) => {
    // First visit - complete onboarding
    await page.waitForSelector('text=/Welcome to Boostlly/i', { timeout: 5000 });
    await page.click('button:has-text("Skip")');
    
    // Reload page
    await page.reload();
    
    // Onboarding should not appear
    await expect(page.locator('text=/Welcome to Boostlly/i')).not.toBeVisible({ timeout: 2000 });
  });
});


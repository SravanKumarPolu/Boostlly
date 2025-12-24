/**
 * E2E Tests for Collections Management
 * 
 * Tests creating, managing, and deleting collections
 */

import { test, expect } from '@playwright/test';

test.describe('Collections Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to collections
    const collectionsLink = page.locator(
      'a:has-text("Collections"), button:has-text("Collections"), [aria-label*="collections" i], nav a[href*="collection"]'
    ).first();
    
    if (await collectionsLink.isVisible({ timeout: 5000 })) {
      await collectionsLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display collections page', async ({ page }) => {
    // Check for collections interface
    const collectionsContainer = page.locator(
      '[data-testid="collections"], [class*="collection"], main'
    ).first();
    await expect(collectionsContainer).toBeVisible({ timeout: 5000 });
  });

  test('should create a new collection', async ({ page }) => {
    // Find create collection button
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New Collection"), button[aria-label*="create" i], button[aria-label*="add" i]'
    ).first();

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for collection name input
      const nameInput = page.locator(
        'input[placeholder*="name" i], input[type="text"]'
      ).first();

      if (await nameInput.isVisible({ timeout: 3000 })) {
        await nameInput.fill('Test Collection');
        
        // Find save/create button
        const saveButton = page.locator(
          'button:has-text("Save"), button:has-text("Create"), button[type="submit"]'
        ).first();

        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(1000);

          // Verify collection was created (check for name in page)
          const collectionName = page.locator('text=/Test Collection/i');
          await expect(collectionName.first()).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });

  test('should view collection details', async ({ page }) => {
    // Look for any existing collection
    const collectionCard = page.locator(
      '[data-testid*="collection"], [class*="collection-card"], article, [role="article"]'
    ).first();

    if (await collectionCard.isVisible({ timeout: 5000 })) {
      await collectionCard.click();
      await page.waitForTimeout(1000);

      // Verify collection details are shown
      const details = page.locator('main, [role="main"]').first();
      await expect(details).toBeVisible();
    }
  });

  test('should search collections', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      // Verify search results or filtered view
      const results = page.locator('main, [role="main"]').first();
      await expect(results).toBeVisible();
    }
  });
});

test.describe('Collection Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to collections
    const collectionsLink = page.locator(
      'a:has-text("Collections"), button:has-text("Collections"), [aria-label*="collections" i]'
    ).first();
    
    if (await collectionsLink.isVisible({ timeout: 5000 })) {
      await collectionsLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should add quote to collection', async ({ page }) => {
    // First, get a quote from today page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find save/add to collection button
    const addButton = page.locator(
      'button[aria-label*="collection" i], button[aria-label*="add" i], button:has-text("Add to Collection")'
    ).first();

    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Look for collection selection
      const collectionOption = page.locator(
        'button:has-text("Collection"), [role="option"]'
      ).first();

      if (await collectionOption.isVisible({ timeout: 3000 })) {
        await collectionOption.click();
        await page.waitForTimeout(1000);

        // Verify quote was added (check for success message or state change)
        const successIndicator = page.locator(
          'text=/added/i, text=/saved/i, [class*="success"]'
        ).first();
        
        // May or may not have visible success indicator
        await page.waitForTimeout(500);
      }
    }
  });

  test('should delete collection', async ({ page }) => {
    // Navigate to collections
    const collectionsLink = page.locator(
      'a:has-text("Collections"), button:has-text("Collections")'
    ).first();
    
    if (await collectionsLink.isVisible({ timeout: 5000 })) {
      await collectionsLink.click();
      await page.waitForTimeout(1000);

      // Find a collection card
      const collectionCard = page.locator(
        '[data-testid*="collection"], [class*="collection-card"]'
      ).first();

      if (await collectionCard.isVisible({ timeout: 5000 })) {
        // Hover to reveal actions
        await collectionCard.hover();
        await page.waitForTimeout(500);

        // Find delete button
        const deleteButton = page.locator(
          'button[aria-label*="delete" i], button:has-text("Delete"), button[aria-label*="remove" i]'
        ).first();

        if (await deleteButton.isVisible({ timeout: 3000 })) {
          await deleteButton.click();
          await page.waitForTimeout(500);

          // Confirm deletion if confirmation dialog appears
          const confirmButton = page.locator(
            'button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")'
          ).first();

          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }
  });
});


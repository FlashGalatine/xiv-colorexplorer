import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Dye Comparison Tool
 *
 * Tests the dye comparison functionality including:
 * - Tool navigation and loading
 * - Dye selector (up to 4 dyes)
 * - Analysis sections (matrix, charts)
 * - Export functionality
 */

test.describe('Dye Comparison Tool', () => {
  test.beforeEach(async ({ page }) => {
    // Mark welcome/changelog modals as seen
    await page.addInitScript(() => {
      localStorage.setItem('xivdyetools_welcome_seen', 'true');
      localStorage.setItem('xivdyetools_last_version_viewed', '2.6.0');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(
      () => {
        const app = document.getElementById('app');
        return app && app.children.length > 0;
      },
      { timeout: 15000 }
    );
    await page.waitForSelector('[data-tool-id]', { state: 'attached', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Navigate to Dye Comparison tool
    const comparisonButton = page.locator('[data-tool-id="comparison"]:visible').first();
    await comparisonButton.click();
    await page.waitForTimeout(1000);
  });

  test.describe('Tool Loading', () => {
    test('should navigate to Dye Comparison tool', async ({ page }) => {
      // Verify the tool loaded by checking for its specific elements
      const dyeSelectorContainer = page.locator('#dye-selector-container');
      await expect(dyeSelectorContainer).toBeAttached();
    });

    test('should display tool header', async ({ page }) => {
      const toolHeader = page.locator('h2').first();
      await expect(toolHeader).toBeAttached();
    });
  });

  test.describe('Dye Selector Section', () => {
    test('should show dye selector container', async ({ page }) => {
      const dyeSelectorContainer = page.locator('#dye-selector-container');
      await expect(dyeSelectorContainer).toBeAttached();
    });

    test('should show dye selector with content', async ({ page }) => {
      const dyeSelectorContainer = page.locator('#dye-selector-container');

      // Wait for content to load
      await page.waitForTimeout(500);

      // It should have content (the dye selector component)
      const hasContent = await dyeSelectorContainer.evaluate((el) => el.children.length > 0);
      expect(hasContent).toBe(true);
    });

    test('should have selectable dye elements', async ({ page }) => {
      const dyeSelectorContainer = page.locator('#dye-selector-container');

      // Wait for content to load
      await page.waitForTimeout(500);

      // Should have interactive elements (buttons for dyes)
      const interactiveElements = dyeSelectorContainer.locator('button, [role="button"]');
      const count = await interactiveElements.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Analysis Sections', () => {
    test('should show summary container', async ({ page }) => {
      const summaryContainer = page.locator('#summary-container');
      await expect(summaryContainer).toBeAttached();
    });

    test('should show matrix container', async ({ page }) => {
      const matrixContainer = page.locator('#matrix-container');
      await expect(matrixContainer).toBeAttached();
    });

    test('should show hue-saturation chart container', async ({ page }) => {
      const hueSatContainer = page.locator('#hue-sat-container');
      await expect(hueSatContainer).toBeAttached();
    });

    test('should show brightness chart container', async ({ page }) => {
      const brightnessContainer = page.locator('#brightness-container');
      await expect(brightnessContainer).toBeAttached();
    });

    test('should show export container', async ({ page }) => {
      const exportContainer = page.locator('#export-container');
      await expect(exportContainer).toBeAttached();
    });
  });

  test.describe('Market Board', () => {
    test('should show market board container', async ({ page }) => {
      const marketBoardContainer = page.locator('#market-board-container');
      await expect(marketBoardContainer).toBeAttached();
    });
  });

  test.describe('Chart Layout', () => {
    test('should have charts in a grid layout', async ({ page }) => {
      // The charts should be in a 2-column grid on large screens
      const hueSatContainer = page.locator('#hue-sat-container');
      const brightnessContainer = page.locator('#brightness-container');

      // Both should be siblings in the same parent grid
      const hueSatParent = await hueSatContainer.evaluate((el) => el.parentElement?.className);
      const brightnessParent = await brightnessContainer.evaluate(
        (el) => el.parentElement?.className
      );

      // Parent should have grid classes
      expect(hueSatParent).toContain('grid');
      expect(brightnessParent).toContain('grid');
    });
  });
});

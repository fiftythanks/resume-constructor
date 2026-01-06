import { expect, test } from '@playwright/test';

test('Visual regression', async ({ page }) => {
  // ARRANGE
  await page.goto('/');

  await page.getByRole('button', { name: 'Control Buttons' }).click();
  await page.getByRole('menuitem', { name: 'Fill All' }).click();
  await page.getByRole('menuitem', { name: 'Preview' }).click();

  // ACT
  const canvas = page.getByTestId('preview-canvas');

  // Make sure the canvas has loaded.
  await expect(canvas).toBeVisible();

  /**
   * After the canvas has loaded, wait a bit to make sure the PDF has finished
   * rendering.
   */
  await page.waitForTimeout(500);

  // ASSERT
  await expect(canvas).toHaveScreenshot('resume-preview.png', {
    // To allow for anti-aliasing quirks.
    maxDiffPixels: 100,
    scale: 'device',
  });
});

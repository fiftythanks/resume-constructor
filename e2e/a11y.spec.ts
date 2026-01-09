import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import sectionTitles from '@/utils/sectionTitles';

test.describe('Accessibility scenarious', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Control Buttons' }).click();
    await page.getByRole('menuitem', { name: 'Fill All' }).click();
  });

  test(`should have no violations in the section ${sectionTitles.personal}`, async ({
    page,
  }) => {
    // ACT
    const results = await new AxeBuilder({ page }).analyze();

    // ASSERT
    expect(results.violations).toEqual([]);
  });

  test('should have no violations in the preview dialog', async ({ page }) => {
    // ARRANGE
    await page.getByRole('menuitem', { name: 'Preview' }).click();

    // To make sure the PDF is loaded before analysing for a11y.
    await page.waitForTimeout(500);

    // ACT
    const results = await new AxeBuilder({ page }).analyze();

    // ASSERT
    expect(results.violations).toEqual([]);
  });

  for (const sectionTitle of Object.values(sectionTitles)) {
    /**
     * The "personal" section is tested separately because at least one section
     * must be tested with the navbar being hidden. All the other sections in
     * the loop are tested with it shown.
     */
    if (sectionTitle === sectionTitles.personal) continue;

    test(`should have no violations in the section "${sectionTitle}"`, async ({
      page,
    }) => {
      // ARRANGE
      await page.getByRole('button', { name: 'Navigation' }).click();
      await page.getByRole('tab', { name: sectionTitle }).click();

      // ACT
      const results = await new AxeBuilder({ page }).analyze();

      // ASSERT
      expect(results.violations).toEqual([]);
    });
  }

  test.describe('Empty sections', () => {
    test('should have no violations when the control buttons are expanded', async ({
      page,
    }) => {
      // ARRANGE
      await page.goto('/');
      await page.getByRole('button', { name: 'Control Buttons' }).click();

      // ACT
      const results = await new AxeBuilder({ page }).analyze();

      // ASSERT
      expect(results.violations).toEqual([]);
    });

    test('should have no violations in the "Add Sections" dialog', async ({
      page,
    }) => {
      // ARRANGE
      await page.goto('/');

      await page.getByRole('button', { name: 'Navigation' }).click();
      await page.getByRole('button', { name: 'Add Sections' }).click();

      // ACT
      const results = await new AxeBuilder({ page }).analyze();

      // ASSERT
      expect(results.violations).toEqual([]);
    });
  });
});

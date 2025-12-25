import { expect, test } from '@playwright/test';

import sectionTitles from '@/utils/sectionTitles';

test('Drag & Drop', async ({ page }) => {
  // ARRANGE
  await page.goto('/');

  await page.getByRole('button', { name: 'Control Buttons' }).click();
  await page.getByRole('menuitem', { name: 'Fill All' }).click();

  await page.getByRole('button', { name: 'Navigation' }).click();
  await page.getByRole('button', { name: 'Toggle Editor Mode' }).click();

  const tabs = page.getByRole('tab');

  // ACT
  const source = page.getByRole('tab', { name: sectionTitles.education });
  const target = page.getByRole('tab', { name: sectionTitles.skills });

  await source.dragTo(target, { force: true });

  // ASSERT
  const tabIds = await tabs.evaluateAll((list) => list.map((tab) => tab.id));

  expect(tabIds).toEqual([
    'personal',
    'links',
    'education',
    'skills',
    'experience',
    'projects',
    'certifications',
  ]);
});

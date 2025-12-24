import { expect, test } from '@playwright/test';

test('Smoke Test', async ({ page }) => {
  await page.goto('/');

  // Fill all sections with placeholder data.
  const options = { name: 'Control Buttons' };
  const toggleControlBtns = page.getByRole('button', options);
  await toggleControlBtns.click();
  await page.getByRole('menuitem', { name: 'Fill All' }).click();

  // Change the placeholder name to Mikhail.
  const fullName = page.getByRole('textbox', { name: 'Full Name' });
  await fullName.fill('Mikhail');

  // Change the placeholder job title to Frontend Developer.
  const jobTitle = page.getByRole('textbox', { name: 'Job Title' });
  await jobTitle.fill('Frontend Developer');

  // Open the preview dialog.
  await toggleControlBtns.click();
  await page.getByRole('menuitem', { name: 'Open Preview' }).click();

  // Click a download button.
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download' }).first().click();
  const download = await downloadPromise;

  // ASSERT

  expect(download.suggestedFilename()).toBe('Resume.pdf');

  // Check file size > 0 to ensure PDF actually generated.
  const path = await download.path();
  const fs = await import('fs');
  const stats = await fs.promises.stat(path);
  expect(stats.size).toBeGreaterThan(0);
});

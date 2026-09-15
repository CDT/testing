import { test, expect } from '@playwright/test';

test('injected catalog markup renders as text in React', async ({ page }) => {
  const payload = '<img src=x onerror=alert(1)>';
  let dialogs = 0;
  page.on('dialog', async dialog => { dialogs += 1; await dialog.dismiss(); });
  await page.route('**/api/products', async route => {
    const response = await route.fetch();
    const products = await response.json();
    products[0].name = payload;
    await route.fulfill({ response, json: products });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: payload, exact: true })).toBeVisible();
  await expect(page.locator('.product img')).toHaveCount(0);
  expect(dialogs).toBe(0);
});

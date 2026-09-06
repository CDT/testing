import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Add Field notebook to bag' })).toBeVisible();
});

test('search and edit the shopping bag', async ({ page }) => {
  await page.getByRole('searchbox', { name: 'Search products' }).fill('Field notebook');
  await expect(page.getByRole('button', { name: /^Add .* to bag$/ })).toHaveCount(1);
  await page.getByRole('button', { name: 'Add Field notebook to bag' }).click();
  await page.getByRole('spinbutton', { name: 'Quantity for Field notebook' }).fill('4');
  const bag = page.getByRole('complementary', { name: 'Shopping bag' });
  await expect(bag.locator('.grand-total')).toContainText('$108.00');
  await page.getByRole('button', { name: 'Remove Field notebook', exact: true }).click();
  await expect(bag).toContainText('A fresh start.');
  await expect(page.getByRole('button', { name: 'Place demo order' })).toBeDisabled();
  await page.getByRole('searchbox').fill('no-such-stationery');
  await expect(page.getByText('No products match. Try another search or category.')).toBeVisible();
  await page.getByRole('searchbox').fill('');
  await expect(page.getByRole('button', { name: /^Add .* to bag$/ })).toHaveCount(6);
});

test('discounted checkout and history survive refresh @smoke', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Field notebook to bag' }).click();
  await page.getByRole('spinbutton', { name: 'Quantity for Field notebook' }).fill('4');
  await page.getByLabel('Have a coupon?').fill('WELCOME10');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('.grand-total')).toContainText('$103.19');
  await page.getByRole('button', { name: 'Place demo order' }).click();
  await expect(page.getByRole('heading', { name: 'Your order is confirmed.' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('$103.19');
  await page.reload();
  await page.getByRole('button', { name: 'Your orders (1)' }).click();
  await expect(page.locator('#order-history article')).toHaveCount(1);
  await expect(page.locator('#order-history')).toContainText('4 × Field notebook');
  await expect(page.locator('#order-history')).toContainText('$103.19');
});

test('declined payment keeps the bag and permits correction', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Everyday pen set to bag' }).click();
  await page.getByLabel('Demo payment').selectOption('declined');
  await page.getByRole('button', { name: 'Place demo order' }).click();
  await expect(page.getByRole('alert')).toContainText('Payment declined.');
  await expect(page.getByRole('spinbutton', { name: 'Quantity for Everyday pen set' })).toHaveValue('1');
  await expect(page.getByRole('button', { name: 'Your orders (0)' })).toBeVisible();
  await page.getByLabel('Demo payment').selectOption('approved');
  await page.getByRole('button', { name: 'Place demo order' }).click();
  await expect(page.getByRole('heading', { name: 'Your order is confirmed.' })).toBeVisible();
});

test('lost order response can be retried without a duplicate purchase', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Canvas pencil pouch to bag' }).click();
  let originalOrder;
  await page.route('**/api/orders', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    // Commit the real request, then hide its response from the browser.
    const response = await route.fetch();
    expect(response.status()).toBe(201);
    originalOrder = await response.json();
    await route.abort('failed');
  });
  await page.getByRole('button', { name: 'Place demo order' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Quantity for Canvas pencil pouch' })).toHaveValue('1');
  await page.unroute('**/api/orders');
  const replayPromise = page.waitForResponse(response => response.url().endsWith('/api/orders') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Place demo order' }).click();
  const replay = await replayPromise;
  expect(replay.status()).toBe(200);
  expect((await replay.json()).id).toBe(originalOrder.id);
  await page.getByRole('button', { name: 'View your orders' }).click();
  await expect(page.locator('#order-history article')).toHaveCount(1);
});

test('catalog and empty bag are usable @smoke', async ({ page }) => {
  await expect(page.getByRole('button', { name: /^Add .* to bag$/ })).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Place demo order' })).toBeDisabled();
  await page.getByRole('button', { name: 'Paper', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Add .* to bag$/ })).toHaveCount(2);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  subtotalCents, discountCents, taxCents, calculateTotals,
} from '../../src/domain/pricing.js';

test('multiplies quantities and adds different line items', () => {
  const items = [
    { priceCents: 2500, quantity: 2 },
    { priceCents: 1500, quantity: 1 },
  ];
  assert.equal(subtotalCents(items), 6500);
});

test('rounds the order-level percentage discount to cents', () => {
  assert.equal(discountCents(999, 10), 100);
});

test('rounds the 8% merchandise tax to cents', () => {
  assert.equal(taxCents(999), 80);
});

test('uses the discounted subtotal for shipping and tax', () => {
  const items = [{ priceCents: 2500, quantity: 4 }];
  assert.deepEqual(calculateTotals(items, 10), {
    subtotal: 10000,
    discount: 1000,
    shipping: 599,
    tax: 720,
    total: 10319,
  });
});

test('an empty bag has no charges', () => {
  assert.deepEqual(calculateTotals([]), {
    subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0,
  });
});

test('calculating a total does not mutate the cart', () => {
  const items = [{ priceCents: 2500, quantity: 2 }];
  const original = structuredClone(items);
  calculateTotals(items, 10);
  assert.deepEqual(items, original);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { shippingCost } from '../../src/domain/pricing.js';

test('charges $5.99 for a $60 subtotal', () => {
  // Arrange: amounts are integer cents, after discounts.
  const subtotal = 6000;
  // Act: call the same function the API uses.
  const actual = shippingCost(subtotal);
  // Assert: the requirement says paid shipping is $5.99.
  assert.equal(actual, 599);
});

test('ships a $120 subtotal for free', () => {
  assert.equal(shippingCost(12000), 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shippingCost, validateQuantity, discountCents,
} from '../../src/domain/pricing.js';

for (const [subtotal, expected] of [[9999, 599], [10000, 0], [10001, 0]]) {
  test('shipping for ' + subtotal + ' cents is ' + expected, () => {
    assert.equal(shippingCost(subtotal), expected);
  });
}

for (const quantity of [1, 99]) {
  test('accepts quantity ' + quantity, () => {
    assert.equal(validateQuantity(quantity), quantity);
  });
}

for (const quantity of [0, 100, -1, 1.5, '2', undefined]) {
  test('rejects quantity ' + String(quantity), () => {
    assert.throws(() => validateQuantity(quantity), RangeError);
  });
}

test('rejects negative money and fractional cents', () => {
  assert.throws(() => shippingCost(-1), RangeError);
  assert.throws(() => shippingCost(100.5), RangeError);
});

test('accepts discount endpoints and rejects values outside them', () => {
  assert.equal(discountCents(5000, 0), 0);
  assert.equal(discountCents(5000, 100), 5000);
  assert.throws(() => discountCents(5000, -1), RangeError);
  assert.throws(() => discountCents(5000, 101), RangeError);
});

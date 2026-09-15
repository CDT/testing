import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCoupon } from '../../src/domain/coupons.js';

const expiry = Date.UTC(2030, 0, 1);

function dependencies(nowMs = expiry - 1) {
  // A fresh fake repository and a fixed clock for each test.
  const coupons = new Map([
    ['WELCOME10', { percent: 10, expiresAt: expiry }],
  ]);
  return { findCoupon: code => coupons.get(code), now: () => nowMs };
}

test('normalizes spaces and lowercase coupon codes', () => {
  assert.equal(resolveCoupon(' welcome10 ', dependencies()), 10);
});

test('an empty code skips the lookup', () => {
  let calls = 0;
  const findCoupon = () => { calls += 1; return undefined; };
  assert.equal(resolveCoupon('  ', { findCoupon }), 0);
  assert.equal(calls, 0);
});

test('rejects an unknown coupon', () => {
  assert.throws(() => resolveCoupon('MISSING', dependencies()), /Coupon not found/);
});

test('accepts a coupon one millisecond before expiry', () => {
  assert.equal(resolveCoupon('WELCOME10', dependencies(expiry - 1)), 10);
});

for (const nowMs of [expiry, expiry + 1]) {
  test('rejects coupon at time ' + nowMs, () => {
    assert.throws(() => resolveCoupon('WELCOME10', dependencies(nowMs)), /Coupon has expired/);
  });
}

test('rejects non-text coupon input', () => {
  assert.throws(() => resolveCoupon(123, dependencies()), TypeError);
});

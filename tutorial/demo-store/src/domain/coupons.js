export function resolveCoupon(code, { findCoupon, now = Date.now }) {
  if (typeof code !== 'string') throw new TypeError('Coupon code must be text.');
  const normalized = code.trim().toUpperCase();
  if (!normalized) return 0;
  const coupon = findCoupon(normalized);
  if (!coupon) throw new RangeError('Coupon not found.');
  if (now() >= coupon.expiresAt) throw new RangeError('Coupon has expired.');
  return coupon.percent;
}

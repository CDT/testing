function validateMoney(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > 100000000) {
    throw new RangeError('Amount must be an integer from 0 to 100000000 cents.');
  }
}

export function validateQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new RangeError('Quantity must be an integer from 1 to 99.');
  }
  return quantity;
}

export function subtotalCents(items) {
  if (!Array.isArray(items)) throw new TypeError('Items must be an array.');
  const total = items.reduce((sum, item) => {
    validateMoney(item.priceCents);
    validateQuantity(item.quantity);
    return sum + item.priceCents * item.quantity;
  }, 0);
  validateMoney(total);
  return total;
}

export function discountCents(subtotal, percent = 0) {
  validateMoney(subtotal);
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    throw new RangeError('Discount must be an integer from 0 to 100 percent.');
  }
  return Math.round(subtotal * percent / 100);
}

export function shippingCost(subtotalAfterDiscountCents) {
  validateMoney(subtotalAfterDiscountCents);
  return subtotalAfterDiscountCents >= 10000 ? 0 : 599;
}

export function taxCents(subtotalAfterDiscountCents) {
  validateMoney(subtotalAfterDiscountCents);
  return Math.round(subtotalAfterDiscountCents * 8 / 100);
}

export function calculateTotals(items, percent = 0) {
  const subtotal = subtotalCents(items);
  const discount = discountCents(subtotal, percent);
  const discountedSubtotal = subtotal - discount;
  const shipping = items.length === 0 ? 0 : shippingCost(discountedSubtotal);
  const tax = taxCents(discountedSubtotal);
  return { subtotal, discount, shipping, tax, total: discountedSubtotal + shipping + tax };
}

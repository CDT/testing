import assert from 'node:assert/strict';
import http from 'node:http';
import { createApi } from '../demo-store/server/api.js';

const api = createApi();
const server = http.createServer((req, res) => api(req, res));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let cookie = '';

async function call(path, body, expected = 200, useSession = true) {
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(useSession && cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (useSession && response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
  const data = await response.json();
  assert.equal(response.status, expected, JSON.stringify(data));
  return data;
}

try {
  const products = await call('/api/products');
  assert.equal(products.length, 6);
  const cart = { items: [{ id: 'notebook', quantity: 4, priceCents: 1 }], coupon: ' welcome10 ' };
  const quote = await call('/api/quote', cart);
  assert.deepEqual(quote.totals, { subtotal: 10000, discount: 1000, shipping: 599, tax: 720, total: 10319 });
  await call('/api/quote', { ...cart, coupon: 'EXPIRED10' }, 400);
  await call('/api/quote', { items: [{ id: 'notebook', quantity: -1 }] }, 400);
  await call('/api/quote', { items: [{ id: 'notebook', quantity: 30 }, { id: 'notebook', quantity: 30 }] }, 400);
  await call('/api/orders', { ...cart, requestId: 'declined-123', payment: 'declined' }, 402);
  assert.equal((await call('/api/products'))[0].stock, 40);
  assert.equal((await call('/api/orders')).length, 0);
  const body = { ...cart, requestId: 'approved-123', payment: 'approved' };
  const order = await call('/api/orders', body, 201);
  const retry = await call('/api/orders', body);
  assert.equal(retry.id, order.id);
  assert.equal((await call('/api/products'))[0].stock, 36);
  assert.equal((await call('/api/orders')).length, 1);
  assert.equal((await call('/api/orders', undefined, 200, false)).length, 0);
  await call('/api/orders', { ...body, coupon: '' }, 409);
  await call('/api/orders', { items: [], requestId: 'empty-1234', payment: 'approved' }, 400);
  // Race two requests for all remaining stock; exactly one may succeed.
  const responses = await Promise.all(['last-stock-a', 'last-stock-b'].map(requestId => fetch(base + '/api/orders', {
    method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: 'desk-set', quantity: 10 }], requestId, payment: 'approved' }),
  })));
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 400]);
  console.log('API checks passed: trusted pricing, coupon/quantity validation, decline, order, idempotency, session isolation, and stock race.');
} finally {
  await new Promise(resolve => server.close(resolve));
}

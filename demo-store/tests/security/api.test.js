import test from 'node:test';
import assert from 'node:assert/strict';
import { startApi, orderBody } from '../helpers/api.js';

test('session cookie has the local demo protections', async t => {
  const call = (await startApi(t)).client();
  const result = await call('/api/orders');
  assert.equal(result.status, 200);
  const cookie = result.headers.get('set-cookie');
  assert.match(cookie, /^paper-session=[0-9a-f-]{36};/);
  assert.match(cookie, /; HttpOnly/);
  assert.match(cookie, /; SameSite=Strict/);
  assert.match(cookie, /; Path=\//);
  assert.doesNotMatch(cookie, /; Domain=/i);
});

test('another or forged session cannot read the first session orders', async t => {
  const app = await startApi(t);
  const owner = app.client();
  assert.equal((await owner('/api/orders', orderBody())).status, 201);
  assert.equal((await owner('/api/orders')).data.length, 1);
  assert.deepEqual((await app.client()('/api/orders')).data, []);
  const forged = await app.client('paper-session=guessed-session')('/api/orders');
  assert.deepEqual(forged.data, []);
  assert.ok(forged.headers.get('set-cookie'));
});

test('cross-origin writes are rejected but same-origin writes work', async t => {
  const app = await startApi(t);
  const call = app.client();
  assert.equal((await call('/api/orders', orderBody(), { headers: { Origin: 'https://untrusted.invalid' } })).status, 403);
  assert.deepEqual((await call('/api/orders')).data, []);
  assert.equal((await call('/api/orders', orderBody(), { headers: { Origin: app.base } })).status, 201);
});

test('server ignores forged prices, discount percent, and totals', async t => {
  const call = (await startApi(t)).client();
  const result = await call('/api/orders', orderBody({
    items: [{ id: 'notebook', quantity: 4, priceCents: 1 }],
    percent: 100, totals: { total: 0 },
  }));
  assert.equal(result.status, 201);
  assert.equal(result.data.items[0].priceCents, 2500);
  assert.equal(result.data.totals.total, 10319);
});

test('invalid quantities and coupons never change stock or orders', async t => {
  const call = (await startApi(t)).client();
  for (const quantity of [-1, 0, 1.5, '4', 100]) {
    assert.equal((await call('/api/orders', orderBody({ items: [{ id: 'notebook', quantity }] }))).status, 400);
  }
  for (const coupon of ['FREE100', 'EXPIRED10', { percent: 100 }]) {
    assert.equal((await call('/api/orders', orderBody({ coupon }))).status, 400);
  }
  assert.deepEqual((await call('/api/orders')).data, []);
  assert.equal((await call('/api/products')).data[0].stock, 40);
});

test('injection-shaped input stays invalid data; errors do not echo it', async t => {
  const call = (await startApi(t)).client();
  for (const id of ["' OR 1=1 --", '<img src=x onerror=alert(1)>']) {
    const result = await call('/api/quote', { items: [{ id, quantity: 1 }] });
    assert.equal(result.status, 400);
    assert.deepEqual(result.data, { error: 'Product not found.' });
  }
  assert.equal((await call('/api/quote', '{', { raw: true })).status, 400);
  assert.equal((await call('/api/quote', JSON.stringify({ padding: 'x'.repeat(17000) }), { raw: true })).status, 400);
});

test('JSON responses limit caching and expose only the documented order fields', async t => {
  const call = (await startApi(t)).client();
  const result = await call('/api/orders', orderBody());
  assert.equal(result.status, 201);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
  assert.match(result.headers.get('content-type'), /^application\/json/);
  assert.deepEqual(Object.keys(result.data).sort(), ['createdAt', 'id', 'items', 'status', 'totals']);
  assert.deepEqual(Object.keys(result.data.items[0]).sort(), ['id', 'name', 'priceCents', 'quantity']);
  assert.equal((await call('/api/admin')).status, 404);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { startApi, orderBody } from '../helpers/api.js';

test('HTTP quote composes catalog, coupon, and pricing without reserving stock', async t => {
  const call = (await startApi(t)).client();
  const quote = await call('/api/quote', orderBody());
  assert.equal(quote.status, 200);
  assert.deepEqual(quote.data.totals, { subtotal: 10000, discount: 1000, shipping: 599, tax: 720, total: 10319 });
  assert.equal((await call('/api/products')).data[0].stock, 40);
  assert.deepEqual((await call('/api/orders')).data, []);
});

test('an order stores the quote and decrements inventory', async t => {
  const call = (await startApi(t)).client();
  const result = await call('/api/orders', orderBody());
  assert.equal(result.status, 201);
  assert.equal(result.data.status, 'Confirmed');
  assert.equal(result.data.totals.total, 10319);
  assert.deepEqual((await call('/api/orders')).data, [result.data]);
  assert.equal((await call('/api/products')).data[0].stock, 36);
});

test('decline leaves no order or stock change; an approved retry succeeds', async t => {
  const call = (await startApi(t)).client();
  assert.equal((await call('/api/orders', orderBody({ payment: 'declined' }))).status, 402);
  assert.deepEqual((await call('/api/orders')).data, []);
  assert.equal((await call('/api/products')).data[0].stock, 40);
  assert.equal((await call('/api/orders', orderBody())).status, 201);
});

test('same request replays once; changed payload conflicts', async t => {
  const call = (await startApi(t)).client();
  const first = await call('/api/orders', orderBody());
  const replay = await call('/api/orders', orderBody());
  assert.equal(first.status, 201);
  assert.equal(replay.status, 200);
  assert.deepEqual(replay.data, first.data);
  assert.equal((await call('/api/orders', orderBody({ coupon: '' }))).status, 409);
  assert.equal((await call('/api/orders')).data.length, 1);
  assert.equal((await call('/api/products')).data[0].stock, 36);
});

test('competing sessions cannot both buy the last stock', async t => {
  const app = await startApi(t);
  const a = app.client();
  const b = app.client();
  await a('/api/products');
  await b('/api/products');
  const body = orderBody({ items: [{ id: 'desk-set', quantity: 10 }], coupon: '' });
  const results = await Promise.all([a('/api/orders', body), b('/api/orders', body)]);
  assert.deepEqual(results.map(result => result.status).sort(), [201, 400]);
  assert.equal((await a('/api/products')).data.find(product => product.id === 'desk-set').stock, 0);
  assert.equal((await a('/api/orders')).data.length + (await b('/api/orders')).data.length, 1);
});

test('a fresh API instance resets orders, sessions, and stock', async t => {
  const first = (await startApi(t)).client();
  assert.equal((await first('/api/orders', orderBody())).status, 201);
  const restarted = (await startApi(t)).client();
  assert.deepEqual((await restarted('/api/orders')).data, []);
  assert.equal((await restarted('/api/products')).data[0].stock, 40);
});

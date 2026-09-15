import test from 'node:test';
import assert from 'node:assert/strict';
import { startApi, orderBody } from '../helpers/api.js';

test('REG-001: discount crossing the shipping threshold reaches the stored order', async t => {
  const call = (await startApi(t)).client();
  const fullPrice = await call('/api/quote', orderBody({ coupon: '' }));
  assert.equal(fullPrice.status, 200);
  assert.equal(fullPrice.data.totals.shipping, 0);
  const discounted = await call('/api/orders', orderBody());
  assert.equal(discounted.status, 201);
  assert.equal(discounted.data.totals.shipping, 599);
  assert.equal(discounted.data.totals.total, 10319);
  assert.deepEqual((await call('/api/orders')).data[0].totals, discounted.data.totals);
});

test('REG-002: duplicate cart lines are combined before checking stock', async t => {
  const call = (await startApi(t)).client();
  const result = await call('/api/orders', orderBody({
    items: [{ id: 'notebook', quantity: 30 }, { id: 'notebook', quantity: 30 }],
  }));
  assert.equal(result.status, 400);
  assert.deepEqual((await call('/api/orders')).data, []);
  assert.equal((await call('/api/products')).data[0].stock, 40);
});

test('REG-003: a quote does not guarantee stock at checkout', async t => {
  const app = await startApi(t);
  const buyer = app.client();
  const competitor = app.client();
  const body = orderBody({ items: [{ id: 'desk-set', quantity: 10 }], coupon: '' });
  assert.equal((await buyer('/api/quote', body)).status, 200);
  assert.equal((await competitor('/api/orders', body)).status, 201);
  assert.equal((await buyer('/api/orders', body)).status, 400);
  assert.deepEqual((await buyer('/api/orders')).data, []);
});

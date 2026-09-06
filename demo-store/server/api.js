import { randomUUID } from 'node:crypto';
import { catalog, coupons } from './catalog.js';
import { calculateTotals, validateQuantity } from '../src/domain/pricing.js';
import { resolveCoupon } from '../src/domain/coupons.js';

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw new RangeError('Request is too large.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString()); }
  catch { throw new TypeError('Send a valid JSON body.'); }
}

export function createApi() {
  const products = catalog.map(product => ({ ...product }));
  const sessions = new Map();

  function prepare(body) {
    if (!body || !Array.isArray(body.items) || body.items.length > 50) throw new RangeError('Provide up to 50 cart lines.');
    const quantities = new Map();
    for (const item of body.items) {
      if (!item || typeof item.id !== 'string') throw new TypeError('Invalid cart item.');
      validateQuantity(item.quantity);
      quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
    }
    const items = Array.from(quantities, ([id, quantity]) => {
      validateQuantity(quantity);
      const product = products.find(entry => entry.id === id);
      if (!product) throw new RangeError('Product not found.');
      if (quantity > product.stock) throw new RangeError(`${product.name}: only ${product.stock} left.`);
      return { id, name: product.name, quantity, priceCents: product.priceCents };
    });
    const percent = resolveCoupon(body.coupon ?? '', { findCoupon: code => coupons.get(code) });
    return { items, totals: calculateTotals(items, percent) };
  }

  return async function api(req, res) {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) return false;
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify(data));
    };
    try {
      if (req.method === 'POST' && req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) {
        send(403, { error: 'Origin is not allowed.' });
        return true;
      }
      let sid = req.headers.cookie?.split('; ').find(value => value.startsWith('paper-session='))?.slice(14);
      if (!sessions.has(sid)) {
        sid = randomUUID();
        sessions.set(sid, { orders: [], requests: new Map() });
        res.setHeader('Set-Cookie', `paper-session=${sid}; HttpOnly; SameSite=Strict; Path=/`);
      }
      const session = sessions.get(sid);
      if (req.method === 'GET' && url.pathname === '/api/products') send(200, products);
      else if (req.method === 'GET' && url.pathname === '/api/orders') send(200, session.orders);
      else if (req.method === 'POST' && url.pathname === '/api/quote') send(200, prepare(await readJson(req)));
      else if (req.method === 'POST' && url.pathname === '/api/orders') {
        const body = await readJson(req);
        if (!body || typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(body.requestId)) throw new RangeError('Provide a valid request ID.');
        const fingerprint = JSON.stringify({ items: body.items, coupon: body.coupon, payment: body.payment });
        const previous = session.requests.get(body.requestId);
        if (previous) {
          send(previous.fingerprint === fingerprint ? 200 : 409, previous.fingerprint === fingerprint ? previous.order : { error: 'Request ID was already used for a different order.' });
          return true;
        }
        const quote = prepare(body);
        if (!quote.items.length) throw new RangeError('Add an item before checkout.');
        if (body.payment === 'declined') { send(402, { error: 'Payment declined. Choose the approved demo payment and try again.' }); return true; }
        if (body.payment !== 'approved') throw new RangeError('Choose a demo payment outcome.');
        // No await between inventory validation above and decrement below.
        const order = { id: randomUUID(), createdAt: new Date().toISOString(), status: 'Confirmed', ...quote };
        for (const item of quote.items) products.find(product => product.id === item.id).stock -= item.quantity;
        session.orders.unshift(order);
        session.requests.set(body.requestId, { fingerprint, order });
        send(201, order);
      } else send(404, { error: 'Endpoint not found.' });
    } catch (error) {
      const expected = error instanceof RangeError || error instanceof TypeError;
      if (!expected) console.error(error);
      send(expected ? 400 : 500, { error: expected ? error.message : 'Something went wrong. Try again.' });
    }
    return true;
  };
}

import http from 'node:http';
import { createApi } from '../../server/api.js';

// Each fixture owns real HTTP transport and fresh in-memory application state.
export async function startApi(t) {
  const api = createApi();
  const server = http.createServer(async (req, res) => {
    if (!await api(req, res)) { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const close = () => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
  t?.after(close);
  const base = `http://127.0.0.1:${server.address().port}`;
  function client(initialCookie = '') {
    let cookie = initialCookie;
    return async (path, body, options = {}) => {
      const response = await fetch(base + path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie, ...options.headers },
        body: body === undefined ? undefined : options.raw ? body : JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';')[0];
      return { status: response.status, headers: response.headers, data: await response.json() };
    };
  }
  return { base, client, close };
}

export function orderBody(overrides = {}) {
  return {
    items: [{ id: 'notebook', quantity: 4 }], coupon: 'WELCOME10',
    payment: 'approved', requestId: 'checkout-0001', ...overrides,
  };
}

import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { fork } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Run the API in a separate process so client work does not block its event loop.
if (process.argv.includes('--server')) {
  const { startApi } = await import('../helpers/api.js');
  const app = await startApi();
  process.send({ base: app.base });
  process.on('message', async message => {
    if (message === 'stop') { await app.close(); process.exit(0); }
  });
} else {
  const profile = process.argv[2] || 'baseline';
  const profiles = { baseline: [1, 20], load: [8, 50], spike: [24, 30], soak: [4, 500] };
  assert.ok(profiles[profile], 'Choose baseline, load, spike, or soak.');
  const [users, iterations] = profiles[profile];
  const child = fork(fileURLToPath(import.meta.url), ['--server'], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
  try {
    const base = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('API startup timed out')), 10000);
      child.once('message', message => { clearTimeout(timer); resolve(message.base); });
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`API exited: ${code}`)); });
    });
    const samples = [];
    let errors = 0;
    let completedJourneys = 0;
    async function request(path, body, cookie, expected, measure = true) {
      const start = performance.now();
      try {
        const response = await fetch(base + path, {
          method: body === undefined ? 'GET' : 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie || '' },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        assert.equal(response.status, expected);
        if (path === '/api/products') assert.equal(data.length, 6);
        if (path === '/api/quote') assert.equal(data.totals.total, 3299);
        if (path === '/api/orders' && expected === 201) assert.equal(data.totals.total, 1678);
        return response.headers.get('set-cookie')?.split(';')[0] || cookie;
      } catch (error) {
        if (!measure) throw error;
        errors += 1;
        return cookie;
      } finally {
        if (measure) samples.push({ endpoint: path, ms: performance.now() - start });
      }
    }
    // Warm every worker's session; warmup is outside reported measurements.
    const cookies = await Promise.all(Array.from({ length: users }, () => request('/api/products', undefined, '', 200, false)));
    const start = performance.now();
    await Promise.all(cookies.map(async (initialCookie, user) => {
      let cookie = initialCookie;
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        cookie = await request('/api/products', undefined, cookie, 200);
        cookie = await request('/api/quote', { items: [{ id: 'notebook', quantity: 1 }] }, cookie, 200);
        if (iteration % 5 === 0) {
          // Declines exercise checkout without draining finite demo stock.
          cookie = await request('/api/orders', { items: [{ id: 'notebook', quantity: 1 }], payment: 'declined', requestId: `load-${user}-${iteration}` }, cookie, 402);
        }
        completedJourneys += 1;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }));
    // One successful purchase per user is bounded by the 50 clips in stock.
    await Promise.all(cookies.map((cookie, user) => request('/api/orders', {
      items: [{ id: 'clips', quantity: 1 }], payment: 'approved', requestId: `purchase-${user}`,
    }, cookie, 201)));
    const seconds = (performance.now() - start) / 1000;
    const stats = values => {
      values.sort((a, b) => a - b);
      return { count: values.length, p95Ms: Math.round(values[Math.ceil(values.length * 0.95) - 1] * 100) / 100 };
    };
    const endpoints = Object.fromEntries(['/api/products', '/api/quote', '/api/orders'].map(path => [path, stats(samples.filter(sample => sample.endpoint === path).map(sample => sample.ms))]));
    const summary = {
      profile, users, iterations, node: process.version, platform: process.platform,
      seconds: Math.round(seconds * 100) / 100, requests: samples.length, completedJourneys,
      requestsPerSecond: Math.round(samples.length / seconds),
      errorRate: errors / samples.length, errors, ...stats(samples.map(sample => sample.ms)), endpoints,
    };
    await writeFile(`performance-${profile}.json`, JSON.stringify(summary, null, 2) + '\n');
    console.log(JSON.stringify(summary, null, 2));
    assert.equal(errors, 0, 'Unexpected status, payload, transport error, or timeout');
    for (const [path, result] of Object.entries(endpoints)) assert.ok(result.p95Ms < 500, `${path}: p95 must be under the local exercise budget of 500 ms`);
  } finally {
    child.kill();
  }
}

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createApi } from './api.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const production = process.argv.includes('--production');
const api = createApi();
const server = http.createServer();
const vite = production ? null : await (await import('vite')).createServer({ root, server: { middlewareMode: true, hmr: { server } }, appType: 'spa' });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

server.on('request', async (req, res) => {
  if (await api(req, res)) return;
  if (vite) { vite.middlewares(req, res); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const dist = path.join(root, 'dist');
    const target = path.resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found. Run npm run build before npm start.'); }
});

const port = Number(process.env.PORT || 5174);
server.listen(port, '127.0.0.1', () => console.log(`Paper Trail: http://localhost:${port}`));
server.on('error', error => { console.error(error.message); process.exit(1); });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  await vite?.close();
  server.close(() => process.exit(0));
});

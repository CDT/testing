import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const groups = process.argv.slice(2);
const files = [];
for (const group of groups.length ? groups : ['unit']) {
  if (!['unit', 'integration', 'security', 'regression'].includes(group)) throw new Error(`Unknown test group: ${group}`);
  const directory = new URL(`../tests/${group}/`, import.meta.url);
  const names = await readdir(directory).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  files.push(...names.filter(name => name.endsWith('.test.js')).sort().map(name => fileURLToPath(new URL(name, directory))));
}
if (!files.length) {
  console.log('0 tests: add the chapter test files before using this as evidence.');
} else {
  const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

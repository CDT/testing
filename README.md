# Testing Notes

A software testing course for experienced developers, built with Vite, React, and Tailwind CSS. Chapter 01 introduces testing; Chapter 02 builds 28 unit tests step by step against Paper Trail, the runnable e-commerce demo in `demo-store/`. Five further chapters are planned. Every testing chapter uses the same demo, adds tests gradually, and ends with a test-code download.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The home page contains the course outline. Standalone chapters are at `/chapters/software-testing/` and `/chapters/unit-testing/`, with stable lesson anchors. All three pages are emitted by the production build, so direct links and refreshes do not require an SPA fallback. The shared sidebar links to the demo ZIP; mobile pages show the same download above the main content.

## Run the demo

Use Node.js 22.12 or newer:

```sh
cd demo-store
npm ci
npm run dev
```

Open http://localhost:5174. The Node server serves the API and Vite middleware together. For production mode, run `npm run build` then `npm start` from the same folder. See `demo-store/README.md` for business rules and limitations: payments are simulated; sessions, stock, and orders live in memory and reset on server restart.

## Unit tests and downloads

The maintained solutions are `demo-store/tests/unit/*.test.js`. Run `npm test` inside `demo-store` (Node's built-in runner); expect 28 passing tests. The starter ZIP excludes tests so learners can add them progressively. Chapter 02 imports the same test source as raw text to keep its snippets aligned with the downloadable solution.

From the course root, rebuild the ZIPs after changing demo source or tests (Python 3, standard library only):

```sh
python scripts/package-downloads.py
npm run build
```

- `public/downloads/paper-trail-demo.zip`: source, lockfile, README; no tests, node_modules, or dist.
- `public/downloads/chapter-02-unit-tests.zip`: four test files under `tests/unit/` plus extraction instructions from `course/unit-testing/README.md`.

Maintainer verification, from the course root:

```sh
python scripts/verify-downloads.py
node scripts/verify-demo-api.mjs
```

Download verification extracts a fresh starter in a temporary directory, runs `npm ci` and a production build, adds tests in chapter order (2 → 8 → 21 → 28), verifies the intentional shipping defect (20 pass / 1 fail), restores it, and verifies the fix. The temporary app is retained for inspection; its location is printed. API verification uses an isolated ephemeral server to check pricing, validation, declined payments, order creation, retry idempotency, session isolation, and inventory competition.

For each later chapter, state the existing app/test prerequisites, exact files to create or edit, commands to run, expected results, and a final test-code ZIP. Keep completed unit tests as the baseline and label any simulated integrations accurately.

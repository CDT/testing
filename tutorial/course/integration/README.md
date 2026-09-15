# Chapter 03: integration solution

Prerequisite: the Paper Trail demo from Testing Notes, Node.js 22.12+, and npm.
This cumulative archive keeps Chapter 02's 28 unit tests and every implemented earlier chapter's tests. It contains test code, configuration, and this README, not a second app.

1. Extract the starter once. Work in its `demo-store` folder, beside `package.json` and `src`.
2. Extract this archive into that same folder. Merge `tests` and compare/replace solution files. Do not delete previous tests or nest another app directory.
3. Restore any temporary exercise defects in production source.
4. For an older starter with bare `node --test`, first run `npm pkg set "scripts.test=node --test tests/unit/shipping.test.js tests/unit/pricing.test.js tests/unit/boundaries.test.js tests/unit/coupons.test.js"` to keep the unit baseline separate.
5. Run `npm ci`, then `npm test`: expect 28 unit passes. The current starter's npm test script selects only unit tests; use the explicit file commands below for later suites.

```sh
node --test tests/integration/checkout.test.js
```

Expected: 6 API tests total (6 integration). The fixture starts real HTTP servers on ephemeral loopback ports and cleans up after every test. No running app is required.

Payments are simulated. There are no accounts, admin roles, durable database, or provider callbacks. Orders, stock, sessions, and request IDs reset on server restart. Session/Origin checks do not make this a production-ready shop. The chapter explains the gaps and how tests would evolve with those features.

File conventions: Node suites use tests/{unit,integration,security,regression}/*.test.js; Playwright uses tests/e2e/*.spec.js; performance uses tests/performance/load.mjs. Do not use bare node --test after adding browser files: use the explicit commands to keep runners separate.

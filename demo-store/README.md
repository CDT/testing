# Paper Trail

A runnable local e-commerce demo for Testing Notes. All testing chapters build on this same app. Node.js serves an HTTP API and Vite serves the React 19 + Tailwind CSS 4 storefront. The starter ZIP has no test files; add them as you follow Chapter 2.

## Run

Install Node.js 22.12+ (Node 24 LTS recommended). Extract the starter ZIP and open a terminal in `demo-store`, the folder containing this package.json.

```sh
npm ci
npm run dev
```

Open http://localhost:5174. One command starts both the API and Vite. Stop it with Ctrl+C. If the port is occupied, stop the previous demo process first or set `PORT` in your shell.

For a local production build:

```sh
npm run build
npm start
```

`npm start` also serves the API; Vite preview alone would not. No database, account, API key, payment provider, or environment file is required. The server binds to loopback. This is a learning application, not a production shop.

## Try it

1. Add four Field notebooks ($25 each) to the bag. Shipping is free at a $100 subtotal; the total with demo tax is $108.
2. Apply WELCOME10. The discounted subtotal is $90, shipping is $5.99, tax is $7.20, and the total is $103.19.
3. Choose Declined payment and place an order. The cart remains and stock is not consumed.
4. Choose Approved payment and try again. An order is confirmed and stock is reduced.
5. Open Your orders. History is scoped to the browser session and survives page refresh, but server restart clears sessions, stock changes, and orders.

## App map

- `src/main.jsx`: catalog, search, category filters, cart, coupons, checkout, and order history.
- `src/domain/pricing.js`: pure calculations and input validation used by the API.
- `src/domain/coupons.js`: coupon resolution with injectable lookup and clock.
- `server/catalog.js`: six products, initial stock, and coupon fixtures.
- `server/api.js`: server-authoritative prices, quotes, session-scoped orders, inventory, and idempotent order submission.
- `server/index.js`: Node HTTP server, Vite development middleware, built-file serving.

The UI sends product IDs and quantities to `/api/quote` and `/api/orders`. Prices are resolved from the server catalog. A quote does not reserve inventory. An order checks inventory again. Payments are simulated; there is no real payment gateway or card collection. Accounts, durable database storage, fulfillment, and admin workflows are future extensions, not implemented features.

## Business rules

- USD amounts are integer cents, from 0 to 100000000 cents per validated amount/subtotal.
- Each quantity must be an integer from 1 to 99; checkout also enforces available stock. Duplicate product lines are combined before validation.
- WELCOME10 gives 10% off all merchandise until January 1, 2099 UTC. EXPIRED10 is an expired example. Coupons are trimmed and uppercased. Only one coupon can be applied. Empty code means no discount; unknown or expired codes are errors. Expiry is exclusive: `now >= expiresAt` is invalid.
- Discount is rounded once on the order subtotal with Math.round (half cents round up).
- Shipping is $5.99, or free at a merchandise subtotal of at least $100 **after discounts, before tax**.
- Illustrative demo tax is 8% of the discounted merchandise subtotal, rounded once. Shipping is not taxed. This is a course rule, not a jurisdictional tax policy.
- Total = subtotal - discount + shipping + tax. An empty bag has all-zero totals and cannot be ordered.
- The starter has the correct `>=` shipping condition. The chapter temporarily changes it to `>` to demonstrate a controlled failing test, then restores it.

## Gradually add unit tests

Use Node's built-in `node:test` and `node:assert/strict`; no test dependency is needed. Create `tests/unit` and add the four files in chapter order:

1. `shipping.test.js`: 2 tests, then `node --test tests/unit/shipping.test.js`.
2. `pricing.test.js`: 6 more tests; `npm test` now runs 8.
3. `boundaries.test.js`: 13 more tests; `npm test` now runs 21.
4. `coupons.test.js`: 7 more tests; `npm test` now runs 28.

`npm test` / `npm run test:unit` use `node --test` auto-discovery. Before adding files, zero tests are expected and are not evidence of coverage. Tests use the `.test.js` naming convention. A passing suite ends with 28 tests, 28 pass, 0 fail. It imports production modules and needs neither Vite nor the HTTP server running.

For the completed download, copy its `tests` folder into this app root (beside `src` and `package.json`), then run `npm test`. Do not replace production modules or create a second nested demo-store folder. Later chapter test downloads will state their prerequisites and build on this baseline.

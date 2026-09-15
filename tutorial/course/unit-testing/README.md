# Chapter 02 — completed unit tests

Requires the Paper Trail starter v1.0.0 from the course sidebar and Node.js 22.12+.

Extract this ZIP. Copy the `tests` folder into the existing `demo-store` folder, beside `src`, `server`, and `package.json`. The final path must be `demo-store/tests/unit/shipping.test.js`, not a second nested demo folder.

From `demo-store`, run:

```sh
npm test
```

Expected: 28 tests, 28 pass, 0 fail. The tests import the app's real domain modules; no browser, running server, extra dependency, or real payment provider is needed. This download adds test files only. If you made the chapter's temporary `>` mutation, restore `>=` in `src/domain/pricing.js` first.

Files, in chapter order:

- `shipping.test.js`: ordinary shipping, 2 tests.
- `pricing.test.js`: calculation, rounding, empty bag, immutability, 6 tests.
- `boundaries.test.js`: shipping limits and invalid input, 13 tests.
- `coupons.test.js`: fake lookup, clock stub, normalization, expiry, 7 tests.

Keep these tests when continuing to integration testing. Unit tests do not establish HTTP, database, browser, or payment-provider behavior.

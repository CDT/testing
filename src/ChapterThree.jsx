import React from 'react';
import Code from './Code';
import { Chapter, Section, FileCode, Download } from './LessonParts';

export default function ChapterThree() {
  return <Chapter number="03" title="Integration testing" intro="Follow an HTTP request through validation, pricing, inventory, and order history. Build six tests that check connections the unit suite cannot see, including retries and competing buyers.">
    <Section id="3.1" title="Choosing integration boundaries">
      <h3>Step 1. Establish the baseline and choose what stays real</h3>
      <p>The current starter keeps <code>npm test</code> scoped to unit files. If your older starter still uses bare <code>node --test</code>, first run this one-time command so adding helpers and browser specs cannot change that baseline:</p>
      <Code>{`npm pkg set "scripts.test=node --test tests/unit/shipping.test.js tests/unit/pricing.test.js tests/unit/boundaries.test.js tests/unit/coupons.test.js"`}</Code>
      <Code>npm test</Code><p>Expected: 28 unit tests pass. Restore Chapter 02’s shipping condition if necessary. You do not need to start Vite: this suite starts its own HTTP server.</p>
      <p>Read <code>server/api.js</code> from the quote route through the order route. A unit test can prove the pricing function works while the HTTP handler still trusts a forged price, forgets to reduce stock, or stores the wrong total. Here the boundary includes real HTTP parsing, routing, catalog lookup, coupon resolution, business calculations, and the application’s in-memory stores.</p>
      <p>The test will call <code>createApi()</code>, not replace it. We leave the browser and static-file server outside this boundary. There is no external payment provider or database to connect. Calling this a database integration test would overstate the evidence.</p>
      <h3>Step 2. Create an isolated HTTP fixture</h3><FileCode path="tests/helpers/api.js"/>
      <p>Port 0 asks the operating system for an available port. Each fixture gets fresh inventory and sessions; each client retains its own cookie. Node fetch does not act as a browser cookie jar, so the helper explicitly returns the session cookie on subsequent requests. The test cleanup closes connections even after an assertion fails.</p>
      <p>Use two clients from one fixture to model customers sharing stock. Use two fixtures to model independent app instances. Confusing those arrangements can produce a passing test that never exercises competition.</p>
    </Section>
    <Section id="3.2" title="Testing APIs and database operations">
      <h3>Step 3. Add the complete integration suite</h3><FileCode path="tests/integration/checkout.test.js"/>
      <Code>node --test tests/integration/checkout.test.js</Code><p>Expected: 6 tests, 6 pass, 0 fail. Keep the four unit files. The chapter commands name files explicitly so browser specs are never sent to Node’s test runner.</p>
      <p>Start with the first test. Its 200 response is only one assertion. The total of 10319 cents proves the real catalog, discount, shipping, and tax were composed correctly; unchanged stock and empty history prove quoting is a read-like operation. A status-only test could miss all three defects.</p>
      <p>The storage checks read through <code>GET /api/orders</code> and <code>GET /api/products</code>, the same interfaces customers use. If a durable database is added later, run it in a disposable test environment, apply the real migrations, and test commit, rollback, uniqueness, and restart recovery. Those tests must use the real repository adapter. The current Map-based fixture proves none of those database guarantees.</p>
    </Section>
    <Section id="3.3" title="Connecting checkout, inventory, and orders">
      <h3>Step 4. Trace the successful write and the competing buyers</h3>
      <Code>node --test --test-name-pattern="order stores|competing sessions" tests/integration/checkout.test.js</Code>
      <p>Expected: the 2 matching tests pass; nonmatching tests are omitted or reported as skipped depending on Node version. An order should return 201, store its exact response in history, and reduce notebooks from 40 to 36. This triangulates the response, history, and shared inventory.</p>
      <p>The race sends two requests for all ten desk sets. Assert the unordered status pair [201, 400], zero remaining stock, and one combined order. Do not assert which buyer wins; scheduling is not a business contract. Running requests sequentially would miss an important concurrency scenario.</p>
      <p>Inspect the no-await region between stock validation and decrement in <code>server/api.js</code>. In this single Node process the sequence is synchronous. Adding an asynchronous payment or database call there changes the concurrency model. A distributed store would need a transaction or another atomic stock mechanism, and tests against that mechanism. One local race test is evidence for this implementation, not proof under every possible schedule.</p>
    </Section>
    <Section id="3.4" title="Testing payment requests and callbacks">
      <h3>Step 5. Check failure before allowing success</h3>
      <Code>node --test --test-name-pattern="decline" tests/integration/checkout.test.js</Code>
      <p>Expected: 1 matching test passes. The simulated decline returns 402, writes no order, and consumes no stock. Changing the payment outcome to approved then succeeds. Failed attempts are not stored in the successful-request cache, so this API accepts the corrected attempt with the same request ID.</p>
      <p>The payment field is an exercise switch, not a charge request. There is no webhook route, signature, provider reference, pending state, or callback retry queue. Do not invent callback tests that simply assert behavior in a mock unrelated to the app.</p>
      <p>For a future gateway, extend this same boundary with a provider adapter. First specify pending → paid transitions, then add sandbox request-contract tests and callback tests for invalid signatures, repeated event IDs, out-of-order delivery, and amount/currency mismatch. Use synthetic provider fixtures, retain the present decline tests, and make durable deduplication part of the implementation before claiming callback reliability.</p>
    </Section>
    <Section id="3.5" title="Handling failures, retries, and duplicate events">
      <h3>Step 6. Separate retry from a new purchase</h3>
      <Code>node --test --test-name-pattern="same request" tests/integration/checkout.test.js</Code>
      <p>Expected: 1 matching test passes. The first attempt creates an order with 201; an identical request in the same session returns that same order with 200. Reusing the ID with a changed coupon returns 409. The stock and history assertions catch duplicate side effects even if both responses look successful.</p>
      <p>Request IDs are scoped to the session. The fingerprint uses the submitted items, coupon, and payment, so different representations of a logically similar cart can conflict. A new ID means a new purchase; this is not global deduplication. Restarting the process forgets both orders and IDs.</p>
      <p>Exercise: temporarily change the replay response status from 200 to 201 in <code>server/api.js</code>. Rerun this command and confirm the status assertion fails, then restore 200 and rerun. Never leave the exercise defect in place. Chapter 04 will test the customer-visible version of a retry after a lost response.</p>
    </Section>
    <Section id="3.6" title="Managing test data and environments">
      <h3>Step 7. Verify reset behavior and repeatability</h3>
      <Code>{`node --test tests/integration/checkout.test.js
node --test tests/integration/checkout.test.js
npm test`}</Code><p>Expected: 6 integration passes on each run, followed by 28 unit passes. The reset test deliberately creates another API instance and checks initial stock and empty history. It documents data loss on restart, not durable recovery.</p>
      <p>Keep fixtures small and named after intent. Do not seed through a private reset endpoint exposed to shoppers. On a failure, record the test name, request body, expected status and state, actual result, and whether it reproduces alone. A suite that only passes in one order has a fixture defect until proven otherwise.</p>
      <p>Reference: <a href="https://nodejs.org/api/test.html">Node’s test runner and cleanup hooks</a>.</p>
      <Download number="03" slug="integration" next="/chapters/end-to-end-testing/" nextTitle="Continue to end-to-end testing"/>
    </Section>
  </Chapter>;
}

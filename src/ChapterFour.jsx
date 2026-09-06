import React from 'react';
import Code from './Code';
import { Chapter, Section, FileCode, Download } from './LessonParts';

export default function ChapterFour() {
  return <Chapter number="04" title="End-to-end testing" intro="Drive the real React storefront against the real Node API. Add five browser tests for discovery, checkout, recovery, and a compact smoke suite.">
    <Section id="4.1" title="Defining critical customer journeys">
      <h3>Step 1. Preserve fast checks and install the browser runner</h3>
      <Code>{`npm test
node --test tests/integration/checkout.test.js
npm ci
npx playwright install chromium`}</Code>
      <p>Expected: 28 unit and 6 integration passes, then Chromium installs. The current starter already pins <code>@playwright/test</code> in its package and lockfile. If you have an older starter without it, run <code>npm install --save-dev --save-exact @playwright/test@1.63.0</code> before the browser installation; use the version in the chapter README if it differs. Commit both dependency files when working in your own repository.</p>
      <p>Choose journeys by consequence: customers must find a product, adjust the bag, see the correct discounted total, place one order, and recover from a decline or lost response. Exhaustive quantity and coupon combinations belong in the fast suites. Browser tests add evidence about wiring, rendering, and interaction.</p>
      <h3>Step 2. Configure a dedicated production-mode test server</h3><FileCode path="playwright.config.js"/>
      <p>Port 5175 is reserved for this suite. Stop any earlier test server on that port. The runner builds the React app, starts its real Node server, waits for the products endpoint, then stops the server afterward. It refuses to reuse a manually running app so each invocation starts with known inventory.</p>
      <p>One worker and no automatic retries make shared inventory predictable. Playwright gives each test a fresh browser context and session, but the server’s stock is shared for the invocation. The suite buys only small quantities and never assumes a particular remaining count. Increasing workers or retries requires reconsidering that fixture design.</p>
    </Section>
    <Section id="4.2" title="Testing product search and the shopping cart">
      <h3>Step 3. Add the complete journey file</h3><FileCode path="tests/e2e/store.spec.js"/>
      <Code>npx playwright test tests/e2e/store.spec.js --grep "search and edit"</Code>
      <p>Expected: 1 browser test passes. It narrows search to one product, changes the quantity to four, waits for the $108 quote, removes the product, checks checkout is disabled, and clears a no-result search. This checks both positive discovery and recovery from empty results.</p>
      <p>The quantity control has an accessible name describing its product. Prefer that name to a generated class or the third input on the page. The total assertion uses the existing <code>.grand-total</code> container because it identifies a specific summary row; scope such selectors deliberately and revisit them if the markup changes.</p>
    </Section>
    <Section id="4.3" title="Completing checkout and verifying the order">
      <h3>Step 4. Verify a complete purchase</h3>
      <Code>npx playwright test tests/e2e/store.spec.js --grep "discounted checkout"</Code>
      <p>Expected: 1 test passes. Four notebooks with WELCOME10 must display $103.19. A confirmation heading alone is insufficient: the test checks the amount, reloads the page, then verifies one history entry with the correct quantity and amount.</p>
      <p>Refreshing retains the session cookie and retrieves history from the API. The bag itself is React state and does not persist across refresh. The test asserts history persistence within the running server, not account ownership or survival across a server restart.</p>
      <p>Keep the money expectation independent of production calculations. Importing the pricing function to compute this browser expectation would hide a shared arithmetic defect. Chapter 02 already explains where 10319 cents comes from.</p>
    </Section>
    <Section id="4.4" title="Testing declined payments and interrupted checkout">
      <h3>Step 5. Run the two recovery journeys</h3>
      <Code>npx playwright test tests/e2e/store.spec.js --grep "declined payment|lost order response"</Code>
      <p>Expected: 2 tests pass. A decline leaves the bag and zero orders; selecting approved then works. For the interruption case, the route handler sends the real order to the server, reads its successful response, and aborts delivery to the page. This creates the important uncertainty: the customer sees failure although the server committed the purchase.</p>
      <p>After removing that fault, clicking again must return 200 with the original order ID and leave exactly one history entry. The fault is deliberately injected only at the response boundary; catalog, pricing, stock, and order creation stay real.</p>
      <p>The request ID lives in a React ref. This recovery test stays on the page. Refreshing after an ambiguous response loses that ref and the bag; this demo does not promise cross-refresh retry recovery. A production checkout would need a durable client/server recovery design and tests for it.</p>
    </Section>
    <Section id="4.5" title="Reliable browser tests: selectors, waits, and isolation">
      <h3>Step 6. Run the complete file and inspect failures</h3>
      <Code>{`npx playwright test tests/e2e/store.spec.js
npx playwright show-report`}</Code><p>Expected: 5 tests pass. The report opens for inspection; failed cases retain a trace. If a command fails, first check server startup and browser installation, then inspect the failing action, DOM, and network response.</p>
      <p>Use awaited locator assertions for changing UI. The quote is asynchronous, so reading text immediately after typing can race the response. The test uses a response promise registered before the retry click when it needs the exact HTTP result. Avoid fixed sleeps: a delay can be both too short on a slow machine and wasteful on a fast one.</p>
      <p>Run a failing case alone with <code>--grep</code>. Then run the full file. If only the full run fails, investigate shared stock and leaked routes before increasing timeouts. Keep selectors tied to observable UI behavior; a trace should help explain a customer failure, not just an implementation detail.</p>
      <p>References: <a href="https://playwright.dev/docs/test-webserver">managed web servers</a> and <a href="https://playwright.dev/docs/test-assertions">retrying assertions</a>.</p>
    </Section>
    <Section id="4.6" title="Building a small deployment smoke suite">
      <h3>Step 7. Run only the tagged critical checks</h3>
      <Code>npx playwright test tests/e2e/store.spec.js --grep @smoke</Code><p>Expected: 2 tests pass: catalog availability and one discounted checkout with history. This is a local release-candidate smoke run against the built app. It creates a simulated order in an isolated process.</p>
      <p>A deployment smoke suite should use the same small set of meaningful checks, but this configuration always launches the local demo. It does not test a remote deployment. Before adapting it for staging, provide a controlled test tenant, synthetic payment method, cleanup policy, and an explicit target URL. Do not point a purchase test at a real shop by casually changing the base URL.</p>
      <p>A smoke pass answers whether the main route is usable. It does not replace the full suite, mobile review, or security and performance checks. Keep all five tests for Chapter 07’s release workflow.</p>
      <Download number="04" slug="e2e" next="/chapters/security-testing/" nextTitle="Continue to security testing"/>
    </Section>
  </Chapter>;
}

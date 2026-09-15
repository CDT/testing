import React from 'react';
import Code from './Code';
import shippingTests from '../demo-store/tests/unit/shipping.test.js?raw';
import pricingTests from '../demo-store/tests/unit/pricing.test.js?raw';
import boundaryTests from '../demo-store/tests/unit/boundaries.test.js?raw';
import couponTests from '../demo-store/tests/unit/coupons.test.js?raw';

export default function ChapterTwo() {
  return <article className="lesson" aria-label="Chapter 02: Unit testing">
    <header className="lesson-header">
      <span>Chapter 02 · Paper Trail demo v1.0</span><h1>Unit testing</h1>
      <p>Build a 28-test unit suite for a working e-commerce app. Start with shipping, add pricing and boundary checks, then control coupon lookup and time.</p>
      <blockquote><strong>One real app, throughout the course.</strong> Paper Trail is our stationery shop: a Node.js API with a Vite, React, and Tailwind storefront. Every testing chapter builds on this app. Keep the same project folder and add tests as you progress.</blockquote>
      <p>The starter download contains the working app without test files. You will import the production modules used by checkout. This chapter uses Node’s built-in test runner; no testing package is needed.</p>
      <nav aria-label="Unit testing lessons"><ol>
        <li><a className="lesson-next" href="#lesson-2-1">Run the app and choose a unit boundary</a></li>
        <li><a className="lesson-next" href="#lesson-2-2">Add your first two shipping tests</a></li>
        <li><a className="lesson-next" href="#lesson-2-3">Add six pricing tests</a></li>
        <li><a className="lesson-next" href="#lesson-2-4">Add thirteen boundary tests and catch a defect</a></li>
        <li><a className="lesson-next" href="#lesson-2-5">Add seven coupon tests and download the suite</a></li>
      </ol></nav>
    </header>

    <section id="lesson-2-1" className="lesson-section">
      <span className="lesson-number">2.1</span><h2>What belongs in a unit test?</h2>
      <h3>Step 1. Download and start Paper Trail</h3>
      <p>Install Node.js 22.12 or newer. Download and extract the starter ZIP. From the directory where you extracted it, run these commands to enter the app folder and start it:</p>
      <p><a className="lesson-next" href="/downloads/paper-trail-demo.zip" download>Download Paper Trail demo app (ZIP)</a></p>
      <Code>{`cd demo-store
npm ci
npm run dev`}</Code>
      <p>Open <a className="lesson-next" href="http://localhost:5174" target="_blank" rel="noreferrer">http://localhost:5174</a>. One command starts both the Node API and Vite. If the port is occupied, stop the other demo process first. No database setup, API key, or payment account is needed.</p>
      <h3>Step 2. Try the behavior you will protect</h3>
      <ol>
        <li>Add four Field notebooks, at $25 each. Without a coupon, the subtotal is $100, shipping is free, and the total with demo tax is $108.</li>
        <li>Apply <code>WELCOME10</code>. The discounted subtotal becomes $90. Shipping is $5.99 and tax is $7.20, for a total of $103.19.</li>
        <li>Select “Declined payment” and place the order. An error appears; your cart remains.</li>
        <li>Select “Approved payment” and retry. The order is confirmed, stock decreases, and “Your orders” shows the purchase.</li>
      </ol>
      <p>Payments are simulated. Orders and inventory are held in server memory and reset on server restart; order history is scoped to the browser session. Accounts, a persistent database, and a real payment gateway are future extensions, not current features.</p>
      <h3>Step 3. Find the production boundary</h3>
      <Code>{`demo-store/
  server/api.js             # HTTP quotes, orders, stock checks
  server/catalog.js         # Product prices and coupon fixtures
  src/main.jsx              # React storefront
  src/domain/pricing.js     # Money, quantity, totals
  src/domain/coupons.js     # Coupon lookup and expiration
  package.json              # Run, build, and test commands`}</Code>
      <p>Open <code>server/api.js</code>. Its quote and order handlers use <code>calculateTotals</code> from <code>src/domain/pricing.js</code>. The browser submits IDs and quantities; the server supplies prices. Our unit tests will call the production calculation functions directly without HTTP or a browser.</p>
      <p>A unit is a small, coherent behavior, not necessarily one function. Testing a pure total calculation that calls pure helpers is useful here. HTTP validation, stock updates, and browser journeys need broader tests in later chapters.</p>
      <p>Stop the app with Ctrl+C if you like; unit tests do not require it to be running. Run every command below from <code>demo-store</code>, beside its <code>package.json</code>.</p>
    </section>

    <section id="lesson-2-2" className="lesson-section">
      <span className="lesson-number">2.2</span><h2>Arrange, act, assert: writing your first test</h2>
      <p>Shipping costs 599 cents unless the merchandise subtotal after discounts is at least 10000 cents. We derive expected results from this requirement, not by copying the implementation into the test.</p>
      <h3>Step 4. Create the first test file</h3>
      <p>In your editor, create the folders <code>tests/unit</code> and the file <code>tests/unit/shipping.test.js</code>. Paste this complete file:</p>
      <Code>{shippingTests}</Code>
      <p><strong>Arrange</strong> establishes the input, <strong>act</strong> calls production code, and <strong>assert</strong> compares its result with an independently known amount. The import goes up two folders from <code>tests/unit</code> to the app root, then into <code>src/domain</code>.</p>
      <h3>Step 5. Run the two tests</h3>
      <Code>node --test tests/unit/shipping.test.js</Code>
      <p>Expected: <strong>2 tests, 2 pass, 0 fail.</strong> The existing <code>npm test</code> command selects <code>tests/unit/*.test.js</code> files through <code>scripts/run-checks.mjs</code>. Before adding files, a zero-test run is not evidence of coverage.</p>
      <p>Temporarily change the first expected value from 599 to 600 and rerun. The failure should show actual 599 versus expected 600. Restore 599. This confirms the assertion executes, not that the suite covers every shipping case.</p>
      <p>A “module not found” error is a setup problem: check paths and filenames. An assertion mismatch requires investigating the requirement, input, and implementation. Do not change an expectation merely to get a passing result.</p>
      <p className="lesson-source">API references: <a href="https://nodejs.org/api/test.html" target="_blank" rel="noreferrer">Node.js test runner</a> and <a href="https://nodejs.org/api/assert.html" target="_blank" rel="noreferrer">strict assertions</a>.</p>
    </section>

    <section id="lesson-2-3" className="lesson-section">
      <span className="lesson-number">2.3</span><h2>Testing prices, discounts, taxes, and shipping</h2>
      <h3>Step 6. Read the calculation contract</h3>
      <p>The demo README documents these rules. Amounts are nonnegative integer cents; quantities are integers from 1 to 99. The API separately enforces available stock.</p>
      <div className="lesson-table"><table><thead><tr><th scope="col">Calculation</th><th scope="col">Demo rule</th></tr></thead><tbody>
        <tr><th scope="row">Subtotal</th><td>Add unit price × quantity for each line.</td></tr>
        <tr><th scope="row">Discount</th><td>WELCOME10 takes 10% off all merchandise. Round once on the order subtotal; half cents round up.</td></tr>
        <tr><th scope="row">Shipping</th><td>599 cents, or zero from 10000 cents after discounts and before tax.</td></tr>
        <tr><th scope="row">Demo tax</th><td>8% of discounted merchandise, rounded once. Shipping is not taxed. This is an illustrative course rule.</td></tr>
        <tr><th scope="row">Total</th><td>Subtotal − discount + shipping + tax. Empty bags have all-zero totals.</td></tr>
      </tbody></table></div>
      <p>Four $25 notebooks with WELCOME10 cost 10000 − 1000 + 599 + 720 = 10319 cents. The discount moves the order below the shipping threshold. Applying shipping before the discount would give the wrong result.</p>
      <h3>Step 7. Add the pricing file</h3>
      <p>Create <code>tests/unit/pricing.test.js</code> beside the shipping file. Keep the original file and paste:</p>
      <Code>{pricingTests}</Code>
      <p>The first checks isolate arithmetic and rounding. The complete-total test checks their composition. Strict <code>assert.deepEqual</code> compares every returned field. The final test verifies the calculation does not mutate its caller’s cart.</p>
      <h3>Step 8. Run the growing suite</h3>
      <Code>npm test</Code>
      <p>Expected: <strong>8 tests, 8 pass, 0 fail.</strong> The original shipping tests remain. Fractional-cent cases such as 10% of 999 cents distinguish rounding from truncation. Integer storage alone does not settle rounding policy.</p>
    </section>

    <section id="lesson-2-4" className="lesson-section">
      <span className="lesson-number">2.4</span><h2>Boundary cases and invalid inputs</h2>
      <h3>Step 9. Check just below, at, and above the threshold</h3>
      <p>The $60 and $120 cases cannot distinguish <code>&gt;</code> from <code>&gt;=</code>. Add 9999, 10000, and 10001 cents. Check quantity endpoints and invalid values at the validator that owns that contract.</p>
      <p>Create <code>tests/unit/boundaries.test.js</code>:</p>
      <Code>{boundaryTests}</Code>
      <p>Each loop creates separately named tests. <code>assert.throws</code> takes a function so it can observe the call throwing. These tests validate quantity values, not the availability of stock.</p>
      <Code>npm test</Code>
      <p>Expected: <strong>21 tests, 21 pass, 0 fail.</strong></p>
      <h3>Step 10. Introduce a controlled defect, then fix it</h3>
      <p>The starter ships with correct behavior. Open <code>src/domain/pricing.js</code> and temporarily change only the return condition inside <code>shippingCost</code>:</p>
      <Code>{`// Temporary defect for this exercise:
return subtotalAfterDiscountCents > 10000 ? 0 : 599;`}</Code>
      <Code>npm test</Code>
      <p>Expected: <strong>21 tests, 20 pass, 1 fail.</strong> Shipping at 10000 cents returns actual 599 versus expected 0. The original $60 and $120 checks still pass.</p>
      <p>Restore equality in the production condition:</p>
      <Code>{`return subtotalAfterDiscountCents >= 10000 ? 0 : 599;`}</Code>
      <Code>npm test</Code>
      <p>Expected: <strong>21 pass, 0 fail.</strong> Keep both the test and the corrected condition. Repeating the failed case is confirmation testing; retaining it helps detect future regressions. This reproduces an intentional exercise defect, not an unknown bug in the starter.</p>
    </section>

    <section id="lesson-2-5" className="lesson-section">
      <span className="lesson-number">2.5</span><h2>Test doubles and keeping tests independent</h2>
      <h3>Step 11. Find the coupon dependencies</h3>
      <p>Open <code>src/domain/coupons.js</code>. <code>resolveCoupon</code> accepts a code plus <code>findCoupon</code> and <code>now</code>. Production uses the server’s coupon map and the real clock. Tests supply controlled replacements without changing production code.</p>
      <p>Codes are trimmed and uppercased. Blank codes mean no discount. Unknown codes and coupons at or after expiration are rejected. Fixed test time makes the cases stable next month and next year.</p>
      <h3>Step 12. Add coupon tests</h3>
      <p>Create <code>tests/unit/coupons.test.js</code>:</p>
      <Code>{couponTests}</Code>
      <p>The in-memory map is a <strong>fake repository</strong>; the fixed clock is a <strong>stub</strong>. The lookup counter is a small <strong>spy</strong> checking that blank input skips that dependency. None of these establish a real database connection.</p>
      <p>Each call to <code>dependencies</code> creates fresh state. No test waits for real time or requires another to run first. Pure pricing functions need no mocks. Prefer assertions about returned behavior over assertions about every internal helper call.</p>
      <h3>Step 13. Run one file and the complete suite</h3>
      <Code>{`node --test tests/unit/coupons.test.js
npm test`}</Code>
      <p>Expected: <strong>7 coupon tests</strong> in the first run; <strong>28 tests, 28 pass, 0 fail</strong> in the full run. Timing and formatting vary by Node version.</p>
      <Code>{`tests/
  unit/
    shipping.test.js     # 2 tests
    pricing.test.js      # 6 tests
    boundaries.test.js   # 13 tests
    coupons.test.js      # 7 tests`}</Code>
      <p>These tests provide evidence about calculations, validation, and coupons. They do not prove the API uses the right inputs, the browser works, or orders survive failures. Integration testing will add checks around those connections in this same project.</p>
      <h3>Download the completed unit test code</h3>
      <p><a className="lesson-download" href="/downloads/chapter-02-unit-tests.zip" download>Download Chapter 02 test code (ZIP)</a></p>
      <p>Extract the ZIP and copy its <code>tests</code> folder into your existing <code>demo-store</code> folder, beside <code>src</code> and <code>package.json</code>. If you followed the chapter, compare the files or replace your test files with these. The archive contains tests and a README, not another app. Restore <code>&gt;=</code> if you left the temporary defect in place, then run <code>npm test</code>.</p>
      <p><strong>Carry this forward:</strong> retain the suite. Each later testing chapter will specify the next files to add and provide its test-code download at the end.</p>
      <a className="lesson-next" href="/chapters/integration-testing/">Continue to integration testing</a>
    </section>
  </article>;
}

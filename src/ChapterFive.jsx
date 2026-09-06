import React from 'react';
import Code from './Code';
import { Chapter, Section, FileCode, Download } from './LessonParts';

export default function ChapterFive() {
  return <Chapter number="05" title="Security testing" intro="Turn concrete threats into repeatable checks of session isolation, trusted prices, input handling, and rendering. Add seven API tests and one focused browser test without pretending this local demo is a production payment system.">
    <Section id="5.1" title="Identifying threats and setting up a safe test environment">
      <h3>Step 1. Map assets, entry points, and trust boundaries</h3>
      <p>Continue with Chapters 02–04’s files and installed Chromium. Run <code>npm test</code> and the integration command before adding security cases. Expected: 28 unit and 6 integration passes. These API tests create isolated loopback servers; the browser test uses the dedicated port 5175 configuration.</p>
      <p>Assets are order history, inventory, and the price charged by the simulation. Entry points are cookies, cart JSON, coupons, and rendered catalog data. Treat every browser-supplied value as untrusted. A hidden field is still input; disabling a button is not server-side validation.</p>
      <div className="lesson-table"><table><thead><tr><th>Threat</th><th>Observable requirement</th></tr></thead><tbody><tr><td>A stranger reads another session’s orders</td><td>A second client sees an empty history</td></tr><tr><td>A buyer changes the price or discount</td><td>The server calculates the documented total</td></tr><tr><td>A foreign page submits an order</td><td>A mismatched Origin receives 403</td></tr><tr><td>Catalog text becomes executable markup</td><td>React renders the string as text</td></tr></tbody></table></div>
      <p>Keep these exercises on your local demo. It has anonymous sessions, simulated payments, and no authentication or admin roles. The tests cover these boundaries specifically; there is no password reset, login lockout, or real card-data handling to certify.</p>
      <h3>Step 2. Add the API security file</h3><FileCode path="tests/security/api.test.js"/>
      <Code>node --test tests/security/api.test.js</Code><p>Expected: 7 tests pass. Each test starts clean state and checks a legitimate or known-good result as well as the rejection it cares about.</p>
    </Section>
    <Section id="5.2" title="Testing authentication and sessions">
      <h3>Step 3. Inspect the cookie and session isolation cases</h3>
      <Code>node --test --test-name-pattern="session" tests/security/api.test.js</Code><p>Expected: 2 matching tests pass. A new session gets a generated ID, HttpOnly, SameSite=Strict, Path=/, and no Domain attribute. A forged unknown ID is replaced rather than adopted, while its history stays empty.</p>
      <p>These are anonymous sessions, not authenticated identities. Anyone holding a valid session cookie can act as that session. The test does not demonstrate resistance to stolen cookies, expiration, logout invalidation, or privilege escalation.</p>
      <p>HttpOnly limits script access to the cookie; it does not eliminate XSS. SameSite constrains browser cookie sending; it is not an authorization rule. The local HTTP cookie lacks Secure, and the server has no session expiry. Those are documented deployment gaps, not assertions to weaken until a production review passes.</p>
      <p>If login is added, test session rotation on authentication, invalidation on logout, expiration using a controlled clock, and access after a password reset. Keep the existing anonymous-session checks where that browsing mode remains supported.</p>
      <p>Reference: <a href="https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/06-Session_Management_Testing/02-Testing_for_Cookies_Attributes">OWASP cookie attribute testing</a>.</p>
    </Section>
    <Section id="5.3" title="Protecting customer orders and admin functions">
      <h3>Step 4. Check both ownership and cross-origin writes</h3>
      <Code>node --test --test-name-pattern="another or forged|cross-origin" tests/security/api.test.js</Code><p>Expected: 2 matching tests pass. The owner sees one order; a fresh client and a guessed-session client see none. A foreign Origin cannot create an order, while the fixture’s own origin can.</p>
      <p>The API only lists the current session’s orders; it has no order-by-ID route. Trying arbitrary UUIDs against an unrelated nonexistent URL would not test object authorization. Likewise, <code>/api/admin</code> returning 404 documents that no admin endpoint exists; it proves no role policy.</p>
      <p>The Origin rule applies to POST requests that include that header. Nonbrowser callers can omit or forge it. Treat it as one browser-request defense, not client authentication. The comparison is written for this loopback HTTP server; HTTPS and reverse-proxy deployment need a deliberate origin configuration.</p>
      <p>For future account and admin features, define an actor/resource/action matrix before writing tests: owner reads own order, another customer is denied, support has explicitly limited access, and an unauthenticated request is rejected. Assert response bodies and side effects, not just status codes.</p>
    </Section>
    <Section id="5.4" title="Testing price, quantity, and coupon manipulation">
      <h3>Step 5. Exercise the server rather than the disabled UI</h3>
      <Code>node --test --test-name-pattern="forged prices|invalid quantities" tests/security/api.test.js</Code><p>Expected: 2 matching tests pass. A request claiming one-cent notebooks, a 100% discount, and a zero total must still create the documented $103.19 order. The ignored fields test server authority; invalid quantities and coupons test rejection.</p>
      <p>Negative, zero, fractional, string, and oversized quantities represent different input classes. The final history and stock checks confirm that validation failures leave no partial purchase. Chapter 07 adds a targeted regression for duplicate lines that are individually plausible but exceed stock when combined.</p>
      <p>Exercise: temporarily replace the server’s <code>priceCents: product.priceCents</code> in <code>prepare</code> with <code>priceCents: 1</code>. Run the forged-price case and observe a failed amount assertion. Restore the production catalog price and rerun the entire security file. Keep this as a local exercise, not a committed application change.</p>
    </Section>
    <Section id="5.5" title="Testing injection and cross-site scripting">
      <h3>Step 6. Separate validation evidence from rendering evidence</h3>
      <Code>node --test --test-name-pattern="injection-shaped" tests/security/api.test.js</Code><p>Expected: 1 matching test passes. SQL-shaped and HTML-shaped product IDs are rejected without being echoed. Malformed JSON and a body larger than 16 KiB receive 400. There is no SQL engine here, so this is input-handling evidence, not proof against SQL injection in a future repository.</p>
      <h3>Step 7. Add an actual browser rendering check</h3><FileCode path="tests/e2e/security.spec.js"/>
      <Code>npx playwright test tests/e2e/security.spec.js</Code><p>Expected: 1 browser test passes. The test changes one catalog response to carry an HTML-shaped name, then checks that the visible heading contains literal text and no image element was created. The dialog counter supplements those structural assertions.</p>
      <p>This deliberately stubbed catalog response isolates React rendering. It does not represent stored XSS through an admin form: the app has no product editor. If a future feature uses raw HTML insertion, markdown, or user-generated descriptions, add payloads and tests for those exact rendering sinks.</p>
    </Section>
    <Section id="5.6" title="Checking sensitive data exposure and verifying fixes">
      <h3>Step 8. Check the response contract, then rerun the baseline</h3>
      <Code>{`node --test tests/security/api.test.js
npx playwright test
npm test
node --test tests/integration/checkout.test.js`}</Code><p>Expected: 7 security API, 6 browser, 28 unit, and 6 integration passes. The last API security case checks JSON content type, no-store, nosniff, and the exact documented order fields. It would catch accidentally returning the session’s internal request map in the order response.</p>
      <p>Record findings with a reproducible request, expected and actual behavior, impact, affected boundary, fix, and rerun evidence. For example, a future endpoint returning another customer’s order is a confidentiality defect; missing login tests for a feature that does not exist are a scope gap. Keep that distinction in the report.</p>
      <p>Remaining gaps include HTTPS and Secure cookies, session expiration and storage limits, authentication, authorization for future routes, real payment verification, and rate limiting. No scanner or eight-case suite can label this demo production-safe. These tests are a maintained set of concrete checks, to expand when the application’s capabilities change.</p>
      <Download number="05" slug="security" next="/chapters/performance-testing/" nextTitle="Continue to performance and load testing"/>
    </Section>
  </Chapter>;
}

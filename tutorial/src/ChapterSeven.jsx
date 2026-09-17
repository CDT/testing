import React from 'react';
import Code from './Code';
import { Chapter, Section, Download } from './LessonParts';

const workflow = `name: Paper Trail tests
on: [push, pull_request]
permissions:
  contents: read
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
      - run: npm ci
      - run: node --test "tests/unit/*.test.js" "tests/integration/*.test.js" "tests/security/*.test.js"
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test`;

export default function ChapterSeven() {
  return <Chapter number="07" title="Regression testing" intro="Regression testing doesn't need new test files. It means rerunning the tests you already have after every change. This chapter shows you which tests to run, when to run them, and how to handle failures.">
    <Section id="7.1" title="Confirmation versus regression testing">
      <p><strong>Confirmation testing</strong> reruns the test that failed, to check that your fix works. <strong>Regression testing</strong> reruns the tests that already passed, to check that the change didn’t break them. Any test that passes today can catch a regression tomorrow.</p>
      <p>Try it. In <code>src/domain/pricing.js</code>, change <code>&gt;= 10000</code> to <code>&gt; 10000</code> and run the unit tests. Only <code>shipping for 10000 cents is 0</code> fails. Change it back. Then rerun that file to confirm the fix, and rerun every suite to check for regressions.</p>
      <Code>{`node --test "tests/unit/*.test.js"
node --test tests/unit/boundaries.test.js`}</Code>
    </Section>
    <Section id="7.2" title="Selecting tests based on change impact and risk">
      <p>Start with the tests closest to the code you changed, then run more.</p>
      <div className="lesson-table"><table><thead><tr><th>You changed…</th><th>Run first</th></tr></thead><tbody>
        <tr><td>Pricing or coupons</td><td>Unit tests</td></tr>
        <tr><td>Cart, stock, or checkout API</td><td>Integration tests</td></tr>
        <tr><td>Sessions, headers, input validation</td><td>Security tests</td></tr>
        <tr><td>React UI</td><td>Browser tests</td></tr>
        <tr><td>Dependencies or anything shared</td><td>Everything</td></tr>
      </tbody></table></div>
      <p>This only helps if a test covers the risk. In <code>server/api.js</code>, replace <code>(quantities.get(item.id) || 0) + item.quantity</code> with <code>item.quantity</code>. Every test still passes, even though a cart with two lines of the same product can now skip the stock check. When you find a gap like this, add the missing test to the existing suite for that behavior, here the integration tests.</p>
    </Section>
    <Section id="7.3" title="Combining unit, integration, E2E, security, and performance checks">
      <p>Before a release, run the suites from fastest to slowest and stop at the first failure:</p>
      <Code>{`node --test "tests/unit/*.test.js"
node --test "tests/integration/*.test.js" "tests/security/*.test.js"
npx playwright test
node tests/performance/load.mjs baseline`}</Code>
      <p>Expected results:</p>
      <ul>
        <li>28 unit tests pass.</li>
        <li>13 API tests pass (6 integration and 7 security).</li>
        <li>6 browser tests pass.</li>
        <li>The performance report stays within its limits.</li>
      </ul>
      <p>Test each rule at the lowest level that can check it. Don’t repeat unit test inputs in browser tests.</p>
    </Section>
    <Section id="7.4" title="Running the right checks in CI and before release">
      <p>Save this file as <code>.github/workflows/testing.yml</code>. GitHub will then run the unit, integration, security, and browser tests on every push and pull request. Make the job a required check so a pull request can’t be merged while it fails. Run performance tests yourself, on the same machine each time: timings on shared CI machines vary too much to compare.</p>
      <Code>{workflow}</Code>
    </Section>
    <Section id="7.5" title="Investigating failures and managing flaky tests">
      <p>First, rerun only the failing test:</p>
      <Code>{`node --test --test-name-pattern="shipping for 10000" tests/unit/boundaries.test.js
npx playwright test --grep "lost order response"`}</Code>
      <p>If it fails only when the whole suite runs, tests are probably sharing state. If it passes and fails on the same commit, look for a timing problem.</p>
      <p>Then decide what went wrong:</p>
      <ul>
        <li>a bug in the code;</li>
        <li>a test that is out of date after a requirement changed;</li>
        <li>a setup or environment problem.</li>
      </ul>
      <p>Don’t change an expected value just to make a test pass. Retries are set to 0 so flaky tests stay visible. If you must quarantine a flaky test, give it an owner and an expiry date.</p>
    </Section>
    <Section id="7.6" title="Maintaining the suite as the store evolves">
      <ul>
        <li>After every bug fix, add a test that reproduces the bug to the suite that covers that behavior.</li>
        <li>When a requirement changes, update the tests and fixtures in the same pull request.</li>
        <li>Delete a test only if another test already covers the same risk.</li>
      </ul>
      <p>With these habits, your 28 unit, 6 integration, 7 security, and 6 browser tests keep protecting the store as it changes.</p>
      <Download number="07" slug="regression" next="/#contents" nextTitle="Return to the complete course outline"/>
    </Section>
  </Chapter>;
}

import React from 'react';
import Code from './Code';
import { Chapter, Section, FileCode, Download } from './LessonParts';

export default function ChapterSeven() {
  return <Chapter number="07" title="Regression testing" intro="Turn the accumulated checks into a maintainable release workflow. Add three named regression cases, practice confirming a fix, and run the right evidence for each kind of change.">
    <Section id="7.1" title="Confirmation versus regression testing">
      <h3>Step 1. Identify the behavior a change could disturb</h3>
      <p>Start with all files from Chapters 02–06. Confirmation testing reruns a known failing example after a fix. Regression testing checks whether existing behavior still holds after any change. The same test can serve both purposes at different times.</p>
      <p>The shipping exercise in Chapter 02 is a controlled example: changing ≥ to &gt; caused the exact-threshold test to fail; restoring ≥ confirmed the fix. Retaining that test guards the rule when pricing changes later. A regression case should describe the requirement or failure scenario, not every line of the patch.</p>
      <h3>Step 2. Add three cross-boundary regression cases</h3><FileCode path="tests/regression/checkout.test.js"/>
      <Code>node --test tests/regression/checkout.test.js</Code><p>Expected: 3 tests pass. REG-001 carries the discounted shipping result into stored history. REG-002 rejects combined duplicate lines exceeding stock. REG-003 rechecks stock after an earlier successful quote. These are named teaching scenarios, not claims about historical production incidents.</p>
    </Section>
    <Section id="7.2" title="Selecting tests based on change impact and risk">
      <h3>Step 3. Build a change-to-evidence map</h3>
      <div className="lesson-table"><table><thead><tr><th>Change</th><th>First checks</th><th>Broader evidence</th></tr></thead><tbody><tr><td>Discount or shipping rule</td><td>Unit pricing and boundaries; REG-001</td><td>Integration quote and discounted browser checkout</td></tr><tr><td>Cart merging or stock handling</td><td>REG-002 and REG-003</td><td>Competing buyers and bag interactions</td></tr><tr><td>Session or request cache</td><td>Security isolation and integration replay</td><td>Lost-response browser recovery</td></tr><tr><td>React markup or navigation</td><td>Browser journeys and rendering test</td><td>Keyboard, small viewport, and visual review</td></tr><tr><td>Server dependency or concurrency</td><td>All deterministic suites</td><td>Browser suite and comparable load experiment</td></tr></tbody></table></div>
      <p>Selection speeds feedback; it does not justify permanently excluding other tests. Shared dependencies and uncertain impact are reasons to broaden the run. In this small project the deterministic suites are cheap enough for every pull request.</p>
      <p>Exercise: for a change in coupon normalization, write down why the coupon unit tests, HTTP quote, and discounted browser journey each add different evidence. Then run those commands before the complete pre-release set. If you cannot explain what a test protects, its name or assertion may need improvement.</p>
    </Section>
    <Section id="7.3" title="Combining unit, integration, E2E, security, and performance checks">
      <h3>Step 4. Run the release-candidate sequence locally</h3>
      <Code>{`npm test
node --test tests/integration/checkout.test.js tests/security/api.test.js tests/regression/checkout.test.js
npx playwright test
node tests/performance/load.mjs baseline`}</Code><p>Expected: 28 unit passes, 16 combined API/regression passes, 6 browser passes, and a performance summary satisfying its local budgets. The browser command builds the demo before starting the server.</p>
      <p>The three REG cases intentionally overlap important rules at a broader boundary. Avoid duplicating every unit input in the browser: that multiplies execution time and maintenance without proportionate evidence. Use an HTTP assertion for inventory and a browser assertion for what the customer sees.</p>
      <p>A release decision should include the commit, test commands, results, known gaps, and any unresolved failures. Passing tests do not answer whether requirements are complete or whether the in-memory demo is suitable for real orders. Keep those limitations visible in the release notes.</p>
    </Section>
    <Section id="7.4" title="Running the right checks in CI and before release">
      <h3>Step 5. Add the workflow</h3><FileCode path=".github/workflows/testing.yml"/>
      <p>This file is ready for a standalone repository whose root is the extracted <code>demo-store</code> app. Commit it with the app and tests to that repository. In the course repository, the app is nested: the maintained root workflow sets the working directory and lockfile path to <code>demo-store</code>, and also builds the course site.</p>
      <p>On a pull request or push, the checks job installs from the lockfile, runs the 44 deterministic tests, installs Chromium and its system dependencies, then runs all six browser cases. The report and any failure traces are uploaded even when the browser command fails. Read the job logs before assuming a missing report means success.</p>
      <p>The performance job runs only through the Actions “Run workflow” control. It keeps hardware-sensitive timing out of the ordinary pull-request gate and uploads the JSON result even after a budget failure. A hosted runner is still a noisy environment; compare controlled runs before attributing a difference to code.</p>
      <p>For a quick local candidate check, use <code>npx playwright test --grep @smoke</code> for 2 passes, but run the full release sequence before release. The workflow does not deploy or publish anything.</p>
      <p>Reference: <a href="https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs">GitHub’s Node.js CI guide</a>.</p>
    </Section>
    <Section id="7.5" title="Investigating failures and managing flaky tests">
      <h3>Step 6. Practice a useful failure report</h3>
      <p>Temporarily introduce the Chapter 02 shipping defect again. Run the unit boundary file and record expected 0 versus actual 599 at a 10000-cent subtotal. Restore the condition, rerun the failing file for confirmation, then run the release-candidate sequence for regression evidence. Do not change expected values to match a defect.</p>
      <Code>{`node --test tests/unit/boundaries.test.js
npx playwright test tests/e2e/store.spec.js --grep "lost order response"`}</Code><p>With production restored, expect 13 unit boundary passes and 1 browser recovery pass. These commands also show how to isolate a failure without deleting other tests.</p>
      <p>Classify a failure from evidence: product defect, stale expectation after an approved requirement change, fixture contamination, environment/setup failure, or timing problem. Capture request and response details for API failures and a trace for browser failures. Check whether it fails alone, in the suite, and on the same commit again.</p>
      <p>A retry that passes does not erase the first failure. This configuration keeps retries at zero so flakes stay visible. If a team temporarily quarantines a flaky test, record an owner, issue, expiry, missing coverage, and the condition for returning it to the gate. Never silently skip the only checkout test to make a release green.</p>
    </Section>
    <Section id="7.6" title="Maintaining the suite as the store evolves">
      <h3>Step 7. Keep tests aligned with real behavior</h3>
      <p>When a requirement changes, update its written rule, test expectations, and fixtures together. Preserve a reproducer for each fixed defect. Remove redundant checks only after identifying the surviving coverage; a test count is not a quality target.</p>
      <p>When adding persistence, replace reset expectations with explicit durable recovery tests. When adding a gateway, retain local simulation checks but add real adapter contracts and signed callback cases. When adding accounts, evolve session isolation into an authorization matrix. Extend this store’s boundaries instead of substituting a toy app.</p>
      <p>Review the suite after significant changes: which customer risks are uncovered, which fixtures depend on execution order, which failures are hard to diagnose, and which experiments can no longer support their original claims? Keep dependency updates deliberate and rerun packaged learner instructions whenever source, setup, or test code changes.</p>
      <h3>Step 8. Finish with a reviewable handoff</h3><p>Your completed baseline contains 28 unit, 6 integration, 7 security API, 3 regression, and 6 browser tests, plus four load profiles. The downloadable source is the source displayed in these lessons. Record your local results and remaining limitations with the project; a future reader should be able to reproduce them without this course open.</p>
      <Download number="07" slug="regression" next="/#contents" nextTitle="Return to the complete course outline"/>
    </Section>
  </Chapter>;
}

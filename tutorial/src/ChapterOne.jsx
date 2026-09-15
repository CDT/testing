import React from 'react';
import Code from './Code';

function Comparison({ headings, rows }) {
  return <div className="lesson-table"><table><thead><tr>{headings.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map(([name, ...cells]) => <tr key={name}><th scope="row">{name}</th>{cells.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export default function ChapterOne() {
  return <article className="lesson" aria-label="Chapter 01: Software testing">
    <header className="lesson-header"><span>Chapter 01</span><h1>Software testing</h1><p>Connect testing vocabulary to checkout examples, documented software failures, and engineering decisions.</p></header>

    <section id="lesson-1-1" className="lesson-section">
      <span className="lesson-number">1.1</span><h2>What is software testing?</h2>
      <p>Software testing is the work of evaluating software and related artifacts to find defects and understand quality. It includes running software, but also reviewing a requirement, questioning an assumption, and investigating an unexpected result.</p>
      <p>As a developer, you already know how to make a feature work. In testing, expand the question: under which conditions does it work, how could it fail, and what evidence would convince us?</p>
      <h3>Example: free shipping at $100</h3>
      <p>Suppose the agreed rule is: “Free shipping applies when the merchandise subtotal after discounts is at least $100, before tax.” Otherwise, shipping costs $5.99. The implementation below uses integer cents.</p>
      <Code>{`function shippingCost(subtotalAfterDiscountCents) {
  return subtotalAfterDiscountCents > 10000 ? 0 : 599;
}`}</Code>
      <p>A $120 order gets free shipping. A $60 order does not. Both checks pass, but they miss the exact threshold.</p>
      <figure className="lesson-illustration">
        <img src="/illustrations/chapter-one-shipping-boundary.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="Three shopping carts compare shipping at $99.99, $100.00, and $100.01. The cases below and above the threshold pass. Exactly $100.00 fails: shipping should be free, but the code charges $5.99." />
        <figcaption>Check just below, exactly at, and just above the boundary. The $100.00 case reveals the defect.</figcaption>
      </figure>
      <Comparison headings={['Input', 'Expected shipping', 'Actual shipping']} rows={[
        ['$99.99', '$5.99', '$5.99 — pass'],
        ['$100.00', '$0.00', '$5.99 — fail'],
        ['$100.01', '$0.00', '$0.00 — pass'],
      ]}/>
      <p>The test exposes a boundary defect: the condition should use <code>&gt;=</code>. The agreed rule supplies the <strong>test oracle</strong> — the basis for deciding whether the result is correct. Copying the implementation’s condition into your expected result would reproduce its mistake.</p>
      <h3>A repeatable investigation</h3>
      <ol><li><strong>Establish the expectation.</strong> Clarify whether the threshold is before or after discounts.</li><li><strong>Choose revealing cases.</strong> Check just below, exactly at, and just above the threshold.</li><li><strong>Observe the result.</strong> Compare the returned shipping charge with the agreed rule.</li><li><strong>Preserve evidence.</strong> Record the input, expected value, actual value, and build.</li><li><strong>Verify the fix.</strong> Repeat the failing case and check related behavior.</li></ol>
      <p>Testing reveals the failure and provides evidence. Debugging identifies its cause and changes the code. You may do both, but they answer different questions.</p>
    </section>

    <section id="lesson-1-2" className="lesson-section">
      <span className="lesson-number">1.2</span><h2>Why is software testing important?</h2>
      <p>A software failure can spend money, stop operations, and affect customers faster than a team can respond. Testing matters because a defect that is cheap to reproduce in a controlled environment can become extremely expensive in production.</p>

      <h3>Knight Capital: more than $460 million lost</h3>
      <p>On August 1, 2012, Knight’s trading system generated millions of orders in about 45 minutes, ultimately losing <strong>more than $460 million</strong>. <a className="lesson-next" href="https://www.sec.gov/newsroom/press-releases/2013-222" target="_blank" rel="noreferrer">Source: SEC investigation</a>.</p>
      <h4>What actually went wrong?</h4>
      <ol>
        <li><strong>Obsolete code remained callable.</strong> An old function called Power Peg was still on the servers. A previous change had broken its ability to stop submitting orders once the requested quantity was filled; Knight had not retested it.</li>
        <li><strong>A new feature reused its activation flag.</strong> Updated servers would interpret that flag as the new feature.</li>
        <li><strong>Deployment missed one of eight servers.</strong> On that server, the same flag activated defective Power Peg instead.</li>
        <li><strong>The failure was not contained.</strong> Inadequate trading controls allowed excessive orders to continue.</li>
      </ol>
      <p><strong>Was insufficient testing responsible?</strong> It contributed directly: the SEC identified the missing retest. Deployment verification and risk controls also failed. Testing only the new version would miss the obsolete code on the unpatched server. <a className="lesson-next" href="https://www.sec.gov/Archives/edgar/data/1569391/000119312513401173/d613486dex101.htm" target="_blank" rel="noreferrer">Source: SEC findings, paragraphs 13–16 and 21–26</a>.</p>
      <p><strong>Testing lesson:</strong> verify every deployed version, exercise partial deployments, and check that processing stops at the intended limit. These are proposed checks derived from the failure sequence.</p>

      <h3>CrowdStrike: a missed input case with consequences for Delta</h3>
      <p>On July 19, 2024, a CrowdStrike detection-configuration update exposed an existing sensor defect and crashed Windows systems.</p>
      <h4>What actually went wrong?</h4>
      <ol>
        <li><strong>The definition and runtime disagreed.</strong> A detection template defined 21 fields, but the integration supplied only 20 values.</li>
        <li><strong>Tests avoided the dangerous access.</strong> Existing test configurations used a wildcard for field 21, so they did not expose the missing value.</li>
        <li><strong>The update exercised a different condition.</strong> A new configuration required a specific match on field 21. Validation accepted it because it assumed 21 values would exist.</li>
        <li><strong>The runtime read past the array.</strong> Without the necessary bounds check, inspecting the nonexistent value caused a system crash.</li>
      </ol>
      <p><strong>Was insufficient testing responsible?</strong> Yes, a specific coverage gap contributed: tests did not exercise non-wildcard matching on field 21. The input-count mismatch, faulty validation, and missing runtime guard also contributed. Passing the existing tests therefore failed to establish that this new configuration was safe. <a className="lesson-next" href="https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf" target="_blank" rel="noreferrer">Source: CrowdStrike root-cause analysis, pages 2–6</a>.</p>
      <p>The consequences extended to customers using the software. Delta reported approximately <strong>7,000 canceled flights over five days</strong>. In its September-quarter results, the airline reported a <strong>$380 million revenue impact</strong> and <strong>$170 million in additional non-fuel expenses</strong>, including customer reimbursements and crew costs. These are separate reported impacts, not a single net-loss figure. <a className="lesson-next" href="https://ir.delta.com/news/news-details/2024/Delta-Air-Lines-Announces-September-Quarter-2024-Financial-Results/default.aspx" target="_blank" rel="noreferrer">Source: Delta’s quarterly results</a>.</p>
      <p><strong>Testing lesson:</strong> test every field with meaningful values against the real consumer, and verify safe handling of missing inputs. A configuration change can exercise code paths that earlier configurations never reached.</p>

      <h3>What this means for your testing work</h3>
      <figure className="lesson-illustration">
        <img src="/illustrations/chapter-one-customer-impact.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="A tester examines a software update, followed by a computer showing a failure and travelers waiting at an airport. Arrows connect software change, system failure, and customer impact." />
        <figcaption>A software failure can disrupt the services people rely on. Testing before release is one opportunity to uncover defects and reduce that risk.</figcaption>
      </figure>
      <p>Testing helps protect the people and businesses that depend on software. Its value comes from uncovering problems while the team still has an opportunity to address them, and providing evidence for decisions about quality and release readiness.</p>
      <p>As you move from development into testing, extend your attention beyond how the software was built. Consider what users need, which assumptions deserve scrutiny, and what the consequences of failure would be. That perspective helps you focus effort where it matters most.</p>
      <p>Confidence should be proportional to the evidence. Successful tests increase confidence, but leave questions about behavior that has not been examined. Communicating those limits is part of the tester’s responsibility.</p>
      <p>Quality is a shared responsibility. Testing works alongside design, code review, controlled deployment, and operational monitoring. Your contribution is to make risks visible early enough for the team to make informed choices.</p>
    </section>

    <section id="lesson-1-3" className="lesson-section">
      <span className="lesson-number">1.3</span><h2>What types of testing are there?</h2>
      <p>Testing terms describe different dimensions: the scope you exercise, the quality you investigate, and the way you work. One check can belong to several categories.</p>
      <h3>By scope: what are you exercising?</h3>
      <figure className="lesson-illustration">
        <img src="/illustrations/chapter-one-testing-scope.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="Five testing scopes: unit examines a shipping calculator; component integration connects checkout and calculation; system exercises the store; system integration connects the store to a payment provider; acceptance involves a stakeholder reviewing the purchasing workflow." />
        <figcaption>The scope defines what you exercise: a component, collaborating components, a complete application, connected systems, or the workflow evaluated for acceptance.</figcaption>
      </figure>
      <Comparison headings={['Level', 'Checkout example']} rows={[
        ['Component / unit', 'Call shippingCost directly with 10000 cents and expect zero.'],
        ['Component integration', 'Verify checkout passes the discounted subtotal to the shipping calculator.'],
        ['System', 'Exercise the complete store application from cart to recorded order.'],
        ['System integration', 'Verify the store and payment provider exchange requests and callbacks correctly.'],
        ['Acceptance', 'Have the business evaluate whether the checkout supports the agreed purchasing workflow.'],
      ]}/>
      <p>“End-to-end” usually describes a complete flow across the relevant stack. Define its boundaries explicitly: a flow with a stubbed payment provider does not establish that the real provider integration works.</p>
      <h3>By purpose: what are you investigating?</h3>
      <Comparison headings={['Type', 'Concrete question']} rows={[
        ['Functional', 'Does a $100 qualifying subtotal receive free shipping?'],
        ['Performance', 'Does checkout meet the agreed latency and error targets under a realistic workload?'],
        ['Security', 'Can customer A retrieve customer B’s order by changing its ID?'],
        ['Accessibility', 'Can a keyboard and screen-reader user complete checkout and understand errors?'],
        ['Usability', 'Do customers understand whether a timed-out payment needs another attempt?'],
        ['Compatibility', 'Does checkout behave correctly in the supported browser and device combinations?'],
        ['Reliability / recovery', 'Does an interrupted checkout recover without losing or duplicating the order?'],
      ]}/>
      <h3>After a change: what needs checking?</h3>
      <p><strong>Confirmation testing</strong> repeats a case that failed to establish whether its defect was fixed. <strong>Regression testing</strong> looks for unintended effects elsewhere. After correcting the shipping threshold, confirm the $100 case and check discounts, paid shipping, and other affected paths.</p>
      <p>A <strong>smoke suite</strong> is a small set of essential checks used to decide whether a build or environment is usable for further work. A checkout smoke check might place one order; it does not replace the broader suite.</p>
      <figure className="lesson-illustration">
        <img src="/illustrations/chapter-one-confirmation-regression.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="Confirmation testing repeats the previously failing $100 order and verifies free shipping. Regression testing checks discounts, paid shipping, and payments for unintended effects after the change." />
        <figcaption>Confirm the original failure is fixed, then choose regression checks based on what the change could affect.</figcaption>
      </figure>
      <h3>By approach: how do you investigate?</h3>
      <figure className="lesson-illustration">
        <img src="/illustrations/chapter-one-testing-approaches.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="Four pairs of testing approaches: static reviews a requirement while dynamic runs checkout; black-box examines inputs and outputs while white-box examines internal paths; manual uses human actions while automated uses tools; exploratory adapts the investigation while scripted follows a specified sequence." />
        <figcaption>These approaches describe different ways of investigating software and can complement each other within the same testing effort.</figcaption>
      </figure>
      <ul><li><strong>Static vs. dynamic:</strong> review an ambiguous shipping requirement without executing software, or run checkout to observe its behavior.</li><li><strong>Black-box vs. white-box:</strong> derive cases from the shipping rule, or inspect branches in the implementation to guide additional checks.</li><li><strong>Manual vs. automated:</strong> explore confusing payment messages yourself, or have a tool repeat pricing assertions.</li><li><strong>Exploratory vs. scripted:</strong> adapt your next investigation as you learn, or follow a previously specified sequence. These approaches can support each other.</li></ul>
      <p>For example, a browser script that places a discounted order can be an automated, functional, system-level regression test. These labels are compatible, not competing choices.</p>
      <p className="lesson-source">Terminology reference: <a href="https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf" target="_blank" rel="noreferrer">ISTQB Foundation Level syllabus</a>. The checkout scenarios in this chapter are illustrative examples.</p>
      <a className="lesson-next" href="/#contents">Back to table of contents</a>
    </section>
  </article>;
}

import React from 'react';

function Comparison({ headings, rows }) {
  return <div className="lesson-table"><table><thead><tr>{headings.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map(([name, ...cells]) => <tr key={name}><th scope="row">{name}</th>{cells.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export default function ChapterOne() {
  return <article className="lesson" aria-label="Chapter 01: Software testing">
    <header className="lesson-header"><span>Chapter 01</span><h1>Software testing</h1><p>Use a checkout feature to connect testing vocabulary to engineering decisions.</p></header>

    <section id="lesson-1-1" className="lesson-section">
      <span className="lesson-number">1.1</span><h2>What is software testing?</h2>
      <p>Software testing is the work of evaluating software and related artifacts to find defects and understand quality. It includes running software, but also reviewing a requirement, questioning an assumption, and investigating an unexpected result.</p>
      <p>As a developer, you already know how to make a feature work. In testing, expand the question: under which conditions does it work, how could it fail, and what evidence would convince us?</p>
      <h3>Example: free shipping at $100</h3>
      <p>Suppose the agreed rule is: “Free shipping applies when the merchandise subtotal after discounts is at least $100, before tax.” Otherwise, shipping costs $5.99. The implementation below uses integer cents.</p>
      <pre><code>{`function shippingCost(subtotalAfterDiscountCents) {
  return subtotalAfterDiscountCents > 10000 ? 0 : 599;
}`}</code></pre>
      <p>A $120 order gets free shipping. A $60 order does not. Both checks pass, but they miss the exact threshold.</p>
      <Comparison headings={['Input', 'Expected shipping', 'Actual shipping']} rows={[
        ['$99.99', '$5.99', '$5.99 — pass'],
        ['$100.00', '$0.00', '$5.99 — fail'],
        ['$100.01', '$0.00', '$0.00 — pass'],
      ]}/>
      <p>The test exposes a boundary defect: the condition should use <code>&gt;=</code>. The agreed rule supplies the <strong>test oracle</strong> — the basis for deciding whether the result is correct. Copying the implementation’s condition into your expected result would reproduce its mistake.</p>
      <h3>A repeatable investigation</h3>
      <ol><li><strong>Establish the expectation.</strong> Clarify whether the threshold is before or after discounts.</li><li><strong>Choose revealing cases.</strong> Check just below, exactly at, and just above the threshold.</li><li><strong>Observe the result.</strong> Compare the returned shipping charge with the agreed rule.</li><li><strong>Preserve evidence.</strong> Record the input, expected value, actual value, and build.</li><li><strong>Verify the fix.</strong> Repeat the failing case and check related behavior.</li></ol>
      <p>Testing reveals the failure and provides evidence. Debugging identifies its cause and changes the code. You may do both, but they answer different questions.</p>
      <details className="lesson-exercise"><summary>Try it yourself: a discount changes the subtotal</summary><p>A cart contains $110 of merchandise and a $15 discount. Expected shipping is $5.99 because the qualifying subtotal is $95. If checkout passes the original $110 into the corrected function, the result is still wrong. Add an integration test that verifies which subtotal checkout supplies.</p></details>
      <a className="lesson-next" href="#lesson-1-2">Next: why testing matters</a>
    </section>

    <section id="lesson-1-2" className="lesson-section">
      <span className="lesson-number">1.2</span><h2>Why is software testing important?</h2>
      <p>Testing gives a team evidence for decisions: whether to release, which failure to fix first, and where confidence is still weak. A green test suite is useful evidence for the situations it covered; it is not proof that every customer journey works.</p>
      <h3>Example: a payment succeeds, but the request times out</h3>
      <p>A customer places an order. The payment provider charges the card, but your service times out before receiving confirmation. The customer retries. A happy-path test cannot tell you whether the retry creates a second charge.</p>
      <Comparison headings={['Investigation', 'Why it matters']} rows={[
        ['Replay the request with the same idempotency key', 'Check that retrying one purchase does not charge twice.'],
        ['Deliver the payment confirmation late', 'Check that the order can recover instead of remaining pending.'],
        ['Deliver the same webhook twice', 'Check that fulfillment does not ship the order twice.'],
        ['Inspect the order history and customer message', 'Check that the customer sees a state consistent with the payment.'],
      ]}/>
      <h3>What the team gains</h3>
      <ul><li><strong>Reduced customer harm.</strong> Detect duplicate charges or missing orders before exposing customers to them.</li><li><strong>Safer changes.</strong> Repeat important checks after refactoring payment handling.</li><li><strong>Earlier clarification.</strong> Decide how a pending payment should appear before implementing conflicting behavior.</li><li><strong>Better release decisions.</strong> Report what was tested, what failed, and what remains unknown.</li></ul>
      <p>Prioritize by likelihood and impact. A duplicate charge usually deserves more attention than an uneven button margin. Context still matters: a visual issue that hides the payment amount could also be severe.</p>
      <h3>Communicate evidence, not a guarantee</h3>
      <blockquote>“Repeated requests with the same key created one charge in the provider sandbox. Delayed and duplicate callbacks updated one order correctly. Provider outage recovery has not been tested.”</blockquote>
      <p>This tells stakeholders where confidence comes from and where it stops. Testing is one part of quality work, alongside sound design, reviews, monitoring, and operational recovery.</p>
      <details className="lesson-exercise"><summary>Try it yourself: choose the first test</summary><p>You have time for one investigation: a receipt logo is misaligned, or a retry may create a second charge. Start with the retry because the potential financial and trust impact is higher. State your assumption about impact, reproduce the sequence, and capture payment and order identifiers as evidence.</p></details>
      <a className="lesson-next" href="#lesson-1-3">Next: types of testing</a>
    </section>

    <section id="lesson-1-3" className="lesson-section">
      <span className="lesson-number">1.3</span><h2>What types of testing are there?</h2>
      <p>Testing terms describe different dimensions: the scope you exercise, the quality you investigate, and the way you work. One check can belong to several categories.</p>
      <h3>By scope: what are you exercising?</h3>
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
      <h3>By approach: how do you investigate?</h3>
      <ul><li><strong>Static vs. dynamic:</strong> review an ambiguous shipping requirement without executing software, or run checkout to observe its behavior.</li><li><strong>Black-box vs. white-box:</strong> derive cases from the shipping rule, or inspect branches in the implementation to guide additional checks.</li><li><strong>Manual vs. automated:</strong> explore confusing payment messages yourself, or have a tool repeat pricing assertions.</li><li><strong>Exploratory vs. scripted:</strong> adapt your next investigation as you learn, or follow a previously specified sequence. These approaches can support each other.</li></ul>
      <p>For example, a browser script that places a discounted order can be an automated, functional, system-level regression test. These labels are compatible, not competing choices.</p>
      <details className="lesson-exercise"><summary>Check your understanding: classify this test</summary><p>You send 500 concurrent checkout requests and measure latency and failed orders. This is dynamic, automated performance testing. Its level depends on the boundary: a single checkout service differs from the complete deployed store. If you also assert that stock never goes negative, you are checking functional correctness under concurrency too.</p></details>
      <p className="lesson-source">Terminology reference: <a href="https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf" target="_blank" rel="noreferrer">ISTQB Foundation Level syllabus</a>. The checkout scenarios in this chapter are illustrative examples.</p>
      <a className="lesson-next" href="/#contents">Back to table of contents</a>
    </section>
  </article>;
}
